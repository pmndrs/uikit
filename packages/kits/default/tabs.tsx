import { Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef, ReactNode, createContext, useContext, useMemo, useState } from 'react'
import { colors } from './defaults.js'

const TabsContext = createContext<{
  value?: string
  setValue?: (value: string) => void
}>(null as any)

export function Tabs({
  value: providedValue,
  onValueChange,
  defaultValue,
  children,
  ...props
}: {
  value?: string
  onValueChange?(value: string): void
  defaultValue?: string
  children?: ReactNode
} & ComponentPropsWithoutRef<typeof Container>) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue)
  const contextValue = useMemo(() => {
    if (providedValue == null) {
      return {
        value: uncontrolled,
        setValue: (value: string) => {
          setUncontrolled(value)
          onValueChange?.(value)
        },
      }
    }
    return {
      value: providedValue,
      onValueChange,
    }
  }, [uncontrolled, onValueChange, providedValue])
  return (
    <Container {...props}>
      <TabsContext.Provider value={contextValue}>{children}</TabsContext.Provider>
    </Container>
  )
}

export function TabsList({ children, ...props }: ComponentPropsWithoutRef<typeof Container>) {
  return (
    <Container
      height={40}
      flexDirection="row"
      alignItems="center"
      borderRadius={6}
      backgroundColor={colors.muted}
      padding={4}
      {...props}
    >
      <DefaultProperties color={colors.mutedForeground}>{children}</DefaultProperties>
    </Container>
  )
}

export function TabsTrigger({
  children,
  value,
  disabled = false,
  ...props
}: ComponentPropsWithoutRef<typeof Container> & { disabled?: boolean; value: string }) {
  const { setValue, value: current } = useContext(TabsContext)
  const active = value === current
  return (
    <Container
      onClick={disabled ? undefined : () => setValue?.(value)}
      cursor={disabled ? undefined : 'pointer'}
      flexDirection="row"
      alignItems="center"
      borderRadius={2}
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
        lineHeight={1.43}
        wordBreak="keep-all"
      >
        {children}
      </DefaultProperties>
    </Container>
  )
}

export function TabsContent({ value, ...props }: ComponentPropsWithoutRef<typeof Container> & { value: string }) {
  const { value: current } = useContext(TabsContext)
  if (value != current) {
    return null
  }
  return <Container marginTop={8} {...props} />
}
