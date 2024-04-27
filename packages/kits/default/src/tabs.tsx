import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, { ReactNode, createContext, useContext, useMemo, useState } from 'react'
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

export function Tabs({ value: providedValue, onValueChange, defaultValue, children, ...props }: TabsProperties) {
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
    <Container flexDirection="column" {...props}>
      <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>
    </Container>
  )
}

export type TabsListProperties = ContainerProperties

export function TabsList({ children, ...props }: TabsListProperties) {
  return (
    <Container
      height={40}
      flexDirection="row"
      alignItems="center"
      borderRadius={borderRadius.md}
      backgroundColor={colors.muted}
      padding={4}
      flexShrink={0}
      {...props}
    >
      <DefaultProperties color={colors.mutedForeground}>{children}</DefaultProperties>
    </Container>
  )
}

export type TabsTriggerProperties = ContainerProperties & { disabled?: boolean; value: string }

export function TabsTrigger({ children, value, disabled = false, ...props }: TabsTriggerProperties) {
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
}

export type TabsContentProperties = ContainerProperties & { value: string }

export function TabsContent({ value, ...props }: TabsContentProperties) {
  const { value: current } = useContext(TabsContext)
  if (value != current) {
    return null
  }
  return <Container marginTop={8} {...props} />
}
