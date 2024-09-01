import { ComponentInternals, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, {
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { GlassMaterial, colors } from './theme.js'

type TabsContext = {
  value?: string
  onValueChange?(value: string): void
  disabled?: boolean
}

const TabsContext = createContext<TabsContext>({})

export type TabsProperties = ContainerProperties & {
  value?: string
  defaultValue?: string
  onValueChange?(value: string): void
  disabled?: boolean
}

export const Tabs: (props: TabsProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ value, defaultValue, onValueChange, disabled, ...props }, ref) => {
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
          borderOpacity={0}
          backgroundColor={colors.background}
          borderColor={colors.background}
          borderBend={disabled ? 0 : -0.3}
          borderRadius={18}
          panelMaterialClass={GlassMaterial}
          flexDirection="row"
          ref={ref}
          {...props}
        />
      </TabsContext.Provider>
    )
  },
)

type TabsButtonProperties = ContainerProperties & {
  value: string
  disabled?: boolean
}

export const TabsButton: (props: TabsButtonProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ children, value, disabled, ...props }, ref) => {
    const { value: currentValue, onValueChange, disabled: tabsDisabled } = useContext(TabsContext) as TabsContext

    const selected = currentValue === value && !tabsDisabled

    return (
      <Container
        height={32}
        paddingX={20}
        flexShrink={0}
        cursor={tabsDisabled || disabled ? undefined : 'pointer'}
        ref={ref}
        {...props}
        onClick={(e) => {
          if (disabled) return
          onValueChange?.(value)
          props.onClick?.(e)
        }}
        backgroundColor={colors.foreground}
        borderColor={colors.foreground}
        backgroundOpacity={selected ? 0.3 : 0}
        borderOpacity={0}
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
  },
)
