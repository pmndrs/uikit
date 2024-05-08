import { cn } from '@/lib/utils.js'
import { Eye, Rotate3D } from 'lucide-react'
import { Button } from '../ui/button.js'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js'
import { useEditorStore } from '@/state.js'
import { startTransition } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js'
import { Card } from '../ui/card.js'

const views = [
  {
    name: 'HUD',
    value: 'hud',
  },
  {
    name: 'Floating',
    value: 'floating',
  },
] as const

export function ViewPopover() {
  const view = useEditorStore((state) => state.view)
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost">
              <Eye className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">Select View</TooltipContent>
      </Tooltip>

      <PopoverContent side="left" className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
        <Card className="flex flex-col gap-2 p-2 bg-background">
          {views.map(({ name, value }) => (
            <Tooltip key={name}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => useEditorStore.setState({ view: value })}
                  variant={view === value ? 'default' : 'ghost'}
                >
                  {name}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">View from {name}</TooltipContent>
            </Tooltip>
          ))}
        </Card>
      </PopoverContent>
    </Popover>
  )
}
