import { computed, Signal, signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { Component } from './component.js'
import { ColorRepresentation } from 'three'
import { RenderContext } from '../components/root.js'
import { OrderInfo, setupOrderInfo, ElementType } from '../order.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { getDefaultPanelMaterialConfig } from '../panel/panel-material.js'
import { AllProperties } from '../properties/index.js'
import { Font, computedFontFamilies, computedFont } from '../text/font.js'
import {
  additionalTextDefaults,
  WordBreak,
  AdditionalTextDefaults,
  computedGylphGroupDependencies,
  createInstancedText,
} from '../text/index.js'
import { abortableEffect } from '../utils.js'
import { AdditionalTextProperties, TextProperties } from './text.js'

export type InputProperties<EM extends ThreeEventMap> = AllProperties<EM, AdditionalInputProperties>

export type InputType = 'text' | 'password'

export type AdditionalInputProperties = {
  html?: Omit<HTMLInputElement, 'value' | 'disabled' | 'type'>
  defaultValue?: string
  value?: string
  disabled?: boolean
  type: InputType
  onValueChange?: (value: string) => void
  onFocusChange?: (focus: boolean) => void
} & AdditionalTextProperties

const additionalInputDefaults = {
  type: 'text',
  disabled: false,
  ...additionalTextDefaults,
}

export type AdditionalInputDefaults = typeof additionalInputDefaults & {
  wordBreak: WordBreak
  caretOpacity: Signal<number>
  caretColor: Signal<ColorRepresentation>
}

export class Input<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<
  T,
  EM,
  AdditionalInputProperties,
  AdditionalInputDefaults
> {
  readonly backgroundOrderInfo = signal<OrderInfo | undefined>(undefined)
  readonly panelGroupDeps: ReturnType<typeof computedPanelGroupDependencies>
  readonly fontSignal: Signal<Font | undefined>

  constructor(
    inputProperties?: TextProperties<EM>,
    initialClasses?: Array<TextProperties<EM>>,
    renderContext?: RenderContext,
  ) {
    super(
      false,
      {
        wordBreak: multiline ? 'break-word' : 'keep-all',
        caretOpacity: computed(() => properties.get('opacity')),
        caretColor: computed(() => properties.get('color') ?? 0),
        ...additionalInputDefaults,
      },
      inputProperties,
      initialClasses,
      undefined,
      renderContext,
    )
    this.material.visible = false

    const parentClippingRect = computed(() => this.parentContainer.value?.clippingRect.value)

    this.panelGroupDeps = computedPanelGroupDependencies(this.properties)

    setupOrderInfo(
      this.backgroundOrderInfo,
      this.properties,
      'zIndexOffset',
      ElementType.Panel,
      this.panelGroupDeps,
      computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)),
      this.abortSignal,
    )

    const fontFamilies = computedFontFamilies(this.properties, this.parentContainer)
    this.fontSignal = computedFont(this.properties, fontFamilies)

    setupOrderInfo(
      this.orderInfo,
      undefined,
      'zIndexOffset',
      ElementType.Text,
      computedGylphGroupDependencies(this.fontSignal),
      this.backgroundOrderInfo,
      this.abortSignal,
    )

    setupInstancedPanel(
      this.properties,
      this.root,
      this.backgroundOrderInfo,
      this.panelGroupDeps,
      this.globalPanelMatrix,
      this.size,
      this.borderInset,
      parentClippingRect,
      this.isVisible,
      getDefaultPanelMaterialConfig(),
      this.abortSignal,
    )

    const customLayouting = createInstancedText(this, parentClippingRect, undefined, undefined, undefined, undefined)
    abortableEffect(() => this.node.setCustomLayouting(customLayouting.value), this.abortSignal)
  }
}
