import { OrthographicCamera, PerspectiveCamera, Vector2, WebGLRenderer } from 'three'
import { Root } from './root.js'
import { FontFamilies, RootProperties, AllOptionalProperties, updateSizeFullscreen } from '../internals.js'
import { Signal, batch, signal } from '@preact/signals-core'

const vectorHelper = new Vector2()

export class Fullscreen extends Root {
  private parentCameraSignal: Signal<PerspectiveCamera | OrthographicCamera | undefined>
  private readonly sizeX: Signal<number>
  private readonly sizeY: Signal<number>
  private readonly pixelSize: Signal<number>
  private readonly transformTranslateZ: Signal<number>

  constructor(
    private renderer: WebGLRenderer,
    private distanceToCamera?: number,
    properties?: Omit<RootProperties, 'sizeX' | 'sizeY' | 'pixelSize'>,
    defaultProperties?: AllOptionalProperties,
    fontFamilies?: FontFamilies,
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
      this.distanceToCamera ??= this.parent.near + 0.01
      this.updateSize()
    })
    this.addEventListener('removed', () => (this.parentCameraSignal.value = undefined))
  }

  /**
   * must be called when the screen size changes
   */
  updateSize() {
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

  setStyle(style: Omit<RootProperties, 'sizeX' | 'sizeY' | 'pixelSize'> | undefined): void {
    super.setStyle(style)
  }

  setProperties(properties: Omit<RootProperties, 'sizeX' | 'sizeY' | 'pixelSize'> | undefined): void {
    super.setProperties({
      ...properties,
      sizeX: this.sizeX,
      sizeY: this.sizeY,
      pixelSize: this.pixelSize,
      transformTranslateZ: this.transformTranslateZ,
    })
  }
}
