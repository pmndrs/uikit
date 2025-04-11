import { parse as parseHTML, Node, HTMLElement, TextNode } from 'node-html-parser'
import parseInlineCSS from 'inline-style-parser'
import { htmlElements } from './defaults.js'

const voidTagRegex = /<((\S+).*)\/>/g

export type ParseConfig = {
  onError?: (message: string) => void
  availableKits: Array<string>
}

/**
 * @param onError Callback function that will be called when parsing errors occur. The parser will still return a result, ignoring any elements that caused errors.
 */
export function parse(text: string, config?: ParseConfig): ElementJson {
  text = text.replaceAll(voidTagRegex, (_, tagContent, tagName) => `<${tagContent}></${tagName}>`)
  const element = parseHTML(text, { voidTag: { tags: [] } })
  return toUikitElementJson(element, config) ?? { type: 'container', children: [], properties: {} }
}

function toUikitElementJson(element: Node, config: ParseConfig | undefined): ElementJson | undefined {
  if (element instanceof TextNode) {
    const text = element.innerText.trim()
    if (text.length === 0) {
      return
    }
    return {
      type: 'text',
      properties: {},
      text,
    }
  }
  if (!(element instanceof HTMLElement)) {
    throw new Error(`Expected HTMLElement or TextNode but got ${element.constructor.name}`)
  }
  if (element.rawTagName == null && element.childNodes.length === 1) {
    return toUikitElementJson(element.childNodes[0]!, config)
  }
  let tagName = (element.rawTagName ?? 'div').toLowerCase()
  let properties = toUikitProperties(element.attributes)
  if (tagName in htmlElements) {
    const { convertTo, defaultProperties } = htmlElements[tagName]!
    tagName = convertTo ?? 'div'
    properties = Object.assign({}, properties, defaultProperties ?? {})
  }
  switch (tagName) {
    case 'video':
    case 'input':
      return {
        type: tagName,
        properties,
      }
    case 'img':
      return {
        type: element.attributes.src?.endsWith('.svg') ? 'svg' : 'image',
        properties,
      }
    case 'svg':
      return {
        type: 'inline-svg',
        properties,
        text: element.outerHTML,
      }
    case 'div':
      if (element.childNodes.length === 1 && element.childNodes[0] instanceof TextNode) {
        return {
          type: 'text',
          properties,
          text: element.childNodes[0].innerText.trim(),
        }
      }
      return {
        type: 'container',
        children: element.childNodes
          .map((node) => toUikitElementJson(node, config))
          .filter((elementJson) => elementJson != null),
        properties,
      }
  }
  const tagNameParts = tagName.split('-')
  if (tagNameParts.length <= 1) {
    config?.onError?.(`Unknown HTML element: ${tagName}`)
    return undefined
  }
  const [kit, ...nameParts] = tagNameParts
  if (config == null || !config.availableKits.includes(kit!)) {
    config?.onError?.(
      `Unknown kit "${kit}". Available kits: ${config == null ? 'no available kits' : config.availableKits.join(', ')}`,
    )
    return undefined
  }
  const name = kebabToCamelCase(nameParts.join('-'))
  return {
    type: 'custom',
    children: element.childNodes
      .map((node) => toUikitElementJson(node, config))
      .filter((elementJson) => elementJson != null),
    name,
    kit: kit!,
    properties,
  }
}

export type ElementJson =
  | CustomElementJson
  | ContainerElementJson
  | ImageElementJson
  | TextElementJson
  | InlineSvgElementJson
  | SvgElementJson
  | VideoElementJson
  | InputElementJson

export type CustomElementJson = {
  type: 'custom'
  name: string
  kit: string
  children: Array<ElementJson>
  properties: Record<string, any>
}

export type ContainerElementJson = {
  type: 'container'
  children: Array<ElementJson>
  properties: Record<string, any>
}

export type ImageElementJson = {
  type: 'image'
  properties: Record<string, any>
}

export type TextElementJson = {
  type: 'text'
  text: string
  properties: Record<string, any>
}

export type InlineSvgElementJson = {
  type: 'inline-svg'
  text: string
  properties: Record<string, any>
}

export type SvgElementJson = {
  type: 'svg'
  properties: Record<string, any>
}

export type VideoElementJson = {
  type: 'video'
  properties: Record<string, any>
}

export type InputElementJson = {
  type: 'input'
  properties: Record<string, any>
}

function toUikitProperties(attributes: HTMLElement['attributes']) {
  const { style, ...properties } = attributes
  //parse and flatten style
  if (style != null) {
    const parsedStyle = parseInlineCSS(style)
    for (const parsedStyleEntry of parsedStyle) {
      if (parsedStyleEntry.type === 'comment') {
        continue
      }
      properties[parsedStyleEntry.property] = parsedStyleEntry.value
    }
  }
  //kebab-case to camelCase
  for (const key in properties) {
    const value = properties[key]!
    delete properties[key]
    properties[kebabToCamelCase(key)] = value
  }
  //apply yoga property renamings
  for (const key in properties) {
    if (!(key in yogaPropertyRenamings)) {
      continue
    }
    const value = properties[key]!
    delete properties[key]
    properties[yogaPropertyRenamings[key as keyof typeof yogaPropertyRenamings]] = value
  }
  return properties
}

const yogaPropertyRenamings = {
  rowGap: 'gapRow',
  columnGap: 'gapColumn',
  position: 'positionType',
  top: 'positionTop',
  left: 'positionLeft',
  right: 'positionRight',
  bottom: 'positionBottom',
}

function kebabToCamelCase(value: string) {
  return value.replace(/-./g, (match) => match[1]!.toUpperCase())
}
