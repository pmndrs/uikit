import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  RenderContext,
} from '@pmndrs/uikit'

const toggleVariants = {
  default: {},
  outline: {},
}
const toggleSizes = {
  default: { height: 40, paddingX: 12 },
  sm: { height: 36, paddingX: 10 },
  lg: { height: 44, paddingX: 20 },
} satisfies { [Key in string]: ContainerProperties }

export type ToggleGroupOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  variant?: keyof typeof toggleVariants
  size?: keyof typeof toggleSizes
} & BaseOutProperties<EM>

export type ToggleGroupProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<ToggleGroupOutProperties<EM>>

export class ToggleGroup<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  ToggleGroupOutProperties<EM>
> {
  constructor(
    inputProperties?: ToggleGroupProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<ToggleGroupOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        ...config?.defaultOverrides,
      },
    })
  }
}

export * from './item'
