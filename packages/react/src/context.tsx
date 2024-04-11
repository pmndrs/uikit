import type { ParentContext } from '@pmndrs/uikit/internals'
import { createContext, useContext } from 'react'

const ParentContext = createContext<ParentContext | undefined>(undefined)

export function useParent(): ParentContext {
  const parent = useContext(ParentContext)
  if (parent == null) {
    throw new Error(`Cannot be used outside of a uikit component.`)
  }
  return parent
}

export const ParentProvider = ParentContext.Provider
