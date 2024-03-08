import { createContext, useContext } from "react"

const ClippingRectContext = createContext<Signal<ClippingRect | undefined>>(null as any)

export const ClippingRectProvider = ClippingRectContext.Provider

export function useParentClippingRect(): Signal<ClippingRect | undefined> | undefined {
  return useContext(ClippingRectContext)
}
