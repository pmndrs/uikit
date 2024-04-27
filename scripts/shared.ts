import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import {
  Definition,
  DefinitionOrBoolean,
  JsonSchemaGenerator,
  Program,
  buildGenerator,
  generateSchema,
  getProgramFromFiles,
} from 'typescript-json-schema'
import { fileURLToPath } from 'url'

const startRefText = '#/definitions/'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export class Converter {
  private program: Program
  private generator: JsonSchemaGenerator

  constructor(filePath: string) {
    const { compilerOptions } = JSON.parse(readFileSync(resolve(__dirname, '../tsconfig.json')).toString())
    this.program = getProgramFromFiles([filePath], compilerOptions)
    this.generator = buildGenerator(this.program)!
  }

  getSchema(typename: string): Definition | null {
    return generateSchema(this.program, typename, undefined, undefined, this.generator)
  }

  hasChildren(schema: DefinitionOrBoolean | null, rootDefinitions?: Definition['definitions']): boolean {
    if (schema == null || typeof schema === 'boolean') {
      return false
    }
    rootDefinitions ??= schema.definitions
    if (schema.$ref != null && rootDefinitions != null) {
      const key = schema.$ref.slice(startRefText.length)
      if (!(key in rootDefinitions)) {
        throw new Error(`unknown type "${key}"`)
      }
      return this.hasChildren(rootDefinitions[key], rootDefinitions)
    }
    if (schema.anyOf != null) {
      return schema.anyOf.some((s) => this.hasChildren(s, rootDefinitions))
    }
    if (schema.allOf != null) {
      return schema.allOf.some((s) => this.hasChildren(s, rootDefinitions))
    }
    if (schema.properties != null) {
      return Object.keys(schema.properties).includes('children')
    }
    return false
  }

  extractPropertyTypes(schema: Definition | null, ...remove: Array<Set<string> | Map<string, unknown>>) {
    const result = new Map<string, Array<string | Array<string>>>()
    if (schema?.definitions == null) {
      return result
    }
    this.addProperties(result, schema, schema.definitions, remove)
    return result
  }

  private addProperties(
    target: Map<string, Array<string | Array<string>>>,
    definition: DefinitionOrBoolean,
    rootDefinitions: Definition['definitions'],
    ignore: Array<Set<string> | Map<string, unknown> | undefined>,
  ) {
    if (typeof definition === 'boolean') {
      return
    }
    if (definition.$ref != null && rootDefinitions != null) {
      const key = definition.$ref.slice(startRefText.length)
      if (!(key in rootDefinitions)) {
        throw new Error(`unknown type "${key}"`)
      }
      this.addProperties(target, rootDefinitions[key], rootDefinitions, ignore)
    }
    if (definition.properties != null) {
      const keys = Object.keys(definition.properties)
      for (const key of keys) {
        if (ignore != null && ignore.some((i) => i?.has(key))) {
          continue
        }
        if (key.startsWith('on')) {
          continue
        }
        if (key === 'children') {
          continue
        }

        const entry = convertPropertyTypes(definition.properties[key])
        if (entry == null) {
          continue
        }
        target.set(key, entry)
      }
    }
    if (definition.allOf != null) {
      for (const allOf of definition.allOf) {
        this.addProperties(target, allOf, rootDefinitions, ignore)
      }
    }
    if (definition.anyOf != null) {
      for (const anyOf of definition.anyOf) {
        this.addProperties(target, anyOf, rootDefinitions, ignore)
      }
    }
  }
}

export function mapIncludesAllKeys<T extends string | number | symbol>(
  map: Map<T, unknown>,
  from: Map<T, unknown>,
): boolean {
  for (const key of from.keys()) {
    if (!map.has(key)) {
      return false
    }
  }
  return true
}

export function filterMapByKeys<T extends string | number | symbol, K>(map: Map<T, K>, fn: (key: T) => boolean) {
  const result = new Map<T, K>()
  for (const [key, value] of map) {
    if (!fn(key)) {
      continue
    }
    result.set(key, value)
  }
  return result
}

export function mergeMaps<T extends string | number | symbol, K>(m1: Map<T, K>, m2: Map<T, K>): Map<T, K> {
  const result = new Map<T, K>()
  for (const [key, value] of m1) {
    result.set(key, value)
  }
  for (const [key, value] of m2) {
    result.set(key, value)
  }
  return result
}

export function mapToRecord<T extends string | number | symbol, K>(map: Map<T, K>, ignore?: Map<T, K>) {
  const result = {} as Record<T, K>
  for (const [key, value] of map) {
    if (ignore?.has(key)) {
      continue
    }
    result[key] = value
  }
  return result
}

function convertPropertyTypes(definition: DefinitionOrBoolean): Array<string | Array<string>> | undefined {
  if (typeof definition === 'boolean') {
    return undefined
  }
  if (definition.$ref === `${startRefText}ColorRepresentation`) {
    return ['string', 'number']
  }
  if (definition.type != null) {
    return convertPropertyType(definition)
  }
  if (definition.anyOf == null) {
    return undefined
  }
  return definition.anyOf.reduce<Array<string | Array<string>> | undefined>((prev, current) => {
    const converted = convertPropertyType(current)
    if (prev == null) {
      return converted
    }
    if (converted == null) {
      return prev
    }
    return prev.concat(converted)
  }, undefined)
}

function convertPropertyType(definition: DefinitionOrBoolean): Array<string> | Array<Array<string>> | undefined {
  if (typeof definition === 'boolean') {
    return undefined
  }

  if (definition.type != null) {
    if (Array.isArray(definition.type)) {
      return definition.type
    }
    switch (definition.type) {
      case 'number':
        return ['number']
      case 'boolean':
        return ['boolean']
      case 'string':
        if (definition.pattern != null) {
          return ['percentage']
        }
        if (definition.const != null && typeof definition.const === 'string') {
          return [[definition.const]]
        }
        if (definition.enum) {
          return [definition.enum as Array<string>]
        }
        return ['string']
    }
  }
  return undefined
}

function filterNull<T>(val: T | undefined): val is T {
  return val != null
}
