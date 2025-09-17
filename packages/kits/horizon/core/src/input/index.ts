import {
  abortableEffect,
  BaseOutProperties,
  Component,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  Input as InputImpl,
  InputOutProperties as BaseInputOutProperties,
  ThreeEventMap,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { computed, ReadonlySignal } from '@preact/signals-core'
import { theme } from '../theme.js'

type InputVariantProps = Pick<ContainerProperties, 'height' | 'fontSize' | 'lineHeight'>
const _inputSizes = {
  lg: {
    height: 48,
    fontSize: 14,
    lineHeight: '20px',
  },
  sm: {
    height: 32,
    fontSize: 12,
    lineHeight: '16px',
  },
} satisfies Record<string, InputVariantProps>
const inputSizes = _inputSizes as UnionizeVariants<typeof _inputSizes>

export type InputOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseInputOutProperties<EM> & {
  /**
   * @default "lg"
   */
  size?: keyof typeof inputSizes
  variant: 'search' | 'text'
  textAlign: 'center' | 'left'
  leftIcon?: {
    new (
      inputProperties: any,
      initialClasses: any,
      config: { defaultOverrides?: InProperties<BaseOutProperties<EM>> },
    ): Component
  }
  rightIcon?: {
    new (
      inputProperties: any,
      initialClasses: any,
      config: { defaultOverrides?: InProperties<BaseOutProperties<EM>> },
    ): Component
  }
  placeholder?: string
}

export type InputProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<InputOutProperties<EM>>

export class Input<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, InputOutProperties<EM>> {
  public readonly input: InputImpl
  public readonly leftIconPlaceholder: Container
  public leftIcon?: Component
  public readonly rightIconPlaceholder: Container
  public rightIcon?: Component

  constructor(
    inputProperties?: InProperties<InputOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<InputOutProperties<EM>>
      hovered?: ReadonlySignal<boolean>
    },
  ) {
    const hovered = config?.hovered ?? computed(() => this.hoveredList.value.length > 0)
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        //exists to make sure the handlers are applied
        hover: {},
        cursor: 'text',
        width: '100%',
        gap: 12,
        flexDirection: 'row',
        alignItems: 'center',
        fontSize: computed(() => inputSizes[this.properties.value.size ?? 'lg'].fontSize),
        lineHeight: computed(() => inputSizes[this.properties.value.size ?? 'lg'].lineHeight),
        fontWeight: 500,
        color: computed(() =>
          (this.properties.value.variant ?? 'text') === 'text'
            ? theme.component.textInput.label.default.value
            : theme.component.search.label.value,
        ),
        paddingX: 16,
        height: computed(() => inputSizes[this.properties.value.size ?? 'lg'].height),
        borderRadius: 8,
        backgroundColor: computed(() => {
          if (this.input.hasFocus.value) {
            return theme.component.textInput.background.typing.value
          }
          if (hovered.value) {
            return theme.component.textInput.background.hovered.value
          }
          return theme.component.textInput.background.default.value
        }),

        ...config?.defaultOverrides,
      },
    })
    this.addEventListener('click', () => this.input.focus())
    const iconSize = computed(() =>
      (this.properties.value.variant ?? 'text') === 'search' && (this.properties.value.size ?? 'lg') === 'lg' ? 24 : 16,
    )
    this.leftIconPlaceholder = new Container()
    super.add(this.leftIconPlaceholder)
    this.input = new InputImpl(undefined, undefined, {
      defaultOverrides: {
        flexGrow: 1,
        flexShrink: 0,
        textAlign: this.properties.signal.textAlign,
        minWidth: 100,
        focus: {
          color: theme.component.textInput.label.typing,
        },
        caretColor: theme.component.textInput.cursor,
        placeholderStyle: {
          color: theme.component.semantic.text.placeholder,
        },
        placeholder: this.properties.signal.placeholder,
        defaultValue: this.properties.signal.defaultValue,
        value: this.properties.signal.value,
        disabled: this.properties.signal.disabled,
        tabIndex: this.properties.signal.tabIndex,
        autocomplete: this.properties.signal.autocomplete,
        type: this.properties.signal.type,
        onValueChange: this.properties.signal.onValueChange,
        onFocusChange: this.properties.signal.onFocusChange,
      },
    })
    super.add(this.input)
    this.rightIconPlaceholder = new Container()
    super.add(this.rightIconPlaceholder)

    const iconColor = computed(() =>
      (this.properties.value.variant ?? 'text') === 'search'
        ? theme.component.search.icon.value
        : this.input.hasFocus
          ? theme.component.textInput.label.typing.value
          : theme.component.textInput.label.default.value,
    )

    abortableEffect(() => {
      const LeftIcon = this.properties.value.leftIcon
      if (LeftIcon == null) {
        return
      }
      const leftIcon = new LeftIcon(undefined, undefined, {
        defaultOverrides: { width: iconSize, height: iconSize, flexShrink: 0, color: iconColor },
      })
      this.leftIconPlaceholder.add(leftIcon)
      this.leftIcon = leftIcon
      return () => {
        leftIcon.dispose()
        this.leftIcon = undefined
      }
    }, this.abortSignal)
    abortableEffect(() => {
      const RightIcon = this.properties.value.rightIcon
      if (RightIcon == null) {
        return
      }
      const rightIcon = new RightIcon(undefined, undefined, {
        defaultOverrides: { width: iconSize, height: iconSize, flexShrink: 0, color: iconColor },
      })
      this.rightIconPlaceholder.add(rightIcon)
      this.rightIcon = rightIcon
      return () => {
        rightIcon.dispose()
        this.rightIcon = undefined
      }
    }, this.abortSignal)
  }

  dispose(): void {
    this.input.dispose()
    this.leftIconPlaceholder.dispose()
    this.rightIconPlaceholder.dispose()
    this.leftIcon?.dispose()
    this.rightIcon?.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the Input component can not have any children`)
  }
}
