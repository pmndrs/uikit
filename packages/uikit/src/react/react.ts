import { createContext, useContext, useCallback, useRef } from 'react'
import { FlexNode } from '../flex/node.js'
import { useFrame } from '@react-three/fiber'

const FlexContext = createContext<FlexNode>(null as any)

export const FlexProvider = FlexContext.Provider

export function useParentFlexNode() {
  return useContext(FlexContext)
}

export function useDeferredRequestLayoutCalculation(): (node: FlexNode) => void {
  let requestedNodeRef = useRef<FlexNode | undefined>(undefined)
  useFrame(() => {
    if (requestedNodeRef.current == null) {
      return
    }
    requestedNodeRef.current.calculateLayout()
    requestedNodeRef.current = undefined
  })
  return useCallback((node) => {
    if (requestedNodeRef.current != null || node['yogaNode'] == null) {
      return
    }
    requestedNodeRef.current = node
  }, [])
}
