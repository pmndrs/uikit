import {
  ColorRepresentation,
  Material,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShapeGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector3,
} from 'three'
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
const textureLoader = new TextureLoader()
const svgCache = new Map<string, Promise<string>>()

type SvgTexture = Texture & { disposable?: boolean; objectUrl?: string }

type SvgLoadResult = {
  meshes: Array<Mesh>
  boundingBox?: BoundingBox
}

async function loadSvg({ src, content }: { src?: string; content?: string }): Promise<SvgLoadResult | undefined> {
  if (src == null && content == null) {
    return undefined
  }
  const svgContent =
    src != null ? await loadSvgContent(src) : content == null ? undefined : preprocessSvgContent(content)
  if (svgContent == null) {
    return undefined
  }

  const parsedSvg = parseSvgDocument(svgContent)
  if (parsedSvg != null && shouldRenderSvgAsTexture(parsedSvg.root)) {
    return loadSvgTextureQuad(svgContent, parsedSvg.root)
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
  const boundingBox = getSvgBoundingBox(result.xml)

  return { meshes, boundingBox }
}

function disposeSvg(result: Awaited<ReturnType<typeof loadSvg>>) {
  const disposedMaterials = new Set<Material>()
  const disposedTextures = new Set<Texture>()
  result?.meshes.forEach((mesh) => {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    for (const material of materials) {
      if (!(material instanceof Material) || disposedMaterials.has(material)) {
        continue
      }
      const texture = (material as MeshBasicMaterial).map
      if (texture != null && !disposedTextures.has(texture)) {
        const svgTexture = texture as SvgTexture
        if (svgTexture.disposable === true) {
          texture.dispose()
          if (svgTexture.objectUrl != null && typeof URL !== 'undefined') {
            URL.revokeObjectURL(svgTexture.objectUrl)
          }
        }
        disposedTextures.add(texture)
      }
      material.dispose()
      disposedMaterials.add(material)
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

async function loadSvgTextureQuad(svgContent: string, root: Element): Promise<SvgLoadResult | undefined> {
  const boundingBox = getSvgBoundingBox(root)
  const texture = await loadSvgTexture(svgContent)
  if (texture == null) {
    return undefined
  }

  const width = boundingBox?.size.x ?? parseSvgLength(root.getAttribute('width')) ?? 1
  const height = boundingBox?.size.y ?? parseSvgLength(root.getAttribute('height')) ?? 1
  const center = boundingBox?.center ?? new Vector3(width / 2, -height / 2, 0.001)

  const material = new MeshBasicMaterial({
    color: '#fff',
    map: texture,
    transparent: true,
    toneMapped: false,
  })
  const mesh = new Mesh(new PlaneGeometry(width, height), material)
  mesh.matrixAutoUpdate = false
  mesh.position.copy(center)
  mesh.updateMatrix()

  return {
    meshes: [mesh],
    boundingBox: boundingBox ?? { center, size: new Vector3(width, height, 0.001) },
  }
}

async function loadSvgTexture(svgContent: string): Promise<SvgTexture | undefined> {
  try {
    const objectUrl = createSvgObjectUrl(svgContent)
    const texture = (await textureLoader.loadAsync(objectUrl)) as SvgTexture
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
    return Object.assign(texture, { disposable: true, objectUrl })
  } catch (error) {
    console.error(error)
    return undefined
  }
}

function createSvgObjectUrl(svgContent: string): string {
  if (typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' })
    return URL.createObjectURL(blob)
  }
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
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

function parseSvgDocument(content: string): { root: Element } | undefined {
  if (typeof DOMParser === 'undefined') {
    return undefined
  }
  const document = new DOMParser().parseFromString(content, 'image/svg+xml')
  const root = document.documentElement
  if (root == null || root.nodeName.toLowerCase() !== 'svg') {
    return undefined
  }
  return { root }
}

function shouldRenderSvgAsTexture(root: Element): boolean {
  if (root.querySelector('image, pattern, use, clipPath, mask, filter, foreignObject') != null) {
    return true
  }
  const elements = [root, ...Array.from(root.querySelectorAll('*'))]
  return elements.some((element) => {
    const fill = element.getAttribute('fill')
    const stroke = element.getAttribute('stroke')
    const clipPath = element.getAttribute('clip-path')
    const style = element.getAttribute('style')
    return (
      clipPath != null ||
      fill?.includes('url(') === true ||
      stroke?.includes('url(') === true ||
      style?.includes('url(') === true
    )
  })
}

function getSvgBoundingBox(root: Element): BoundingBox | undefined {
  const viewBoxNumbers = root
    .getAttribute('viewBox')
    ?.split(/\s+/)
    .map((s) => Number.parseFloat(s))
    .filter((value) => !isNaN(value))
  if (viewBoxNumbers?.length === 4) {
    const [minX, minY, width, height] = viewBoxNumbers as [number, number, number, number]
    return {
      center: new Vector3(width / 2 + minX, -height / 2 - minY, 0.001),
      size: new Vector3(width, height, 0.001),
    }
  }

  const width = parseSvgLength(root.getAttribute('width'))
  const height = parseSvgLength(root.getAttribute('height'))
  if (width == null || height == null) {
    return undefined
  }
  return {
    center: new Vector3(width / 2, -height / 2, 0.001),
    size: new Vector3(width, height, 0.001),
  }
}

function parseSvgLength(value: string | null): number | undefined {
  if (value == null) {
    return undefined
  }
  const result = Number.parseFloat(value)
  return Number.isFinite(result) ? result : undefined
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
      const selectors =
        match[1]
          ?.split(',')
          .map((selector) => selector.trim())
          .filter(Boolean) ?? []
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

function applyResolvedSvgStyles(
  element: Element,
  stylesheet: Map<string, SvgComputedStyle>,
  inherited: SvgComputedStyle,
) {
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
