import { OrthographicCamera, PerspectiveCamera, Vector2, WebGLRenderer } from 'three'
import { batch, Signal, signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { Container } from './container.js'
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js'
import { RenderContext } from '../context.js'

export type FullscreenProperties<EM extends ThreeEventMap> = InProperties<FullscreenOutProperties<EM>>

export type FullscreenOutProperties<EM extends ThreeEventMap> = BaseOutProperties<EM> & { distanceToCamera?: number }

const vectorHelper = new Vector2()

export class Fullscreen<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends FullscreenOutProperties<EM> = FullscreenOutProperties<EM>,
> extends Container<T, EM, OutProperties> {
  private readonly sizeX: Signal<number>
  private readonly sizeY: Signal<number>
  private readonly transformTranslateZ: Signal<number>
  private readonly pixelSize: Signal<number>

  constructor(
    private renderer: WebGLRenderer,
    properties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    const sizeX = signal(0)
    const sizeY = signal(0)
    const transformTranslateZ = signal(0)
    const pixelSize = signal(0)

    super(properties, initialClasses, {
      ...config,
      defaultOverrides: {
        sizeX,
        sizeY,
        pixelSize,
        transformTranslateZ,
        pointerEvents: 'listener',
        ...config?.defaultOverrides,
      } as InProperties<OutProperties>,
    })

    this.sizeX = sizeX
    this.sizeY = sizeY
    this.transformTranslateZ = transformTranslateZ
    this.pixelSize = pixelSize
  }

  update(delta: number) {
    super.update(delta)
    const camera = this.parent
    if (!(camera instanceof PerspectiveCamera || camera instanceof OrthographicCamera)) {
      throw new Error(`fullscreen can only be added to a camera`)
    }
    const distanceToCamera = this.properties.peek().distanceToCamera ?? camera.near + 0.1
    batch(() => {
      if (camera instanceof PerspectiveCamera) {
        const cameraHeight = 2 * Math.tan((Math.PI * camera.fov) / 360) * distanceToCamera!
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
      this.transformTranslateZ.value = -distanceToCamera / this.pixelSize.value
    })
  }
}
