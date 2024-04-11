import { Camera, WebGLRenderer } from 'three'
import { Signal, effect, signal } from '@preact/signals-core'
import { AllOptionalProperties } from '../properties/default.js'
import { createRoot, RootProperties } from '../components/root.js'
import { Parent, bindHandlers } from './utils.js'
import { Subscriptions, initialize, readReactive, unsubscribeSubscriptions } from '../utils.js'
import { FontFamilies } from '../internals.js'

export class Root extends Parent {
  private readonly styleSignal: Signal<RootProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<RootProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly unsubscribe: () => void
  private readonly onFrameSet = new Set<(delta: number) => void>()
  private readonly fontFamiliesSignal: Signal<FontFamilies | undefined>

  constructor(
    camera: Signal<Camera | undefined> | (() => Camera) | Camera,
    renderer: WebGLRenderer,
    properties?: RootProperties,
    defaultProperties?: AllOptionalProperties,
    fontFamilies?: FontFamilies,
  ) {
    super()
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
      const internals = createRoot(
        this.styleSignal,
        this.propertiesSignal,
        this.defaultPropertiesSignal,
        { current: this },
        { current: this.childrenContainer },
        getCamera,
        renderer,
        this.onFrameSet,
      )
      this.contextSignal.value = Object.assign(internals, { fontFamiliesSignal: this.fontFamiliesSignal })
      super.add(internals.interactionPanel)
      const subscriptions: Subscriptions = []
      initialize(internals.initializers, subscriptions)
      bindHandlers(internals.handlers, this, subscriptions)
      return () => {
        this.onFrameSet.clear()
        this.remove(internals.interactionPanel)
        unsubscribeSubscriptions(subscriptions)
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

  setStyle(style: RootProperties | undefined) {
    this.styleSignal.value = style
  }

  setProperties(properties: RootProperties | undefined) {
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
