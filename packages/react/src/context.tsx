import { WithContext } from '@vanilla-three/uikit/internals'
import { createContext, useContext } from 'react'

//const FontFamiliesContext = createContext<Record<string, FontFamilyUrls>>(null as any)

const ParentContext = createContext<WithContext | undefined>(undefined)

export function useParent(): WithContext {
  const parent = useContext(ParentContext)
  if (parent == null) {
    throw new Error(`Cannot be used outside of a uikit component.`)
  }
  return parent
}

export const ParentProvider = ParentContext.Provider
