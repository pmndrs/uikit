import { Container, DefaultProperties, Input as InputImpl, Text, InputInternals } from '@react-three/uikit'
import React, { ComponentPropsWithoutRef, useMemo, useState } from 'react'
import { colors } from './theme'
import { Signal, computed } from '@preact/signals-core'

export function Input({
  panelMaterialClass,
  multiline,
  value,
  defaultValue,
  onValueChange,
  tabIndex,
  disabled = false,
  placeholder,
  ...props
}: ComponentPropsWithoutRef<typeof InputImpl> & { placeholder?: string }) {
  const [internal, setInternal] = useState<InputInternals | null>(null)
  const placeholderOpacity = useMemo(() => {
    if (internal == null) {
      return undefined
    }
    if (internal.value instanceof Signal) {
      const signal = internal.value
      return computed(() => (signal.value.length > 0 ? 0 : undefined))
    }
    return internal.value.length > 0 ? 0 : undefined
  }, [internal])
  return (
    <Container height={40} positionType="relative" overflow="hidden" {...props}>
      <DefaultProperties
        fontSize={14}
        height="100%"
        width="100%"
        border={1}
        paddingX={12}
        paddingY={8}
        lineHeight={1.43}
        opacity={disabled ? 0.5 : undefined}
        backgroundOpacity={disabled ? 0.5 : undefined}
      >
        <InputImpl
          ref={setInternal}
          borderRadius={6}
          backgroundColor={colors.background}
          borderColor={colors.input}
          focus={{
            borderColor: colors.ring,
          }}
          panelMaterialClass={panelMaterialClass}
          multiline={multiline}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          tabIndex={tabIndex}
          disabled={disabled}
        />
        {placeholder != null && (
          <Text
            color={colors.mutedForeground}
            opacity={placeholderOpacity}
            borderOpacity={0}
            inset={0}
            positionType="absolute"
          >
            {placeholder}
          </Text>
        )}
      </DefaultProperties>
    </Container>
  )
}
