import { FrontSide, Material, WebGLProgramParametersWithUniforms, WebGLRenderer } from 'three'
import { compilePanelMaterial } from './shader.js'

export type MaterialClass = { new (...args: Array<any>): Material }

type InstanceOf<T> = T extends { new (): infer K } ? K : never

export type PanelMaterialInfo = { type: 'instanced' } | { type: 'normal'; data: Float32Array }

export type PanelMaterial = InstanceOf<ReturnType<typeof createPanelMaterial>>

export function createPanelMaterial<T extends MaterialClass>(MaterialClass: T, info: PanelMaterialInfo) {
  const material = new MaterialClass()
  if (material.defines == null) {
    material.defines = {}
  }
  material.side = FrontSide
  material.clipShadows = true
  material.transparent = true
  material.toneMapped = false
  material.shadowSide = FrontSide
  material.defines.USE_UV = ''
  material.defines.USE_TANGENT = ''

  const superOnBeforeCompile = material.onBeforeCompile
  material.onBeforeCompile = (parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {
    superOnBeforeCompile.call(material, parameters, renderer)
    if (info.type === 'normal') {
      parameters.uniforms.data = { value: info.data }
    }
    compilePanelMaterial(parameters, info.type === 'instanced')
  }
  return material
}
