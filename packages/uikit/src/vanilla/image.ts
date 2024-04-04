import { Object3D, Texture } from 'three'
import { ImageProperties, createImage } from '../components/image.js'
import { AllOptionalProperties } from '../properties/default.js'
import { Parent } from './index.js'
import { bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { unsubscribeSubscriptions } from '../utils.js'
import { FontFamilies } from '../internals.js'

export class Image extends Object3D {
  public readonly internals: ReturnType<typeof createImage>
  public readonly fontFamiliesSignal: Signal<FontFamilies | undefined>

  private container: Object3D
  private readonly propertiesSignal: Signal<ImageProperties>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly srcSignal: Signal<string | Signal<string> | Texture | Signal<Texture>>

  constructor(
    parent: Parent,
    src: string | Signal<string>,
    properties: ImageProperties,
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.fontFamiliesSignal = parent.fontFamiliesSignal
    this.srcSignal = signal(src)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.container = new Object3D()
    this.container.matrixAutoUpdate = false
    this.container.add(this)
    this.matrixAutoUpdate = false
    parent.add(this.container)

    //creating the image
    this.internals = createImage(
      parent.internals,
      this.srcSignal,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this.container },
      { current: this },
    )
    this.setProperties(properties, defaultProperties)

    //setting up events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.container.add(interactionPanel)
    bindHandlers(handlers, this, subscriptions)
  }

  setSrc(src: string | Signal<string> | Texture | Signal<Texture>) {
    this.srcSignal.value = src
  }

  setProperties(properties: ImageProperties, defaultProperties?: AllOptionalProperties) {
    batch(() => {
      this.propertiesSignal.value = properties
      this.defaultPropertiesSignal.value = defaultProperties
    })
  }

  destroy() {
    this.container.parent?.remove(this.container)
    unsubscribeSubscriptions(this.internals.subscriptions)
  }
}
