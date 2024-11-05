import { ContainerRef, Container, ContainerProperties } from '@react-three/uikit'
import React, { ReactNode, RefAttributes, forwardRef, useMemo } from 'react'
import { colors } from './theme.js'
import { Signal, computed } from '@preact/signals-core'

export type ProgressProperties = { value?: Signal<number> | number } & Omit<ContainerProperties, 'children'>

export const Progress: (props: ProgressProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  ({ value, ...props }, ref) => {
    const width = useMemo(() => computed(() => `${(value ?? 0) as number}%` as const), [value])
    return (
      <Container height={16} width="100%" borderRadius={1000} backgroundColor={colors.secondary} ref={ref} {...props}>
        <Container height="100%" borderRadius={1000} backgroundColor={colors.primary} width={width} />
      </Container>
    )
  },
)
