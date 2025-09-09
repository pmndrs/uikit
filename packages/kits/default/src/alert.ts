import {
  BaseOutProperties,
  Container,
  ContainerProperties,
  InProperties,
  ThreeEventMap,
  RenderContext,
} from '@pmndrs/uikit'
import { borderRadius, colors } from './theme.js'
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

export type AlertIconProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class AlertIcon<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertIconProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        positionLeft: 16,
        positionTop: 16,
        positionType: 'absolute',
        ...config?.defaultOverrides,
      },
    })
  }
}

export type AlertTitleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class AlertTitle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertTitleProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        marginBottom: 4,
        padding: 0,
        paddingLeft: 28,
        fontWeight: 'medium',
        letterSpacing: -0.4,
        lineHeight: '100%',
        ...config?.defaultOverrides,
      },
    })
  }
}

export type AlertDescriptionProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class AlertDescription<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: AlertDescriptionProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        paddingLeft: 28,
        lineHeight: '162.5%',
        fontSize: 14,
        opacity: 0.9,
        ...config?.defaultOverrides,
      },
    })
  }
}
