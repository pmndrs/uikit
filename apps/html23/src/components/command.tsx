import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Button } from './ui/button.js'
import {
  Settings,
  Blend,
  Palette,
  Maximize,
  Link,
  Rocket,
  Square,
  CircleHelp,
  Image,
  Radius,
  Sun,
  Moon,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command.js'
import { examples } from '@/examples.js'
import { StoreApi, UseBoundStore, create } from 'zustand'
import { tutorials } from '@/tutorials.js'
import {
  copyLink,
  importV0,
  toggleBloomEffect,
  toggleChromaticAberrationEffect,
  toggleCodeEditor,
  toggleCodeOutput,
  toggleDarkMode,
  toggleFullscreen,
  toggleTiltshiftEffect,
  toggleVignetteEffect,
  toggleWebXR,
} from '@/shared.js'
import { useEditorStore, useUiState } from '@/state.js'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip.js'
import { themeColors, themeNames, themeRadii } from './popover/theme.js'
import { environmentColorNames, environmentColors, environmentPresets } from './popover/environment.js'
import { showDeployDialog } from './deploy.js'

type CommandState = { searchTitle?: string; content?: () => ReactNode; prev?: () => ReactNode }

const useCommandState = create<CommandState>(() => ({}))

export function openHelp() {
  useCommandState.setState({
    searchTitle: 'Search for helpful resources ...',
    content: HelpCommandContent,
    prev: undefined,
  })
}
export function close() {
  useCommandState.setState({ content: undefined, prev: undefined })
}

export function CommandButton() {
  const open = useCommandState((s) => s.content != null)

  const setOpen = useCallback((open: boolean) => {
    if (open) {
      useCommandState.setState({ searchTitle: 'Search for anything', content: DefaultCommandContent, prev: undefined })
      return
    }
    const prev = useCommandState.getState().prev
    useCommandState.setState({ content: prev, prev: undefined })
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        const isOpen = useCommandState.getState().content != null
        setOpen(!isOpen)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="ml-auto max-w-96 w-full justify-between mr-2"
            variant="outline"
          >
            Search ...
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[12px] font-medium text-muted-foreground opacity-100">
              <span className="text-[14px]">⌘</span>K
            </kbd>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Search for anything available in html23</TooltipContent>
      </Tooltip>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandDialogContent />
      </CommandDialog>
    </>
  )
}

function SelectBasedOnStore<T>({
  store: useStore,
  entry,
  ifFalse,
  ifTrue,
}: {
  store: UseBoundStore<StoreApi<T>>
  entry: keyof T
  ifTrue: string
  ifFalse: string
}): string {
  const value = useStore((s) => s[entry] ?? false)
  const x = useStore()
  return value ? ifTrue : ifFalse
}

const ClearCommandContext = createContext<() => void>(null as any)

function CommandDialogContent() {
  const Content = useCommandState((s) => s.content)
  const placeholder = useCommandState((s) => s.searchTitle)
  const [value, setValue] = useState('')
  const clear = useCallback(() => setValue(''), [])

  return (
    <>
      <CommandInput value={value} onValueChange={setValue} placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <ClearCommandContext.Provider value={clear}>
          {Content == null ? null : <Content />}
        </ClearCommandContext.Provider>
      </CommandList>
    </>
  )
}

function HelpCommandContent() {
  return (
    <>
      <CommandGroup heading="Tutorials">
        {tutorials.map(({ title, url }) => (
          <CommandItem key={title} onSelect={() => window.open(url, '_blank')}>
            <img src="youtube.svg" className="mr-2 h-4 w-4" />
            <span>{title}</span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  )
}

function DefaultCommandContent() {
  const clearCommand = useContext(ClearCommandContext)
  return (
    <>
      <CommandGroup heading="Project">
        <CommandItem
          onSelect={() => {
            clearCommand()
            useCommandState.setState({
              searchTitle: 'Search for helpful resources ...',
              content: HelpCommandContent,
              prev: DefaultCommandContent,
            })
          }}
          keywords={['question', 'unclear']}
        >
          <img src="questionmark.svg" className="invert mr-2 h-4 w-4" />
          <span>Help</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            close()
            copyLink()
          }}
          keywords={['link']}
        >
          <Link className="mr-2 h-4 w-4" />
          <span>Share</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            close()
            importV0()
          }}
          keywords={['AI', 'generative', 'automatic']}
        >
          <img src="v0.svg" className="invert mr-2 h-3" />
          <span>Import from v0.dev</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            close()
            showDeployDialog()
          }}
          keywords={['host', 'website', 'build']}
        >
          <Rocket className="mr-2 h-3" />
          <span>Deploy</span>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Settings">
        <CommandItem
          onSelect={() => {
            close()
            toggleCodeEditor()
          }}
          keywords={['html', 'css', 'tailwind', 'shadcn']}
        >
          <Settings className="mr-2 h-3" />
          <span>
            <SelectBasedOnStore store={useUiState} entry="showEditor" ifTrue="Hide" ifFalse="Show" /> Code Editor
          </span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            close()
            toggleCodeOutput()
          }}
          keywords={['react', 'uikit', 'three']}
        >
          <Settings className="mr-2 h-3" />
          <span>
            <SelectBasedOnStore store={useUiState} entry="showOutputCode" ifTrue="Hide" ifFalse="Show" /> Code Output
          </span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            close()
            toggleWebXR()
          }}
          keywords={['Augmented Reality', 'Virtual Reality', 'AR', 'VR', 'XR', 'Mixed Reality', 'MR']}
        >
          <Settings className="mr-2 h-3" />
          <span>
            <SelectBasedOnStore store={useUiState} entry="showWebXRButtons" ifTrue="Disable" ifFalse="Enable" /> WebXR
          </span>
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Examples">
        {examples.map(({ title, content }) => (
          <CommandItem
            onSelect={() => {
              close()
              useEditorStore.getState().setExample(content)
            }}
            key={title}
          >
            <Square className="mr-2 h-3" />
            <span>Open {title} Example</span>
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Appearance">
        <CommandItem
          onSelect={() => {
            clearCommand()
            useCommandState.setState({
              searchTitle: 'Search for theme color ...',
              content: ThemeColorCommandContent,
              prev: DefaultCommandContent,
            })
          }}
          keywords={['theme', 'color', 'primary']}
        >
          <Palette className="mr-2 h-4 w-4" />
          <span>Change Theme Color</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            clearCommand()
            useCommandState.setState({
              searchTitle: 'Search for radii ...',
              content: ThemeRadiusCommandContent,
              prev: DefaultCommandContent,
            })
          }}
          keywords={['theme', 'radius', 'round', 'sharp']}
        >
          <Palette className="mr-2 h-4 w-4" />
          <span>Change Theme Radius</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            close()
            toggleDarkMode()
          }}
          keywords={['light', 'dark', 'theme']}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>
            <SelectBasedOnStore store={useEditorStore} entry="lightMode" ifTrue="Disable" ifFalse="Enable" /> Light Mode
          </span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            close()
            toggleFullscreen()
          }}
          keywords={['maximize', 'full', 'cover']}
        >
          <Maximize className="mr-2 h-4 w-4" />
          <span>Toggle Fullscreen</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            clearCommand()
            useCommandState.setState({
              searchTitle: 'Search for environment images and colors ...',
              content: EnvironmentCommandContent,
              prev: DefaultCommandContent,
            })
          }}
          keywords={[]}
        >
          <Image className="mr-2 h-4 w-4" />
          <span>Change Environment</span>
        </CommandItem>
        <CommandItem
          onSelect={() => {
            clearCommand()
            useCommandState.setState({
              searchTitle: 'Search for effects ...',
              content: EffectsCommandContent,
              prev: DefaultCommandContent,
            })
          }}
          keywords={['post', 'effect', 'blur', 'bloom', 'glare', 'vignette', 'tilt', 'shift', 'color']}
        >
          <Image className="mr-2 h-4 w-4" />
          <span>Change Effects</span>
        </CommandItem>
      </CommandGroup>
    </>
  )
}

