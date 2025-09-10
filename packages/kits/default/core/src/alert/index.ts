import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  ThreeEventMap,
  RenderContext,
} from '@pmndrs/uikit'
import { borderRadius, colors } from '../theme.js'
import { computed } from '@preact/signals-core'

const alertVariants = {
  default: {
    backgroundColor: colors.card,
    color: colors.cardForeground,
  },
  destructive: {
    backgroundColor: colors.card,
    color: colors.destructive,
  },
} satisfies { [Key in string]: ContainerProperties }

export type AlertProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<AlertOutProperties<EM>>

export type AlertOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  variant?: keyof typeof alertVariants
}

export class Alert<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends AlertOutProperties<EM> = AlertOutProperties<EM>,
> extends Container<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
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
          () => alertVariants[this.properties.signal.variant.value ?? 'default'].backgroundColor,
        ),
        color: computed(() => alertVariants[this.properties.signal.variant.value ?? 'default'].color),
        ...config?.defaultOverrides,
      } as InProperties<OutProperties>,
    })
  }
}

export * from './icon.js'
export * from './title.js'
export * from './description.js'
