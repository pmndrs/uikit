import { Container } from '@react-three/uikit'
import { ComponentPropsWithoutRef, useMemo, useRef } from 'react'
import { colors } from './theme'
import { useFrame } from '@react-three/fiber'
import { signal } from '@preact/signals-core'

export function Skeleton(props: Omit<ComponentPropsWithoutRef<typeof Container>, 'children'>) {
  const opacity = useMemo(() => signal(1), [])
  const time = useRef(0)
  useFrame((_, delta) => {
    opacity.value = Math.cos(time.current * Math.PI) * 0.25 + 0.75
    time.current += delta
  })
  return <Container borderRadius={6} backgroundColor={colors.muted} backgroundOpacity={opacity} {...props} />
}
