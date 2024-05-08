import {
  Container,
  DefaultProperties,
  Input as InputImpl,
  Text,
  InputInternals,
  InputProperties as BaseInputProperties,
  ComponentInternals,
} from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef, useMemo, useState } from 'react'
import { borderRadius, colors } from './theme.js'
import { computed } from '@preact/signals-core'

export type InputProperties = Omit<BaseInputProperties, 'multiline'> & { placeholder?: string }

export const Input: (props: InputProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  (
    { panelMaterialClass, value, defaultValue, onValueChange, tabIndex, disabled, placeholder, type, ...props },
    ref,
  ) => {
    const [internal, setInternal] = useState<InputInternals | null>(null)
    const placeholderOpacity = useMemo(() => {
      if (internal == null) {
        return undefined
      }
      return computed(() => (internal.current.value.length > 0 ? 0 : undefined))
    }, [internal])
    return (
      <Container height={40} positionType="relative" overflow="hidden" ref={ref} {...props}>
        <DefaultProperties
          fontSize={14}
          height="100%"
          width="100%"
          borderWidth={1}
          paddingX={12}
          paddingY={8}
          lineHeight={20}
          opacity={disabled ? 0.5 : undefined}
          backgroundOpacity={disabled ? 0.5 : undefined}
        >
          <InputImpl
            ref={setInternal}
            borderRadius={borderRadius.md}
            backgroundColor={colors.background}
            borderColor={colors.input}
            focus={{
              borderColor: colors.ring,
            }}
            panelMaterialClass={panelMaterialClass}
            multiline={false}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            tabIndex={tabIndex}
            disabled={disabled}
            type={type}
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
  },
)
