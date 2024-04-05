import { Camera, Object3D, WebGLRenderer } from 'three'
import { Signal, batch, signal } from '@preact/signals-core'
import { AllOptionalProperties } from '../properties/default.js'
import { createRoot, RootProperties } from '../components/root.js'
import { bindHandlers } from './utils.js'
import { unsubscribeSubscriptions } from '../utils.js'
import { FontFamilies } from '../internals.js'

export class Root extends Object3D {
  public readonly internals: ReturnType<typeof createRoot>
  public readonly fontFamiliesSignal: Signal<FontFamilies | undefined>

  private readonly childrenContainer: Object3D
  private readonly styleSignal: Signal<RootProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<RootProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(
    camera: Camera | (() => Camera),
    renderer: WebGLRenderer,
    fontFamilies?: FontFamilies,
    properties?: RootProperties,
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
      this.styleSignal,
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
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
