import { parse as parseHTML, Node as ConversionNode, TextNode, HTMLElement } from 'node-html-parser'
import { htmlDefaults } from './defaults.js'
import parseInlineCSS, { Declaration, Comment } from 'inline-style-parser'
import { tailwindToCSS } from 'tw-to-css'
//@ts-ignore
import { generatedPropertyTypes } from './generated-property-types.js'
import {
  ConversionColorMap,
  ConversionPropertyTypes,
  convertProperties,
  convertProperty,
  isInheritingProperty,
  toNumber,
} from './properties.js'
import { MeshPhongMaterial, MeshPhysicalMaterial } from 'three'

export type ConversionGenerateComponent<T> = (
  element: ConversionNode | undefined,
  renderAs: string,
  custom: boolean,
  properties: Record<string, unknown>,
  index: number,
  children?: Array<T | string>,
) => T | string

export type ConversionComponentData = {
  defaultProperties?: Record<string, unknown>
  skipIfEmpty?: boolean
  propertyTypes: ConversionPropertyTypes
  renderAs: string
  children?: 'none' | 'text'
}

export { Node as ConversionNode, HTMLElement as ConversionHtmlNode } from 'node-html-parser'

const styleTagRegex = /\<style\>(?:.|\s)*?\<\/style\>/gm

export type ConversionComponentMap = Record<string, ConversionComponentData>

export function convertHtml<T>(
  text: string,
  generate: ConversionGenerateComponent<T>,
  colorMap?: ConversionColorMap,
  componentMap?: ConversionComponentMap,
): T | string | undefined {
  const { classes, element } = parseHtml(text, colorMap)
  return convertParsedHtml(element, classes, generate, colorMap, componentMap)
}

const cssClassRegex = /\s*\.([^\{]+)\s*\{([^}]*)\}/g

const cssPropsRegex = /([^:\s]+)\s*\:\s*([^;\s]+(?:[ \t]+[^;\s]+)*)\s*\;?\s*/g

const spaceXYRegex = /(-?)space-(x|y)-(\d+)/g

export class PlasticMaterial extends MeshPhongMaterial {
  constructor() {
    super({
      specular: '#111',
      shininess: 100,
    })
  }
}

export class GlassMaterial extends MeshPhysicalMaterial {
  constructor() {
    super({
      transmission: 0.5,
      roughness: 0.1,
      reflectivity: 0.5,
      iridescence: 0.4,
      thickness: 0.05,
      specularIntensity: 1,
      metalness: 0.3,
      ior: 2,
      envMapIntensity: 1,
    })
  }
}

export class MetalMaterial extends MeshPhysicalMaterial {
  constructor() {
    super({
      metalness: 0.8,
      roughness: 0.1,
    })
  }
}

const voidTagRegex = /<((\S+).*)\/>/g
const mediaQueryRegex = /@media\(min-width:(\d+)px\)([^@]+)/gm

const breakpoints = {
  '640': 'sm',
  '768': 'md',
  '1024': 'lg',
  '1280': 'xl',
  '1536': '2xl',
}

