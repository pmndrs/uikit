import type { Signal } from '@preact/signals-core'
import { Camera, OrthographicCamera, PerspectiveCamera } from 'three'
import type { RootProperties } from './root.js'
import { ThreeEventMap } from '../events.js'

export type FullscreenProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<
  RootProperties<EM>,
  'sizeX' | 'sizeY' | 'pixelSize' | 'anchorX' | 'anchorY'
>

/**
 * must be called when camera.fov, camera.top, camera.bottom, camera.right, camera.left, camera.zoom, camera.aspect changes
 */
export function updateSizeFullscreen(
  sizeX: Signal<number>,
  sizeY: Signal<number>,
  pixelSize: Signal<number>,
  distanceToCamera: number,
  camera: Camera,
  screenHeight: number,
) {
  if (camera instanceof PerspectiveCamera) {
    const cameraHeight = 2 * Math.tan((Math.PI * camera.fov) / 360) * distanceToCamera
    pixelSize.value = cameraHeight / screenHeight
    sizeY.value = cameraHeight
    sizeX.value = cameraHeight * camera.aspect
  }
  if (camera instanceof OrthographicCamera) {
    const cameraHeight = (camera.top - camera.bottom) / camera.zoom
    const cameraWidth = (camera.right - camera.left) / camera.zoom
    pixelSize.value = cameraHeight / screenHeight
    sizeY.value = cameraHeight
    sizeX.value = cameraWidth
  }
}