function EffectsCommandContent() {
  return (
    <>
      <CommandItem
        onSelect={() => {
          close()
          toggleVignetteEffect()
        }}
        keywords={['vignette', 'dark', 'corner']}
      >
        <Blend className="mr-2 h-4 w-4" />
        <span>
          <SelectBasedOnStore store={useEditorStore} entry="vignetteEffect" ifTrue="Disable" ifFalse="Enable" />{' '}
          Vignette
        </span>
      </CommandItem>
      <CommandItem
        onSelect={() => {
          close()
          toggleTiltshiftEffect()
        }}
        keywords={['tilt', 'blur']}
      >
        <Blend className="mr-2 h-4 w-4" />
        <span>
          <SelectBasedOnStore store={useEditorStore} entry="tiltShiftEffect" ifTrue="Disable" ifFalse="Enable" />{' '}
          Tiltshift
        </span>
      </CommandItem>
      <CommandItem
        onSelect={() => {
          close()
          toggleBloomEffect()
        }}
        keywords={['glare', 'bloom', 'light']}
      >
        <Blend className="mr-2 h-4 w-4" />
        <span>
          <SelectBasedOnStore store={useEditorStore} entry="bloomEffect" ifTrue="Disable" ifFalse="Enable" /> Bloom
        </span>
      </CommandItem>
      <CommandItem
        onSelect={() => {
          close()
          toggleChromaticAberrationEffect()
        }}
        keywords={['color', 'shift']}
      >
        <Blend className="mr-2 h-4 w-4" />
        <span>
          <SelectBasedOnStore
            store={useEditorStore}
            entry="chromaticAberrationEffect"
            ifTrue="Disable"
            ifFalse="Enable"
          />{' '}
          Chromatic Aberration
        </span>
      </CommandItem>
    </>
  )
}

