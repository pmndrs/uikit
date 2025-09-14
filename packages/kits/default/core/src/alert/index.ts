import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  ThreeEventMap,
  RenderContext,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { borderRadius, colors, componentDefaults } from '../theme.js'
import { computed } from '@preact/signals-core'

const _alertVariants = {
  default: {
    backgroundColor: colors.card,
    color: colors.cardForeground,
  },
  destructive: {
    backgroundColor: colors.card,
    color: colors.destructive,
  },
} satisfies { [Key in string]: ContainerProperties }
const alertVariants = _alertVariants as UnionizeVariants<typeof _alertVariants>

export type AlertProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<AlertOutProperties<EM>>

export type AlertOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  variant?: keyof typeof alertVariants
}

export class Alert<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, AlertOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<AlertOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AlertOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'column',
        positionType: 'relative',
        width: '100%',
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        padding: 16,
        backgroundColor: computed(
          () => alertVariants[this.properties.value.variant ?? 'default'].backgroundColor?.value,
        ),
        ...componentDefaults,
        color: computed(() => alertVariants[this.properties.value.variant ?? 'default'].color?.value),
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './icon.js'
export * from './title.js'
export * from './description.js'
