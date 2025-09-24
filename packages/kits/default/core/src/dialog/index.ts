import { Container, InProperties, BaseOutProperties, withOpacity } from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { colors, componentDefaults } from '../theme.js'

export type DialogOutProperties = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
} & BaseOutProperties

export type DialogProperties = InProperties<DialogOutProperties>

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
        onPointerMove: (e: any) => e.stopPropagation(),
        onPointerEnter: (e: any) => e.stopPropagation(),
        onPointerLeave: (e: any) => e.stopPropagation(),
        onWheel: (e: any) => e.stopPropagation(),
        positionType: 'absolute',
        display: computed(() => (this.currentSignal.value ? 'flex' : 'none')),
        inset: 0,
        zIndex: 50,
        backgroundColor: withOpacity('black', 0.8),
        alignItems: 'center',
        justifyContent: 'center',
        onClick: () => {
          this.setOpen(false)
        },
        ...config?.defaultOverrides,
      },
    })
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
