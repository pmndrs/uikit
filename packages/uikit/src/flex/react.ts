import { createContext, useContext, useMemo, useEffect, RefObject, useCallback, useRef } from 'react'
import { FlexNode } from './node.js'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'

const FlexContext = createContext<FlexNode>(null as any)

export function useParentFlexNode() {
  return useContext(FlexContext)
}

export function useFlexNode(groupRef: RefObject<Group>): FlexNode {
  const parentNode = useParentFlexNode()
  const node = useMemo(() => parentNode.createChild(groupRef), [groupRef, parentNode])
  useEffect(() => {
    parentNode.addChild(node)
    return () => {
      parentNode.removeChild(node)
      node.destroy()
    }
  }, [parentNode, node])
  return node
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

export const FlexProvider = FlexContext.Provider
