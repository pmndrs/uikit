import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { themes } from './themes.js'
import { CheckedState } from '@radix-ui/react-checkbox'
import { ConversionNode, setPreferredColorScheme } from '@react-three/uikit'
import z from 'zod'
import { baseBorderRadius, themeName } from '@react-three/uikit-default'
import { compress, decompress } from 'brotli-compress'
import { initializeApp } from 'firebase/app'
import { getFirestore, getDoc, doc, addDoc, collection } from 'firebase/firestore'
import CardExample from './examples/card.json'
//@ts-ignore
import { parseHtml } from '@pmndrs/uikit/internals'

export type UiState = {
  showEditor?: boolean
  showOutputCode?: boolean
}

export const useUiState = create(
  persist<UiState>(
    () => ({
      showEditor: false,
      showOutputCode: false,
    }),
    { name: 'html23-ui' },
  ),
)

const firebaseConfig = {
  apiKey: 'AIzaSyCaBoJlRYNt3hSE4HeGE0quMKduBpSOYxQ',
  authDomain: 'html23-9ca77.firebaseapp.com',
  projectId: 'html23-9ca77',
  storageBucket: 'html23-9ca77.appspot.com',
  messagingSenderId: '993913345021',
  appId: '1:993913345021:web:f9c1bf07af8a8fc1197f94',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

const EditorStateSchema = z.object({
  environment: z
    .enum(['apartment', 'city', 'dawn', 'forest', 'lobby', 'night', 'park', 'studio', 'sunset', 'warehouse'])
    .or(z.coerce.number())
    .default(0xffffff),
  vignetteEffect: z.coerce.boolean().default(false),
  bloomEffect: z.coerce.boolean().default(false),
  tiltShiftEffect: z.coerce.boolean().default(false),
  chromaticAberrationEffect: z.coerce.boolean().default(false),
  view: z.enum(['hud', 'floating']).default('hud'),
  code: z.coerce.string().default(''),
  lightMode: z.coerce.boolean().default(true),
  theme: z
    .enum(['zinc', 'slate', 'stone', 'gray', 'neutral', 'red', 'rose', 'orange', 'green', 'blue', 'yellow', 'violet'])
    .default('slate'),
  borderRadius: z.coerce.number().default(0.5),
})

type EditorState = z.infer<typeof EditorStateSchema>

function parseState(object: any) {
  try {
    return EditorStateSchema.parse(object)
  } catch (e: any) {
    return EditorStateSchema.parse(CardExample)
  }
}

async function urlParamsToObject() {
  const url = new URL(window.location.href)
  const projectId = url.searchParams.get('p')
  if (projectId == null) {
    return {}
  }
  url.search = ''
  window.history.replaceState({}, '', url)
  try {
    const data = await (await getDoc(doc(db, 'links', projectId))).get('data')
    if (data == null) {
      return {}
    }
    return await decode(data)
  } catch (e: any) {
    console.error(e)
    return {}
  }
}

const localStorageKey = 'html23-state'

const fromLocalStorage = localStorage.getItem(localStorageKey)
const initialState = parseState(fromLocalStorage == null ? CardExample : JSON.parse(fromLocalStorage))

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()

async function decode(value: string) {
  const array = new Uint8Array([...atob(value)].map((cp) => cp.codePointAt(0)!))
  return JSON.parse(textDecoder.decode(await decompress(array)))
}

async function encode(object: any) {
  const binString = textEncoder.encode(JSON.stringify(object))
  return btoa(String.fromCodePoint(...(await compress(binString))))
}

export function confirmNotOverrride(): boolean {
  if (
    useEditorStore.getState().code.length > 0 &&
    !window.confirm(
      'Caution! You are overwriting your existing project by importing this example. Do you want to continue?',
    )
  ) {
    return false
  }
  return true
}

export const useEditorStore = create(
  combine(initialState, (set, get) => ({
    setTheme(theme: keyof typeof themes) {
      set({ theme })
    },
    setExample(state: any) {
      if (!confirmNotOverrride()) {
        return
      }
      set(state)
    },
    downloadJson() {
      const url = window.URL.createObjectURL(new Blob([JSON.stringify(get())], { type: 'application/json' }))
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'example.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    },
    async generateLink() {
      const url = new URL(window.location.href)
      url.search = ''
      const data = await encode(get())
      const docRef = await addDoc(collection(db, 'links'), {
        data,
      })
      url.searchParams.set('p', docRef.id)
      return url.href
    },
    setBorderRadius(borderRadius: number) {
      set({ borderRadius })
    },
    setLightMode(lightMode: boolean) {
      set({ lightMode })
    },
    setEnvironment(environment: EditorState['environment'] | number) {
      set({ environment })
    },
    setVignetteEffect(vignetteEffect: CheckedState) {
      if (typeof vignetteEffect === 'string') {
        return
      }
      set({ vignetteEffect })
    },
    setBloomEffect(bloomEffect: CheckedState) {
      if (typeof bloomEffect === 'string') {
        return
      }
      set({ bloomEffect })
    },
    setChromaticAberrationEffect(chromaticAberrationEffect: CheckedState) {
      if (typeof chromaticAberrationEffect === 'string') {
        return
      }
      set({ chromaticAberrationEffect })
    },
    setTiltshiftEffect(tiltShiftEffect: CheckedState) {
      if (typeof tiltShiftEffect === 'string') {
        return
      }
      set({ tiltShiftEffect })
    },
    setCode(code: string) {
      set({ code })
    },
    setView(view: EditorState['view']) {
      set({ view })
    },
  })),
)

let saveStateTimeoutRef: NodeJS.Timeout | undefined

useEditorStore.subscribe((state) => {
  clearTimeout(saveStateTimeoutRef)
  saveStateTimeoutRef = setTimeout(() => saveState(state), 300)
})

function saveState(state: EditorState) {
  localStorage.setItem(localStorageKey, JSON.stringify(state))
}

const customColors = {
  background: 1,
  foreground: 1,
  card: 1,
  cardForeground: 1,
  popover: 1,
  popoverForeground: 1,
  primary: 1,
  primaryForeground: 1,
  secondary: 1,
  secondaryForeground: 1,
  muted: 1,
  mutedForeground: 1,
  accent: 1,
  accentForeground: 1,
  destructive: 1,
  destructiveForeground: 1,
  border: 1,
  input: 1,
  ring: 1,
}

type ParsedHtmlState = {
  parsed?: {
    element: ConversionNode
    classes: Map<string, any>
  }
  error?: string
}

function tryParseHtml(prevResult: ParsedHtmlState['parsed'], code: string): ParsedHtmlState {
  try {
    const parsed = parseHtml(code, customColors)
    return {
      parsed,
      error: undefined,
    }
  } catch (e: any) {
    console.error(e)
    return {
      parsed: prevResult,
      error: e.message,
    }
  }
}

export function setCodeBasedOnParsedHtml() {
  const { parsed } = useParsedHtmlStore.getState()
  if (parsed == null) {
    return
  }
  useEditorStore.setState({ code: parsed.element.toString() })
}

export const useParsedHtmlStore = create<
  {
    parsed?: {
      element: ConversionNode
      classes: Map<string, any>
    }
    error?: string
  },
  []
>(() => tryParseHtml(undefined, useEditorStore.getState().code))

let parseHtmlTimeoutRef: NodeJS.Timeout | undefined

useEditorStore.subscribe(({ code }, { code: prevCode }) => {
  if (code === prevCode) {
    return
  }
  clearTimeout(parseHtmlTimeoutRef)
  parseHtmlTimeoutRef = setTimeout(() => {
    const state = tryParseHtml(useParsedHtmlStore.getState().parsed, code)
    queueMicrotask(() => useParsedHtmlStore.setState(state))
  }, 100)
})

setPreferredColorScheme(useEditorStore.getState().lightMode ? 'light' : 'dark')
useEditorStore.subscribe((state) => setPreferredColorScheme(state.lightMode ? 'light' : 'dark'))
baseBorderRadius.value = useEditorStore.getState().borderRadius * 16
useEditorStore.subscribe((state) => (baseBorderRadius.value = state.borderRadius * 16))
themeName.value = useEditorStore.getState().theme
useEditorStore.subscribe((state) => (themeName.value = state.theme))

urlParamsToObject().then((object) => {
  const urlState = parseState(object)

  if (urlState.code.length === 0) {
    return
  }
  if (
    initialState.code.length > 0 &&
    !window.confirm(
      'Caution! You are overwriting your existing project by importing this project. Do you want to continue?',
    )
  ) {
    return
  }
  useEditorStore.setState(urlState)
})
