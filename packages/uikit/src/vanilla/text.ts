import { computed, signal, Signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { BaseOutputProperties, InputProperties } from '../properties/index.js'
import { Component } from './component.js'
import { ElementType, OrderInfo, setupOrderInfo } from '../order.js'
import { RenderContext } from '../components/root.js'
import {
  AdditionalTextDefaults,
  additionalTextDefaults,
  computedFont,
  computedFontFamilies,
  computedGylphGroupDependencies,
  createInstancedText,
  Font,
} from '../text/index.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { getDefaultPanelMaterialConfig } from '../panel/panel-material.js'
import { abortableEffect } from '../utils.js'
import { defaults } from '../properties/defaults.js'

export type TextOutputProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutputProperties<EM> &
  AdditionalTextDefaults

export type TextProperties<EM extends ThreeEventMap = ThreeEventMap> = InputProperties<TextOutputProperties<EM>>

const textDefaults = { ...defaults, ...additionalTextDefaults }

export class Text<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T, EM, TextOutputProperties<EM>> {
  readonly backgroundOrderInfo = signal<OrderInfo | undefined>(undefined)
  readonly panelGroupDeps: ReturnType<typeof computedPanelGroupDependencies>
  readonly fontSignal: Signal<Font | undefined>

  constructor(
    inputProperties?: TextProperties<EM>,
    initialClasses?: Array<InputProperties<BaseOutputProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(false, inputProperties, initialClasses, undefined, renderContext, textDefaults)
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
