import { Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef, createContext, useContext, useMemo, useRef, useState } from 'react'
import { GlassMaterial, colors } from './theme'

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
}: ComponentPropsWithoutRef<typeof Container> & {
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
        backgroundOpacity={opacity}
        border={2}
        backgroundColor={colors.background}
        borderColor={colors.background}
        borderOpacity={opacity}
        borderBend={disabled ? 0 : -0.3}
        borderRadius={18}
        backgroundMaterialClass={GlassMaterial}
        flexDirection="row"
        {...props}
      />
    </TabsContext.Provider>
  )
}

type SegmentedControlButtonProps = ComponentPropsWithoutRef<typeof Container> & {
  value: string
  disabled?: boolean
}

export function TabsButton({ children, value, disabled, ...props }: SegmentedControlButtonProps) {
  const { value: currentValue, onValueChange, disabled: tabsDisabled } = useContext(TabsContext) as TabsContext

  return (
    <Container
      height={32}
      paddingX={20}
      positionType="relative"
      cursor={tabsDisabled || disabled ? undefined : 'pointer'}
      {...props}
      onClick={(e) => {
        if (disabled) return
        onValueChange?.(value)
        props.onClick?.(e)
      }}
    >
      {currentValue === value && !tabsDisabled && (
        <Container
          positionType="absolute"
          inset={0}
          backgroundColor={colors.foreground}
          borderColor={colors.foreground}
          backgroundOpacity={0.3}
          border={2}
          borderOpacity={0.3}
          borderRadius={16}
          borderBend={0.3}
          backgroundMaterialClass={GlassMaterial}
        />
      )}
      <DefaultProperties fontSize={16} color={colors.foreground} opacity={disabled || tabsDisabled ? 0.4 : 1}>
        <Container height="100%" flexDirection="row" alignItems="center" gapColumn={10}>
          {children}
        </Container>
      </DefaultProperties>
    </Container>
  )
}
