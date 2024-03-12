export function useRootSize() {
  return useContext(RootSizeContext)
}

const RootSizeContext = createContext<Signal<Vector2Tuple>>(null as any)

export const RootSizeProvider = RootSizeContext.Provider
