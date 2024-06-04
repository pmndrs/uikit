import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable.js'
import { useEffect, useState } from 'react'

import './prism.css'
import { Link, Maximize, Minimize, Send, HardDriveDownload, Braces } from 'lucide-react'
import { Button } from './components/ui/button.js'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './components/ui/tooltip.js'
import { useEnterXR, useIsInSessionMode, useSessionSupported } from '@coconut-xr/natuerlich/react'
import { cn } from './lib/utils.js'
import { Toaster } from './components/ui/toaster.js'
import { useToast } from './components/ui/use-toast.js'
import { Scene } from './components/scene.js'
import { useEditorStore, useUiState } from './state.js'
import { Editor } from './components/editor.js'
import { EnvironmentPopover } from './components/popover/environment.js'
import { EffectsPopover } from './components/popover/effects.js'
import { ViewPopover } from './components/popover/view.js'
import { ThemePopover } from './components/popover/theme.js'
import { componentMap as defaultComponentMap } from '@react-three/uikit-default'
import { componentMap as lucideComponentMap } from '@react-three/uikit-lucide'
import { DeployDialog } from './components/deploy.js'
import { OutputCode } from './components/output-code.js'
import { Drawer } from './components/drawer.js'
import { Logo } from './logo.js'
import { CommandButton, openHelp } from './components/command.js'
import { copyLink, importV0, toggleFullscreen } from './shared.js'
import { ImportV0Dialog } from './components/import.js'
import { MaterialsPopover } from './components/popover/materials.js'

export const componentMap = { ...defaultComponentMap, video: defaultComponentMap.Video, ...lucideComponentMap }

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
  const isInXR = useIsInSessionMode(['immersive-ar', 'immersive-vr'])
  const { toast } = useToast()
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', setInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', setInstallPrompt)
  }, [setInstallPrompt])
  return (
    <div className="h-dvh w-dvw overflow-hidden flex flex-col bg-background">
      <ImportV0Dialog />
      <Toaster />
      <TooltipProvider>
        <div
          className={cn('flex p-2 border-b justify-between flex-row items-center', (isInXR || fullscreen) && 'hidden')}
        >
          <div className="flex flex-row px-2 items-center">
            <Drawer />
            <Logo className="md:flex hidden mx-4" />
          </div>
          <CommandButton />
          <div className="flex flex-row items-center">
            {import.meta.env.DEV && (
              <Button onClick={() => useEditorStore.getState().downloadJson()} variant="ghost" size="icon">
                <Braces className="w-4 h-4" />
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={importV0}
                  variant="outline"
                  className="hidden md:flex flex-row items-center gap-3 pr-3 mr-2"
                >
                  <img className="h-[0.85rem] text-white invert" src="v0.svg" />
                  Import
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import UI from v0.dev</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <img className="h-3 px-1 text-white invert" src="v0.svg" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Import UI from v0.dev</TooltipContent>
            </Tooltip>
            <DeployDialog />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={copyLink} size="icon" variant="ghost">
                  <Link className="cursor-pointer w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={openHelp} size="icon" variant="ghost">
                  <img src="questionmark.svg" className="invert cursor-pointer w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Help Center</TooltipContent>
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
          <Editor fullscreen={fullscreen} />
          <ResizablePanel minSize={30} order={2} id="right" className={cn(isInXR && 'hidden')}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel minSize={30} order={1} id="top" className="bg-background w-full h-full flex flex-row">
                <Scene />
                <SceneToolbar fullscreen={fullscreen} />
              </ResizablePanel>
              <OutputCode fullscreen={fullscreen} />
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  )
}

function SceneToolbar({ fullscreen }: { fullscreen: boolean }) {
  return (
    <div className="border-l p-1 flex flex-col *:flex-shrink-0 overflow-y-auto flex-shrink-0">
      <ViewPopover />
      <WebXRToolbar />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={toggleFullscreen} size="icon" variant="ghost">
            {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">{fullscreen ? 'Minimize' : 'Maximize'}</TooltipContent>
      </Tooltip>

      <EnvironmentPopover />

      <ThemePopover />

      <EffectsPopover />

      <MaterialsPopover />
    </div>
  )
}

function WebXRToolbar() {
  const enterAR = useEnterXR('immersive-ar', sessionConfig)
  const enterVR = useEnterXR('immersive-vr', sessionConfig)
  const isARSupported = useSessionSupported('immersive-ar')
  const isVRSupported = useSessionSupported('immersive-vr')

  return (
    <>
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
    </>
  )
}

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
