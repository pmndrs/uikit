import { Container, ThreeEventMap } from '@pmndrs/uikit'
import { InProperties, BaseOutProperties } from '@pmndrs/uikit/src/properties/index.js'

export type LabelNonReactiveProperties = {
  disabled?: boolean
}

export type LabelProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  BaseOutProperties<EM>,
  LabelNonReactiveProperties
>

export class Label<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>,
  LabelNonReactiveProperties
> {
  protected internalResetProperties({ disabled, ...rest }: LabelProperties<EM> = {}): void {
    super.internalResetProperties({
      fontWeight: 'medium',
      fontSize: 14,
      lineHeight: '100%',
      opacity: disabled ? 0.7 : undefined,
      ...rest,
    })
  }
}
