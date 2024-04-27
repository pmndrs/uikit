import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable.js'
import { Suspense, forwardRef, useEffect, useState } from 'react'
import { ConversionNode, htmlToCode, parsedHtmlToCode } from '@react-three/uikit'

import { suspend } from 'suspend-react'
import 'prismjs/themes/prism.css'
import { AlertCircle, HeartHandshake, Link, Maximize, Minimize, Send, HardDriveDownload } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from './components/ui/alert.js'
import { Highlight } from 'prism-react-renderer'
import { Button } from './components/ui/button.js'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './components/ui/tooltip.js'
import { useEnterXR, useSessionSupported } from '@coconut-xr/natuerlich/react'
import { cn } from './lib/utils.js'
import { Toaster } from './components/ui/toaster.js'
import { useToast } from './components/ui/use-toast.js'
import { colors } from './theme.js'
import { Scene } from './components/scene.js'
import { useEditorStore, useParsedHtmlStore } from './state.js'
import { Editor } from './components/editor.js'
import { BackgroundPopover } from './components/popover/background.js'
import { EffectsPopover } from './components/popover/effects.js'
import { ViewPopover } from './components/popover/view.js'
import { ThemePopover } from './components/popover/theme.js'
import { componentMap as defaultComponentMap } from '@react-three/uikit-default'
import { componentMap as lucideComponentMap } from '@react-three/uikit-lucide'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './components/ui/navigation-menu.js'
import card from './examples/card.json'
import cookies from './examples/cookies.json'
import musicPlayer from './examples/music-player.json'
import pricing from './examples/pricing.json'
import profile from './examples/profile.json'
import weather from './examples/weather.json'

export const componentMap = { ...defaultComponentMap, ...lucideComponentMap }

const sessionConfig: XRSessionInit = {
  requiredFeatures: ['local-floor'],
  optionalFeatures: ['hand-tracking'],
}

export default function App() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | undefined>(undefined)
  const [fullscreen, setFullscreen] = useState(false)
  useEffect(() => {
    const listener = () => setFullscreen(document.fullscreenElement === document.body)
    document.addEventListener('fullscreenchange', listener)
    return () => document.removeEventListener('fullscreenchange', listener)
  }, [setFullscreen])
  const enterAR = useEnterXR('immersive-ar', sessionConfig)
  const enterVR = useEnterXR('immersive-vr', sessionConfig)
  const isARSupported = useSessionSupported('immersive-ar')
  const isVRSupported = useSessionSupported('immersive-vr')
  const { toast } = useToast()
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', setInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', setInstallPrompt)
  }, [setInstallPrompt])
  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <Toaster />
      <TooltipProvider>
        <div className={cn('flex p-2 border-b justify-between flex-row items-center', fullscreen && 'hidden')}>
          <div className="flex flex-row gap-4 px-2 items-center">
            <div className="flex flex-row gap-2 items-center">
              <img height={20} width={20} src="./icon.svg" />
              <h1 className="font-bold">HTML23</h1>
            </div>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Examples</NavigationMenuTrigger>
                  <NavigationMenuContent className="bg-background border-white">
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <ListItem
                        className="cursor-pointer"
                        onClick={() => useEditorStore.getState().setExample(card)}
                        title="Card"
                      >
                        A basic card layout for displaying content.
                      </ListItem>
                      <ListItem
                        className="cursor-pointer"
                        onClick={() => useEditorStore.getState().setExample(cookies)}
                        title="Cookies"
                      >
                        A feature for managing website cookies.
                      </ListItem>
                      <ListItem
                        className="cursor-pointer"
                        onClick={() => useEditorStore.getState().setExample(musicPlayer)}
                        title="MusicPlayer"
                      >
                        An application for playing and managing music.
                      </ListItem>
                      <ListItem
                        className="cursor-pointer"
                        onClick={() => useEditorStore.getState().setExample(pricing)}
                        title="Pricing"
                      >
                        A section displaying product or service pricing information.
                      </ListItem>
                      <ListItem
                        className="cursor-pointer"
                        onClick={() => useEditorStore.getState().setExample(profile)}
                        title="Profile"
                      >
                        A user's personal information and activity overview.
                      </ListItem>
                      <ListItem
                        className="cursor-pointer"
                        onClick={() => useEditorStore.getState().setExample(weather)}
                        title="Weather"
                      >
                        A widget showing current and forecasted weather conditions.
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex flex-row items-center">
            {import.meta.env.DEV && (
              <Button onClick={() => useEditorStore.getState().downloadJson()} variant="ghost">
                JSON
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="https://github.com/sponsors/bbohlender" target="_blank">
                  <Button size="icon" variant="ghost">
                    <HeartHandshake className="cursor-pointer w-4 h-4" />
                  </Button>
                </a>
              </TooltipTrigger>
              <TooltipContent>Support the Project</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={async () => {
                    navigator.clipboard.writeText(await useEditorStore.getState().generateLink())
                    toast({ title: 'Link successfully copied', className: 'bg-green-500 p-4' })
                  }}
                  size="icon"
                  variant="ghost"
                >
                  <Link className="cursor-pointer w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost">
                  <a href="https://github.com/pmndrs/uikit" target="_blank">
                    <svg className="fill-white w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Github</TooltipContent>
            </Tooltip>

            {installPrompt && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => installPrompt.prompt()} size="icon" variant="ghost">
                    <HardDriveDownload className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Install</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            className={cn('p-4 md:flex flex-col hidden', fullscreen && 'md:hidden')}
            style={{ overflow: 'auto' }}
          >
            <Editor />
          </ResizablePanel>
          <ResizableHandle className={cn('md:flex hidden', fullscreen && 'md:hidden')} withHandle />
          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel>
                <div className="bg-background w-full h-full flex flex-row">
                  <Scene />
                  <div className="border-l p-1 flex flex-col *:flex-shrink-0 overflow-y-auto flex-shrink-0">
                    <ViewPopover />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={async () => {
                            try {
                              if (fullscreen) {
                                await document.exitFullscreen()
                              } else {
                                await document.body.requestFullscreen()
                              }
                            } catch (e: any) {}
                          }}
                          size="icon"
                          variant="ghost"
                        >
                          {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">{fullscreen ? 'Minimize' : 'Maximize'}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button disabled={!isARSupported} onClick={enterAR} size="icon" variant="ghost">
                          AR
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Start Augemented Reality</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button disabled={!isVRSupported} onClick={enterVR} size="icon" variant="ghost">
                          VR
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Start Virtual Reality</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={async () =>
                            window.open(
                              `https://www.oculus.com/open_url/?url=${await useEditorStore.getState().generateLink()}`,
                              '_blank',
                            )
                          }
                          size="icon"
                          variant="ghost"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">Send to XR Headset</TooltipContent>
                    </Tooltip>

                    <BackgroundPopover />

                    <ThemePopover />

                    <EffectsPopover />
                  </div>
                </div>
              </ResizablePanel>
              <ResizableHandle className={cn(fullscreen && 'hidden')} withHandle />
              <ResizablePanel className={cn(fullscreen && 'hidden')}>
                <Suspense fallback={null}>
                  <ConvertToReact />
                </Suspense>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  )
}

const ListItem = forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)

