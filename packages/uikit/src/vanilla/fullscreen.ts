import { OrthographicCamera, PerspectiveCamera, Vector2, WebGLRenderer } from 'three'
import { Root } from './root.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { FullscreenProperties, updateSizeFullscreen } from '../components/index.js'
import { AllOptionalProperties } from '../properties/index.js'
import { FontFamilies } from '../text/index.js'
import { ThreeEventMap } from '../events.js'

const vectorHelper = new Vector2()

export class Fullscreen<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Root<T, EM> {
  private parentCameraSignal: Signal<PerspectiveCamera | OrthographicCamera | undefined>
  private readonly sizeX: Signal<number>
  private readonly sizeY: Signal<number>
  private readonly pixelSize: Signal<number>
  private readonly transformTranslateZ: Signal<number>

  constructor(
    private renderer: WebGLRenderer,
    private distanceToCamera?: number,
    properties?: FullscreenProperties<EM>,
    defaultProperties?: AllOptionalProperties,
    fontFamilies?: FontFamilies,
    requestRender?: () => void,
  ) {
    const sizeX = signal(0)
    const sizeY = signal(0)
    const pixelSize = signal(0)
    const transformTranslateZ = signal(0)
    const parentCameraSignal = signal<PerspectiveCamera | OrthographicCamera | undefined>(undefined)
    super(
      parentCameraSignal,
      renderer,
      { ...properties, sizeX, sizeY, pixelSize, transformTranslateZ },
      defaultProperties,
      fontFamilies,
      requestRender,
    )
    this.matrixAutoUpdate = false
    this.parentCameraSignal = parentCameraSignal
    this.sizeX = sizeX
    this.sizeY = sizeY
    this.pixelSize = pixelSize
    this.transformTranslateZ = transformTranslateZ
    this.addEventListener('added', () => {
      if (!(this.parent instanceof PerspectiveCamera || this.parent instanceof OrthographicCamera)) {
        throw new Error(`fullscreen can only be added to a camera`)
      }
      this.parentCameraSignal.value = this.parent
      this.distanceToCamera ??= this.parent.near + 0.1
      this.update()
    })
    this.addEventListener('removed', () => (this.parentCameraSignal.value = undefined))
  }

  /**
   * must be called when camera.fov, camera.top, camera.bottom, camera.right, camera.left, camera.zoom, camera.aspect changes
   */
  update() {
    const parentCamera = this.parentCameraSignal.peek()
    if (this.distanceToCamera == null || parentCamera == null) {
      return
    }
    batch(() => {
      updateSizeFullscreen(
        this.sizeX,
        this.sizeY,
        this.pixelSize,
        this.distanceToCamera!,
        parentCamera,
        this.renderer.getSize(vectorHelper).y,
      )
      this.transformTranslateZ.value = -this.distanceToCamera! / this.pixelSize.value
    })
  }

  getStyle(): undefined | Readonly<FullscreenProperties<EM>> {
    return this.styleSignal.peek()
  }

  setStyle(style: FullscreenProperties<EM> | undefined, replace?: boolean): void {
    super.setStyle(style, replace)
  }

  setProperties(properties: FullscreenProperties<EM> | undefined): void {
    super.setProperties({
      ...properties,
      sizeX: this.sizeX,
      sizeY: this.sizeY,
      pixelSize: this.pixelSize,
      transformTranslateZ: this.transformTranslateZ,
    })
  }
}
