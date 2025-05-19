import { computed, Signal, signal, untracked } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { Box3, Color, Matrix4, Mesh, MeshBasicMaterial, Object3D, Plane, Quaternion, Vector3 } from 'three'
import { RenderContext, RootContext } from '../components/root.js'
import { ElementType, OrderInfo, setupOrderInfo, setupRenderOrder } from '../order.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { getDefaultPanelMaterialConfig } from '../panel/panel-material.js'
import { Component } from './component.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { AllProperties, Properties } from '../properties/index.js'
import { abortableEffect, alignmentZMap } from '../utils.js'
import { setupMatrixWorldUpdate } from '../components/utils.js'
import { createGlobalClippingPlanes } from '../clipping.js'
import { makeClippedCast } from '../panel/interaction-panel-mesh.js'
import { InstancedGlyphMesh } from '../text/index.js'
import { InstancedPanelMesh } from '../panel/instanced-panel-mesh.js'

const additionalContentDefaults = {
  depthAlign: 'back',
  keepAspectRatio: true,
}

type AdditionalContentDefaults = typeof additionalContentDefaults & {
  aspectRatio: Signal<number | undefined>
  depthWrite: boolean
}

export type AdditionalContentProperties = {
  depthAlign?: keyof typeof alignmentZMap
  keepAspectRatio?: boolean
}

export type ContentProperties<EM extends ThreeEventMap = ThreeEventMap> = AllProperties<EM, AdditionalContentProperties>

const IdentityQuaternion = new Quaternion()
const IdentityMatrix = new Matrix4()

const box3Helper = new Box3()
const smallValue = new Vector3().setScalar(0.001)

const positionHelper = new Vector3()
const scaleHelper = new Vector3()
const vectorHelper = new Vector3()

