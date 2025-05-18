import { computed, Signal, signal } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { Box3, Material, Matrix4, Mesh, Object3D, Plane, Quaternion, Vector3 } from 'three'
import { RenderContext } from '../components/root.js'
import { ElementType, OrderInfo, setupOrderInfo, setupRenderOrder } from '../order.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { getDefaultPanelMaterialConfig } from '../panel/panel-material.js'
import { Component } from './component.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { AllProperties } from '../properties/index.js'
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
  depthWrite?: boolean
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

export class Content<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Component<
  T,
  EM,
  AdditionalContentProperties,
  AdditionalContentDefaults
> {
  readonly measurement = signal({ size: new Vector3(1, 1, 1), center: new Vector3(0, 0, 0) })
  readonly clippingPlanes: Array<Plane>

  constructor(
    inputProperties?: ContentProperties<EM>,
    initialClasses?: Array<ContentProperties<EM> | string>,
    renderContext?: RenderContext,
  ) {
    const defaultAspectRatio = signal<number | undefined>(undefined)
    super(
      true,
      {
        ...additionalContentDefaults,
        depthWrite: undefined,
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
    const backgroundOrderInfo = signal()
    setupOrderInfo(
      backgroundOrderInfo,
      this.properties,
      'zIndexOffset',
      ElementType.Panel,
      panelGroupDeps,
      computed(() => (this.parentContainer.value == null ? null : this.parentContainer.value.orderInfo.value)),
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

    setupInstancedPanel(
      this.properties,
      this.root,
      this.orderInfo,
      panelGroupDeps,
      this.globalPanelMatrix,
      this.size,
      this.borderInset,
      computed(() => this.parentContainer.value?.clippingRect.value),
      this.isVisible,
      getDefaultPanelMaterialConfig(),
      this.abortSignal,
    )

    this.clippingPlanes = createGlobalClippingPlanes(this)

    abortableEffect(() => {
      updateRenderProperties(
        this,
        this.isVisible.value,
        this.properties.get('renderOrder'),
        this.properties.get('depthTest'),
        this.properties.get('depthWrite'),
      )
      this.root.peek().requestRender?.()
    }, this.abortSignal)

    const onChildrenChanged = this.notifyAncestorsChanged.bind(this)
    this.addEventListener('childadded', onChildrenChanged)
    this.addEventListener('childremoved', onChildrenChanged)
    this.abortSignal.addEventListener('abort', () => {
      this.removeEventListener('childadded', onChildrenChanged)
      this.removeEventListener('childremoved', onChildrenChanged)
    })
  }

  notifyAncestorsChanged() {
    updateRenderProperties(
      this,
      this.isVisible.peek(),
      this.properties.peek('renderOrder'),
      this.properties.peek('depthTest'),
      this.properties.peek('depthWrite'),
    )
    this.traverse((child) => {
      if (child instanceof Mesh) {
        setupRenderOrder(child, this.root, this.orderInfo)
        child.material.clippingPlanes = this.clippingPlanes
        child.material.needsUpdate = true
        child.raycast = makeClippedCast(this, child.raycast, this.root, this.parentContainer, this.orderInfo)
        child.spherecast =
          child.spherecast != null
            ? makeClippedCast(this, child.spherecast, this.root, this.parentContainer, this.orderInfo)
            : undefined
      }
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

function updateRenderProperties(
  object: Object3D,
  visible: boolean,
  renderOrder: number,
  depthTest: boolean,
  depthWrite: boolean | undefined,
) {
  object.visible = visible
  object.traverse((child) => {
    if (child instanceof InstancedGlyphMesh || child instanceof InstancedPanelMesh) {
      return
    }
    if (!(child instanceof Mesh)) {
      return
    }
    child.renderOrder = renderOrder
    if (!(child.material instanceof Material)) {
      return
    }
    child.material.depthTest = depthTest
    child.material.depthWrite = depthWrite ?? true
    child.material.transparent = true
  })
}
