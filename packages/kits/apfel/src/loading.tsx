import { ComponentInternals, Container, ContainerProperties } from '@react-three/uikit'
import { useFrame } from '@react-three/fiber'
import React, { ReactNode, RefAttributes, forwardRef, useMemo } from 'react'
import { signal } from '@preact/signals-core'
import { colors } from './theme.js'

const sizes = {
  sm: { diameter: 20, pillWidth: 3, pillHeight: 6 },
  md: { diameter: 28, pillWidth: 4, pillHeight: 10 },
  lg: { diameter: 44, pillWidth: 6, pillHeight: 16 },
}

type Size = keyof typeof sizes

const PILL_AMOUNT = 8

export type LoadingProperties = ContainerProperties & {
  size?: Size
}

export const Loading: (props: LoadingProperties & RefAttributes<ComponentInternals>) => ReactNode = forwardRef(
  ({ size = 'md', ...props }, ref) => {
    const pillOpacities = useMemo(() => new Array(PILL_AMOUNT).fill(undefined).map(() => signal(0)), [])

    useFrame(({ clock }) => {
      for (let i = 0; i < PILL_AMOUNT; i++) {
        const opacity = pillOpacities[i]
        const interval = 0.8
        const pillOffset = (i / PILL_AMOUNT) * interval
        opacity.value = 1 - ((clock.elapsedTime + pillOffset) % interval)
      }
    })

    const { diameter, pillHeight, pillWidth } = sizes[size]

    return (
      <Container positionType="relative" width={diameter} height={diameter} ref={ref} {...props}>
        {pillOpacities.map((opacity, i) => (
          <Container
            key={i}
            positionType="absolute"
            flexDirection="column"
            inset={0}
            transformRotateZ={(i * 360) / PILL_AMOUNT}
            alignItems="center"
            justifyContent="flex-start"
          >
            <Container
              backgroundOpacity={opacity}
              width={pillWidth}
              height={pillHeight}
              borderRadius={pillWidth / 2}
              backgroundColor={colors.foreground}
            />
          </Container>
        ))}
      </Container>
    )
  },
)