export function parseHtml(
  text: string,
  colorMap?: ConversionColorMap,
): { element: HTMLElement; classes: Map<string, any> } {
  text = text
    .replaceAll(styleTagRegex, '')
    .replaceAll(voidTagRegex, (_, tagContent, tagName) => `<${tagContent}></${tagName}>`)
  const element = parseHTML(text, { voidTag: { tags: [] } })
  const themeColors: Record<string, string> = {}
  for (const key in colorMap) {
    themeColors[key.replaceAll(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`)] = `$${key}`
  }
  const classes = new Map<string, any>([
    [
      'material-plastic',
      {
        panelMaterialClass: PlasticMaterial,
      },
    ],
    [
      'material-metal',
      {
        panelMaterialClass: MetalMaterial,
      },
    ],
    [
      'material-glass',
      {
        panelMaterialClass: GlassMaterial,
      },
    ],
    [
      'border-bend',
      {
        borderBend: 0.5,
      },
    ],
    [
      'inline-flex',
      {
        alignSelf: 'flex-start',
      },
    ],
  ])
  const css = tailwindToCSS({
    config: {
      theme: {
        extend: {
          colors: themeColors,
        },
      },
    },
  })
    .twi(
      collectClasses(element)
        .replaceAll(conditionalRegex, (_, _selector, className) => className)
        .replaceAll(spaceXYRegex, (className, negative: '' | '-', dir: 'x' | 'y', value: string) => {
          const multiplier = negative === '-' ? -1 : 1
          switch (dir) {
            case 'x':
              classes.set(className, { flexDirection: 'row', columnGap: parseFloat(value) * 4 * multiplier })
              break
            case 'y':
              classes.set(className, { flexDirection: 'column', rowGap: parseFloat(value) * 4 * multiplier })
              break
          }
          return ''
        }),
      { merge: false, ignoreMediaQueries: false },
    )
    .replaceAll(/\\(.)/g, (_, result) => result)
    .replaceAll(mediaQueryRegex, (_, breakpoint: string, content: string) => {
      const prefix = breakpoints[breakpoint as keyof typeof breakpoints]
      if (prefix == null) {
        return ''
      }
      content = content.slice(1, -1)
      parseCssClassDefinitions(content, (key, properties) => {
        const existingProperties = classes.get(key) ?? {}
        classes.set(key, { ...existingProperties, [prefix]: { ...existingProperties[prefix], ...properties } })
      })
      return ''
    })
  parseCssClassDefinitions(css, (key, properties) => classes.set(key, { ...classes.get(key), ...properties }))
  return { classes, element }
}

function parseCssClassDefinitions(css: string, set: (className: string, properties: any) => void) {
  let classesResult: RegExpExecArray | null
  let contentResult: RegExpExecArray | null
  while ((classesResult = cssClassRegex.exec(css)) != null) {
    const [, className, classContent] = classesResult
    const properties: any = {}
    while ((contentResult = cssPropsRegex.exec(classContent)) != null) {
      const [, name, value] = contentResult
      properties[kebabToCamelCase(name)] = value
    }
    set(className, properties)
  }
}

function collectClasses(element: ConversionNode): string {
  let result: string = ''
  if (element instanceof HTMLElement) {
    result += ' ' + (element.classNames ?? '')
    result += ' ' + (element.attributes.className ?? '')
  }
  const childrenLength = element.childNodes.length
  for (let i = 0; i < childrenLength; i++) {
    result += collectClasses(element.childNodes[i])
  }
  return result
}

export function convertParsedHtml<T>(
  element: ConversionNode,
  classes: Map<string, any>,
  generate: ConversionGenerateComponent<T>,
  colorMap?: ConversionColorMap,
  componentMap?: ConversionComponentMap,
) {
  return convertParsedHtmlRecursive(element, classes, 0, generate, colorMap, componentMap)
}

export const conversionPropertyTypes = {
  Inheriting: generatedPropertyTypes.Inheriting,
  Container: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Container],
  Icon: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Icon],
  Image: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Image],
  Input: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Input],
  Svg: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Svg],
  Text: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Text],
  Video: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Video],
} satisfies Record<string, ConversionPropertyTypes>

function convertParsedHtmlRecursive<T>(
  element: ConversionNode,
  classes: Map<string, any>,
  index: number,
  generate: ConversionGenerateComponent<T>,
  colorMap: ConversionColorMap | undefined,
  componentMap: ConversionComponentMap | undefined,
): T | string | undefined {
  if (element instanceof HTMLElement && element.tagName?.toLowerCase() === 'svg') {
    const { width, height, ...restAttributes } = element.attributes
    const { inheritingProperties, properties, srOnly } = convertMergeSortProperties(
      false,
      [...conversionPropertyTypes.Icon, { svgWidth: ['number'], svgHeight: ['number'] }],
      classes,
      { svgWidth: toNumber(width) ?? 24, svgHeight: toNumber(height) ?? 24, text: element.toString() },
      restAttributes,
      colorMap,
    )
    if (srOnly) {
      return undefined
    }
    return generate(element, 'Icon', false, { ...inheritingProperties, ...properties }, index)
  }

  const [{ skipIfEmpty, defaultProperties, children, propertyTypes, renderAs }, custom] = nodeToConversionData(
    element,
    componentMap,
  )
  if (skipIfEmpty && element.childNodes.length === 0) {
    return undefined
  }

  if (skipIfEmpty && element.childNodes.length === 1) {
    return convertParsedHtmlRecursive(element.childNodes[0], classes, index, generate, colorMap, componentMap)
  }

  const { inheritingProperties, properties, srOnly } =
    element instanceof HTMLElement
      ? convertMergeSortProperties(custom, propertyTypes, classes, defaultProperties, element.attributes, colorMap)
      : { inheritingProperties: undefined, properties: undefined, srOnly: false }

  if (srOnly) {
    return undefined
  }

  switch (children) {
    case 'none':
      return generate(element, renderAs, custom, { ...inheritingProperties, ...properties }, index)
    case 'text':
      if (!(element instanceof TextNode)) {
        return generate(
          element,
          renderAs,
          custom,
          { ...inheritingProperties, ...properties },
          index,
          element.childNodes
            .filter(filterTextNode)
            .map((e) => e.text.trim())
            .filter((text) => text.length > 0),
        )
      }
      const text = element.text.trim()
      if (text.length === 0) {
        return undefined
      }
      return generate(element, renderAs, custom, { ...inheritingProperties, ...properties }, index, [text])
  }

  let result = generate(
    element,
    renderAs,
    custom,
    properties ?? {},
    index,
    element.childNodes
      .map((node, i) => convertParsedHtmlRecursive(node, classes, i, generate, colorMap, componentMap))
      .filter(filterNull),
  )

  if (inheritingProperties == null || Object.keys(inheritingProperties).length > 0) {
    result = generate(undefined, 'DefaultProperties', false, inheritingProperties ?? {}, index, [result])
  }

  return result
}

function filterTextNode(val: any): val is TextNode {
  return val instanceof TextNode
}

function nodeToConversionData(
  element: ConversionNode,
  customComponents?: ConversionComponentMap,
): [ConversionComponentData, boolean] {
  if (element instanceof TextNode) {
    return [
      {
        propertyTypes: conversionPropertyTypes.Text,
        renderAs: 'Text',
        children: 'text',
      },
      false,
    ]
  }
  if (element.rawTagName == null) {
    return [
      {
        skipIfEmpty: true,
        propertyTypes: {},
        renderAs: 'Fragment',
      },
      false,
    ]
  }

  if (customComponents != null && element.rawTagName in customComponents) {
    return [customComponents[element.rawTagName], true]
  }

  let { children, defaultProperties, renderAs, skipIfEmpty } = htmlDefaults[element.rawTagName.toLowerCase()] ?? {}

  if (
    element.childNodes.length > 0 &&
    element.childNodes.every((e) => e instanceof TextNode) &&
    element.childNodes.some((e) => e instanceof TextNode && e.text.trim().length > 0)
  ) {
    renderAs ??= 'Text'
    children ??= 'text'
  }

  renderAs ??= 'Container'

  return [
    {
      propertyTypes: conversionPropertyTypes[renderAs],
      renderAs,
      children,
      defaultProperties,
      skipIfEmpty,
    },
    false,
  ]
}

function filterNull<T>(val: T | undefined): val is T {
  return val != null
}

function convertMergeSortProperties(
  custom: boolean,
  propertyTypes: ConversionPropertyTypes,
  classes: Map<string, any>,
  defaultProperties: Record<string, unknown> | undefined,
  attributes: HTMLElement['attributes'],
  colorMap: ConversionColorMap | undefined,
): {
  properties: Record<string, unknown>
  inheritingProperties: Record<string, unknown>
  srOnly: boolean
} {
  const [properties, srOnly] = convertHtmlAttributes(custom, propertyTypes, classes, attributes, colorMap)
  const result = {
    ...defaultProperties,
    ...properties,
  }
  const inheritingProperties: Record<string, unknown> = {}
  for (const key in result) {
    if (!isInheritingProperty(key)) {
      continue
    }
    inheritingProperties[key] = result[key]
    delete result[key]
  }
  return {
    inheritingProperties,
    properties: result,
    srOnly,
  }
}

const kebebToCamelRegex = /-([a-zA-z])/g

export function kebabToCamelCase(name: string): string {
  return name.replaceAll(kebebToCamelRegex, (_, group) => group.toUpperCase())
}

function convertHtmlAttributes(
  custom: boolean,
  propertyTypes: ConversionPropertyTypes,
  classes: Map<string, any>,
  { class: _class, className, style, ...rest }: HTMLElement['attributes'],
  colorMap: ConversionColorMap | undefined,
) {
  let srOnly: boolean = false
  const result = convertProperties(propertyTypes, rest, colorMap, kebabToCamelCase) ?? {}

  if (_class != null) {
    if (_class.includes('sr-only')) {
      srOnly = true
    }
    Object.assign(result, convertTailwind(propertyTypes, classes, _class, colorMap))
  }

  if (className != null) {
    if (className.includes('sr-only')) {
      srOnly = true
    }
    Object.assign(result, convertTailwind(propertyTypes, classes, className, colorMap))
  }

  let styles: Array<Declaration | Comment> = []
  try {
    if (style != null) {
      styles = parseInlineCSS(style)
    }
  } catch {}
  const stylesMap: Record<string, string> = {}
  for (const style of styles) {
    if (style.type === 'comment') {
      continue
    }
    stylesMap[kebabToCamelCase(style.property)] = style.value
  }
  Object.assign(result, convertProperties(propertyTypes, stylesMap, colorMap, kebabToCamelCase) ?? {})

  if (!custom && !('display' in result) && !('flexDirection' in result)) {
    const key = 'flexDirection'
    const value = convertProperty(propertyTypes, key, 'column', colorMap)
    if (value != null) {
      result[key] = value
    }
  }

  return [result, srOnly] as const
}

const nonWhitespaceRegex = /\S+/g

function tailwindToJson(classNames: string, classes: Map<string, any>): any {
  const result: any = {}
  let classNameResult: RegExpExecArray | null
  while ((classNameResult = nonWhitespaceRegex.exec(classNames)) != null) {
    const [className] = classNameResult
    const classesEntry = classes.get(className)
    if (classesEntry == null) {
      continue
    }
    Object.assign(result, classesEntry)
  }
  return result
}

const conditionalRegex = /(\S+)\:(\S+)/g

function convertTailwind(
  propertyTypes: ConversionPropertyTypes,
  classes: Map<string, any>,
  className: string,
  colorMap: ConversionColorMap | undefined,
) {
  const properties: Record<string, any> = {}

  const withoutConditionals = className.replaceAll(conditionalRegex, (_, conditional, value) => {
    properties[conditional] = {
      ...properties[conditional],
      ...tailwindToJson(value, classes),
    }
    return ''
  })

  Object.assign(properties, tailwindToJson(withoutConditionals, classes))

  return convertProperties(propertyTypes, properties, colorMap) ?? {}
}

export * from './properties.js'
