import { ContainerRef, Container, ContainerProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef, useMemo, useRef } from 'react'
import { borderRadius, colors } from './theme.js'
import { useFrame } from '@react-three/fiber'
import { signal } from '@preact/signals-core'

export type SkeletonProperties = Omit<ContainerProperties, 'children'>

export const Skeleton: (props: SkeletonProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  (props, ref) => {
    const opacity = useMemo(() => signal(1), [])
    const time = useRef(0)
    useFrame((_, delta) => {
      opacity.value = Math.cos(time.current * Math.PI) * 0.25 + 0.75
      time.current += delta
    })
    return (
      <Container
        borderRadius={borderRadius.md}
        backgroundColor={colors.muted}
        backgroundOpacity={opacity}
        ref={ref}
        {...props}
      />
    )
  },
)
