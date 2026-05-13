import {
  MeshDepthMaterial,
  MeshDistanceMaterial,
  RGBADepthPacking,
  WebGLProgramParametersWithUniforms,
  WebGLRenderer,
} from 'three'
import type { PanelMaterialInfo } from './create.js'
import { compilePanelDepthMaterial } from './shader.js'

export class PanelDistanceMaterial extends MeshDistanceMaterial {
  constructor(private info: PanelMaterialInfo) {
    super()
    if (this.defines == null) {
      this.defines = {}
    }
    this.defines.USE_UV = ''
    this.clipShadows = true
  }

  onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void {
    super.onBeforeCompile(parameters, renderer)
    if (this.info.type === 'normal') {
      parameters.uniforms.data = { value: this.info.data }
    }
    compilePanelDepthMaterial(parameters, this.info.type === 'instanced')
  }
}

export class PanelDepthMaterial extends MeshDepthMaterial {
  constructor(private info: PanelMaterialInfo) {
    super({ depthPacking: RGBADepthPacking })
    if (this.defines == null) {
      this.defines = {}
    }
    this.defines.USE_UV = ''
    this.clipShadows = true
  }

  onBeforeCompile(parameters: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer): void {
    super.onBeforeCompile(parameters, renderer)
    if (this.info.type === 'normal') {
      parameters.uniforms.data = { value: this.info.data }
    }
    compilePanelDepthMaterial(parameters, this.info.type === 'instanced')
  }
}

export const instancedPanelDepthMaterial = new PanelDepthMaterial({ type: 'instanced' })
export const instancedPanelDistanceMaterial = new PanelDistanceMaterial({ type: 'instanced' })
