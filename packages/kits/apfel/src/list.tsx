import { ComponentInternals, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, createContext, forwardRef, useContext } from 'react'
import { colors } from './theme.js'

type Type = 'plain' | 'inset'

const ListContext = createContext<Type>('plain')

type ListProperties = ContainerProperties & {
  type?: Type
}

export const List: (props: ListProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ type = 'plain', ...props }, ref) => {
    return (
      <ListContext.Provider value={type}>
        <Container flexDirection="column" alignItems="stretch" gapRow={type === 'plain' ? 8 : 1} ref={ref} {...props} />
      </ListContext.Provider>
    )
  },
)

export type ListItemProperties = ContainerProperties & {
  subtitle?: ReactNode
  selected?: boolean
  leadingAccessory?: ReactNode
  trailingAccessory?: ReactNode
  isFirst?: boolean
  isLast?: boolean
}

export const ListItem: (props: ListItemProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ children, subtitle, selected, leadingAccessory, trailingAccessory, isFirst, isLast, ...props }, ref) => {
    const type = useContext(ListContext)

    return (
      <Container
        height={subtitle ? 72 : 60}
        borderRadius={type === 'plain' ? 16 : undefined}
        borderTopRadius={type === 'inset' ? (isFirst ? 16 : 0) : undefined}
        borderBottomRadius={type === 'inset' ? (isLast ? 16 : 0) : undefined}
        paddingX={20}
        flexDirection="row"
        alignItems="center"
        gapColumn={16}
        backgroundColor={type === 'plain' ? colors.foreground : colors.background}
        backgroundOpacity={type === 'plain' ? (selected ? 0.2 : 0) : 0.2}
        hover={{
          backgroundOpacity: type === 'plain' ? (selected ? 0.2 : 0.1) : 0.1,
        }}
        active={
          type === 'plain'
            ? {
                backgroundOpacity: 0.3,
              }
            : undefined
        }
        cursor="pointer"
        ref={ref}
        {...props}
      >
        <DefaultProperties color={colors.foreground}>
          {leadingAccessory && <Container>{leadingAccessory}</Container>}
          <Container flexDirection="column" flexGrow={1}>
            <DefaultProperties fontSize={18}>{children}</DefaultProperties>
            <DefaultProperties fontSize={14} opacity={0.5}>
              {subtitle}
            </DefaultProperties>
          </Container>
          {trailingAccessory && <Container>{trailingAccessory}</Container>}
        </DefaultProperties>
      </Container>
    )
  },
)
