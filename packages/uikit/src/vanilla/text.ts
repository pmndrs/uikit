import { Object3D } from 'three'
import { AllOptionalProperties, Properties } from '../properties/default.js'
import { Parent } from './index.js'
import { bindHandlers } from './utils.js'
import { Signal, batch, signal } from '@preact/signals-core'
import { TextProperties, createText } from '../components/text.js'
import { unsubscribeSubscriptions } from '../internals.js'

export class Text extends Object3D {
  public readonly internals: ReturnType<typeof createText>

  private readonly styleSignal: Signal<TextProperties | undefined> = signal(undefined)
  private readonly propertiesSignal: Signal<TextProperties | undefined>
  private readonly defaultPropertiesSignal: Signal<AllOptionalProperties | undefined>
  private readonly textSignal: Signal<string | Signal<string> | Array<string | Signal<string>>>

  constructor(
    parent: Parent,
    text: string | Signal<string> | Array<string | Signal<string>> = '',
    properties?: TextProperties,
    defaultProperties?: AllOptionalProperties,
  ) {
    super()
    this.propertiesSignal = signal(properties)
    this.defaultPropertiesSignal = signal(defaultProperties)
    this.textSignal = signal(text)
    //setting up the threejs elements
    this.matrixAutoUpdate = false
    parent.add(this)

    //setting up the text
    this.internals = createText(
      parent.internals,
      this.textSignal,
      parent.fontFamiliesSignal,
      this.styleSignal,
      this.propertiesSignal,
      this.defaultPropertiesSignal,
      { current: this },
    )

    //setup events
    const { handlers, interactionPanel, subscriptions } = this.internals
    this.add(interactionPanel)
    bindHandlers(handlers, this, subscriptions)
  }

  setText(text: string | Signal<string> | Array<string | Signal<string>>) {
    this.textSignal.value = text
  }

  setStyle(style: TextProperties | undefined) {
    this.styleSignal.value = style
  }

  setProperties(properties: TextProperties | undefined) {
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
