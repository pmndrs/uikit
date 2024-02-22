import { DefaultProperties } from '@react-three/uikit'
import { ReactNode } from 'react'

export function Label({ disabled, children }: { disabled?: boolean; children?: ReactNode }) {
  return (
    <DefaultProperties fontWeight="medium" fontSize={14} lineHeight={1} opacity={disabled ? 0.7 : undefined}>
      {children}
    </DefaultProperties>
  )
}
