import {
  Color,
  FrontSide,
  Material,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  MeshLambertMaterial,
  RGBADepthPacking,
  TypedArray,
  Vector2Tuple,
} from 'three'
import { Signal } from '@preact/signals-core'
import type { Constructor } from './utils.js'
import type { PanelMaterialInfo } from './panel-material.js'

// All TSL and node material imports are lazy to avoid crashing on WebGL
// where three/tsl exports are null.

let _tsl: any = null
let _nodeMaterials: any = null

function getTSL() {
  if (_tsl == null) {
    throw new Error('TSL not initialized. Call initNodeMaterials() before using node materials.')
  }
  return _tsl
}

function getNodeMaterials() {
  if (_nodeMaterials == null) {
    throw new Error('Node materials not initialized. Call initNodeMaterials() before using node materials.')
  }
  return _nodeMaterials
}

let _initPromise: Promise<void> | null = null

/**
 * Must be called (and awaited) before any node material is created.
 * This loads three/tsl and three/webgpu dynamically so they don't
 * crash on WebGL where these modules export null values.
 */
export function initNodeMaterials(): Promise<void> {
  if (_initPromise != null) return _initPromise
  _initPromise = (async () => {
    const webgpu = await import('three/webgpu')
    _tsl = (webgpu as any).TSL
    _nodeMaterials = webgpu
    // Build the lazy Fn helpers now that TSL is available
    _buildTSLHelpers()
  })()
  return _initPromise
}

// Lazy TSL helper functions - built after initNodeMaterials resolves
let _radiusDistance: any = null
let _calculateCornerIntersection: any = null
let _computeClipping: any = null
let _panelFragment: any = null
let _panelNormal: any = null

