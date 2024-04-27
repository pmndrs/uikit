import { Container, ContainerProperties } from '@react-three/uikit'
import React, { useMemo } from 'react'
import { colors } from './theme.js'
import { Signal, computed } from '@preact/signals-core'

export type ProgressProperties = { value?: Signal<number> | number } & Omit<ContainerProperties, 'children'>

export function Progress({ value, ...props }: ProgressProperties) {
  const width = useMemo(() => computed(() => `${(value ?? 0) as number}%` as const), [value])
  return (
    <Container height={16} width="100%" borderRadius={1000} backgroundColor={colors.secondary} {...props}>
      <Container height="100%" borderRadius={1000} backgroundColor={colors.primary} width={width} />
    </Container>
  )
}
