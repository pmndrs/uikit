import { Signal, computed } from '@preact/signals-core'
import { GlassMaterial, colors } from './theme'
import { Input as InputImpl, Container, DefaultProperties, Text, InputInternals } from '@react-three/uikit'
import React, { ComponentPropsWithoutRef, ReactNode, useMemo, useState } from 'react'

type Variant = 'pill' | 'rect'

//TODO: increase hitbox size (by increasing the size of the InputImpl)

export function Input({
  variant = 'rect',
  prefix,
  placeholder,
  panelMaterialClass,
  multiline,
  value,
  defaultValue,
  onValueChange,
  tabIndex,
  disabled = false,
  ...props
}: ComponentPropsWithoutRef<typeof InputImpl> & { placeholder?: string; variant?: Variant; prefix?: ReactNode }) {
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
    <Container
      height={44}
      width="100%"
      paddingRight={20}
      paddingLeft={prefix ? 0 : 20}
      flexDirection="row"
      alignItems="center"
      borderRadius={variant === 'pill' ? 22 : 12}
      backgroundColor="#444"
      backgroundOpacity={disabled ? 0.3 : 0.4}
      borderOpacity={disabled ? 0.3 : 0.4}
      hover={disabled ? undefined : { backgroundOpacity: 0.2, borderOpacity: 0.2 }}
      border={2}
      borderColor="#444"
      borderBend={disabled ? 0 : -0.3}
      panelMaterialClass={GlassMaterial}
      overflow="hidden"
      {...props}
    >
      <DefaultProperties color={colors.foreground} opacity={disabled ? 0.2 : 0.5}>
        {prefix && (
          <Container paddingX={12}>
            <DefaultProperties width={14} height={14}>
              {prefix}
            </DefaultProperties>
          </Container>
        )}
        <Container justifyContent="center" minHeight={1} flexGrow={1} positionType="relative">
          {placeholder != null && (
            <Text fontSize={14} positionType="absolute" opacity={placeholderOpacity}>
              {placeholder}
            </Text>
          )}
          <InputImpl
            ref={setInternal}
            height="100%"
            width="100%"
            verticalAlign="center"
            fontSize={14}
            panelMaterialClass={panelMaterialClass}
            multiline={multiline}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            tabIndex={tabIndex}
            disabled={disabled}
          />
        </Container>
      </DefaultProperties>
    </Container>
  )
}