function _buildTSLHelpers() {
  const {
    Fn,
    If,
    attribute,
    float,
    vec2,
    vec3,
    vec4,
    int,
    mat4,
    uv,
    positionLocal,
    normalLocal,
    tangentLocal,
    bitangentLocal,
    uniform,
    varying,
    texture,
    abs,
    all,
    clamp,
    distance: tslDistance,
    dot,
    fwidth,
    length,
    max,
    min,
    mix,
    normalize,
    pow,
    smoothstep,
    step,
    lessThan,
    Discard,
  } = _tsl

  _radiusDistance = Fn(
    ([radius_immutable, outside_immutable, border_immutable, borderSize_immutable]: [any, any, any, any]) => {
      const radius = float(radius_immutable)
      const outside = vec2(outside_immutable)
      const border = vec2(border_immutable)
      const borderSize = vec2(borderSize_immutable)

      const outerRadius = vec2(radius, radius)
      const innerRadius = outerRadius.sub(borderSize)

      const radiusWeightUnnorm = abs(innerRadius.sub(border))
      const sum = radiusWeightUnnorm.x.add(radiusWeightUnnorm.y)
      const radiusWeight = mix(vec2(0.5, 0.5), radiusWeightUnnorm.div(sum), float(sum.greaterThan(0.0)))

      return vec2(
        radius.sub(length(outside.sub(outerRadius))),
        dot(radiusWeight, innerRadius).sub(length(border.sub(innerRadius))),
      )
    },
  )

  _calculateCornerIntersection = Fn(
    ([cornerRadius_immutable, borderSizes_immutable, aspectRatio_immutable]: [any, any, any]) => {
      const cornerRadius = float(cornerRadius_immutable)
      const borderSizes = vec2(borderSizes_immutable)
      const aspectRatio = float(aspectRatio_immutable)

      const tmp1 = cornerRadius.sub(borderSizes.y)
      const xIntersection = vec2(tmp1, tmp1.div(aspectRatio))

      const tmp2 = cornerRadius.sub(borderSizes.x)
      const yIntersection = vec2(tmp2.mul(aspectRatio), tmp2)

      return min(xIntersection, yIntersection)
    },
  )

  _computeClipping = Fn(
    ([localPos_immutable, clip0_immutable, clip1_immutable, clip2_immutable, clip3_immutable]: [
      any,
      any,
      any,
      any,
      any,
    ]) => {
      const localPos = vec3(localPos_immutable)
      const planes = [vec4(clip0_immutable), vec4(clip1_immutable), vec4(clip2_immutable), vec4(clip3_immutable)]

      let clipOpacity = float(1.0).toVar()
      for (let i = 0; i < 4; i++) {
        const plane = planes[i]!
        const distanceToPlane = dot(localPos, plane.xyz).add(plane.w)
        const planeDistanceGradient = fwidth(distanceToPlane).mul(0.5)
        clipOpacity.assign(
          clipOpacity.mul(smoothstep(planeDistanceGradient.negate(), planeDistanceGradient, distanceToPlane)),
        )
      }
      return clipOpacity
    },
  )

  _panelFragment = Fn(
    ([
      data0_immutable,
      data1_immutable,
      data2_immutable,
      data3_immutable,
      borderRadiusVec_immutable,
      clipOpacity_immutable,
      uvCoord_immutable,
      existingAlpha_immutable,
    ]: [any, any, any, any, any, any, any, any]) => {
      const absoluteBorderSize = vec4(data0_immutable)
      const data1 = vec4(data1_immutable)
      const data2 = vec4(data2_immutable)
      const data3 = vec4(data3_immutable)
      const borderRadius = vec4(borderRadiusVec_immutable)
      const clipOp = float(clipOpacity_immutable)
      const uvIn = vec2(uvCoord_immutable)
      const existingAlpha = float(existingAlpha_immutable)

      const backgroundColor = data1.xyz
      const backgroundOpacity = data1.w
      const borderColor = vec3(data2.y, data2.z, data2.w)
      const borderOpacity = data3.x
      const borderBend = data3.y
      const dimensions = data3.zw

      const aspectRatio = dimensions.x.div(dimensions.y)
      const borderSize = absoluteBorderSize.div(dimensions.yyyy)

      const uvFlipped = vec2(uvIn.x, float(1.0).sub(uvIn.y))
      const v_outsideDistance = vec4(
        uvFlipped.y,
        float(1.0).sub(uvFlipped.x).mul(aspectRatio),
        float(1.0).sub(uvFlipped.y),
        uvFlipped.x.mul(aspectRatio),
      )
      const v_borderDistance = v_outsideDistance.sub(borderSize)

      const dist = vec2(
        min(min(v_outsideDistance.x, v_outsideDistance.y), min(v_outsideDistance.z, v_outsideDistance.w)),
        min(min(v_borderDistance.x, v_borderDistance.y), min(v_borderDistance.z, v_borderDistance.w)),
      ).toVar()

      const negateBorderDistance = vec4(1.0, 1.0, 1.0, 1.0).sub(v_borderDistance)
      const maxWeight = max(
        max(negateBorderDistance.x, negateBorderDistance.y),
        max(negateBorderDistance.z, negateBorderDistance.w),
      )
      const borderWeight = vec4(
        step(maxWeight, negateBorderDistance.x),
        step(maxWeight, negateBorderDistance.y),
        step(maxWeight, negateBorderDistance.z),
        step(maxWeight, negateBorderDistance.w),
      ).toVar()

      const insideBorder = vec4(0.0, 0.0, 0.0, 0.0).toVar()

      If(
        all(lessThan(vec2(v_outsideDistance.w, v_outsideDistance.x), vec2(borderRadius.x, borderRadius.x))),
        () => {
          const cornerPos = vec2(v_outsideDistance.w, v_outsideDistance.x)
          const cornerBorderSizes = vec2(borderSize.w, borderSize.x)
          dist.assign(
            _radiusDistance(borderRadius.x, cornerPos, vec2(v_borderDistance.w, v_borderDistance.x), cornerBorderSizes),
          )
          const lineIntersection = _calculateCornerIntersection(borderRadius.x, cornerBorderSizes, aspectRatio)
          insideBorder.w.assign(max(float(0.0), lineIntersection.x.sub(v_borderDistance.w)))
          insideBorder.x.assign(max(float(0.0), lineIntersection.y.sub(v_borderDistance.x)))
        },
      )
        .ElseIf(
          all(lessThan(vec2(v_outsideDistance.y, v_outsideDistance.x), vec2(borderRadius.y, borderRadius.y))),
          () => {
            const cornerPos = vec2(v_outsideDistance.y, v_outsideDistance.x)
            const cornerBorderSizes = vec2(borderSize.y, borderSize.x)
            dist.assign(
              _radiusDistance(
                borderRadius.y,
                cornerPos,
                vec2(v_borderDistance.y, v_borderDistance.x),
                cornerBorderSizes,
              ),
            )
            const lineIntersection = _calculateCornerIntersection(borderRadius.y, cornerBorderSizes, aspectRatio)
            insideBorder.y.assign(max(float(0.0), lineIntersection.x.sub(v_borderDistance.y)))
            insideBorder.x.assign(max(float(0.0), lineIntersection.y.sub(v_borderDistance.x)))
          },
        )
        .ElseIf(
          all(lessThan(vec2(v_outsideDistance.y, v_outsideDistance.z), vec2(borderRadius.z, borderRadius.z))),
          () => {
            const cornerPos = vec2(v_outsideDistance.y, v_outsideDistance.z)
            const cornerBorderSizes = vec2(borderSize.y, borderSize.z)
            dist.assign(
              _radiusDistance(
                borderRadius.z,
                cornerPos,
                vec2(v_borderDistance.y, v_borderDistance.z),
                cornerBorderSizes,
              ),
            )
            const lineIntersection = _calculateCornerIntersection(borderRadius.z, cornerBorderSizes, aspectRatio)
            insideBorder.y.assign(max(float(0.0), lineIntersection.x.sub(v_borderDistance.y)))
            insideBorder.z.assign(max(float(0.0), lineIntersection.y.sub(v_borderDistance.z)))
          },
        )
        .ElseIf(
          all(lessThan(vec2(v_outsideDistance.z, v_outsideDistance.w), vec2(borderRadius.w, borderRadius.w))),
          () => {
            const cornerPos = vec2(v_outsideDistance.z, v_outsideDistance.w)
            const cornerBorderSizes = vec2(borderSize.z, borderSize.w)
            dist.assign(
              _radiusDistance(
                borderRadius.w,
                cornerPos,
                vec2(v_borderDistance.z, v_borderDistance.w),
                cornerBorderSizes,
              ),
            )
            const lineIntersection = _calculateCornerIntersection(borderRadius.w, cornerBorderSizes, aspectRatio)
            insideBorder.z.assign(max(float(0.0), lineIntersection.x.sub(v_borderDistance.z)))
            insideBorder.w.assign(max(float(0.0), lineIntersection.y.sub(v_borderDistance.w)))
          },
        )

      const insideBorderSum = insideBorder.x.add(insideBorder.y).add(insideBorder.z).add(insideBorder.w)
      If(insideBorderSum.greaterThan(0.0), () => {
        borderWeight.assign(insideBorder.div(insideBorderSum))
      })

      const distanceGradient = fwidth(dist)
      const outer = smoothstep(distanceGradient.x.negate(), distanceGradient.x, dist.x)
      const inner = smoothstep(distanceGradient.y.negate(), distanceGradient.y, dist.y)

      const transition = float(1.0).sub(step(float(0.1), outer.sub(inner)).mul(float(1.0).sub(inner)))

      const fullBackgroundOpacity = existingAlpha.mul(backgroundOpacity)
      const fullBorderOpacity = min(float(1.0), borderOpacity.add(fullBackgroundOpacity))

      const outOpacity = clipOp.mul(outer).mul(mix(fullBorderOpacity, fullBackgroundOpacity, transition))

      Discard(outOpacity.lessThan(0.01))

      const mainColor = backgroundColor
      const borderMix = borderOpacity.div(max(fullBorderOpacity, float(0.001)))
      const outColor = mix(mix(mainColor, borderColor, borderMix), mainColor, transition)

      return vec4(outColor, outOpacity)
    },
  )

  _panelNormal = Fn(
    ([
      data3_immutable,
      borderWeightVec_immutable,
      distVec_immutable,
      normalVec_immutable,
      tangentVec_immutable,
      bitangentVec_immutable,
    ]: [any, any, any, any, any, any]) => {
      const data3 = vec4(data3_immutable)
      const bw = vec4(borderWeightVec_immutable)
      const d = vec2(distVec_immutable)
      const n = vec3(normalVec_immutable)
      const t = vec3(tangentVec_immutable)
      const bt = vec3(bitangentVec_immutable)

      const borderBend = data3.y
      const currentBorderSize = d.x.sub(d.y)
      const outsideNormalWeight = mix(
        float(0.0),
        max(float(0.0), d.y.negate().div(currentBorderSize)).mul(borderBend.negate()),
        float(currentBorderSize.greaterThan(1e-5)),
      )

      const outsideNormal = normalize(bt.mul(bw.x.sub(bw.z)).add(t.mul(bw.y.sub(bw.w))))

      return normalize(mix(n, outsideNormal, outsideNormalWeight))
    },
  )
}

