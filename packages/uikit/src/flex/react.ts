import { createContext, useContext, useMemo, useEffect, RefObject } from 'react'
import { FlexNode } from './node.js'
import { Group } from 'three'

const FlexContext = createContext<FlexNode>(null as any)

export function useParentFlexNode() {
  return useContext(FlexContext)
}

export function useFlexNode(groupRef: RefObject<Group>): FlexNode {
  const parentNode = useParentFlexNode()
  const node = useMemo(() => parentNode.createChild(groupRef), [groupRef, parentNode])
  useEffect(
    () => () => {
      parentNode.removeChild(node)
      node.destroy()
    },
    [parentNode, node],
  )
  return node
}

export const FlexProvider = FlexContext.Provider
