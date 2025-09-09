import {
  Container,
  ContainerProperties,
  Text,
  ThreeEventMap,
  InProperties,
  BaseOutProperties,
  RenderContext,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { ChevronLeft, ChevronRight, Ellipsis } from '@pmndrs/uikit-lucide'
import { borderRadius, colors } from './theme.js'

export type PaginationProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Pagination<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        marginX: 'auto',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        ...config?.defaultOverrides,
      },
    })
  }
}

export type PaginationContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class PaginationContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: PaginationContentProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        ...config?.defaultOverrides,
      },
    })
  }
}

export type PaginationItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class PaginationItem<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {}

type PaginationSizeProps = Pick<ContainerProperties, 'height' | 'width' | 'paddingX' | 'paddingY'>

const paginationSizes: Record<string, PaginationSizeProps> = {
  default: { height: 40, paddingX: 16, paddingY: 8 },
  sm: { height: 36, paddingX: 12 },
  lg: { height: 42, paddingX: 32 },
  icon: { height: 40, width: 40 },
}

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
    const sizeProps = computed(() => paginationSizes[this.properties.signal.size?.value ?? 'icon'])
    const paddingX = computed(() => sizeProps.value?.paddingX)
    const paddingY = computed(() => sizeProps.value?.paddingY)
    const isActive = computed(() => this.properties.signal.isActive?.value ?? false)
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
      } as InProperties<PaginationLinkOutProperties<EM>>,
    })
  }
}

export type PaginationPreviousProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<
  PaginationLinkProperties<EM>,
  'children'
>

export class PaginationPrevious<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends PaginationLink<T, EM> {
  constructor(
    inputProperties?: InProperties<PaginationLinkOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<PaginationLinkOutProperties<EM>>
    },
  ) {
    super(
      { size: 'default', flexDirection: 'row', gap: 4, paddingLeft: 10, ...inputProperties },
      initialClasses,
      config,
    )

    const chevronIcon = new ChevronLeft(undefined, undefined, {
      defaultOverrides: {
        width: 16,
        height: 16,
      },
    })
    super.add(chevronIcon)

    const textElement = new Text(undefined, undefined, { defaultOverrides: { text: 'Previous' } })
    super.add(textElement)
  }

  add(): never {
    throw new Error('PaginationPrevious does not support adding children. The component has predefined content.')
  }
}

export type PaginationNextProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<
  PaginationLinkProperties<EM>,
  'children'
>

export class PaginationNext<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends PaginationLink<T, EM> {
  constructor(
    inputProperties?: InProperties<PaginationLinkOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<PaginationLinkOutProperties<EM>>
    },
  ) {
    super(
      { size: 'default', flexDirection: 'row', gap: 4, paddingRight: 10, ...inputProperties },
      initialClasses,
      config,
    )

    const textElement = new Text(undefined, undefined, { defaultOverrides: { text: 'Next' } })
    super.add(textElement)

    const chevronIcon = new ChevronRight(undefined, undefined, {
      defaultOverrides: {
        width: 16,
        height: 16,
      },
    })
    super.add(chevronIcon)
  }
  add(): never {
    throw new Error('PaginationNext does not support adding children. The component has predefined content.')
  }
}

export type PaginationEllipsisProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<
  PaginationLinkProperties<EM>,
  'children'
>

export class PaginationEllipsis<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  private ellipsisIcon?: typeof Ellipsis.prototype

  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, config)

    this.ellipsisIcon = new Ellipsis(undefined, undefined, {
      defaultOverrides: {
        width: 16,
        height: 16,
      },
    })
    super.add(this.ellipsisIcon)
  }

  add(): never {
    throw new Error('PaginationEllipsis does not support adding children. The component has predefined content.')
  }
}
