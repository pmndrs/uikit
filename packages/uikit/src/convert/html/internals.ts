import { parse as parseHTML, Node, TextNode, HTMLElement } from 'node-html-parser'
import { htmlDefaults } from './defaults.js'
import parseInlineCSS from 'inline-style-parser'
import { tailwindToCSS, type twj } from 'tw-to-css'
import generatedPropertyTypes from './properties.json' assert { type: 'json' }
import {
  ConversionColorMap,
  ConversionPropertyTypes,
  convertProperties as convertCssProperties,
  convertProperties,
  convertProperty,
  isInheritingProperty,
} from './properties.js'

export type ConversionGenerateComponent<T> = (
  renderAs: string,
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

export type ConversionComponentMap = Record<string, ConversionComponentData>

export function convertHtml<T>(
  text: string,
  generate: ConversionGenerateComponent<T>,
  colorMap?: ConversionColorMap,
  componentMap?: ConversionComponentMap,
): T | string | undefined {
  return convertHtmlRecursive(parseHTML(text), 0, generate, createTailwindToJson(colorMap), colorMap, componentMap)
}

export const conversionPropertyTypes = {
  Inheriting: generatedPropertyTypes.Inheriting,
  Container: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Container],
  Icon: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Icon],
  Image: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Image],
  Input: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Input],
  Svg: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Svg],
  Text: [generatedPropertyTypes.Inheriting, generatedPropertyTypes.Shared, generatedPropertyTypes.Text],
  VideoContainer: [
    generatedPropertyTypes.Inheriting,
    generatedPropertyTypes.Shared,
    generatedPropertyTypes.VideoContainer,
  ],
} satisfies Record<string, ConversionPropertyTypes>

