import { ComponentInternals, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, createContext, forwardRef, useContext, useMemo, useState } from 'react'
import { borderRadius, colors } from './theme.js'

const TabsContext = createContext<{
  value?: string
  setValue?: (value: string) => void
}>({})

export type TabsProperties = {
  value?: string
  onValueChange?(value: string): void
  defaultValue?: string
  children?: ReactNode
} & ContainerProperties

export const Tabs: (props: TabsProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ value: providedValue, onValueChange, defaultValue, children, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const contextValue = useMemo(() => {
      if (providedValue == null) {
        return {
          value: uncontrolled,
          setValue: (value: string): void => {
            setUncontrolled(value)
            onValueChange?.(value)
          },
        }
      }
      return {
        value: providedValue,
        setValue: onValueChange,
      }
    }, [uncontrolled, onValueChange, providedValue])
    return (
      <Container flexDirection="column" ref={ref} {...props}>
        <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>
      </Container>
    )
  },
)

export type TabsListProperties = ContainerProperties

export const TabsList: (props: TabsListProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ children, ...props }, ref) => {
    return (
      <Container
        height={40}
        flexDirection="row"
        alignItems="center"
        borderRadius={borderRadius.md}
        backgroundColor={colors.muted}
        padding={4}
        flexShrink={0}
        ref={ref}
        {...props}
      >
        <DefaultProperties color={colors.mutedForeground}>{children}</DefaultProperties>
      </Container>
    )
  },
)

export type TabsTriggerProperties = ContainerProperties & { disabled?: boolean; value: string }

export const TabsTrigger: (props: TabsTriggerProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ children, value, disabled = false, ...props }, ref) => {
    const { setValue, value: current } = useContext(TabsContext)
    const active = value === current
    return (
      <Container
        onClick={disabled ? undefined : (e) => setValue?.(value)}
        cursor={disabled ? undefined : 'pointer'}
        flexDirection="row"
        alignItems="center"
        borderRadius={borderRadius.sm}
        paddingX={12}
        backgroundOpacity={disabled ? 0.5 : undefined}
        backgroundColor={active ? colors.background : undefined}
        paddingY={6}
        justifyContent="center"
        ref={ref}
        {...props}
      >
        <DefaultProperties
          opacity={disabled ? 0.5 : undefined}
          color={active ? colors.foreground : undefined}
          fontSize={14}
          fontWeight="medium"
          lineHeight={20}
          wordBreak="keep-all"
        >
          {children}
        </DefaultProperties>
      </Container>
    )
  },
)

export type TabsContentProperties = ContainerProperties & { value: string }

export const TabsContent: (props: TabsContentProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ value, ...props }, ref) => {
    const { value: current } = useContext(TabsContext)
    if (value != current) {
      return null
    }
    return <Container marginTop={8} ref={ref} {...props} />
  },
)
