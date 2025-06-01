import { Container, ThreeEventMap } from '@pmndrs/uikit'
import { InProperties, BaseOutProperties } from '@pmndrs/uikit/src/properties/index.js'
import { colors } from './theme.js'

export type SeparatorNonReactiveProperties = {
  orientation?: 'horizontal' | 'vertical'
}

export type SeparatorProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  BaseOutProperties<EM>,
  SeparatorNonReactiveProperties
>

export class Separator<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>,
  SeparatorNonReactiveProperties
> {
  protected internalResetProperties({ orientation, ...rest }: SeparatorProperties<EM> = {}): void {
    super.internalResetProperties({
      flexShrink: 0,
      backgroundColor: colors.border,
      width: (orientation ?? 'horizontal' === 'horizontal') ? '100%' : 1,
      height: (orientation ?? 'horizontal' === 'horizontal') ? 1 : '100%',
      ...rest,
    })
  }
}