const cacheSymbol = Symbol('htmlToCode')

const customColorsForText = {
  background: colors.background.value.getStyle(),
  foreground: colors.foreground.value.getStyle(),
  card: colors.card.value.getStyle(),
  cardForeground: colors.cardForeground.value.getStyle(),
  popover: colors.popover.value.getStyle(),
  popoverForeground: colors.popoverForeground.value.getStyle(),
  primary: colors.primary.value.getStyle(),
  primaryForeground: colors.primaryForeground.value.getStyle(),
  secondary: colors.secondary.value.getStyle(),
  secondaryForeground: colors.secondaryForeground.value.getStyle(),
  muted: colors.muted.value.getStyle(),
  mutedForeground: colors.mutedForeground.value.getStyle(),
  accent: colors.accent.value.getStyle(),
  accentForeground: colors.accentForeground.value.getStyle(),
  destructive: colors.destructive.value.getStyle(),
  destructiveForeground: colors.destructiveForeground.value.getStyle(),
  border: colors.border.value.getStyle(),
  input: colors.input.value.getStyle(),
  ring: colors.ring.value.getStyle(),
}

export async function tryparsedHtmlToCode(element: ConversionNode, classes: Map<string, any>): Promise<string> {
  try {
    return parsedHtmlToCode(element, classes, customColorsForText, componentMap).catch(() => '')
  } catch (e: any) {
    console.error(e)
    return ''
  }
}

export function ConvertToReact() {
  const parsed = useParsedHtmlStore((state) => state.parsed)
  if (parsed == null) {
    return null
  }
  const result = suspend(tryparsedHtmlToCode, [parsed.element, parsed.classes, cacheSymbol])
  return (
    <div className="relative h-full w-full justify-stretch items-stretch p-4 overflow-auto">
      <Highlight code={result} language="jsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
/**
 * 
      {error != null && (
        <Alert variant="destructive" className="absolute bottom-4 w-auto left-4 right-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
 */

declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform: string
    }>
    prompt(): Promise<void>
  }
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}
