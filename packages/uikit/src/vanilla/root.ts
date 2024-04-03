import { Camera, Object3D, WebGLRenderer } from 'three'
import { Signal, batch, signal } from '@preact/signals-core'
import { AllOptionalProperties } from '../properties/default.js'
import { createRoot, RootProperties } from '../components/root.js'
import { EventConfig, bindHandlers } from './utils.js'
import { unsubscribeSubscriptions } from '../utils.js'
import { FontFamilies } from '../internals.js'

export class Root extends Object3D {
  public readonly internals: ReturnType<typeof createRoot>
  public readonly fontFamiliesSignal: Signal<FontFamilies | undefined>
  private object: Object3D

  private readonly propertiesSignal: Signal<RootProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>

  constructor(
    public readonly eventConfig: EventConfig,
    camera: Camera | (() => Camera),
    renderer: WebGLRenderer,
    parent: Object3D,
    fontFamilies?: FontFamilies,
    properties: RootProperties = {},
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.fontFamiliesSignal = signal(fontFamilies)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.object = new Object3D()
    this.object.matrixAutoUpdate = false
    this.object.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.object)

    this.internals = createRoot(
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this },
      { current: this },
      typeof camera === 'function' ? camera : () => camera,
      renderer,
    )

    //setup scrolling & events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    bindHandlers(handlers, this, this.eventConfig, subscriptions)
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
    this.object.parent?.remove(this.object)
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
