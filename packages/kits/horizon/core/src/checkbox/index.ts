import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { CheckIcon } from '@pmndrs/uikit-lucide'
import { computed, signal } from '@preact/signals-core'
import { theme } from '../theme.js'

type CheckboxVariantProps = Pick<
  ContainerProperties,
  | 'backgroundColor'
  | 'borderRadius'
  | 'width'
  | 'height'
  | 'hover'
  | 'active'
  | 'important'
  | '*'
  | 'color'
  | 'margin'
  | 'borderWidth'
  | 'borderColor'
>
const _checkboxVariants = {
  normal: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: theme.component.checkbox.selected.background.default,
    color: theme.component.checkbox.selected.icon.selected,
    hover: {
      backgroundColor: theme.component.checkbox.selected.background.hover,
    },
    active: {
      backgroundColor: theme.component.checkbox.selected.background.pressed,
    },
    //used as selected here
    important: {
      backgroundColor: theme.component.checkbox.selected.background.selected,
    },
    '*': {
      width: 14,
      height: 14,
    },
  },
  onMedia: {
    width: 32,
    height: 32,
    borderRadius: 100,
    hover: {
      backgroundColor: theme.component.onMediaCheckbox.background.hovered,
      color: theme.component.onMediaCheckbox.icon.hovered,
    },
    active: {
      backgroundColor: theme.component.onMediaCheckbox.background.pressed,
      color: theme.component.onMediaCheckbox.icon.pressed,
    },
    //used as selected here
    important: {
      backgroundColor: theme.component.onMediaCheckbox.background.selected,
      color: theme.component.onMediaCheckbox.icon.selected,
    },
    '*': {
      width: 24,
      height: 24,
    },
  },
} satisfies Record<string, CheckboxVariantProps>
const checboxVariants = _checkboxVariants as UnionizeVariants<typeof _checkboxVariants>

export type CheckboxOutProperties = BaseOutProperties & {
  checked?: boolean
  disabled?: boolean
  variant?: keyof typeof checboxVariants
  onCheckedChange?: (checked: boolean) => void
  defaultChecked?: boolean
}

export type CheckboxProperties = InProperties<CheckboxOutProperties>

export class Checkbox extends Container<CheckboxOutProperties> {
  public readonly uncontrolledSignal = signal<boolean | undefined>(undefined)
  public readonly currentSignal = computed(
    () => this.properties.value.checked ?? this.uncontrolledSignal.value ?? this.properties.value.defaultChecked,
  )
  public readonly icon: CheckIcon
  public readonly defaultOnMediaRing: Container

  constructor(
    inputProperties?: InProperties<CheckboxOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<CheckboxOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        width: computed(() => checboxVariants[this.properties.value.variant ?? 'normal'].width),
        height: computed(() => checboxVariants[this.properties.value.variant ?? 'normal'].height),
        borderRadius: computed(() => checboxVariants[this.properties.value.variant ?? 'normal'].borderRadius),
        backgroundColor: computed(
          () => checboxVariants[this.properties.value.variant ?? 'normal'].backgroundColor?.value,
        ),
        hover: {
          backgroundColor: computed(
            () => checboxVariants[this.properties.value.variant ?? 'normal'].hover?.backgroundColor?.value,
          ),
        },
        active: {
          backgroundColor: computed(
            () => checboxVariants[this.properties.value.variant ?? 'normal'].active?.backgroundColor?.value,
          ),
        },
        important: {
          backgroundColor: computed(() =>
            this.currentSignal.value
              ? checboxVariants[this.properties.value.variant ?? 'normal'].important?.backgroundColor?.value
              : undefined,
          ),
        },
        color: computed(() => checboxVariants[this.properties.value.variant ?? 'normal'].color?.value),
        onClick: () => {
          if (this.properties.peek().disabled) {
            return
          }
          const checked = this.currentSignal.peek()
          if (this.properties.peek().checked == null) {
            this.uncontrolledSignal.value = !checked
          }
          this.properties.peek().onCheckedChange?.(!checked)
        },
        ...config?.defaultOverrides,
      },
    })
    super.add(
      (this.defaultOnMediaRing = new Container(undefined, undefined, {
        defaultOverrides: {
          display: computed(() =>
            this.hoveredList.value.length === 0 &&
            this.activeList.value.length === 0 &&
            !this.currentSignal.value &&
            (this.properties.value.variant ?? 'normal') === 'onMedia'
              ? 'flex'
              : 'none',
          ),
          borderColor: theme.component.onMediaCheckbox.icon.default,
          width: 20,
          height: 20,
          borderWidth: 2,
          positionType: 'absolute',
          positionTop: '50%',
          positionLeft: '50%',
          transformTranslateX: '-50%',
          transformTranslateY: '-50%',
          borderRadius: 1000,
        },
      })),
    )
    super.add(
      (this.icon = new CheckIcon(undefined, undefined, {
        defaultOverrides: {
          display: computed(() => {
            if ((this.properties.value.variant ?? 'normal') === 'normal') {
              return this.currentSignal.value ? 'flex' : 'none'
            }
            if (
              this.hoveredList.value.length === 0 &&
              this.activeList.value.length === 0 &&
              !this.currentSignal.value
            ) {
              return 'none'
            }
            return 'flex'
          }),
          flexShrink: 0,
          width: computed(() => checboxVariants[this.properties.value.variant ?? 'normal']['*']?.width),
          height: computed(() => checboxVariants[this.properties.value.variant ?? 'normal']['*']?.height),
          color: theme.component.checkbox.selected.icon.selected,
        },
      })),
    )
  }

  dispose(): void {
    this.defaultOnMediaRing.dispose()
    this.icon.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the checkbox component can not have any children`)
  }
}