function createTailwindToJson(customColors?: ConversionColorMap): typeof tailwindToJson {
  const themeColors: Record<string, string> = {}
  for (const key in customColors) {
    themeColors[key.replaceAll(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`)] = `$${key}`
  }
  const { twj: tailwindToJson } = tailwindToCSS({
    config: {
      theme: {
        extend: {
          colors: themeColors,
        },
      },
    },
  })
  return tailwindToJson
}

/*
TODO
export function convertHtmlToThree() {
}
function generateThreeElementCode() {
}
*/

function convertHtmlRecursive<T>(
  element: Node,
  index: number,
  generate: ConversionGenerateComponent<T>,
  tailwindToJson: typeof twj,
  colorMap?: ConversionColorMap,
  componentMap?: ConversionComponentMap,
): T | string | undefined {
  const { skipIfEmpty, defaultProperties, children, propertyTypes, renderAs } = nodeToConversionData(
    element,
    componentMap,
  )
  if (skipIfEmpty && element.childNodes.length === 0) {
    return undefined
  }

  if (skipIfEmpty && element.childNodes.length === 1) {
    return convertHtmlRecursive(element.childNodes[0], index, generate, tailwindToJson, colorMap, componentMap)
  }

  const { inheritingProperties, properties } =
    element instanceof HTMLElement
      ? convertMergeSortProperties(propertyTypes, defaultProperties, element.attributes, tailwindToJson, colorMap)
      : { inheritingProperties: undefined, properties: undefined }

  switch (children) {
    case 'none':
      return generate(renderAs, { ...inheritingProperties, ...properties }, index)
    case 'text':
      const texts = (
        element instanceof TextNode
          ? [element.rawText.trim()]
          : element.childNodes.filter(filterTextNode).map((e) => e.rawText.trim())
      ).filter((text) => text.length > 0)
      if (texts.length === 0) {
        return undefined
      }
      return generate(renderAs, { ...inheritingProperties, ...properties }, index, texts)
  }

  let result = generate(
    renderAs,
    properties ?? {},
    index,
    element.childNodes
      .map((node, i) => convertHtmlRecursive(node, i, generate, tailwindToJson, colorMap, componentMap))
      .filter(filterNull),
  )

  if (inheritingProperties == null || Object.keys(inheritingProperties).length > 0) {
    result = generate('DefaultProperties', inheritingProperties ?? {}, index, [result])
  }

  return result
}

function filterTextNode(val: any): val is TextNode {
  return val instanceof TextNode
}

function nodeToConversionData(element: Node, customComponents?: ConversionComponentMap): ConversionComponentData {
  if (element instanceof TextNode) {
    return {
      propertyTypes: conversionPropertyTypes.Text,
      renderAs: 'Text',
      children: 'text',
    }
  }
  if (element.rawTagName == null) {
    return {
      skipIfEmpty: true,
      propertyTypes: {},
      renderAs: 'Fragment',
    }
  }

  if (customComponents != null && element.rawTagName in customComponents) {
    return customComponents[element.rawTagName]
  }

  let { children, defaultProperties, renderAs, skipIfEmpty } = htmlDefaults[element.rawTagName.toLowerCase()] ?? {}

  if (element.childNodes.length > 0 && element.childNodes.every((e) => e instanceof TextNode)) {
    renderAs ??= 'Text'
    children ??= 'text'
  }

  renderAs ??= 'Container'

  return {
    propertyTypes: conversionPropertyTypes[renderAs],
    renderAs,
    children,
    defaultProperties,
    skipIfEmpty,
  }
}

function filterNull<T>(val: T | undefined): val is T {
  return val != null
}

function convertMergeSortProperties(
  propertyTypes: ConversionPropertyTypes,
  defaultProperties: Record<string, unknown> | undefined,
  attributes: HTMLElement['attributes'],
  tailwindToJson: typeof twj,
  customColors: ConversionColorMap | undefined,
): {
  properties: Record<string, unknown>
  inheritingProperties: Record<string, unknown>
} {
  const result = {
    ...defaultProperties,
    ...convertHtmlAttributes(propertyTypes, attributes, tailwindToJson, customColors),
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
  }
}

const kebebToCamelRegex = /-([a-zA-z])/g

export function kebabToCamelCase(name: string): string {
  return name.replaceAll(kebebToCamelRegex, (_, group) => group.toUpperCase())
}

function convertHtmlAttributes(
  propertyTypes: ConversionPropertyTypes,
  { class: _class, className, style, ...rest }: HTMLElement['attributes'],
  tailwindToJson: typeof twj,
  colorMap: ConversionColorMap | undefined,
) {
  const result = convertProperties(propertyTypes, rest, colorMap, kebabToCamelCase) ?? {}

  if (_class != null) {
    Object.assign(result, convertTailwind(propertyTypes, _class, tailwindToJson, colorMap))
  }

  if (className != null) {
    Object.assign(result, convertTailwind(propertyTypes, className, tailwindToJson, colorMap))
  }

  const styles = style == null ? [] : parseInlineCSS(style)
  for (const style of styles) {
    if (style.type === 'comment') {
      continue
    }
    const key = kebabToCamelCase(style.property)
    const value = convertProperty(propertyTypes, key, style.value, colorMap)
    if (value == null) {
      continue
    }
    result[key] = value
  }

  return result
}

const conditionals = ['sm', 'md', 'lg', 'xl', '2xl', 'focus', 'hover', 'active', 'dark']

const conditionalRegex = /(\S+)\:(\S+)/g

function convertTailwind(
  propertyTypes: ConversionPropertyTypes,
  className: string,
  tailwindToJson: typeof twj,
  colorMap: ConversionColorMap | undefined,
) {
  const conditionalMap = new Map<string, Array<string>>()

  const withoutConditionals = className.replaceAll(conditionalRegex, (_, conditional, value) => {
    if (conditionals.includes(conditional)) {
      let entries = conditionalMap.get(conditional)
      if (entries == null) {
        conditionalMap.set(conditional, (entries = []))
      }
      entries.push(value)
    }
    return ''
  })

  const result: Record<string, unknown> =
    convertCssProperties(propertyTypes, tailwindToJson(withoutConditionals), colorMap) ?? {}

  for (const [key, values] of conditionalMap) {
    const properties = convertCssProperties(propertyTypes, tailwindToJson(values.join(' ')), colorMap)
    if (properties == null) {
      continue
    }
    result[key] = properties
  }
  return result
}

export * from './properties.js'
