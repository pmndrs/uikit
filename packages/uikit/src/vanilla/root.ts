import { Camera, Object3D, WebGLRenderer } from 'three'
import { ReadonlySignal, Signal, computed, effect, signal, untracked } from '@preact/signals-core'
import { AllOptionalProperties, MergedProperties, WithReactive } from '../properties/index.js'
import { createRootState, setupRoot, DEFAULT_PIXEL_SIZE, RootProperties } from '../components/root.js'
import { Parent, bindHandlers } from './utils.js'
import { readReactive } from '../utils.js'
import { FontFamilies } from '../text/index.js'
import { ThreeEventMap } from '../events.js'

export class Root<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Parent<T> {
  protected readonly styleSignal: Signal<RootProperties<EM> | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<RootProperties<EM> | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly unsubscribe: () => void
  private readonly onFrameSet = new Set<(delta: number) => void>()
  private readonly fontFamiliesSignal: Signal<FontFamilies | undefined>
  private readonly pixelSizeSignal: Signal<ReadonlySignal<number | undefined> | number | undefined>
  public internals!: ReturnType<typeof createRootState>

  constructor(
    camera: Signal<Camera | undefined> | (() => Camera) | Camera,
    renderer: WebGLRenderer,
    properties?: RootProperties<EM> & WithReactive<{ pixelSize?: number }>,
    defaultProperties?: AllOptionalProperties,
    fontFamilies?: FontFamilies,
    requestRender?: () => void,
    requestFrame?: () => void,
  ) {
    super()
    this.pixelSizeSignal = signal(properties?.pixelSize ?? DEFAULT_PIXEL_SIZE)
    this.matrixAutoUpdate = false
    this.fontFamiliesSignal = signal<FontFamilies | undefined>(fontFamilies)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.unsubscribe = effect(() => {
      let getCamera: () => Camera
      if (typeof camera === 'function') {
        getCamera = camera
      } else {
        const cam = readReactive(camera)
        if (cam == null) {
          this.contextSignal.value = undefined
          return
        }
        getCamera = () => cam
      }
      const abortController = new AbortController()
      const objectRef = { current: this as Object3D }
      this.internals = createRootState(
        objectRef,
        computed(() => readReactive(this.pixelSizeSignal.value) ?? DEFAULT_PIXEL_SIZE),
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        getCamera,
        renderer,
        this.onFrameSet,
        requestRender ?? (() => {}),
        requestFrame ?? (() => {}),
      )
      this.contextSignal.value = Object.assign(this.internals, { fontFamiliesSignal: this.fontFamiliesSignal })
      super.add(this.internals.interactionPanel)

      setupRoot(
        this.internals,
        this.styleSignal,
        this.propertiesSignal,
        this,
        this.childrenContainer,
        abortController.signal,
      )

      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.onFrameSet.clear()
        this.remove(this.internals.interactionPanel)
        abortController.abort()
      }
    })
  }

  update(delta: number) {
    for (const onFrame of this.onFrameSet) {
      onFrame(delta)
    }
  }

  setFontFamilies(fontFamilies: FontFamilies | undefined) {
    this.fontFamiliesSignal.value = fontFamilies
  }

  getComputedProperty<K extends keyof RootProperties<EM>>(key: K): RootProperties<EM>[K] | undefined {
    return untracked(() => this.internals.mergedProperties?.value.read(key as string, undefined))
  }

  getStyle(): undefined | Readonly<RootProperties<EM>> {
    return this.styleSignal.peek()
  }

  setStyle(style: RootProperties<EM> | undefined, replace?: boolean) {
    this.styleSignal.value = replace ? style : ({ ...this.styleSignal.peek(), ...style } as any)
  }

  setProperties(properties: (RootProperties<EM> & WithReactive<{ pixelSize?: number }>) | undefined) {
    this.pixelSizeSignal.value = properties?.pixelSize ?? DEFAULT_PIXEL_SIZE
    this.propertiesSignal.value = properties
  }

  setDefaultProperties(properties: AllOptionalProperties) {
    this.defaultPropertiesSignal.value = properties
  }

  destroy() {
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