function ThemeColorCommandContent() {
  const lightMode = useEditorStore((state) => state.lightMode)
  return (
    <>
      {themeNames.map((themeName, i) => (
        <CommandItem
          onSelect={() => {
            close()
            useEditorStore.getState().setTheme(themeName)
          }}
          key={themeName}
        >
          <div
            style={{
              backgroundColor: `hsl(${themeColors[i][lightMode ? 'light' : 'dark']})`,
            }}
            className="mr-2 rounded h-4 w-4"
          />
          <span>Select {themeName} theme</span>
        </CommandItem>
      ))}
    </>
  )
}

function ThemeRadiusCommandContent() {
  return (
    <>
      {themeRadii.map((radius, i) => (
        <CommandItem
          onSelect={() => {
            close()
            useEditorStore.getState().setBorderRadius(parseFloat(radius))
          }}
          key={radius}
        >
          <Radius className="mr-2 h-4 w-4" />
          <span>Select {radius} Radius</span>
        </CommandItem>
      ))}
    </>
  )
}

function EnvironmentCommandContent() {
  return (
    <>
      {environmentColorNames.map((environmentColorName, i) => (
        <CommandItem
          onSelect={() => {
            close()
            useEditorStore.getState().setEnvironment(environmentColors[i])
          }}
          key={environmentColorName}
        >
          <div
            style={{
              backgroundColor: '#' + environmentColors[i].toString(16),
            }}
            className="mr-2 rounded h-4 w-4"
          />
          <span>Select {environmentColorName} background color</span>
        </CommandItem>
      ))}
      {environmentPresets.map((environmentPreset) => (
        <CommandItem
          onSelect={() => {
            close()
            useEditorStore.getState().setEnvironment(environmentPreset)
          }}
          key={environmentPreset}
        >
          <img src={`./${environmentPreset}.png`} className="rounded w-4 h-4 mr-2" />
          <span>Select {environmentPreset} environment</span>
        </CommandItem>
      ))}
    </>
  )
}
