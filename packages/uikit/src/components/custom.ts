import { computed } from '@preact/signals-core'
import { createGlobalClippingPlanes } from '../clipping.js'
import { ThreeEventMap } from '../events.js'
import { setupOrderInfo, ElementType, setupRenderOrder } from '../order.js'
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js'
import { abortableEffect, setupMatrixWorldUpdate } from '../utils.js'
import { Component } from './component.js'
import { Material, MeshDepthMaterial, MeshDistanceMaterial } from 'three'
import { RenderContext } from '../context.js'

export type CustomProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export type CustomOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export class Custom<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
> extends Component<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      material?: Material
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
      defaults?: WithSignal<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, { hasNonUikitChildren: false, ...config })

    setupOrderInfo(
      this.orderInfo,
      this.properties,
      'zIndex',
      ElementType.Custom,
      undefined,
      computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)),
      this.abortSignal,
    )

    this.frustumCulled = false
    setupRenderOrder(this, this.root, this.orderInfo)

    const clippingPlanes = createGlobalClippingPlanes(this)

    this.customDepthMaterial = new MeshDepthMaterial()
    this.customDistanceMaterial = new MeshDistanceMaterial()
    this.material.clippingPlanes = clippingPlanes
    this.customDepthMaterial.clippingPlanes = clippingPlanes
    this.customDistanceMaterial.clippingPlanes = clippingPlanes

    abortableEffect(() => {
      this.material.depthTest = this.properties.value.depthTest
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.material.depthWrite = this.properties.value.depthWrite ?? false
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.renderOrder = this.properties.value.renderOrder
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.castShadow = this.properties.value.castShadow
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.receiveShadow = this.properties.value.receiveShadow
      this.root.peek().requestRender?.()
    }, this.abortSignal)

    setupMatrixWorldUpdate(this, this.root, this.globalPanelMatrix, this.abortSignal)

    abortableEffect(() => {
      this.visible = this.isVisible.value
      this.root.peek().requestRender?.()
    }, this.abortSignal)
  }
}
