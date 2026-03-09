import { ColorRepresentation, Material, Mesh, MeshBasicMaterial, ShapeGeometry, Vector3 } from 'three'
import { ThreeEventMap } from '../events.js'
import { BoundingBox, Content, ContentOutProperties } from './content.js'
import { computed, signal } from '@preact/signals-core'
import { abortableEffect, loadResourceWithParams } from '../utils.js'
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js'
import { BaseOutProperties, InProperties } from '../properties/index.js'
import { RenderContext } from '../context.js'

export type SvgOutProperties<EM extends ThreeEventMap = ThreeEventMap> = ContentOutProperties<EM> & {
  keepAspectRatio?: boolean
  src?: string
  content?: string
}

export type SvgProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<SvgOutProperties<EM>>

export class Svg<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends SvgOutProperties<EM> = SvgOutProperties<EM>,
> extends Content<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    const boundingBox = signal<BoundingBox | undefined>(undefined)
    super(inputProperties, initialClasses, {
      ...config,
      remeasureOnChildrenChange: false,
      depthWriteDefault: false,
      supportFillProperty: true,
      boundingBox,
    })

    const svgResult = signal<Awaited<ReturnType<typeof loadSvg>>>(undefined)
    loadResourceWithParams(
      svgResult,
      loadSvg,
      disposeSvg,
      this.abortSignal,
      computed(() => ({
        src: this.properties.value.src,
        content: this.properties.value.content,
      })),
    )
    abortableEffect(() => {
      const result = svgResult.value
      boundingBox.value = result?.boundingBox
      if (result == null || result.meshes.length === 0) {
        this.notifyAncestorsChanged()
        return
      }
      super.add(...result.meshes)
      this.notifyAncestorsChanged()
      return () => {
        super.remove(...result.meshes)
      }
    }, this.abortSignal)
  }
}

const loader = new SVGLoader()
const svgCache = new Map<string, Promise<string>>()

async function loadSvg({
  src,
  content,
}: {
  src?: string
  content?: string
}): Promise<{ meshes: Array<Mesh>; boundingBox?: BoundingBox } | undefined> {
  if (src == null && content == null) {
    return undefined
  }
  const svgContent =
    src != null ? await loadSvgContent(src) : content == null ? undefined : preprocessSvgContent(content)
  if (svgContent == null) {
    return undefined
  }
  let result: Omit<SVGResult, 'xml'> & { xml: Element }
  result = loader.parse(svgContent) as any
  const meshes: Array<Mesh> = []
  for (const path of result.paths) {
    const style = path.userData?.style ?? {}
    const fillOpacity = getCombinedOpacity(style.opacity, style.fillOpacity)
    if (style.fill !== 'none' && fillOpacity > 0) {
      const shapes = SVGLoader.createShapes(path)
      if (shapes.length > 0) {
        const material = createSvgMaterial(path.color, fillOpacity)
        for (const shape of shapes) {
          meshes.push(createSvgMesh(new ShapeGeometry(shape), material))
        }
      }
    }

    const strokeOpacity = getCombinedOpacity(style.opacity, style.strokeOpacity)
    if (style.stroke != null && style.stroke !== 'none' && style.strokeWidth > 0 && strokeOpacity > 0) {
      const material = createSvgMaterial(style.stroke, strokeOpacity)
      for (const subPath of path.subPaths) {
        const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), style)
        if (geometry == null) {
          continue
        }
        meshes.push(createSvgMesh(geometry, material))
      }
    }
  }
  let boundingBox: { center: Vector3; size: Vector3 } | undefined
  const viewBoxNumbers = result.xml
    .getAttribute('viewBox')
    ?.split(/\s+/)
    .map((s) => Number.parseFloat(s))
    .filter((value) => !isNaN(value))
  if (viewBoxNumbers?.length === 4) {
    const [minX, minY, width, height] = viewBoxNumbers as [number, number, number, number]
    boundingBox = {
      center: new Vector3(width / 2 + minX, -height / 2 - minY, 0.001),
      size: new Vector3(width, height, 0.001),
    }
  }

  return { meshes, boundingBox }
}

