import EditorImpl from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import { useEditorStore, useUiState } from '@/state.js'
import { startTransition } from 'react'
import { ResizableHandle, ResizablePanel } from './ui/resizable.js'
import { cn } from '@/lib/utils.js'
import { useIsInSessionMode } from '@coconut-xr/natuerlich/react'
import { Button } from './ui/button.js'
import { ChevronLeft, ChevronRight, Code, PanelLeftClose } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip.js'

export function Editor({ fullscreen }: { fullscreen: boolean }) {
  const code = useEditorStore((state) => state.code)
  const isInXR = useIsInSessionMode(['immersive-ar', 'immersive-vr'])
  const isVisible = useUiState((s) => s.showEditor ?? false) || isInXR

  if (!isVisible) {
    return (
      <div className="w-0 h-full relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="top-2 w-8 absolute z-50"
              size="icon"
              variant="outline"
              onClick={() => useUiState.setState({ showEditor: true })}
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, transform: 'translate(99%, 0)', right: 0 }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Show the Code Editor</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <>
      <ResizablePanel order={1} id="left" className={cn('p-4 md:flex hidden', fullscreen && 'md:hidden')} minSize={15}>
        <div className="overflow-auto flex-col w-full">
          <EditorImpl
            value={code}
            onValueChange={(code) => startTransition(() => useEditorStore.getState().setCode(code))}
            highlight={(code) => highlight(code, languages.html, 'html')}
            className="font-mono text-base flex-grow flex-shrink-0 min-w-full min-h-full"
            textareaClassName="outline-none"
          />
        </div>
      </ResizablePanel>

      <ResizableHandle className={cn('md:flex hidden', (isInXR || fullscreen) && 'md:hidden', 'relative')} withHandle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="top-2 w-8 absolute z-50"
              size="icon"
              variant="outline"
              onClick={() => useUiState.setState({ showEditor: false })}
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, transform: 'translate(99%, 0)', right: 0 }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Hide the Code Editor</TooltipContent>
        </Tooltip>
      </ResizableHandle>
    </>
  )
}
