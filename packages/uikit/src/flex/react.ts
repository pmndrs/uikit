import { createContext, useContext, useMemo, useEffect } from 'react'
import { FlexNode } from './node.js'

const FlexContext = createContext<FlexNode>(null as any)

export function useParentFlexNode() {
  return useContext(FlexContext)
}

export function useFlexNode(index: number = 0): FlexNode {
  const parentNode = useParentFlexNode()
  const node = useMemo(() => parentNode.createChild(), [parentNode])
  if (node.index != index) {
    node.index = index
    node.requestCalculateLayout()
  }
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
