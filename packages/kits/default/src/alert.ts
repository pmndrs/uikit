import { Container, ContainerProperties, ThreeEventMap } from '@pmndrs/uikit'
import { InProperties, BaseOutProperties } from '@pmndrs/uikit/src/properties/index.js'
import { borderRadius, colors } from './theme.js'

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

export type AlertNonReactiveProperties = {
  variant?: keyof typeof alertVariants
}

export type AlertProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  BaseOutProperties<EM>,
  AlertNonReactiveProperties
>

export class Alert<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>,
  AlertNonReactiveProperties
> {
  protected internalResetProperties({ variant, ...rest }: AlertProperties<EM> = {}): void {
    const variantProperties = alertVariants[variant ?? 'default']

    super.internalResetProperties({
      flexDirection: 'column',
      positionType: 'relative',
      width: '100%',
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      padding: 16,
      ...variantProperties,
      ...rest,
    })
  }
}

export type AlertIconProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class AlertIcon<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: AlertIconProperties<EM>): void {
    super.internalResetProperties({
      positionLeft: 16,
      positionTop: 16,
      positionType: 'absolute',
      ...inputProperties,
    })
  }
}

export type AlertTitleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class AlertTitle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: AlertTitleProperties<EM>): void {
    super.internalResetProperties({
      marginBottom: 4,
      padding: 0,
      paddingLeft: 28,
      fontWeight: 'medium',
      letterSpacing: -0.4,
      lineHeight: '100%',
      ...inputProperties,
    })
  }
}

export type AlertDescriptionProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class AlertDescription<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: AlertDescriptionProperties<EM>): void {
    super.internalResetProperties({
      paddingLeft: 28,
      lineHeight: '162.5%',
      fontSize: 14,
      opacity: 0.9,
      ...inputProperties,
    })
  }
}
