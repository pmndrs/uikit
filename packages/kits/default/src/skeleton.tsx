import { Container, ContainerProperties } from '@react-three/uikit'
import React, { useMemo, useRef } from 'react'
import { borderRadius, colors } from './theme.js'
import { useFrame } from '@react-three/fiber'
import { signal } from '@preact/signals-core'

export type SkeletonProperties = Omit<ContainerProperties, 'children'>

export function Skeleton(props: SkeletonProperties) {
  const opacity = useMemo(() => signal(1), [])
  const time = useRef(0)
  useFrame((_, delta) => {
    opacity.value = Math.cos(time.current * Math.PI) * 0.25 + 0.75
    time.current += delta
  })
  return (
    <Container borderRadius={borderRadius.md} backgroundColor={colors.muted} backgroundOpacity={opacity} {...props} />
  )
}
