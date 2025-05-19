import { Material, Mesh, MeshBasicMaterial, ShapeGeometry } from 'three'
import { RenderContext } from '../components/root.js'
import { ThreeEventMap } from '../events.js'
import { Content } from './content.js'
import { computed, signal } from '@preact/signals-core'
import { abortableEffect } from '../utils.js'
import { loadResourceWithParams } from '../components/utils.js'
import { SVGLoader, SVGResult } from 'three/examples/jsm/loaders/SVGLoader.js'
import { AllProperties } from '../properties/index.js'

export type AdditionalSvgProperties = {
  keepAspectRatio?: boolean
  src?: string
  content?: string
}

export type SvgProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, AdditionalSvgProperties>

export class Svg<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Content<T, EM, AdditionalSvgProperties> {
  constructor(
    inputProperties?: SvgProperties<EM>,
    initialClasses?: Array<SvgProperties<EM> | string>,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext, { remeasureOnChildrenChange: false, depthWrite: false })

    const svgResult = signal<Array<Mesh> | undefined>(undefined)
    loadResourceWithParams(
      svgResult,
      loadSvg,
      disposeSvg,
      this.abortSignal,
      computed(() => ({
        src: this.properties.get('src'),
        content: this.properties.get('content'),
      })),
    )
    abortableEffect(() => {
      const meshes = svgResult.value
      if (meshes == null || meshes.length === 0) {
        this.notifyAncestorsChanged()
        return
      }
      this.add(...meshes)
      this.notifyAncestorsChanged()
      return () => {
        this.remove(...meshes)
      }
    }, this.abortSignal)
  }
}

const loader = new SVGLoader()
const svgCache = new Map<string, Promise<SVGResult>>()

async function loadSvg({ src, content }: { src?: string; content?: string }): Promise<Array<Mesh> | undefined> {
  if (src == null && content == null) {
    return undefined
  }
  let result: SVGResult
  if (src != null) {
    let promise = svgCache.get(src)
    if (promise == null) {
      svgCache.set(src, (promise = loader.loadAsync(src)))
    }
    result = await promise
  } else {
    result = loader.parse(content!)
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
  return meshes
}

function disposeSvg(meshes: Array<Mesh> | undefined) {
  meshes?.forEach((mesh) => {
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
