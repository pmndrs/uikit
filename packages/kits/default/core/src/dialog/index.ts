import { boolean, custom, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { Container, InProperties, BaseOutProperties, withOpacity } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'
export const DialogOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    open: boolean().optional(),
    onOpenChange: custom<(open: boolean) => void>((value) => typeof value === 'function').optional(),
    defaultOpen: boolean().optional(),
  }).strict(),
)

export const DialogPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(DialogOutPropertiesSchema),
)

export type DialogOutProperties = BaseOutProperties & z.output<typeof DialogOutPropertiesSchema>

export type DialogProperties = z.input<typeof DialogPropertiesSchema>

export class Dialog extends Container<DialogOutProperties> {
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.open ?? this.uncontrolledSignal.value ?? this.properties.value.defaultOpen,
  )

  constructor(
    inputProperties?: InProperties<DialogOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        positionType: 'absolute',
        display: computed(() => (this.currentSignal.value ? 'flex' : 'none')),
        inset: 0,
        zIndex: 50,
        backgroundColor: withOpacity('black', 0.8),
        alignItems: 'center',
        justifyContent: 'center',
        ...config?.defaultOverrides,
      },
    })

    const stopPropagationListener = (e: any) => e.stopPropagation()
    this.addEventListener('pointermove', stopPropagationListener)
    this.addEventListener('pointerenter', stopPropagationListener)
    this.addEventListener('pointerleave', stopPropagationListener)
    this.addEventListener('wheel', stopPropagationListener)
    this.addEventListener('click', () => this.setOpen(false))
  }

  setOpen(open: boolean) {
    const props = this.properties.peek()
    if (props.open == null) {
      this.uncontrolledSignal.value = open
    }
    props.onOpenChange?.(open)
  }
}

export * from './trigger.js'
export * from './content.js'
export * from './header.js'
export * from './footer.js'
export * from './title.js'
export * from './description.js'