function disposeSvg(result: Awaited<ReturnType<typeof loadSvg>>) {
  result?.meshes.forEach((mesh) => {
    if (mesh.material instanceof Material) {
      mesh.material.dispose()
    }
    mesh.geometry.dispose()
  })
}

async function loadSvgContent(src: string) {
  let promise = svgCache.get(src)
  if (promise == null) {
    svgCache.set(
      src,
      (promise = fetch(src)
        .then((response) => response.text())
        .then((content) => preprocessSvgContent(content))),
    )
  }
  return promise
}

function createSvgMaterial(color: ColorRepresentation, opacity: number) {
  return new MeshBasicMaterial({
    color,
    opacity,
    transparent: opacity < 1,
    toneMapped: false,
  })
}

function createSvgMesh(geometry: ShapeGeometry | Mesh['geometry'], material: MeshBasicMaterial) {
  const mesh = new Mesh(geometry, material)
  mesh.matrixAutoUpdate = false
  mesh.scale.y = -1
  mesh.updateMatrix()
  return mesh
}

function getCombinedOpacity(opacity?: string | number, channelOpacity?: string | number) {
  return toOpacity(opacity) * toOpacity(channelOpacity)
}

function toOpacity(value?: string | number) {
  if (value == null) {
    return 1
  }
  const result = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(result) ? Math.max(0, Math.min(1, result)) : 1
}

type SvgComputedStyle = Partial<
  Record<
    | 'color'
    | 'fill'
    | 'fill-opacity'
    | 'fill-rule'
    | 'opacity'
    | 'stroke'
    | 'stroke-opacity'
    | 'stroke-width'
    | 'stroke-linejoin'
    | 'stroke-linecap'
    | 'stroke-miterlimit'
    | 'visibility',
    string
  >
>

const svgStyleAttributes = [
  'color',
  'fill',
  'fill-opacity',
  'fill-rule',
  'opacity',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'stroke-linejoin',
  'stroke-linecap',
  'stroke-miterlimit',
  'visibility',
] as const

const inheritedSvgDefaults: SvgComputedStyle = {
  color: '#000',
  fill: '#000',
  'fill-opacity': '1',
  opacity: '1',
  stroke: 'none',
  'stroke-opacity': '1',
  'stroke-width': '1',
  'stroke-linejoin': 'miter',
  'stroke-linecap': 'butt',
  'stroke-miterlimit': '4',
  visibility: 'visible',
}

function preprocessSvgContent(content: string) {
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return content
  }
  const document = new DOMParser().parseFromString(content, 'image/svg+xml')
  const root = document.documentElement
  if (root == null || root.nodeName.toLowerCase() !== 'svg') {
    return content
  }
  const stylesheet = parseSvgStylesheet(root)
  applyResolvedSvgStyles(root, stylesheet, inheritedSvgDefaults)
  removeSvgStyleElements(root)
  return new XMLSerializer().serializeToString(root)
}

