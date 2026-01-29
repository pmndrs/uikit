import { Container, ThreeEventMap, InProperties, BaseOutProperties } from '@ni2khanna/uikit'

export type PaginationItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class PaginationItem<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {}
