import {
  Container,
  ContainerProperties,
  Text,
  ThreeEventMap,
  RenderContext,
  InProperties,
  BaseOutProperties,
} from '@pmndrs/uikit'
import { ChevronLeft, ChevronRight, Ellipsis } from '@pmndrs/uikit-lucide'
import { borderRadius, colors } from './theme.js'

export type PaginationProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class Pagination<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: PaginationProperties<EM>): void {
    super.internalResetProperties({
      marginX: 'auto',
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'center',
      ...inputProperties,
    })
  }
}

export type PaginationContentProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class PaginationContent<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  protected internalResetProperties(inputProperties?: PaginationContentProperties<EM>): void {
    super.internalResetProperties({
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      ...inputProperties,
    })
  }
}

export type PaginationItemProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class PaginationItem<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {}

const paginationVariants: {
  [Key in string]: {
    containerProps?: Omit<ContainerProperties, 'hover'>
    containerHoverProps?: ContainerProperties['hover']
  }
} = {
  outline: {
    containerProps: {
      borderWidth: 1,
      borderColor: colors.input,
      backgroundColor: colors.background,
    },
    containerHoverProps: {
      backgroundColor: colors.accent,
    },
  },
  ghost: {
    containerHoverProps: {
      backgroundColor: colors.accent,
    },
  },
}

const paginationSizes = {
  default: { height: 40, paddingX: 16, paddingY: 8 },
  sm: { height: 36, paddingX: 12 },
  lg: { height: 42, paddingX: 32 },
  icon: { height: 40, width: 40 },
} satisfies { [Key in string]: ContainerProperties }

export type PaginationLinkNonReactiveProperties = {
  size?: keyof typeof paginationSizes
  isActive?: boolean
}

export type PaginationLinkProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  BaseOutProperties<EM>,
  PaginationLinkNonReactiveProperties
>

export class PaginationLink<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>,
  PaginationLinkNonReactiveProperties
> {
  protected internalResetProperties({
    isActive = false,
    size = 'icon',
    hover,
    ...rest
  }: PaginationLinkProperties<EM> = {}): void {
    const variant = paginationVariants[isActive ? 'outline' : 'ghost']
    const containerProps = variant?.containerProps ?? {}
    const containerHoverProps = variant?.containerHoverProps
    const sizeProps = paginationSizes[size]

    super.internalResetProperties({
      cursor: 'pointer',
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      hover: { ...containerHoverProps, ...hover },
      ...containerProps,
      ...sizeProps,
      ...rest,
    })
  }
}

export type PaginationPreviousProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<
  PaginationLinkProperties<EM>,
  'children'
>

export class PaginationPrevious<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends PaginationLink<T, EM> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>, PaginationLinkNonReactiveProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext)

    // Add chevron icon
    const chevronIcon = new ChevronLeft({
      width: 16,
      height: 16,
    })
    super.add(chevronIcon)

    // Add text
    const textElement = new Text({ text: 'Previous' })
    super.add(textElement)
  }

  protected internalResetProperties(inputProperties?: PaginationPreviousProperties<EM>): void {
    super.internalResetProperties({
      flexDirection: 'row',
      size: 'default',
      gap: 4,
      paddingLeft: 10,
      ...inputProperties,
    })
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
    inputProperties?: InProperties<BaseOutProperties<EM>, PaginationLinkNonReactiveProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext)

    // Add text
    const textElement = new Text({ text: 'Next' })
    super.add(textElement)

    // Add chevron icon
    const chevronIcon = new ChevronRight({
      width: 16,
      height: 16,
    })
    super.add(chevronIcon)
  }

  protected internalResetProperties(inputProperties?: PaginationNextProperties<EM>): void {
    super.internalResetProperties({
      flexDirection: 'row',
      size: 'default',
      gap: 4,
      paddingRight: 10,
      ...inputProperties,
    })
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
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext)

    // Add ellipsis icon
    this.ellipsisIcon = new Ellipsis({
      width: 16,
      height: 16,
    })
    super.add(this.ellipsisIcon)
  }

  protected internalResetProperties(inputProperties?: PaginationEllipsisProperties<EM>): void {
    super.internalResetProperties({
      flexDirection: 'row',
      height: 36,
      width: 36,
      alignItems: 'center',
      justifyContent: 'center',
      ...inputProperties,
    })
  }

  add(): never {
    throw new Error('PaginationEllipsis does not support adding children. The component has predefined content.')
  }
}
