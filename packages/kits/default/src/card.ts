import { Container, ContainerProperties, ThreeEventMap } from '@pmndrs/uikit'
import { InProperties, BaseOutProperties } from '@pmndrs/uikit/src/properties/index.js'
import { borderRadius, colors } from './theme.js'

export type CardProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Card<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, BaseOutProperties<EM>> {
  protected internalResetProperties(inputProperties?: CardProperties<EM>): void {
    super.internalResetProperties({
      flexDirection: 'column',
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      backgroundColor: colors.card,
      color: colors.cardForeground,
      ...inputProperties,
    })
  }
}

export type CardHeaderProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class CardHeader<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: CardHeaderProperties<EM>): void {
    super.internalResetProperties({
      padding: 24,
      flexDirection: 'column',
      gap: 6,
      ...inputProperties,
    })
  }
}

export type CardTitleProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class CardTitle<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: CardTitleProperties<EM>): void {
    super.internalResetProperties({
      fontWeight: 'semi-bold',
      letterSpacing: -0.4,
      fontSize: 24,
      lineHeight: '100%',
      ...inputProperties,
    })
  }
}

export type CardDescriptionProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class CardDescription<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: CardDescriptionProperties<EM>): void {
    super.internalResetProperties({
      fontSize: 14,
      lineHeight: 20,
      color: colors.mutedForeground,
      ...inputProperties,
    })
  }
}

export type CardContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class CardContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: CardContentProperties<EM>): void {
    super.internalResetProperties({
      padding: 24,
      paddingTop: 0,
      ...inputProperties,
    })
  }
}

export type CardFooterProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class CardFooter<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: CardFooterProperties<EM>): void {
    super.internalResetProperties({
      flexDirection: 'row',
      alignItems: 'center',
      padding: 24,
      paddingTop: 0,
      ...inputProperties,
    })
  }
}
