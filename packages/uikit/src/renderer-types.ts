import type { Camera, Object3D, RenderTarget, Vector2 } from 'three'

/**
 * Minimal renderer interface compatible with both WebGLRenderer and WebGPURenderer.
 * This allows the library to work with either renderer without a hard dependency on WebGLRenderer.
 */
export interface RendererLike {
  getSize(target: Vector2): Vector2
  xr: {
    getSession(): XRSession | null
    enabled: boolean
    isPresenting: boolean
  }
  autoClear: boolean
  getRenderTarget(): RenderTarget | null
  setRenderTarget(target: any): void
  render(scene: Object3D, camera: Camera): void
  localClippingEnabled: boolean
  setTransparentSort(method: (a: any, b: any) => number): void
  capabilities: {
    getMaxAnisotropy(): number
  }
}
