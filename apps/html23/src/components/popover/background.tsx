import { cn } from '@/lib/utils.js'
import { Button } from '../ui/button.js'
import { Card } from '../ui/card.js'
import { Image } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js'
import { PopoverClose } from '@radix-ui/react-popover'
import { useEditorStore } from '@/state.js'

const backgroundPresets = ['apartment', 'city', 'dawn', 'forest', 'lobby', 'night', 'park', 'studio', 'sunset']
const backgroundColors = [0xffffff, 0x0, 0xadd8e6, 0x90ee90, 0xd3d3d3, 0xffffe0, 0xffb6c1, 0xe6e6fa, 0xffdab9]

export function BackgroundPopover() {
  const background = useEditorStore((state) => state.background)
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost">
              <Image className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">Change Background</TooltipContent>
      </Tooltip>
      <PopoverContent side="left" className="w-auto p-0">
        <Card className="flex flex-col gap-4 p-4 bg-background">
          <div className="flex flex-col gap-2">
            <h4 className="font-medium leading-none">Background</h4>
            <p className="text-sm text-muted-foreground ">Choose a background.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {backgroundColors.map((color) => (
              <PopoverClose asChild key={color}>
                <Button
                  onClick={() => useEditorStore.getState().setBackground(color)}
                  variant="ghost"
                  className={cn(color === background && 'border-2 border-white')}
                  size="icon"
                >
                  <div
                    style={{ backgroundColor: `#${color.toString(16).padStart(6, '0')}` }}
                    className="rounded w-6 h-6"
                  />
                </Button>
              </PopoverClose>
            ))}
            {backgroundPresets.map((preset) => (
              <PopoverClose asChild key={preset}>
                <Button
                  variant="ghost"
                  onClick={() => useEditorStore.getState().setBackground(preset)}
                  className={cn(preset === background && 'border-2 border-white')}
                  size="icon"
                >
                  <img src={`./${preset}.png`} className="rounded w-6 h-6" />
                </Button>
              </PopoverClose>
            ))}
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
