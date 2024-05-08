import { Droplet } from 'lucide-react'
import { Button } from '../ui/button.js'
import { Card } from '../ui/card.js'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js'
import { create } from 'zustand'
import { ComponentPropsWithoutRef, HTMLProps, forwardRef, useEffect, useRef, useState } from 'react'
import { applyMaterialToLastHovered } from '../scene.js'
import { GlassMaterial, MetalMaterial, PlasticMaterial } from '@react-three/uikit'
import { MeshBasicMaterial, Vector2Tuple } from 'three'

export type DraggingMaterial = {
  name: string
  applyClassNames: Array<string>
  removeClassNames: Array<string>
  style: Record<string, any>
  previewUrl: string
}

const materials: Array<DraggingMaterial> = [
  {
    name: 'Glass',
    applyClassNames: ['material-glass', 'border-4', 'border-bend', 'border-transparent'],
    removeClassNames: ['material-glass', 'border-4', 'border-bend', 'border-transparent'],
    style: {
      borderWidth: 4,
      borderBend: 0.5,
      borderOpacity: 0,
      panelMaterialClass: GlassMaterial,
    },
    previewUrl: 'glass.png',
  },
  {
    name: 'Plastic',
    applyClassNames: ['material-plastic', 'border-4', 'border-bend', 'border-transparent'],
    removeClassNames: ['material-plastic', 'border-4', 'border-bend', 'border-transparent'],
    style: {
      borderWidth: 4,
      borderBend: 0.5,
      borderOpacity: 0,
      panelMaterialClass: PlasticMaterial,
    },
    previewUrl: 'plastic.png',
  },
  {
    name: 'Metal',
    applyClassNames: ['material-metal', 'border-4', 'border-bend', 'border-transparent'],
    removeClassNames: ['material-metal', 'border-4', 'border-bend', 'border-transparent'],
    style: {
      borderWidth: 4,
      borderBend: 0.5,
      borderOpacity: 0,
      panelMaterialClass: MetalMaterial,
    },
    previewUrl: 'metal.png',
  },

  {
    name: 'Flat Glass',
    applyClassNames: ['material-glass'],
    removeClassNames: ['material-glass', 'border-bend'],
    style: {
      borderBend: 0,
      panelMaterialClass: GlassMaterial,
    },
    previewUrl: 'flat-glass.png',
  },
  {
    name: 'Flat Plastic',
    applyClassNames: ['material-plastic'],
    removeClassNames: ['material-plastic', 'border-bend'],
    style: {
      borderBend: 0,
      panelMaterialClass: PlasticMaterial,
    },
    previewUrl: 'flat-plastic.png',
  },
  {
    name: 'Flat Metal',
    applyClassNames: ['material-metal'],
    removeClassNames: ['material-metal', 'border-bend'],
    style: {
      borderBend: 0,
      panelMaterialClass: MetalMaterial,
    },
    previewUrl: 'flat-metal.png',
  },

  {
    name: 'No Material',
    applyClassNames: [''],
    removeClassNames: ['material-metal', 'material-glass', 'material-plastic', 'border-bend', 'border-transparent'],
    style: {
      borderBend: 0,
      panelMaterialClass: MeshBasicMaterial,
    },
    previewUrl: 'flat-plastic.png',
  },
]

export const useDraggingMaterialStore = create<DraggingMaterial | undefined>(() => undefined)

window.addEventListener('pointerup', () => {
  applyMaterialToLastHovered()
  useDraggingMaterialStore.setState(undefined)
})

window.addEventListener('pointermove', (e) => {
  useCursorPositionStore.setState([e.pageX, e.pageY])
})

const useCursorPositionStore = create<Vector2Tuple>(() => [0, 0])

export function ShowDraggingMaterial({ material }: { material: DraggingMaterial }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const update = ({ 0: x, 1: y }: Vector2Tuple) => {
      if (ref.current == null) {
        return
      }
      ref.current.style.left = `${x}px`
      ref.current.style.top = `${y}px`
    }
    update(useCursorPositionStore.getState())
    return useCursorPositionStore.subscribe(update)
  }, [])
  return (
    <div ref={ref} className="z-50 rounded bg-background opacity-50 pointer-events-none absolute">
      <MaterialDisplay material={material} />
    </div>
  )
}

export function MaterialsPopover() {
  const [open, setOpen] = useState(false)
  const draggingMaterial = useDraggingMaterialStore()
  return (
    <>
      {draggingMaterial && <ShowDraggingMaterial material={draggingMaterial} />}
      <Popover onOpenChange={setOpen} open={open}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost">
                <Droplet className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">Apply Material</TooltipContent>
        </Tooltip>

        <PopoverContent side="left" className="w-auto p-0" onClick={(e) => e.stopPropagation()}>
          <Card className="flex flex-col gap-2 p-2 bg-background">
            {materials.map((material) => (
              <Tooltip key={material.name}>
                <TooltipTrigger asChild>
                  <MaterialDisplay
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      setOpen(false)
                      useDraggingMaterialStore.setState(material)
                    }}
                    material={material}
                  />
                </TooltipTrigger>
                <TooltipContent>Drag on User Interface</TooltipContent>
              </Tooltip>
            ))}
          </Card>
        </PopoverContent>
      </Popover>
    </>
  )
}

const MaterialDisplay = forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement> & { material: DraggingMaterial }>(
  ({ material, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className="cursor-pointer flex flex-row justify-between items-center p-2 gap-2 hover:bg-primary hover:text-primary-foreground rounded-lg"
        {...props}
      >
        <span>{material.name}</span>
        <img src={material.previewUrl} className="pointer-events-none h-10 rounded" />
      </div>
    )
  },
)
