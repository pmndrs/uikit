import { PropertyTransformation } from './utils.js'

type Aliases = Readonly<Record<string, ReadonlyArray<string> | undefined>>

export type WithAliases<T, A extends Record<string, ReadonlyArray<unknown>>> = T & {
  [K in keyof A]?: A[K][number] extends keyof T ? T[A[K][number]] : never
}

function createAliasPropertyTransformation(aliases: Aliases): PropertyTransformation {
  return (key, value, hasProperty, setProperty) => {
    if (hasProperty(key)) {
      setProperty(key, value)
      return
    }
    const aliasList = aliases[key]
    if (aliasList == null) {
      return
    }
    const aliasListLength = aliasList.length
    if (!hasProperty(aliasList[0])) {
      //if one alias doesnt exist on the object, all aliases dont exist
      return
    }
    //and also, if one alias exists on the object, all aliases exist
    for (let i = 0; i < aliasListLength; i++) {
      const alias = aliasList[i]
      setProperty(alias, value)
    }
  }
}

export type AllAliases = typeof flexAliases & typeof panelAliases & typeof scrollbarAliases & typeof transformAliases

export type WithAllAliases<T> = WithAliases<T, AllAliases>

const borderAliases = {
  border: ['borderBottom', 'borderTop', 'borderLeft', 'borderRight'],
  borderX: ['borderLeft', 'borderRight'],
  borderY: ['borderTop', 'borderBottom'],
} as const satisfies Aliases

export const borderAliasPropertyTransformation = createAliasPropertyTransformation(borderAliases)

const flexAliases = {
  ...borderAliases,
  inset: ['positionTop', 'positionLeft', 'positionRight', 'positionBottom'],
  padding: ['paddingBottom', 'paddingTop', 'paddingLeft', 'paddingRight'],
  paddingX: ['paddingLeft', 'paddingRight'],
  paddingY: ['paddingTop', 'paddingBottom'],
  margin: ['marginBottom', 'marginTop', 'marginLeft', 'marginRight'],
  marginX: ['marginLeft', 'marginRight'],
  marginY: ['marginTop', 'marginBottom'],
  gap: ['gapRow', 'gapColumn'],
} as const satisfies Aliases

export const flexAliasPropertyTransformation = createAliasPropertyTransformation(flexAliases)

const panelAliases = {
  borderRadius: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'],
  borderTopRadius: ['borderTopLeftRadius', 'borderTopRightRadius'],
  borderLeftRadius: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
  borderRightRadius: ['borderTopRightRadius', 'borderBottomRightRadius'],
  borderBottomRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
} as const satisfies Aliases

export const panelAliasPropertyTransformation = createAliasPropertyTransformation(panelAliases)

const scrollbarAliases = {
  scrollbarBorderRadius: [
    'borderTopLeftRadius',
    'borderTopRightRadius',
    'borderBottomLeftRadius',
    'borderBottomRightRadius',
  ],
  scrollbarBorderTopRadius: ['borderTopLeftRadius', 'borderTopRightRadius'],
  scrollbarBorderLeftRadius: ['borderTopLeftRadius', 'borderBottomLeftRadius'],
  scrollbarBorderRightRadius: ['borderTopRightRadius', 'borderBottomRightRadius'],
  scrollbarBorderBottomRadius: ['borderBottomLeftRadius', 'borderBottomRightRadius'],
} as const satisfies Aliases

export const scrollbarAliasPropertyTransformation = createAliasPropertyTransformation(scrollbarAliases)

const transformAliases = {
  transformScale: ['transformScaleX', 'transformScaleY', 'transformScaleZ'],
} as const satisfies Aliases

export const transformAliasPropertyTransformation = createAliasPropertyTransformation(transformAliases)
