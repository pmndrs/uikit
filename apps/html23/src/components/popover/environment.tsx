import { cn } from '@/lib/utils.js'
import { Button } from '../ui/button.js'
import { Card } from '../ui/card.js'
import { Image } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js'
import { PopoverClose } from '@radix-ui/react-popover'
import { useEditorStore } from '@/state.js'

export const environmentPresets = [
  'apartment',
  'city',
  'dawn',
  'forest',
  'lobby',
  'night',
  'park',
  'studio',
  'sunset',
] as const
export const environmentColors = [0xffffff, 0x0, 0xadd8e6, 0x90ee90, 0xd3d3d3, 0xffffe0, 0xffb6c1, 0xe6e6fa, 0xffdab9]
export const environmentColorNames = ['White', 'Black', 'Blue', 'Green', 'Grey', 'Yellow', 'Pink', 'Lavender', 'Peach']

export function EnvironmentPopover() {
  const environment = useEditorStore((state) => state.environment)
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
        <TooltipContent side="left">Change Environment</TooltipContent>
      </Tooltip>
      <PopoverContent side="left" className="w-auto p-0">
        <Card className="flex flex-col gap-4 p-4 bg-background">
          <div className="flex flex-col gap-2">
            <h4 className="font-medium leading-none">Environment</h4>
            <p className="text-sm text-muted-foreground ">Choose a environment.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {environmentColors.map((color) => (
              <PopoverClose asChild key={color}>
                <Button
                  onClick={() => useEditorStore.getState().setEnvironment(color)}
                  variant="ghost"
                  className={cn(color === environment && 'border-2 border-white')}
                  size="icon"
                >
                  <div
                    style={{ backgroundColor: `#${color.toString(16).padStart(6, '0')}` }}
                    className="rounded w-6 h-6"
                  />
                </Button>
              </PopoverClose>
            ))}
            {environmentPresets.map((preset) => (
              <PopoverClose asChild key={preset}>
                <Button
                  variant="ghost"
                  onClick={() => useEditorStore.getState().setEnvironment(preset)}
                  className={cn(preset === environment && 'border-2 border-white')}
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
