import { Blend } from 'lucide-react'
import { Button } from '../ui/button.js'
import { Card } from '../ui/card.js'
import { Checkbox } from '../ui/checkbox.js'
import { useEditorStore } from '@/state.js'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js'

export function EffectsPopover() {
  const vignette = useEditorStore((state) => state.vignetteEffect)
  const bloom = useEditorStore((state) => state.bloomEffect)
  const aberration = useEditorStore((state) => state.chromaticAberrationEffect)
  const tiltshift = useEditorStore((state) => state.tiltShiftEffect)
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost">
              <Blend className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">Change Effects</TooltipContent>
      </Tooltip>

      <PopoverContent side="left" className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
        <Card className="flex flex-col gap-4 *:justify-start p-4 bg-background">
          <div className="flex flex-col gap-2 mb-2">
            <h4 className="font-medium leading-none">Effects</h4>
            <p className="text-sm text-muted-foreground ">Toggle effects.</p>
          </div>
          <div className="flex items-center gap-2 py-2">
            <Checkbox onCheckedChange={useEditorStore.getState().setVignetteEffect} checked={vignette} id="vignette" />
            <label
              htmlFor="vignette"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Vignette
            </label>
          </div>
          <div className="flex py-2 items-center gap-2">
            <Checkbox onCheckedChange={useEditorStore.getState().setBloomEffect} checked={bloom} id="bloom" />
            <label
              htmlFor="bloom"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Bloom
            </label>
          </div>
          <div className="flex items-center gap-2 py-2">
            <Checkbox
              onCheckedChange={useEditorStore.getState().setTiltshiftEffect}
              checked={tiltshift}
              id="tiltshift"
            />
            <label
              htmlFor="tiltshift"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tilshift
            </label>
          </div>
          <div className="flex items-center gap-2 py-2">
            <Checkbox
              onCheckedChange={useEditorStore.getState().setChromaticAberrationEffect}
              checked={aberration}
              id="aberration"
            />
            <label
              htmlFor="aberration"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Chromatic Aberration
            </label>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