/**
 * Maps standard Three.js material classes to their node material equivalents.
 */
function getNodeMaterialMap(): Map<Constructor<Material>, Constructor<Material>> {
  const nm = getNodeMaterials()
  return new Map<Constructor<Material>, Constructor<Material>>([
    [MeshBasicMaterial, nm.MeshBasicNodeMaterial as unknown as Constructor<Material>],
    [MeshPhongMaterial, nm.MeshPhongNodeMaterial as unknown as Constructor<Material>],
    [MeshStandardMaterial, nm.MeshStandardNodeMaterial as unknown as Constructor<Material>],
    [MeshPhysicalMaterial, nm.MeshPhysicalNodeMaterial as unknown as Constructor<Material>],
    [MeshLambertMaterial, nm.MeshLambertNodeMaterial as unknown as Constructor<Material>],
  ])
}

function resolveNodeMaterialClass(MaterialClass: Constructor<Material>): Constructor<Material> {
  const nodeMaterialMap = getNodeMaterialMap()
  const direct = nodeMaterialMap.get(MaterialClass)
  if (direct) return direct
  for (const [standardClass, nodeClass] of nodeMaterialMap) {
    if (MaterialClass.prototype instanceof standardClass) {
      return nodeClass
    }
  }
  return MaterialClass
}

