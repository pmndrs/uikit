import { parse as parseHTML, Node, HTMLElement, TextNode } from 'node-html-parser'
import parseInlineCSS from 'inline-style-parser'
import { htmlElements } from './defaults.js'

const voidTagRegex = /<(([^<\s]+)[^<]*)\/>/g

export type ParseConfig = {
  onError?: (message: string) => void
  availableKits: Array<string>
}

/**
 * @param onError Callback function that will be called when parsing errors occur. The parser will still return a result, ignoring any elements that caused errors.
 */
export function parse(
  text: string,
  config?: ParseConfig,
): { element: ElementJson | string | undefined; classes: Record<string, Record<string, string>> } {
  text = text.replaceAll(voidTagRegex, (_, tagContent, tagName) => `<${tagContent}></${tagName}>`)
  const htmlElement = parseHTML(text, { voidTag: { tags: [] } })
  return {
    element: toUikitElementJson(htmlElement, config),
    classes: toUikitClassesJson(htmlElement),
  }
}

function toUikitClassesJson(element: Node) {
  const classesList = toUikitClassesList(element)
  const result: Record<string, Record<string, any>> = {}
  for (const { name, selector, style } of classesList) {
    let classObject = result[name]
    if (classObject == null) {
      result[name] = classObject = {}
    }
    if (selector != null) {
      if (!(selector in classObject)) {
        classObject[selector] = {}
      }
      classObject = classObject[selector]
    }

    Object.assign(classObject!, style)
  }
  return result
}

const classRegex = /\.([a-zA-Z0-9_-]+)(?::([a-zA-Z0-9_-]+))?\s*{([^}]*)}/g

function toUikitClassesList(element: Node) {
  const result: Array<{ name: string; selector: string | undefined; style: Record<string, string> }> = []
  if (element instanceof HTMLElement && element.rawTagName?.toLowerCase() === 'style') {
    let match: RegExpExecArray | null
    while ((match = classRegex.exec(element.textContent)) != null) {
      const [, name, selector, classContent] = match
      result.push({ name: name!, selector, style: toUikitStyleProperties(classContent!) })
    }
  }
  for (const node of element.childNodes) {
    result.push(...toUikitClassesList(node))
  }
  return result
}

function toUikitElementJson(element: Node, config: ParseConfig | undefined): ElementJson | string | undefined {
  if (element instanceof TextNode) {
    const text = element.innerText.trim()
    if (text.length === 0) {
      return undefined
    }
    return text
  }
  if (!(element instanceof HTMLElement)) {
    config?.onError?.(`Expected HTMLElement or TextNode but got ${element.constructor.name}`)
    return undefined
  }
  const children = element.childNodes
    .map((node) => toUikitElementJson(node, config))
    .filter((elementJson) => elementJson != null)
  if (element.rawTagName == null && children.length <= 1) {
    return children[0]
  }
  const sourceTag = (element.rawTagName ?? 'div').toLowerCase()
  if (sourceTag === 'style') {
    return undefined
  }
  let tag = sourceTag
  const properties = toUikitProperties(element.attributes)
  let defaultProperties = {}
  if (tag in htmlElements) {
    const { convertTo, defaultProperties: htmlDefaultProperties } = htmlElements[tag]!
    tag = convertTo ?? 'div'
    defaultProperties = htmlDefaultProperties ?? defaultProperties
  }
  switch (tag) {
    case 'video':
    case 'input':
      return {
        type: tag,
        sourceTag,
        properties,
        defaultProperties,
      }
    case 'img':
      return {
        type: element.attributes.src?.endsWith('.svg') ? 'svg' : 'image',
        sourceTag,
        properties,
        defaultProperties,
      }
    case 'svg':
      return {
        type: 'inline-svg',
        sourceTag,
        properties,
        text: element.outerHTML,
        defaultProperties,
      }
    case 'div':
      return {
        type: 'container',
        sourceTag,
        children,
        properties,
        defaultProperties,
      }
  }
  const tagNameParts = tag.split('-')
  if (tagNameParts.length <= 1) {
    config?.onError?.(`Unknown HTML element: ${tag}`)
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
    sourceTag,
    type: 'custom',
    children,
    name,
    kit: kit!,
    properties,
    defaultProperties,
  }
}

export type ElementJson =
  | CustomElementJson
  | ContainerElementJson
  | ImageElementJson
  | InlineSvgElementJson
  | SvgElementJson
  | VideoElementJson
  | InputElementJson

export type CustomElementJson = {
  type: 'custom'
  name: string
  kit: string
  children: ReadonlyArray<ElementJson | string>
  properties: Record<string, any>
  //for re-converting to .uikitml
  sourceTag: string
  defaultProperties: Record<string, any>
}

export type ContainerElementJson = {
  type: 'container'
  children: ReadonlyArray<ElementJson | string>
  properties: Record<string, any>
  //for re-converting to .uikitml
  sourceTag: string
  defaultProperties: Record<string, any>
}

export type ImageElementJson = {
  type: 'image'
  properties: Record<string, any>
  //for re-converting to .uikitml
  sourceTag: string
  defaultProperties: Record<string, any>
}

export type InlineSvgElementJson = {
  type: 'inline-svg'
  text: string
  properties: Record<string, any>
  //for re-converting to .uikitml
  sourceTag: string
  defaultProperties: Record<string, any>
}

export type SvgElementJson = {
  type: 'svg'
  properties: Record<string, any>
  //for re-converting to .uikitml
  sourceTag: string
  defaultProperties: Record<string, any>
}

export type VideoElementJson = {
  type: 'video'
  properties: Record<string, any>
  //for re-converting to .uikitml
  sourceTag: string
  defaultProperties: Record<string, any>
}

export type InputElementJson = {
  type: 'input'
  properties: Record<string, any>
  //for re-converting to .uikitml
  sourceTag: string
  defaultProperties: Record<string, any>
}

function toUikitProperties(attributes: HTMLElement['attributes']): Record<string, any> {
  const { style: styleString, ...properties } = attributes
  //parse style
  if (styleString != null) {
    properties.style = toUikitStyleProperties(styleString) as any
  }
  //kebab-case to camelCase
  for (const key in properties) {
    const value = properties[key]!
    delete properties[key]
    properties[kebabToCamelCase(key)] = value
  }
  return properties
}

function toUikitStyleProperties(styleString: string) {
  const parsedStyle = parseInlineCSS(styleString)
  const style: Record<string, string> = {}
  for (const parsedStyleEntry of parsedStyle) {
    if (parsedStyleEntry.type === 'comment') {
      continue
    }
    let key = kebabToCamelCase(parsedStyleEntry.property)
    //apply yoga property renamings
    if (key in yogaPropertyRenamings) {
      key = yogaPropertyRenamings[key as keyof typeof yogaPropertyRenamings]
    }
    style[key] = parsedStyleEntry.value
  }
  return style
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
