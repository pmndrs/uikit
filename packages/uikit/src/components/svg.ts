import { Material, Mesh, MeshBasicMaterial, ShapeGeometry, Vector3 } from 'three'
import { ThreeEventMap } from '../events.js'
import { BoundingBox, Content, ContentOutputProperties } from './content.js'
import { computed, signal } from '@preact/signals-core'
import { abortableEffect, loadResourceWithParams } from '../utils.js'
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js'
import { BaseOutputProperties, InputProperties } from '../properties/index.js'
import { RenderContext } from '../context.js'

export type SvgOutputProperties<EM extends ThreeEventMap = ThreeEventMap> = ContentOutputProperties<EM> & {
  keepAspectRatio?: boolean
  src?: string
  content?: string
}

export type SvgProperties<EM extends ThreeEventMap = ThreeEventMap> = InputProperties<SvgOutputProperties<EM>>

export class Svg<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Content<T, EM, SvgOutputProperties<EM>> {
  constructor(
    inputProperties?: SvgProperties<EM>,
    initialClasses?: Array<InputProperties<BaseOutputProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    const boundingBox = signal<BoundingBox | undefined>(undefined)
    super(inputProperties, initialClasses, renderContext, {
      remeasureOnChildrenChange: false,
      depthWriteDefault: false,
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
      this.add(...result.meshes)
      this.notifyAncestorsChanged()
      return () => {
        this.remove(...result.meshes)
      }
    }, this.abortSignal)
  }
}

const loader = new SVGLoader()
const svgCache = new Map<string, Promise<SVGResult>>()

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
  let result: Omit<SVGResult, 'xml'> & { xml: SVGSVGElement }
  if (src != null) {
    let promise = svgCache.get(src)
    if (promise == null) {
      svgCache.set(src, (promise = loader.loadAsync(src)))
    }
    result = (await promise) as any
  } else {
    result = loader.parse(content!) as any
  }
  const meshes: Array<Mesh> = []
  for (const path of result.paths) {
    const shapes = SVGLoader.createShapes(path)
    const material = new MeshBasicMaterial({ color: path.color, toneMapped: false })

    for (const shape of shapes) {
      const mesh = new Mesh(new ShapeGeometry(shape), material)
      mesh.matrixAutoUpdate = false
      mesh.scale.y = -1
      mesh.updateMatrix()
      meshes.push(mesh)
    }
  }
  let boundingBox: { center: Vector3; size: Vector3 } | undefined
  if (result.xml instanceof SVGSVGElement) {
    result.xml
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

function isUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (e: any) {
    return false
  }
}
