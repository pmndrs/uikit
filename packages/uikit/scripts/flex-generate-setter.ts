import { writeFileSync } from 'fs'
import { Edge, Gutter, Unit, Node, loadYoga } from 'yoga-layout/load'
import { createDefaultConfig } from '../src/flex/yoga.js'

const propertyRenameMap = {
  borderTop: 'borderTopWidth',
  borderRight: 'borderRightWidth',
  borderLeft: 'borderLeftWidth',
  borderBottom: 'borderBottomWidth',
}

async function main() {
  const Yoga = await loadYoga()
  const node = Yoga.Node.create(createDefaultConfig(Yoga.Config))

  const propertiesWithEdge = new Set(['border', 'padding', 'margin', 'position'])
  const propertiesWithGutter = new Set(['gap'])
  const propertiesWithoutPointUnit = new Set(['aspectRatio', 'flexGrow', 'flexShrink'])

  const enumsToPrefix: { [key in string]: string } = {
    alignContent: 'ALIGN_',
    alignItems: 'ALIGN_',
    alignSelf: 'ALIGN_',
    display: 'DISPLAY_',
    flexDirection: 'FLEX_DIRECTION_',
    flexWrap: 'WRAP_',
    justifyContent: 'JUSTIFY_',
    overflow: 'OVERFLOW_',
    positionType: 'POSITION_TYPE_',
  }

  const edgeMap = {
    Top: Edge.Top,
    Left: Edge.Left,
    Right: Edge.Right,
    Bottom: Edge.Bottom,
  }
  const gutterMap = {
    Row: Gutter.Row,
    Column: Gutter.Column,
  }

  const yogaKeys = Object.entries(Yoga)

  const kebabCaseFromSnakeCase = (str: string) =>
    str.toLowerCase().replace(/_[a-z]/g, (letter) => `-${letter.slice(1)}`)

  const nodeKeys = Object.keys(Object.getPrototypeOf(node))

  const properties = nodeKeys
    .filter(
      (keyName) =>
        keyName.startsWith('get') &&
        !keyName.includes('Child') &&
        !keyName.includes('Parent') &&
        !keyName.startsWith('getComputed'),
    )
    .map<[string, string]>((fnName) => {
      const baseFnName = fnName.slice('get'.length)
      const propertyName = `${baseFnName.charAt(0).toLowerCase()}${baseFnName.slice(1)}`
      return [propertyName, baseFnName]
    })
  const lookupTables = new Map<string, string>()
  const importedTypesFromYoga = new Set<string>()
  const setterFunctions: Array<[string, string]> = []
  for (const [propertyName, functionName] of properties) {
    const enumPrefix = enumsToPrefix[propertyName]
    let convertFunction: (
      defaultValue: string | number | null,
      setter: (value?: string | null, fnNameSuffix?: string) => string,
    ) => string
    let types: Array<string>
    if (enumPrefix != null) {
      const enums = yogaKeys.filter(([key]) => key.startsWith(enumPrefix))
      const lutName = `${enumPrefix}LUT`
      if (!lookupTables.has(lutName)) {
        lookupTables.set(
          lutName,
          createLookupTable(
            lutName,
            enums.map(([name, value]) => [kebabCaseFromSnakeCase(name.slice(enumPrefix.length)), value as any, name]),
            importedTypesFromYoga,
          ),
        )
      }
      convertFunction = (defaultValue, setter) => {
        const enumType = enumPrefix
          .slice(0, -1)
          .split('_')
          .map((split) => split[0] + split.slice(1).toLowerCase())
          .join('')
        importedTypesFromYoga.add(enumType)
        return setter(
          `convertEnum(${lutName}, input, ${
            defaultValue === null || isNaN(defaultValue as any) ? 'NaN' : JSON.stringify(defaultValue)
          } as ${enumType})`,
        )
      }
      types = [...enums.map(([name]) => `"${kebabCaseFromSnakeCase(name.slice(enumPrefix.length))}"`), 'undefined']
    } else {
      const percentUnit = node[`set${functionName}Percent` as keyof Node] != null
      const autoUnit = node[`set${functionName}Auto` as keyof Node] != null
      types = ['undefined', 'number']
      if (percentUnit) {
        types.push('`${number}%`')
      }
      if (autoUnit) {
        types.push(`"auto"`)
      }
      convertFunction = (defaultValue, setter) => {
        const prefix = autoUnit ? `if(input === "auto") { ${setter(null, 'Auto')}; return }\n` : ''
        if (defaultValue == null || (typeof defaultValue === 'number' && isNaN(defaultValue))) {
          return prefix + setter('input')
        }
        const defaultValueString =
          defaultValue === null || isNaN(defaultValue as any) ? 'NaN' : JSON.stringify(defaultValue)
        return prefix + setter(`input ?? ${defaultValueString}${propertyName === 'margin' ? ' as number' : ''}`)
      }
    }
    if (propertiesWithEdge.has(propertyName)) {
      importedTypesFromYoga.add('Edge')
      for (const [edgeKey, edge] of Object.entries(edgeMap)) {
        const defaultValue = fromYoga(propertyName, node[`get${functionName}` as 'getBorder'](edge))
        const edgePropertyName = `${propertyName}${edgeKey}`
        setterFunctions.push([
          edgePropertyName,
          `(node: Node, input: ${types.join(' | ')}) => {
              ${convertFunction(
                defaultValue,
                (value, fnNameSuffix) =>
                  `node.set${functionName}${fnNameSuffix ?? ''}(${edge}${value == null ? '' : `, ${value}`})`,
              )}}`,
        ])
      }
    } else if (propertiesWithGutter.has(propertyName)) {
      importedTypesFromYoga.add('Gutter')
      for (const [gutterKey, gutter] of Object.entries(gutterMap)) {
        const defaultValue = fromYoga(propertyName, node[`get${functionName}` as 'getGap'](gutter))
        const gutterPropertyName = `${propertyName}${gutterKey}`
        const gutterType = `Gutter.${gutterKey}`
        setterFunctions.push([
          gutterPropertyName,
          `(node: Node, input: ${types.join(' | ')}) => {
              ${convertFunction(
                defaultValue,
                (value, fnNameSuffix) => `
                  node.set${functionName}${fnNameSuffix ?? ''}(${gutter} as ${gutterType}${value == null ? '' : `, ${value}`})`,
              )}}`,
        ])
      }
    } else {
      const defaultValue = fromYoga(propertyName, node[`get${functionName}` as 'getWidth']())
      setterFunctions.push([
        propertyName,
        `(node: Node, input: ${types.join(' | ')}) => {
          ${convertFunction(
            defaultValue,
            (value, fnNameSuffix) => `
              node.set${functionName}${fnNameSuffix ?? ''}(${value == null ? '' : value})`,
          )}}`,
      ])
    }
  }

  writeFileSync(
    'src/flex/setter.ts',
    `import { Node } from "yoga-layout/load"
    import type { ${Array.from(importedTypesFromYoga).join(', ')} } from "yoga-layout/load"
    function convertEnum<T extends { [Key in string]: number }>(lut: T, input: keyof T | undefined, defaultValue: T[keyof T]): T[keyof T] {
      if(input == null) {
        return defaultValue
      }
      const resolvedValue = lut[input]
      if(resolvedValue == null) {
        throw new Error(\`unexpected value ${'${input as string}'}, expected ${'${Object.keys(lut).join(", ")}'}\`)
      }
      return resolvedValue
    }
    function convertPoint<T>(input: T | undefined, defaultValue: T): T | number {
      return input ?? defaultValue
    }
    ${Array.from(lookupTables.values()).join('\n')}
    export const setter = { ${setterFunctions
      .map(([propertyName, functionCode]) => `${applyRenames(propertyName)}: ${functionCode}`)
      .join(',\n')} }`,
  )
}

function applyRenames(key: string): string {
  if (!(key in propertyRenameMap)) {
    return key
  }
  return propertyRenameMap[key as keyof typeof propertyRenameMap]
}

function createLookupTable(
  name: string,
  values: Array<[string, string, string]>,
  importedTypesFromYoga: Set<string>,
): string {
  return `const ${name} = {
    ${values
      .map(([key, value, type]) => {
        return `"${key}": ${value}`
      })
      .join(',\n')}
  } as const`
}

function fromYoga(name: string, value: any): 'auto' | `${number}%` | number | null {
  if (typeof value === 'object') {
    switch (value.unit) {
      case Unit.Auto:
        return 'auto'
      case Unit.Percent:
        return `${value.value}%`
      case Unit.Point:
        return value.value ?? null
      case Unit.Undefined:
        return null
    }
  }
  if (typeof value === 'number') {
    return value
  }
  throw `can't convert value "${JSON.stringify(value)}" for property "${name}" from yoga`
}

main().catch(console.error)
