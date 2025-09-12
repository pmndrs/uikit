import {
  Container,
  ContainerProperties,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  RenderContext,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors } from '../theme.js'

type PaginationSizeProps = Pick<ContainerProperties, 'height' | 'width' | 'paddingX' | 'paddingY'>

const _paginationSizes = {
  default: { height: 40, paddingX: 16, paddingY: 8 },
  sm: { height: 36, paddingX: 12 },
  lg: { height: 42, paddingX: 32 },
  icon: { height: 40, width: 40 },
} satisfies Record<string, PaginationSizeProps>
const paginationSizes = _paginationSizes as UnionizeVariants<typeof _paginationSizes>

export type PaginationLinkOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  size?: keyof typeof paginationSizes
  isActive?: boolean
}

export type PaginationLinkProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  PaginationLinkOutProperties<EM>
>

export class PaginationLink<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  PaginationLinkOutProperties<EM>
> {
  constructor(
    inputProperties?: PaginationLinkProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<PaginationLinkOutProperties<EM>>
    },
  ) {
    const sizeProps = computed(() => paginationSizes[this.properties.value.size ?? 'default'])
    const paddingX = computed(() => sizeProps.value?.paddingX)
    const paddingY = computed(() => sizeProps.value?.paddingY)
    const isActive = computed(() => this.properties.value.isActive ?? false)
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        cursor: 'pointer',
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        hover: { backgroundColor: colors.accent },
        backgroundColor: computed(() => (isActive.value ? colors.background.value : undefined)),
        color: computed(() => (isActive.value ? colors.foreground.value : undefined)),
        borderWidth: computed(() => (isActive.value ? 1 : undefined)),
        borderColor: computed(() => (isActive.value ? colors.input.value : undefined)),
        height: computed(() => sizeProps.value?.height),
        width: computed(() => sizeProps.value?.width),
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        ...config?.defaultOverrides,
      },
    })
  }
}
