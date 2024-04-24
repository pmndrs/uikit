import { create } from 'zustand'
import { combine } from 'zustand/middleware'
import { themes } from './themes.js'
import { CheckedState } from '@radix-ui/react-checkbox'

type EditorState = {
  background: number | string
  vignetteEffect: boolean
  bloomEffect: boolean
  tiltShiftEffect: boolean
  chromaticAberrationEffect: boolean
  view: 'hud' | 'floating'
  code: string
  lightMode: boolean
  theme: keyof typeof themes
  borderRadius: number
}

const initialState: EditorState = {
  background: 0xffffff,
  bloomEffect: false,
  borderRadius: 0.5,
  chromaticAberrationEffect: false,
  code: '',
  lightMode: false,
  theme: 'slate',
  tiltShiftEffect: false,
  view: 'hud',
  vignetteEffect: false,
}

export const useEditorStore = create(
  combine(initialState, (set, get) => ({
    setTheme(theme: keyof typeof themes) {
      set({ theme })
    },
    setBorderRadius(borderRadius: number) {
      set({ borderRadius })
    },
    setLightMode(lightMode: boolean) {
      set({ lightMode })
    },
    setBackground(background: string | number) {
      set({ background })
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
