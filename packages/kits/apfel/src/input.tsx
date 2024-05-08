import { computed } from '@preact/signals-core'
import { GlassMaterial, colors } from './theme.js'
import {
  Input as InputImpl,
  Container,
  DefaultProperties,
  Text,
  InputInternals,
  InputProperties as BaseInputProperties,
  ComponentInternals,
} from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef, useMemo, useState } from 'react'

type Variant = 'pill' | 'rect'
export type InputProperties = BaseInputProperties & { placeholder?: string; variant?: Variant; prefix?: ReactNode }

//TODO: increase hitbox size (by increasing the size of the InputImpl)

export const Input: (props: InputProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  (
    {
      variant = 'rect',
      prefix,
      placeholder,
      panelMaterialClass,
      multiline,
      value,
      defaultValue,
      onValueChange,
      tabIndex,
      disabled,
      type,
      ...props
    },
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
        borderWidth={2}
        borderColor="#444"
        borderBend={disabled ? 0 : -0.3}
        panelMaterialClass={GlassMaterial}
        overflow="hidden"
        ref={ref}
        {...props}
      >
        <DefaultProperties color={colors.foreground} opacity={disabled ? 0.2 : 0.5}>
          {prefix && (
            <Container flexShrink={0} paddingX={12}>
              <DefaultProperties width={14} height={14}>
                {prefix}
              </DefaultProperties>
            </Container>
          )}
          <Container alignItems="center" minHeight={1} flexGrow={1} positionType="relative">
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
              type={type}
            />
          </Container>
        </DefaultProperties>
      </Container>
    )
  },
)
