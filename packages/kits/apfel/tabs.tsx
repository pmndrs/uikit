import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, { createContext, useContext, useMemo, useRef, useState } from 'react'
import { GlassMaterial, colors } from './theme.js'

type TabsContext = {
  value?: string
  onValueChange?(value: string): void
  disabled?: boolean
}

const TabsContext = createContext<TabsContext>({})

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  disabled,
  ...props
}: ContainerProperties & {
  value?: string
  defaultValue?: string
  onValueChange?(value: string): void
  disabled?: boolean
}) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
  const currentValue = value != null ? value : internalValue

  const onValueChangeRef = useRef(onValueChange)
  onValueChangeRef.current = onValueChange

  const context = useMemo<TabsContext>(
    () => ({
      value: currentValue,
      onValueChange: (value) => {
        setInternalValue(value)
        onValueChangeRef.current?.(value)
      },
      disabled,
    }),
    [currentValue, disabled],
  )

  const opacity = disabled ? 0.3 : 0.4

  return (
    <TabsContext.Provider value={context}>
      <Container
        height={36}
        borderWidth={2}
        backgroundOpacity={opacity}
        borderOpacity={opacity}
        backgroundColor={colors.background}
        borderColor={colors.background}
        borderBend={disabled ? 0 : -0.3}
        borderRadius={18}
        panelMaterialClass={GlassMaterial}
        flexDirection="row"
        {...props}
      />
    </TabsContext.Provider>
  )
}

type TabsButtonProperties = ContainerProperties & {
  value: string
  disabled?: boolean
}

export function TabsButton({ children, value, disabled, ...props }: TabsButtonProperties) {
  const { value: currentValue, onValueChange, disabled: tabsDisabled } = useContext(TabsContext) as TabsContext

  const selected = currentValue === value && !tabsDisabled

  return (
    <Container
      height={32}
      paddingX={20}
      flexShrink={0}
      cursor={tabsDisabled || disabled ? undefined : 'pointer'}
      {...props}
      onClick={(e) => {
        if (disabled) return
        onValueChange?.(value)
        props.onClick?.(e)
      }}
      backgroundColor={colors.foreground}
      borderColor={colors.foreground}
      backgroundOpacity={selected ? 0.3 : 0}
      borderOpacity={selected ? 0.3 : 0}
      borderWidth={2}
      borderRadius={16}
      borderBend={0.3}
      panelMaterialClass={GlassMaterial}
      flexDirection="row"
      alignItems="center"
      gapColumn={10}
    >
      <DefaultProperties color={colors.foreground} opacity={disabled || tabsDisabled ? 0.4 : 1}>
        {children}
      </DefaultProperties>
    </Container>
  )
}
