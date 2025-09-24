import {
  abortableEffect,
  BaseOutProperties,
  Component,
  Container,
  ContainerProperties,
  InProperties,
  RenderContext,
  Text,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { theme } from '../theme.js'

type BadgeVariantProps = Pick<ContainerProperties, 'backgroundColor' | 'color'>
const _badgeVariants = {
  primary: {
    backgroundColor: theme.component.badges.primary.background,
    color: theme.component.badges.primary.label,
  },
  secondary: {
    backgroundColor: theme.component.badges.secondary.background,
    color: theme.component.badges.secondary.label,
  },
  positive: {
    backgroundColor: theme.component.badges.positive.background,
    color: theme.component.badges.positive.label,
  },
  negative: {
    backgroundColor: theme.component.badges.background.background,
    color: theme.component.badges.background.label,
  },
} satisfies Record<string, BadgeVariantProps>
const badgeVariants = _badgeVariants as UnionizeVariants<typeof _badgeVariants>

export type BadgeOutProperties = BaseOutProperties & {
  /**
   * @default "primary"
   */
  variant?: keyof typeof badgeVariants
  label?: string
  icon?: {
    new (
      inputProperties: any,
      initialClasses: any,
      config: { defaultOverrides?: InProperties<BaseOutProperties> },
    ): Component
  }
}

export type BadgeProperties = InProperties<BadgeOutProperties>

export class Badge extends Container<BadgeOutProperties> {
  public readonly label: Text
  public readonly iconPlaceholder: Container
  public icon?: Component

  constructor(
    inputProperties?: InProperties<BadgeOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BadgeOutProperties>
    },
  ) {
    const width = computed(() => {
      if (this.properties.value.icon != null) {
        return undefined
      }
      const length = this.properties.value.label?.length ?? 0
      if (length === 0) {
        return 12
      }
      if (length === 1) {
        return 24
      }
      return undefined
    })
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        borderRadius: computed(() =>
          (this.properties.value.label?.length ?? 0) > 1 || this.properties.value.icon != null ? 8 : 1000,
        ),
        color: computed(() => badgeVariants[this.properties.value.variant ?? 'primary'].color?.value),
        backgroundColor: computed(
          () => badgeVariants[this.properties.value.variant ?? 'primary'].backgroundColor?.value,
        ),
        paddingX: computed(() =>
          (this.properties.value.label?.length ?? 0) > 1 || this.properties.value.icon != null ? 8 : undefined,
        ),
        paddingY: computed(() =>
          (this.properties.value.label?.length ?? 0) > 1 || this.properties.value.icon != null ? 4 : undefined,
        ),
        width: width,
        height: width,
        fontSize: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        lineHeight: '16px',
        fontWeight: 700,
        ...config?.defaultOverrides,
      },
    })

    this.iconPlaceholder = new Container(undefined, undefined, {
      defaultOverrides: { display: computed(() => (this.properties.value.icon == null ? 'none' : 'flex')) },
    })
    super.add(this.iconPlaceholder)
    this.label = new Text(undefined, undefined, {
      defaultOverrides: {
        text: this.properties.signal.label,
        display: computed(() => ((this.properties.value.label?.length ?? 0) === 0 ? 'none' : 'flex')),
      },
    })
    super.add(this.label)

    abortableEffect(() => {
      const Icon = this.properties.value.icon
      if (Icon == null) {
        return
      }
      const icon = new Icon(undefined, undefined, {
        defaultOverrides: { width: 16, height: 16 },
      })
      this.iconPlaceholder.add(icon)
      this.icon = icon
      return () => {
        this.icon = undefined
        icon.dispose()
      }
    }, this.abortSignal)
  }

  dispose(): void {
    this.icon?.dispose()
    this.label.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the Badge component can not have any children`)
  }
}
