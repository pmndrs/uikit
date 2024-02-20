import { Container, Text } from '@react-three/uikit'
import { ChevronLeft, ChevronRight, MoreHorizontal } from '@react-three/uikit-lucide'
import { ComponentPropsWithoutRef } from 'react'
import { colors } from './defaults.js'

export function Pagination(props: ComponentPropsWithoutRef<typeof Container>) {
  return <Container marginX="auto" flexDirection="row" width="100%" justifyContent="center" {...props} />
}

export function PaginationContent(props: ComponentPropsWithoutRef<typeof Container>) {
  return <Container flexDirection="row" alignItems="center" gap={4} {...props} />
}

export const PaginationItem: typeof Container = Container

const paginationVariants = {
  outline: {
    border: 1,
    borderColor: colors.input,
    backgroundColor: colors.background,
    hover: {
      backgroundColor: colors.accent,
    },
  }, //TODO: hover:text-accent-foreground",
  ghost: {
    hover: {
      backgroundColor: colors.accent,
    },
  }, // TODO: hover:text-accent-foreground",
} satisfies {
  [Key in string]: ComponentPropsWithoutRef<typeof Container>
}

const paginationSizes = {
  default: { height: 40, paddingX: 16, paddingY: 8 },
  sm: { height: 36, paddingX: 12 },
  lg: { height: 42, paddingX: 32 },
  icon: { height: 40, width: 40 },
} satisfies { [Key in string]: ComponentPropsWithoutRef<typeof Container> }

export function PaginationLink({
  isActive = false,
  size = 'icon',
  ...props
}: ComponentPropsWithoutRef<typeof Container> & {
  size?: keyof typeof paginationSizes
  isActive?: boolean
}) {
  const containerProps = paginationVariants[isActive ? 'outline' : 'ghost']
  const sizeProps = paginationSizes[size]
  return (
    <Container
      cursor="pointer"
      borderRadius={6}
      alignItems="center"
      justifyContent="center"
      {...containerProps}
      {...sizeProps}
      {...props}
    />
  )
}

export function PaginationPrevious(props: Omit<ComponentPropsWithoutRef<typeof PaginationLink>, 'children'>) {
  return (
    <PaginationLink flexDirection="row" size="default" gap={4} paddingLeft={10} {...props}>
      <ChevronLeft width={16} height={16} />
      <Text>Previous</Text>
    </PaginationLink>
  )
}

export function PaginationNext(props: Omit<ComponentPropsWithoutRef<typeof PaginationLink>, 'children'>) {
  return (
    <PaginationLink flexDirection="row" size="default" gap={4} paddingRight={10} {...props}>
      <Text>Next</Text>
      <ChevronRight width={16} height={16} />
    </PaginationLink>
  )
}

export function PaginationEllipsis(props: Omit<ComponentPropsWithoutRef<typeof Container>, 'children'>) {
  return (
    <Container flexDirection="row" height={36} width={36} alignItems="center" justifyContent="center" {...props}>
      <MoreHorizontal width={16} height={16} />
    </Container>
  )
}
//<span className="sr-only">More pages</span>