/**
 * Creates a TSL-based panel material compatible with both WebGL and WebGPU renderers.
 * initNodeMaterials() must have been called and awaited before using this function.
 */
export function createPanelNodeMaterial<T extends Constructor<Material>>(MaterialClass: T, info: PanelMaterialInfo) {
  const tsl = getTSL()
  const { attribute, float, vec2, vec4, int, uv, positionLocal, uniform, varying } = tsl

  const NodeClass = resolveNodeMaterialClass(MaterialClass as unknown as Constructor<Material>)
  const material = new NodeClass() as any
  material.side = FrontSide
  material.clipShadows = true
  material.transparent = true
  material.toneMapped = false
  material.shadowSide = FrontSide

  if (info.type === 'instanced') {
    const aData0 = attribute('aData0', 'vec4')
    const aData1 = attribute('aData1', 'vec4')
    const aData2 = attribute('aData2', 'vec4')
    const aData3 = attribute('aData3', 'vec4')

    const aClipping0 = attribute('aClipping0', 'vec4')
    const aClipping1 = attribute('aClipping1', 'vec4')
    const aClipping2 = attribute('aClipping2', 'vec4')
    const aClipping3 = attribute('aClipping3', 'vec4')

    const vData0 = varying(aData0)
    const vData1 = varying(aData1)
    const vData2 = varying(aData2)
    const vData3 = varying(aData3)

    const vClipping0 = varying(aClipping0)
    const vClipping1 = varying(aClipping1)
    const vClipping2 = varying(aClipping2)
    const vClipping3 = varying(aClipping3)

    const vLocalPosition = varying(positionLocal)

    const packedBR = int(vData2.x)
    const vBorderRadius = vec4(
      float(packedBR.div(125000).mod(50)),
      float(packedBR.div(2500).mod(50)),
      float(packedBR.div(50).mod(50)),
      float(packedBR.mod(50)),
    ).mul(0.01)

    const clipOpacity = _computeClipping(vLocalPosition, vClipping0, vClipping1, vClipping2, vClipping3)
    const result = _panelFragment(vData0, vData1, vData2, vData3, vBorderRadius, clipOpacity, uv(), float(1.0))

    material.colorNode = result.xyz
    material.opacityNode = result.w

    if ('normalNode' in material) {
      // TODO: borderWeight needs to be shared from panelFragment - for now skip normal bending
    }
  } else if (info.type === 'normal') {
    const dataUniform = uniform(info.data, 'mat4')

    const data0 = dataUniform[0]!
    const data1 = dataUniform[1]!
    const data2 = dataUniform[2]!
    const data3 = dataUniform[3]!

    const packedBR = int(data2.x)
    const borderRadiusVec = vec4(
      float(packedBR.div(125000).mod(50)),
      float(packedBR.div(2500).mod(50)),
      float(packedBR.div(50).mod(50)),
      float(packedBR.mod(50)),
    ).mul(0.01)

    const result = _panelFragment(data0, data1, data2, data3, borderRadiusVec, float(1.0), uv(), float(1.0))

    material.colorNode = result.xyz
    material.opacityNode = result.w
  }

  return material
}
