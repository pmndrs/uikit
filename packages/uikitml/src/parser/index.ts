import { parse as parseHTML, Node, HTMLElement, TextNode } from 'node-html-parser'
import parseInlineCSS from 'inline-style-parser'
import { htmlElements } from './defaults.js'

const voidTagRegex = /<(([^<\s]+)[^<]*)\/>/g

//TODO: add support for #btn * {} and #btn:hover * {}
//TODO: #btn treted as class
//TODO: parse("<link ref='./text.css'/>", { files: { 'text.css': '' } })

export type ParseConfig = {
  onError?: (message: string) => void
  resolveFile?: (filePath: string) => string
}

/**
 * @param onError Callback function that will be called when parsing errors occur. The parser will still return a result, ignoring any elements that caused errors.
 */
export function parse(
  text: string,
  config?: ParseConfig,
): {
  element: ElementJson | string | undefined
  classes: Record<string, { origin?: string; content: Record<string, any> }>
} {
  text = text.replaceAll(voidTagRegex, (_, tagContent, tagName) => `<${tagContent}></${tagName}>`)
  const htmlElement = parseHTML(text, { voidTag: { tags: [] } })
  return {
    element: toUikitElementJson(htmlElement, config),
    classes: toUikitClassesJson(htmlElement),
  }
}

function toUikitClassesJson(element: Node) {
  const classesList = toUikitClassesList(element)
  const result: Record<string, { origin?: string; content: Record<string, any> }> = {}
  for (const { name, selector, style } of classesList) {
    let entry = result[name]
    if (entry == null) {
      result[name] = entry = { content: {} }
    }
    let content = entry.content
    if (selector != null) {
      if (!(selector in content)) {
        content[selector] = {}
      }
      content = content[selector]
    }

    Object.assign(content, style)
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

  return {
    sourceTag,
    type: 'custom',
    children,
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
  children: ReadonlyArray<ElementJson | string>
  properties: Record<string, any>
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