export class Content<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  AP extends AdditionalContentProperties = AdditionalContentProperties,
> extends Component<T, EM, AP, AdditionalContentDefaults> {
  readonly measurement = signal({ size: new Vector3(1, 1, 1), center: new Vector3(0, 0, 0) })
  readonly clippingPlanes: Array<Plane>

  constructor(
    inputProperties?: AllProperties<EM, AP>,
    initialClasses?: Array<AllProperties<EM, AP> | string>,
    renderContext?: RenderContext,
    config = { remeasureOnChildrenChange: true, depthWrite: true },
  ) {
    const defaultAspectRatio = signal<number | undefined>(undefined)
    super(
      true,
      {
        ...additionalContentDefaults,
        //TODO: this doesnt work with the background - need different defaults for the background and the content
        depthWrite: config.depthWrite,
        aspectRatio: defaultAspectRatio,
      },
      inputProperties,
      initialClasses,
      undefined,
      renderContext,
    )
    abortableEffect(() => {
      if (!this.properties.get('keepAspectRatio')) {
        defaultAspectRatio.value = undefined
        return
      }
      defaultAspectRatio.value = this.measurement.value.size.x / this.measurement.value.size.y
    }, this.abortSignal)
    this.material.visible = false

    const panelGroupDeps = computedPanelGroupDependencies(this.properties)
    const backgroundOrderInfo = signal<OrderInfo | undefined>()
    setupOrderInfo(
      backgroundOrderInfo,
      this.properties,
      'zIndexOffset',
      ElementType.Panel,
      panelGroupDeps,
      computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)),
      this.abortSignal,
    )

    setupInstancedPanel(
      this.properties,
      this.root,
      backgroundOrderInfo,
      panelGroupDeps,
      this.globalPanelMatrix,
      this.size,
      this.borderInset,
      computed(() => this.parentContainer.value?.clippingRect.value),
      this.isVisible,
      getDefaultPanelMaterialConfig(),
      this.abortSignal,
    )

    const localMatrix = computed(() => {
      if (this.size.value == null || this.paddingInset.value == null || this.borderInset.value == null) {
        return IdentityMatrix
      }
      const [width, height] = this.size.value
      const [pTop, pRight, pBottom, pLeft] = this.paddingInset.value
      const [bTop, bRight, bBottom, bLeft] = this.borderInset.value
      const topInset = pTop + bTop
      const rightInset = pRight + bRight
      const bottomInset = pBottom + bBottom
      const leftInset = pLeft + bLeft

      const innerWidth = width - leftInset - rightInset
      const innerHeight = height - topInset - bottomInset

      const measurement = this.measurement.value

      const pixelSize = this.properties.get('pixelSize')
      scaleHelper
        .set(
          innerWidth * pixelSize,
          innerHeight * pixelSize,
          this.properties.get('keepAspectRatio')
            ? (innerHeight * pixelSize * measurement.size.z) / measurement.size.y
            : measurement.size.z,
        )
        .divide(measurement.size)

      positionHelper.copy(measurement.center).negate()

      positionHelper.z -= alignmentZMap[this.properties.get('depthAlign')] * measurement.size.z
      positionHelper.multiply(scaleHelper)
      positionHelper.add(
        vectorHelper.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0),
      )
      return new Matrix4().compose(positionHelper, IdentityQuaternion, scaleHelper)
    })

    setupMatrixWorldUpdate(
      this,
      this.root,
      computed(() => {
        const result = localMatrix.value
        if (this.globalMatrix.value == null) {
          return result
        }
        return result.clone().premultiply(this.globalMatrix.value)
      }),
      this.abortSignal,
    )

    setupOrderInfo(
      this.orderInfo,
      undefined,
      'zIndexOffset',
      ElementType.Content,
      undefined,
      backgroundOrderInfo,
      this.abortSignal,
    )

    this.clippingPlanes = createGlobalClippingPlanes(this)

    abortableEffect(() => {
      this.visible = this.isVisible.value
      applyAppearancePropertiesToGroup(this.properties, this)
      this.root.peek().requestRender?.()
    }, this.abortSignal)

    if (config.remeasureOnChildrenChange) {
      const onChildrenChanged = this.notifyAncestorsChanged.bind(this)
      this.addEventListener('childadded', onChildrenChanged)
      this.addEventListener('childremoved', onChildrenChanged)
      this.abortSignal.addEventListener('abort', () => {
        this.removeEventListener('childadded', onChildrenChanged)
        this.removeEventListener('childremoved', onChildrenChanged)
      })
    }
  }

  notifyAncestorsChanged() {
    applyAppearancePropertiesToGroup(this.properties, this)
    this.traverse((child) => {
      if (child instanceof InstancedGlyphMesh || child instanceof InstancedPanelMesh || !(child instanceof Mesh)) {
        return
      }
      setupRenderOrder(child, this.root, this.orderInfo)
      child.material.clippingPlanes = this.clippingPlanes
      child.material.needsUpdate = true
      child.material.transparent = true
      child.raycast = makeClippedCast(this, child.raycast, this.root, this.parentContainer, this.orderInfo)
      child.spherecast =
        child.spherecast != null
          ? makeClippedCast(this, child.spherecast, this.root, this.parentContainer, this.orderInfo)
          : undefined
    })
    box3Helper.makeEmpty()
    for (const child of this.children) {
      if (child instanceof InstancedGlyphMesh || child instanceof InstancedPanelMesh) {
        continue
      }
      const parent = child.parent
      child.parent = null
      box3Helper.expandByObject(child)
      child.parent = parent
    }

    const size = new Vector3()
    const center = new Vector3()
    box3Helper.getSize(size).max(smallValue)
    box3Helper.getCenter(center)
    this.measurement.value = { center, size }

    this.root.peek().requestRender?.()
  }
}

const colorHelper = new Color()

function applyAppearancePropertiesToGroup(properties: Properties, group: Object3D) {
  const color = properties.get('color')
  let c: Color | undefined
  if (Array.isArray(color)) {
    c = colorHelper.setRGB(...color)
  } else if (color != null) {
    c = colorHelper.set(color)
  }
  const opacity = properties.get('opacity')
  const depthTest = properties.get('depthTest')
  const depthWrite = properties.get('depthWrite')
  const renderOrder = properties.get('renderOrder')
  group.traverse((child) => {
    if (child instanceof InstancedGlyphMesh || child instanceof InstancedPanelMesh || !(child instanceof Mesh)) {
      return
    }

    child.renderOrder = renderOrder
    const material: MeshBasicMaterial = child.material
    child.userData.color ??= material.color.clone()
    material.color.copy(c ?? child.userData.color)
    material.opacity = opacity
    material.depthTest = depthTest
    material.depthWrite = depthWrite
  })
}
