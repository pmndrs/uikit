import { AllOptionalProperties } from '@pmndrs/uikit'
import { ReactNode, createContext, useContext } from 'react'

const DefaultPropertiesContext = createContext<AllOptionalProperties | undefined>(undefined)

export function useDefaultProperties(): AllOptionalProperties | undefined {
  return useContext(DefaultPropertiesContext)
}

export type DefaultPropertiesProperties = { children?: ReactNode } & AllOptionalProperties

export function DefaultProperties(properties: DefaultPropertiesProperties) {
  const existingDefaultProperties = useContext(DefaultPropertiesContext)
  const result: any = { ...existingDefaultProperties }
  for (const key in properties) {
    if (key === 'children') {
      continue
    }
    //TODO: this is not correctly merged but rather overwritten
    const value = properties[key as keyof AllOptionalProperties]
    if (value == null) {
      continue
    }
    result[key] = value as any
  }
  return <DefaultPropertiesContext.Provider value={result}>{properties.children}</DefaultPropertiesContext.Provider>
}
