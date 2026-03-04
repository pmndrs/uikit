import { Material } from 'three'
import { Font } from '../font.js'

// All TSL and node material imports are lazy - loaded dynamically.
// This module must only be used after initGlyphNodeMaterials() has been called.

let _MeshBasicNodeMaterial: any = null
let _tsl: any = null

let _initPromise: Promise<void> | null = null

/**
 * Initialize this module's TSL dependencies.
 * Must be called (and awaited) before creating glyph node materials.
 */
export function initGlyphNodeMaterials(): Promise<void> {
  if (_initPromise != null) return _initPromise
  _initPromise = (async () => {
    const webgpu = await import('three/webgpu')
    _tsl = (webgpu as any).TSL
    _MeshBasicNodeMaterial = webgpu.MeshBasicNodeMaterial
  })()
  return _initPromise
}

/**
 * Creates a TSL-based instanced glyph material for MSDF text rendering.
 * Compatible with both WebGPU and WebGL renderers (via TSL->GLSL compilation).
 *
 * initGlyphNodeMaterials() must have been called and awaited before use.
 */
export function createGlyphNodeMaterial(font: Font): Material {
  if (_MeshBasicNodeMaterial == null || _tsl == null) {
    throw new Error('Glyph node materials not initialized. Call initGlyphNodeMaterials() first.')
  }

  const material = new _MeshBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  })

  _applyGlyphShader(material, font)

  return material as Material
}

// Keep the class export for backward compat (used in instanced-glyph-group.ts)
// This is a thin wrapper that delegates to createGlyphNodeMaterial
export class InstancedGlyphNodeMaterial {
  constructor(font: Font) {
    return createGlyphNodeMaterial(font) as any
  }
}

function _applyGlyphShader(material: any, font: Font) {
  const {
    Fn,
    Discard,
    attribute,
    float,
    vec2,
    vec4,
    int,
    uv,
    positionLocal,
    uniform,
    varying,
    texture,
    clamp,
    dot,
    fwidth,
    length,
    max,
    min,
    pow,
    smoothstep,
  } = _tsl

  // Set anisotropy directly on texture (max reasonable value)
  font.page.anisotropy = 16

  // Uniforms
  const fontPageTexture = texture(font.page)
  const pageSize = uniform(vec2(font.pageWidth, font.pageHeight))
  const distanceRangeUniform = uniform(int(font.distanceRange))

  // Per-instance attributes
  const instanceUVOffset = attribute('instanceUVOffset', 'vec4')
  const instanceRGBA = attribute('instanceRGBA', 'vec4')

  // Split clipping mat4 into 4 vec4 attributes
  const instanceClipping0 = attribute('instanceClipping0', 'vec4')
  const instanceClipping1 = attribute('instanceClipping1', 'vec4')
  const instanceClipping2 = attribute('instanceClipping2', 'vec4')
  const instanceClipping3 = attribute('instanceClipping3', 'vec4')

  // Vertex -> fragment varyings
  const vFontUv = varying(instanceUVOffset.xy.add(uv().mul(instanceUVOffset.zw)))
  const vRGBA = varying(instanceRGBA)
  const vLocalPosition = varying(positionLocal)
  const vClip0 = varying(instanceClipping0)
  const vClip1 = varying(instanceClipping1)
  const vClip2 = varying(instanceClipping2)
  const vClip3 = varying(instanceClipping3)

  // MSDF median function
  const getDistance = Fn(() => {
    const msdf = fontPageTexture.sample(vFontUv).rgb
    return max(min(msdf.r, msdf.g), min(max(msdf.r, msdf.g), msdf.b))
  })

  // Clipping computation (shared pattern with panel)
  const computeClipping = Fn(() => {
    const localPos = vLocalPosition
    const planes = [vClip0, vClip1, vClip2, vClip3]
    let clipOpacity = float(1.0).toVar()
    for (let i = 0; i < 4; i++) {
      const plane = planes[i]!
      const distanceToPlane = dot(localPos, plane.xyz).add(plane.w)
      const distanceGradient = fwidth(distanceToPlane).div(2.0)
      clipOpacity.assign(
        clipOpacity.mul(smoothstep(distanceGradient.negate(), distanceGradient, distanceToPlane)),
      )
    }
    return clipOpacity
  })

  // Fragment color/opacity
  const glyphOutput = Fn(() => {
    const clipOpacity = computeClipping()
    Discard(clipOpacity.lessThanEqual(0.0))

    const dist = getDistance().sub(0.5).mul(float(distanceRangeUniform))

    const aaDist = clamp(
      length(fwidth(vFontUv.mul(pageSize))).mul(0.5),
      float(0.0),
      float(distanceRangeUniform).mul(0.5),
    )

    const alpha = smoothstep(aaDist.negate(), aaDist, dist)

    Discard(alpha.lessThanEqual(0.0))

    const gamma = float(1.3)
    const finalAlpha = pow(alpha, float(1.0).div(gamma))

    return vec4(vRGBA.rgb, vRGBA.a.mul(clipOpacity).mul(finalAlpha))
  })

  const result = glyphOutput()
  material.colorNode = result.xyz
  material.opacityNode = result.w
}
