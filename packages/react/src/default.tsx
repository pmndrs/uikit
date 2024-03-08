const DefaultPropertiesContext = createContext<AllOptionalProperties | undefined>(undefined)

export function useDefaultProperties(): AllOptionalProperties | undefined {
  return useContext(DefaultPropertiesContext)
}

export function DefaultProperties(properties: { children?: ReactNode } & AllOptionalProperties) {
  const existingDefaultProperties = useContext(DefaultPropertiesContext)
  const result: any = { ...existingDefaultProperties }
  for (const key in properties) {
    if (key === 'children') {
      continue
    }
    const value = properties[key as keyof AllOptionalProperties]
    if (value == null) {
      continue
    }
    result[key] = value as any
  }
  return <DefaultPropertiesContext.Provider value={result}>{properties.children}</DefaultPropertiesContext.Provider>
}
