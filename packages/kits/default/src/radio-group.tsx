import { ComponentInternals, Container, ContainerProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, createContext, forwardRef, useContext, useMemo, useState } from 'react'
import { colors } from './theme.js'

const RadioGroupContext = createContext<{
  value?: string
  setValue?: (value: string) => void
}>({})

export type RadioGroupProperties = {
  value?: string
  onValueChange?(value: string): void
  defaultValue?: string
} & ContainerProperties

export const RadioGroup: (props: RadioGroupProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ defaultValue, value: providedValue, onValueChange, children, ...props }, ref) => {
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
      <Container flexDirection="column" gap={8} ref={ref} {...props}>
        <RadioGroupContext.Provider value={contextValue}>{children}</RadioGroupContext.Provider>
      </Container>
    )
  },
)

export type RadioGroupItemProperties = ContainerProperties & { disabled?: boolean; value: string }

export const RadioGroupItem: (props: RadioGroupItemProperties & RefAttributes<ComponentInternals>) => ReactNode =
  forwardRef(({ disabled = false, value, children, ...props }, ref) => {
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
          borderWidth={1}
          borderOpacity={disabled ? 0.5 : undefined}
          borderColor={colors.primary}
          alignItems="center"
          justifyContent="center"
          ref={ref}
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
  })
