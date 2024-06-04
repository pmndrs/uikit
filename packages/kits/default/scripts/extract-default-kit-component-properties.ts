import { writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Converter, mapIncludesAllKeys, mapToRecord } from '../../../../scripts/shared.js'

import * as DefaultKit from '../src/components.js'
import { Definition } from 'typescript-json-schema'

const components = Object.keys(DefaultKit)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const converter = new Converter(resolve(__dirname, '../src/components.ts'))

const conversionComponentMapEntries: Array<string> = []
const imports: Array<string> = []

const containerPropertyTypes = converter.extractPropertyTypes(converter.getSchema(`ContainerProperties`))
const imagePropertyTypes = converter.extractPropertyTypes(converter.getSchema(`ImageProperties`))
const inputPropertyTypes = converter.extractPropertyTypes(converter.getSchema(`InputProperties`))

for (const component of components) {
  if (component === 'Defaults' || component.charAt(0).toUpperCase() != component.charAt(0)) {
    continue
  }
  let schema: Definition | null = null
  try {
    schema = converter.getSchema(`_${component}Properties`)
  } catch {}
  schema ??= converter.getSchema(`${component}Properties`)
  imports.push(component) //TODO
  const propertyTypes = converter.extractPropertyTypes(schema)
  conversionComponentMapEntries.push(`${component}: {
    renderAs: '${component}',
    renderAsImpl: ${component},
    children: ${converter.hasChildren(schema) ? 'undefined' : "'none'"},
    propertyTypes: [${
      mapIncludesAllKeys(propertyTypes, inputPropertyTypes)
        ? `...conversionPropertyTypes.Input, ${JSON.stringify(mapToRecord(propertyTypes, inputPropertyTypes))}`
        : mapIncludesAllKeys(propertyTypes, imagePropertyTypes)
          ? `...conversionPropertyTypes.Image, ${JSON.stringify(mapToRecord(propertyTypes, imagePropertyTypes))}`
          : mapIncludesAllKeys(propertyTypes, containerPropertyTypes)
            ? `...conversionPropertyTypes.Container, ${JSON.stringify(mapToRecord(propertyTypes, containerPropertyTypes))}`
            : `conversionPropertyTypes.Inheriting, ${JSON.stringify(mapToRecord(propertyTypes))}`
    }],
  },`)
}

writeFileSync(
  resolve(__dirname, '../src/convert.ts'),
  `
import { ConversionComponentMap, conversionPropertyTypes } from '@react-three/uikit'
import { ${imports.join(',\n')} } from "./index.js"

export const componentMap: ConversionComponentMap = {
  ${conversionComponentMapEntries.join('\n')}
}

`,
)
