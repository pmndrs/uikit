import { Object3D, Object3DEventMap } from 'three'
import { Component, Container, Image, Input, Text, Video, Svg, StyleSheet } from '@pmndrs/uikit'
import { ContainerElementJson, ElementJson } from '../parser/index.js'

export interface Kit {
  [componentName: string]: new (props?: any) => Component<Object3DEventMap>
}
export function interpret(
  parseResult: {
    element: ElementJson | string | undefined
    classes: Record<string, { origin?: string; content: Record<string, any> }>
  },
  kit?: Kit,
): Object3D<Object3DEventMap> | null {
  if (!parseResult.element) {
    return null
  }

  // Add parsed CSS classes to the global StyleSheet
  for (const [className, classData] of Object.entries(parseResult.classes)) {
    if (classData && typeof classData === 'object' && 'content' in classData) {
      StyleSheet[className] = classData.content as Record<string, any>
    }
  }

  return interpretElement(parseResult.element, kit)
}

function interpretElement(json: ElementJson | string, kit?: Kit): Object3D<Object3DEventMap> | null {
  if (json === null || json === undefined) {
    return null
  }

  if (typeof json === 'string') {
    return new Text({ text: json })
  }

  const properties = { ...json.properties }
  if (properties.style && typeof properties.style === 'object') {
    Object.assign(properties, properties.style)
    delete properties.style
  }

  if (json.defaultProperties) {
    Object.assign(properties, json.defaultProperties, properties)
  }

  const elementId: string | undefined = properties.id
  let element: Component<Object3DEventMap>

  switch (json.type) {
    case 'container':
      element = createContainerElement(json, properties)
      break

    case 'custom':
      element = createCustomElement(json, properties, kit)
      break

    case 'image':
      element = createImageElement(json, properties)
      break

    case 'svg':
      element = createSvgElement(json, properties)
      break

    case 'inline-svg':
      element = createInlineSvgElement(json, properties)
      break

    case 'video':
      element = createVideoElement(json, properties)
      break

    case 'input':
      element = createInputElement(json, properties)
      break

    default:
      console.warn(`Unknown element type: ${(json as any).type}, falling back to container`)
      element = new Container(properties)
      break
  }

  if (elementId) {
    element.userData.id = elementId
  }

  if (json.sourceTag) {
    element.userData.sourceTag = json.sourceTag
  }

  if (properties.class) {
    const classNames = (properties.class as string).split(' ').filter((name) => name.trim())
    element.classList.add(...classNames)
  }

  if (element instanceof Container) {
    ;(json as ContainerElementJson).children.forEach((childElementJson: ElementJson | string) => {
      const childElement = interpretElement(childElementJson, kit)
      if (childElement) {
        element.add(childElement)
      }
    })
  }

  return element
}

function createContainerElement(
  json: ElementJson & { type: 'container' },
  properties: Record<string, any>,
): Container | Text {
  if (json.children && json.children.length === 1 && typeof json.children[0] === 'string') {
    return new Text({ ...properties, text: json.children[0] })
  }

  return new Container(properties)
}

function createCustomElement(
  json: ElementJson & { type: 'custom' },
  properties: Record<string, any>,
  kit?: Kit,
): Component<Object3DEventMap> {
  const componentName = json.sourceTag
  const CustomComponent = kit?.[componentName]

  if (CustomComponent) {
    const element = new CustomComponent(properties)
    element.userData.customElement = {
      componentName,
      sourceTag: json.sourceTag,
    }
    return element
  } else {
    const element = new Container(properties)
    element.userData.customElement = {
      componentName,
      sourceTag: json.sourceTag,
    }
    console.warn(`Custom component '${componentName}' not found in kit, falling back to Container`)
    return element
  }
}

function createImageElement(_json: ElementJson & { type: 'image' }, properties: Record<string, any>): Image {
  if (!properties.src) {
    console.warn('Image element missing src property')
    properties.src = ''
  }

  return new Image(properties as any)
}

function createSvgElement(_json: ElementJson & { type: 'svg' }, properties: Record<string, any>): Svg {
  if (!properties.src) {
    console.warn('SVG element missing src property')
    properties.src = ''
  }

  return new Svg(properties)
}

function createInlineSvgElement(json: ElementJson & { type: 'inline-svg' }, properties: Record<string, any>): Svg {
  const svgText = json.text || ''
  return new Svg({
    ...properties,
    content: svgText,
  })
}

function createVideoElement(_json: ElementJson & { type: 'video' }, properties: Record<string, any>): Video {
  if (!properties.src) {
    console.warn('Video element missing src property')
    properties.src = ''
  }

  return new Video(properties)
}

function createInputElement(json: ElementJson & { type: 'input' }, properties: Record<string, any>): Input {
  if (json.sourceTag === 'textarea' && !properties.multiline) {
    properties.multiline = true
  }

  return new Input(properties)
}

export function getElementDescription(json: ElementJson | string): string {
  if (typeof json === 'string') {
    return `Text: "${json.substring(0, 20)}${json.length > 20 ? '...' : ''}"`
  }

  switch (json.type) {
    case 'container':
      return `Container (${json.sourceTag})`
    case 'custom':
      return `Custom: ${json.sourceTag}`
    case 'image':
      return `Image: ${json.properties?.src || 'no src'}`
    case 'svg':
      return `SVG: ${json.properties?.src || 'no src'}`
    case 'inline-svg':
      return `Inline SVG (${json.text?.length || 0} chars)`
    case 'video':
      return `Video: ${json.properties?.src || 'no src'}`
    case 'input':
      return `Input (${json.sourceTag}${json.properties?.multiline || json.defaultProperties?.multiline ? ', multiline' : ''})`
    default:
      return `Unknown: ${(json as any).type}`
  }
}
