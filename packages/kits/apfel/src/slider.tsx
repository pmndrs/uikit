import { ThreeEvent } from '@react-three/fiber'
import type { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events'
import { ComponentInternals, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { clamp } from 'three/src/math/MathUtils.js'
import { GlassMaterial, colors } from './theme.js'

const vectorHelper = new Vector3()

const sizes = {
  xs: { height: 12, knobHeight: 8 },
  sm: { height: 16, knobHeight: 12 },
  md: { height: 28, knobHeight: 20 },
  lg: { height: 44, knobHeight: 32 },
}

type Size = keyof typeof sizes

export type SliderProperties = ContainerProperties & {
  disabled?: boolean
  value?: number
  defaultValue?: number
  onValueChange?(value: number): void
  min?: number
  max?: number
  step?: number
  size?: Size
  icon?: ReactNode
}

export const Slider: (props: SliderProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  (
    {
      value: providedValue,
      defaultValue,
      onValueChange,
      min = 0,
      max = 100,
      step = 1,
      size = 'md',
      icon,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [uncontrolled, setUncontrolled] = useState(defaultValue)
    const value = providedValue ?? uncontrolled ?? 50
    const internalRef = useRef<ComponentInternals<ContainerProperties>>(null)
    const onChange = useRef(onValueChange)
    onChange.current = onValueChange
    const hasProvidedValue = providedValue != null
    const handler = useMemo(() => {
      let down: boolean = false
      function setValue(e: ThreeEvent<PointerEvent>) {
        if (internalRef.current == null) {
          return
        }
        vectorHelper.copy(e.point)
        internalRef.current.interactionPanel.worldToLocal(vectorHelper)
        const newValue = Math.min(
          Math.max(Math.round(((vectorHelper.x + 0.5) * (max - min) + min) / step) * step, min),
          max,
        )
        if (!hasProvidedValue) {
          setUncontrolled(newValue)
        }
        onChange.current?.(newValue)
        e.stopPropagation()
      }
      return {
        onPointerDown(e) {
          down = true
          setValue(e)
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        },
        onPointerMove(e) {
          if (!down) {
            return
          }
          setValue(e)
        },
        onPointerUp(e) {
          if (!down) {
            return
          }
          down = false
          e.stopPropagation()
        },
      } satisfies EventHandlers
    }, [max, min, hasProvidedValue, step])

    const range = max - min
    const width = `${((1 - 0.03) * clamp(value / range, 0, 1) + 0.03) * 100}%` as const

    const { height, knobHeight } = sizes[size]
    const knobPadding = (height - knobHeight) / 2
    const showIcon = size == 'md' || size == 'lg'
    const iconHeight = size === 'md' ? 12 : 18

    useImperativeHandle(ref, () => internalRef.current!)

    return (
      <Container
        ref={internalRef}
        height={height}
        borderRadius={height / 2}
        backgroundColor={colors.background}
        borderColor={colors.background}
        backgroundOpacity={0.4}
        positionType="relative"
        borderOpacity={0}
        cursor={disabled ? undefined : 'pointer'}
        borderWidth={2}
        borderBend={-0.3}
        panelMaterialClass={GlassMaterial}
        {...(disabled ? {} : handler)}
        {...props}
      >
        <Container positionType="absolute" inset={-2}>
          <Container
            width={width}
            minWidth={height}
            height="100%"
            borderRadius={height / 2}
            backgroundOpacity={disabled ? 0.35 : 0.6}
            backgroundColor={colors.foreground}
          >
            {showIcon && (
              <Container width={height} height={height} alignItems="center" justifyContent="center">
                <DefaultProperties
                  color={colors.foreground}
                  width={iconHeight}
                  height={iconHeight}
                  opacity={disabled ? 0.4 : 1}
                >
                  {icon}
                </DefaultProperties>
              </Container>
            )}
            <Container
              positionType="absolute"
              height={knobHeight}
              width={knobHeight}
              borderRadius={knobHeight / 2}
              positionTop={knobPadding}
              positionRight={knobPadding}
              backgroundColor={colors.foreground}
              backgroundOpacity={disabled ? 0 : 1 /** todo use hovered from root element */}
            />
          </Container>
        </Container>
      </Container>
    )
  },
)
