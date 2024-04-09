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

  private readonly childrenContainer: Object3D
  private readonly styleSignal: Signal<ImageProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<ImageProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly srcSignal: Signal<
    Signal<string | undefined> | string | Texture | Signal<Texture | undefined> | undefined
  >

  constructor(
    parent: Parent,
    src: string | Signal<string>,
    properties?: ImageProperties,
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.fontFamiliesSignal = parent.fontFamiliesSignal
    this.srcSignal = signal(src)
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.childrenContainer = new Object3D()
    this.childrenContainer.matrixAutoUpdate = false
    this.add(this.childrenContainer)
    this.matrixAutoUpdate = false
    parent.add(this)

    //creating the image
    this.internals = createImage(
      parent.internals,
      this.srcSignal,
      this.styleSignal,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this },
      { current: this.childrenContainer },
    )

    //setting up events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    bindHandlers(handlers, this, subscriptions)
  }

  setSrc(src: string | Signal<string> | Texture | Signal<Texture>) {
    this.srcSignal.value = src
  }

  setStyle(style: ImageProperties | undefined) {
    this.styleSignal.value = style
  }

  setProperties(properties: ImageProperties | undefined) {
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
