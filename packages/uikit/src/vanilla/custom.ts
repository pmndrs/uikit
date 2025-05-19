import { computed } from '@preact/signals-core'
import { createGlobalClippingPlanes } from '../clipping.js'
import { RenderContext } from '../components/root.js'
import { setupMatrixWorldUpdate } from '../components/utils.js'
import { ThreeEventMap } from '../events.js'
import { setupOrderInfo, ElementType, setupRenderOrder } from '../order.js'
import { AllProperties } from '../properties/index.js'
import { abortableEffect } from '../utils.js'
import { Component } from './component.js'
import { Material, MeshDepthMaterial, MeshDistanceMaterial } from 'three'

export type CustomProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, {}>

export class Custom<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<T, EM, {}, {}> {
  constructor(
    material: Material,
    inputProperties?: CustomProperties<EM>,
    initialClasses?: Array<CustomProperties<EM>>,
    renderContext?: RenderContext,
  ) {
    super(false, {}, inputProperties, initialClasses, material, renderContext)

    setupOrderInfo(
      this.orderInfo,
      this.properties,
      'zIndexOffset',
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
      this.material.depthTest = this.properties.get('depthTest')
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.material.depthWrite = this.properties.get('depthWrite')
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.renderOrder = this.properties.get('renderOrder')
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.castShadow = this.properties.get('castShadow')
      this.root.peek().requestRender?.()
    }, this.abortSignal)
    abortableEffect(() => {
      this.receiveShadow = this.properties.get('receiveShadow')
      this.root.peek().requestRender?.()
    }, this.abortSignal)

    setupMatrixWorldUpdate(this, this.root, this.globalPanelMatrix, this.abortSignal)

    abortableEffect(() => {
      this.visible = this.isVisible.value
      this.root.peek().requestRender?.()
    }, this.abortSignal)
  }
}
