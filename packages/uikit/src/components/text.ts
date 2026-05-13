import { computed, signal, Signal } from '@preact/signals-core'
import type { ReadonlySignal } from '@preact/signals-core'
import { EventHandlersProperties } from '../events.js'
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js'
import { Component } from './component.js'
import { ElementType, OrderInfo, setupOrderInfo } from '../order.js'
import {
  AdditionalTextDefaults,
  additionalTextDefaults,
  computedFont,
  computedFontFamilies,
  computedGlobalTextMatrix,
  computedGylphGroupDependencies,
  createInstancedText,
  setupTextLayout,
} from '../text/index.js'
import type { Font, PositionedGlyphLayout } from '../text/index.js'
import { computedPanelGroupDependencies } from '../panel/instance/properties.js'
import { setupInstancedPanel } from '../panel/instance/setup.js'
import { getDefaultPanelMaterialConfig } from '../panel/material/config.js'
import { abortableEffect } from '../utils.js'
import { componentDefaults } from '../properties/defaults.js'
import { RenderContext } from '../context.js'
import { Matrix4 } from 'three'

export type TextOutProperties = BaseOutProperties & AdditionalTextDefaults & { text?: unknown }

export type TextProperties = InProperties<TextOutProperties>

export const textDefaults = { ...componentDefaults, ...additionalTextDefaults }

export class Text<OutProperties extends TextOutProperties = TextOutProperties> extends Component<OutProperties> {
  readonly backgroundOrderInfo = signal<OrderInfo | undefined>(undefined)
  readonly backgroundGroupDeps: ReturnType<typeof computedPanelGroupDependencies>
  readonly fontSignal: Signal<Font | undefined>
  readonly textLayout: ReadonlySignal<PositionedGlyphLayout | undefined>

  readonly globalTextMatrix: Signal<Matrix4 | undefined>

  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    protected inputConfig?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
      dynamicHandlers?: Signal<EventHandlersProperties | undefined>
      hasFocus?: Signal<boolean>
      defaults?: WithSignal<OutProperties>
      isPlaceholder?: Signal<boolean>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: textDefaults as OutProperties,
      hasNonUikitChildren: false,
      isRenderless: true,
      ...inputConfig,
    })
    this.material.visible = false

    const parentClippingRect = computed(() => this.parentContainer.value?.clippingRect.value)

    this.backgroundGroupDeps = computedPanelGroupDependencies(this.properties)

    this.globalTextMatrix = computedGlobalTextMatrix(this)

    setupOrderInfo(
      this.backgroundOrderInfo,
      this.properties,
      'zIndex',
      ElementType.Panel,
      this.backgroundGroupDeps,
      computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)),
      this.abortSignal,
    )

    const fontFamilies = computedFontFamilies(this.properties, this.parentContainer)
    this.fontSignal = computedFont(this.properties, fontFamilies)

    setupOrderInfo(
      this.orderInfo,
      this.properties,
      'zIndex',
      ElementType.Text,
      computedGylphGroupDependencies(this.fontSignal),
      this.backgroundOrderInfo,
      this.abortSignal,
    )

    setupInstancedPanel(
      this.properties,
      this.root,
      this.backgroundOrderInfo,
      this.backgroundGroupDeps,
      this.globalPanelMatrix,
      this.size,
      this.borderInset,
      parentClippingRect,
      this.isVisible,
      getDefaultPanelMaterialConfig(),
      this.abortSignal,
    )

    const { layout, customLayouting } = setupTextLayout(this)
    this.textLayout = layout
    createInstancedText(this, parentClippingRect, this.textLayout)
    abortableEffect(() => this.node.setCustomLayouting(customLayouting.value), this.abortSignal)
  }

  clone(recursive?: boolean): this {
    const cloned = new Text(this.inputProperties, this.initialClasses, this.inputConfig) as this
    this.copyInto(cloned, recursive)
    return cloned
  }

  add(): this {
    throw new Error(`the text component can not have any children`)
  }
}
