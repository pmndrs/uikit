import { Camera, Object3D, WebGLRenderer } from 'three'
import { Signal, batch, signal } from '@preact/signals-core'
import { AllOptionalProperties } from '../properties/default.js'
import { createRoot, RootProperties } from '../components/root.js'
import { bindHandlers } from './utils.js'
import { unsubscribeSubscriptions } from '../utils.js'
import { EventHandlers, FontFamilies } from '../internals.js'

export class Root extends Object3D {
  public readonly internals: ReturnType<typeof createRoot>
  public readonly fontFamiliesSignal: Signal<FontFamilies | undefined>
  private childrenContainer: Object3D

  private readonly propertiesSignal: Signal<RootProperties & EventHandlers>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(
    camera: Camera | (() => Camera),
    renderer: WebGLRenderer,
    fontFamilies?: FontFamilies,
    properties: RootProperties & EventHandlers = {},
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.fontFamiliesSignal = signal(fontFamilies)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.childrenContainer = new Object3D()
    this.childrenContainer.matrixAutoUpdate = false
    this.add(this.childrenContainer)
    this.matrixAutoUpdate = false

    this.internals = createRoot(
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this },
      { current: this.childrenContainer },
      typeof camera === 'function' ? camera : () => camera,
      renderer,
    )

    //setup scrolling & events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    bindHandlers(handlers, this, subscriptions)
  }

  update(delta: number) {
    for (const onFrame of this.internals.onFrameSet) {
      onFrame(delta)
    }
  }

  setFontFamilies(fontFamilies: FontFamilies | undefined) {
    this.fontFamiliesSignal.value = fontFamilies
  }

  setProperties(properties: RootProperties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.parent?.remove(this)
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
