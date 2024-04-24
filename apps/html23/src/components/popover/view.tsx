import { cn } from '@/lib/utils.js'
import { Rotate3D } from 'lucide-react'
import { Button } from '../ui/button.js'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js'
import { useEditorStore } from '@/state.js'

export function ViewPopover() {
  const view = useEditorStore((state) => state.view)
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={() => useEditorStore.getState().setView(view === 'floating' ? 'hud' : 'floating')}
          size="icon"
          variant="ghost"
        >
          <div className={cn('-m-2 p-2 ', view === 'floating' && 'bg-white text-black rounded')}>
            <Rotate3D className="w-4 h-4 " />
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left">{view === 'floating' ? 'Switch to 2D View' : 'Switch to 3D View'}</TooltipContent>
    </Tooltip>
  )
}
