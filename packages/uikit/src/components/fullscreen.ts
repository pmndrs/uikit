import { OrthographicCamera, PerspectiveCamera, Vector2, WebGLRenderer } from 'three'
import { batch, signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { Container } from './container.js'
import { BaseOutProperties, InProperties } from '../properties/index.js'
import { RenderContext } from '../context.js'
import { defaults } from '../properties/defaults.js'

export type FullscreenProperties<EM extends ThreeEventMap> = InProperties<FullscreenOutProperties<EM>>

type FullscreenOutProperties<EM extends ThreeEventMap> = BaseOutProperties<EM> & { distanceToCamera?: number }

const vectorHelper = new Vector2()

const fullscreenDefaults = {
  ...defaults,
  pointerEvents: 'listener' as const,
}

export class Fullscreen<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends FullscreenOutProperties<EM> = FullscreenOutProperties<EM>,
  NonReactiveProperties = {},
> extends Container<T, EM, OutProperties, NonReactiveProperties> {
  private readonly sizeX = signal(0)
  private readonly sizeY = signal(0)
  private readonly transformTranslateZ = signal(0)
  private readonly pixelSize = signal(0)

  constructor(
    private renderer: WebGLRenderer,
    properties?: InProperties<OutProperties, NonReactiveProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(properties, initialClasses, renderContext, fullscreenDefaults as OutProperties)
    //force sizeX, sizeY, pixelSize, transformTranslateZ
    this.properties.setLayer(-1, {
      sizeX: this.sizeX,
      sizeY: this.sizeY,
      pixelSize: this.pixelSize,
      transformTranslateZ: this.transformTranslateZ,
    } as InProperties<OutProperties>)
    this.matrixAutoUpdate = false
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
