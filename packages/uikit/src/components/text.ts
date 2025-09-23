import { computed, signal, Signal } from '@preact/signals-core'
import { EventHandlers, ThreeEventMap } from '../events.js'
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js'
import { Component } from './component.js'
import { ElementType, OrderInfo, setupOrderInfo } from '../order.js'
import {
  AdditionalTextDefaults,
  additionalTextDefaults,
  computedFont,
  computedFontFamilies,
  computedGylphGroupDependencies,
  createInstancedText,
  Font,
  InstancedText,
} from '../text/index.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { getDefaultPanelMaterialConfig } from '../panel/panel-material.js'
import { abortableEffect } from '../utils.js'
import { componentDefaults } from '../properties/defaults.js'
import { RenderContext } from '../context.js'
import { Matrix4, Quaternion, Vector2Tuple, Vector3 } from 'three'
import { CaretTransformation } from '../caret.js'
import { SelectionTransformation } from '../selection.js'

export type TextOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> &
  AdditionalTextDefaults & { text?: string | Array<string> }

export type TextProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<TextOutProperties<EM>>

export const textDefaults = { ...componentDefaults, ...additionalTextDefaults }

const IdentityMatrix = new Matrix4()
const IdentityQuaternion = new Quaternion()
const IdentityScale = new Vector3(1, 1, 1)
const positionHelper = new Vector3()

export class Text<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends TextOutProperties<EM> = TextOutProperties<EM>,
> extends Component<T, EM, OutProperties> {
  readonly backgroundOrderInfo = signal<OrderInfo | undefined>(undefined)
  readonly backgroundGroupDeps: ReturnType<typeof computedPanelGroupDependencies>
  readonly fontSignal: Signal<Font | undefined>

  readonly globalTextMatrix: Signal<Matrix4 | undefined>

  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
      dynamicHandlers?: Signal<EventHandlers | undefined>
      selectionRange?: Signal<Vector2Tuple | undefined>
      selectionTransformations?: Signal<Array<SelectionTransformation>>
      caretTransformation?: Signal<CaretTransformation | undefined>
      instancedTextRef?: { current?: InstancedText }
      hasFocus?: Signal<boolean>
      defaults?: WithSignal<OutProperties>
      isPlaceholder?: Signal<boolean>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: textDefaults as OutProperties,
      hasNonUikitChildren: false,
      ...config,
    })
    this.material.visible = false

    const parentClippingRect = computed(() => this.parentContainer.value?.clippingRect.value)

    this.backgroundGroupDeps = computedPanelGroupDependencies(this.properties)

    this.globalTextMatrix = computed(() => {
      if (this.paddingInset.value == null || this.borderInset.value == null) {
        return IdentityMatrix
      }

      const [pTop, pRight, pBottom, pLeft] = this.paddingInset.value
      const [bTop, bRight, bBottom, bLeft] = this.borderInset.value

      const topInset = pTop + bTop
      const rightInset = pRight + bRight
      const bottomInset = pBottom + bBottom
      const leftInset = pLeft + bLeft

      const pixelSize = this.properties.value.pixelSize

      positionHelper.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0)
      return new Matrix4()
        .compose(positionHelper, IdentityQuaternion, IdentityScale)
        .premultiply(this.globalMatrix.value ?? IdentityMatrix)
    })

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

    const customLayouting = createInstancedText(
      this,
      parentClippingRect,
      config?.selectionRange,
      config?.selectionTransformations,
      config?.caretTransformation,
      config?.instancedTextRef,
    )
    abortableEffect(() => this.node.setCustomLayouting(customLayouting.value), this.abortSignal)
  }

  add(): this {
    throw new Error(`the text component can not have any children`)
  }
}