function parseSvgStylesheet(root: Element) {
  const stylesheet = new Map<string, SvgComputedStyle>()
  const styleElements = root.querySelectorAll('style')
  for (const styleElement of styleElements) {
    const cssText = styleElement.textContent?.replaceAll(/\/\*[\s\S]*?\*\//g, '') ?? ''
    const matches = cssText.matchAll(/([^{}]+)\{([^{}]+)\}/g)
    for (const match of matches) {
      const selectors = match[1]?.split(',').map((selector) => selector.trim()).filter(Boolean) ?? []
      const declarations = parseSvgDeclarations(match[2] ?? '')
      for (const selector of selectors) {
        stylesheet.set(selector, { ...stylesheet.get(selector), ...declarations })
      }
    }
  }
  return stylesheet
}

function parseSvgDeclarations(value: string): SvgComputedStyle {
  const result: SvgComputedStyle = {}
  for (const declaration of value.split(';')) {
    const separatorIndex = declaration.indexOf(':')
    if (separatorIndex === -1) {
      continue
    }
    const key = declaration.slice(0, separatorIndex).trim()
    const declarationValue = declaration.slice(separatorIndex + 1).trim()
    if (key.length === 0 || declarationValue.length === 0) {
      continue
    }
    if ((svgStyleAttributes as ReadonlyArray<string>).includes(key)) {
      result[key as keyof SvgComputedStyle] = declarationValue
    }
  }
  return result
}

function applyResolvedSvgStyles(element: Element, stylesheet: Map<string, SvgComputedStyle>, inherited: SvgComputedStyle) {
  const resolved = { ...inherited }
  for (const [selector, declarations] of stylesheet) {
    if (!matchesSvgSelector(element, selector)) {
      continue
    }
    Object.assign(resolved, declarations)
  }
  for (const attribute of svgStyleAttributes) {
    const attributeValue = element.getAttribute(attribute)
    if (attributeValue != null) {
      resolved[attribute] = attributeValue
    }
  }
  Object.assign(resolved, parseSvgDeclarations(element.getAttribute('style') ?? ''))
  resolved.color = resolveSvgColorValue(resolved.color, inherited.color ?? '#000')
  resolved.fill = resolveSvgColorValue(resolved.fill, resolved.color ?? inherited.color ?? '#000')
  resolved.stroke = resolveSvgColorValue(resolved.stroke, resolved.color ?? inherited.color ?? '#000')

  for (const attribute of svgStyleAttributes) {
    const value = resolved[attribute]
    if (value == null) {
      continue
    }
    element.setAttribute(attribute, value)
  }

  const children = element.children
  for (let i = 0; i < children.length; i++) {
    applyResolvedSvgStyles(children[i]!, stylesheet, resolved)
  }
}

function resolveSvgColorValue(value: string | undefined, currentColor: string) {
  if (value == null) {
    return value
  }
  if (value === 'currentColor') {
    return currentColor
  }
  return value
}

function matchesSvgSelector(element: Element, selector: string): boolean {
  const selectorParts = selector.split(/\s+/).filter(Boolean)
  let currentElement: Element | null = element
  for (let i = selectorParts.length - 1; i >= 0; i--) {
    const selectorPart = selectorParts[i]!
    currentElement = findMatchingSvgSelectorTarget(currentElement, selectorPart, i === selectorParts.length - 1)
    if (currentElement == null) {
      return false
    }
    currentElement = currentElement.parentElement
  }
  return true
}

function findMatchingSvgSelectorTarget(element: Element | null, selector: string, requireCurrent: boolean) {
  if (element == null) {
    return null
  }
  if (requireCurrent) {
    return matchesSvgSelectorPart(element, selector) ? element : null
  }
  let current: Element | null = element
  while (current != null) {
    if (matchesSvgSelectorPart(current, selector)) {
      return current
    }
    current = current.parentElement
  }
  return null
}

function matchesSvgSelectorPart(element: Element, selector: string) {
  const normalizedSelector = selector.trim()
  if (normalizedSelector === '*') {
    return true
  }

  const idMatch = normalizedSelector.match(/#([A-Za-z0-9_-]+)/)
  if (idMatch != null && element.getAttribute('id') !== idMatch[1]) {
    return false
  }

  const classMatches = Array.from(normalizedSelector.matchAll(/\.([A-Za-z0-9_-]+)/g)).map((match) => match[1]!)
  if (classMatches.length > 0) {
    const classNames = (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean)
    for (const className of classMatches) {
      if (!classNames.includes(className)) {
        return false
      }
    }
  }

  const tagName = normalizedSelector.replace(/[#.][A-Za-z0-9_-]+/g, '').trim()
  if (tagName.length > 0 && tagName !== element.tagName.toLowerCase()) {
    return false
  }

  return true
}

function removeSvgStyleElements(root: Element) {
  const styleElements = root.querySelectorAll('style')
  for (const styleElement of styleElements) {
    styleElement.remove()
  }
}
