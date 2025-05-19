import { Camera, OrthographicCamera, PerspectiveCamera, Vector2, WebGLRenderer } from 'three'
import { Signal, batch, signal } from '@preact/signals-core'
import { RenderContext } from '../components/index.js'
import { ThreeEventMap } from '../events.js'
import { Container } from './container.js'
import { AllProperties } from '../properties/index.js'

export type FullscreenProperties<EM extends ThreeEventMap> = AllProperties<EM, {}>

const vectorHelper = new Vector2()

export class Fullscreen<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  private readonly sizeX: Signal<number>
  private readonly sizeY: Signal<number>
  private readonly transformTranslateZ: Signal<number>
  private readonly pixelSize: Signal<number>

  constructor(
    private renderer: WebGLRenderer,
    properties?: FullscreenProperties<EM>,
    initialClasses?: Array<FullscreenProperties<EM>>,
    private distanceToCamera?: number,
    renderContext?: RenderContext,
  ) {
    const pixelSize = signal(0)
    const sizeX = signal(0)
    const sizeY = signal(0)
    const transformTranslateZ = signal(0)
    super(
      { pointerEvents: 'listener', ...properties, sizeX, sizeY, pixelSize, transformTranslateZ },
      initialClasses,
      renderContext,
    )
    this.matrixAutoUpdate = false
    this.sizeX = sizeX
    this.sizeY = sizeY
    this.pixelSize = pixelSize
    this.transformTranslateZ = transformTranslateZ
    this.addEventListener('added', () => {
      if (!(this.parent instanceof PerspectiveCamera || this.parent instanceof OrthographicCamera)) {
        throw new Error(`fullscreen can only be added to a camera`)
      }
      this.distanceToCamera ??= this.parent.near + 0.1
      this.update()
    })
  }

  /**
   * must be called when camera.fov, camera.top, camera.bottom, camera.right, camera.left, camera.zoom, camera.aspect changes
   */
  update() {
    const camera = this.parent
    if (this.distanceToCamera == null || !(camera instanceof Camera)) {
      return
    }
    batch(() => {
      const pixelSize = this.properties.peek('pixelSize')
      if (camera instanceof PerspectiveCamera) {
        const cameraHeight = 2 * Math.tan((Math.PI * camera.fov) / 360) * this.distanceToCamera!
        this.pixelSize.value = cameraHeight / this.renderer.getSize(vectorHelper).y
        this.sizeY.value = cameraHeight
        this.sizeX.value = cameraHeight * camera.aspect
      }
      if (camera instanceof OrthographicCamera) {
        const cameraHeight = (camera.top - camera.bottom) / camera.zoom
        const cameraWidth = (camera.right - camera.left) / camera.zoom
        this.pixelSize.value = cameraHeight / this.renderer.getSize(vectorHelper).y
        this.sizeY.value = cameraHeight
        this.sizeX.value = cameraWidth
      }
      this.transformTranslateZ.value = -this.distanceToCamera! / this.pixelSize.value
    })
  }

  setProperties(properties?: FullscreenProperties<EM>): void {
    super.setProperties({
      ...properties,
      sizeX: this.sizeX,
      sizeY: this.sizeY,
      pixelSize: this.pixelSize,
      transformTranslateZ: this.transformTranslateZ,
    })
  }
}
