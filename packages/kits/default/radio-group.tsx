import { Container } from '@react-three/uikit'
import { ComponentPropsWithoutRef, createContext, useContext, useMemo, useState } from 'react'
import { colors } from './theme'

const RadioGroupContext = createContext<{
  value?: string
  setValue?: (value: string) => void
}>(null as any)

export function RadioGroup({
  defaultValue,
  value: providedValue,
  onValueChange,
  children,
  ...props
}: {
  value?: string
  onValueChange?(value: string): void
  defaultValue?: string
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
    <Container gap={8} {...props}>
      <RadioGroupContext.Provider value={contextValue}>{children}</RadioGroupContext.Provider>
    </Container>
  )
}

export function RadioGroupItem({
  disabled = false,
  value,
  children,
  ...props
}: { disabled?: boolean; value: string } & ComponentPropsWithoutRef<typeof Container>) {
  const { value: current, setValue } = useContext(RadioGroupContext)
  return (
    <Container
      cursor={disabled ? undefined : 'pointer'}
      onClick={disabled ? undefined : () => setValue?.(value)}
      flexDirection="row"
      alignItems="center"
      gap={8}
    >
      <Container
        aspectRatio={1}
        height={16}
        width={16}
        borderRadius={1000}
        border={1}
        borderOpacity={disabled ? 0.5 : undefined}
        borderColor={colors.primary}
        alignItems="center"
        justifyContent="center"
        {...props}
      >
        <Container
          borderRadius={1000}
          aspectRatio={1}
          backgroundColor={colors.primary}
          backgroundOpacity={value === current ? 1 : 0}
          height={9}
          width={9}
        />
      </Container>
      {children}
    </Container>
  )
}
