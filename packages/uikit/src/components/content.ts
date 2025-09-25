import { computed, Signal, signal } from '@preact/signals-core'
import { Box3, Color, Matrix4, Mesh, MeshBasicMaterial, Object3D, Plane, Quaternion, Vector3 } from 'three'
import { ElementType, OrderInfo, setupOrderInfo, setupRenderOrder } from '../order.js'
import { setupInstancedPanel } from '../panel/instanced-panel.js'
import { getDefaultPanelMaterialConfig, writeColor } from '../panel/panel-material.js'
import { Component } from './component.js'
import { computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { BaseOutProperties, InProperties, Properties, WithSignal } from '../properties/index.js'
import { abortableEffect, alignmentZMap, setupMatrixWorldUpdate } from '../utils.js'
import { createGlobalClippingPlanes } from '../clipping.js'
import { makeClippedCast } from '../panel/interaction-panel-mesh.js'
import { InstancedGlyphMesh, toAbsoluteNumber } from '../text/index.js'
import { InstancedPanelMesh } from '../panel/instanced-panel-mesh.js'
import { componentDefaults } from '../properties/defaults.js'
import { RenderContext } from '../context.js'

export const contentDefaults = {
  ...componentDefaults,
  depthAlign: 'back' as keyof typeof alignmentZMap,
  keepAspectRatio: true,
}

export type ContentOutProperties = typeof contentDefaults & BaseOutProperties

export type ContentProperties = InProperties<ContentOutProperties>

const IdentityQuaternion = new Quaternion()
const IdentityMatrix = new Matrix4()

const box3Helper = new Box3()
const smallValue = new Vector3().setScalar(0.000001)

const positionHelper = new Vector3()
const scaleHelper = new Vector3()
const vectorHelper = new Vector3()

export type BoundingBox = { size: Vector3; center: Vector3 }

const RemeasureOnChildrenChangeDefault = true
const DepthWriteDefaultDefault = true
const SupportFillPropertyDefault = false

export class Content<
  OutProperties extends ContentOutProperties = ContentOutProperties,
> extends Component<OutProperties> {
  readonly boundingBox: Signal<BoundingBox | undefined>
  readonly clippingPlanes: Array<Plane>

  private readonly childrenMatrix = new Matrix4()

  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    private readonly config?: {
      remeasureOnChildrenChange?: boolean
      depthWriteDefault?: boolean
      supportFillProperty?: boolean
      boundingBox?: Signal<BoundingBox | undefined>
      defaultOverrides?: InProperties<OutProperties>
      renderContext?: RenderContext
      defaults?: WithSignal<OutProperties>
    },
  ) {
    const defaultAspectRatio = signal<number | undefined>(undefined)
    super(inputProperties, initialClasses, {
      defaults: contentDefaults as OutProperties,
      hasNonUikitChildren: true,
      ...config,
      defaultOverrides: { aspectRatio: defaultAspectRatio, ...config?.defaultOverrides } as InProperties<OutProperties>,
    })
    this.boundingBox =
      config?.boundingBox ?? signal<BoundingBox>({ size: new Vector3(1, 1.01, 1), center: new Vector3(0, 0, 0) })

    abortableEffect(() => {
      if (!this.properties.value.keepAspectRatio || this.boundingBox.value == null) {
        defaultAspectRatio.value = undefined
        return
      }
      defaultAspectRatio.value = this.boundingBox.value.size.x / this.boundingBox.value.size.y
    }, this.abortSignal)
    this.material.visible = false

    const panelGroupDeps = computedPanelGroupDependencies(this.properties)
    const backgroundOrderInfo = signal<OrderInfo | undefined>()
    setupOrderInfo(
      backgroundOrderInfo,
      this.properties,
      'zIndex',
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

    abortableEffect(() => {
      if (
        this.size.value == null ||
        this.paddingInset.value == null ||
        this.borderInset.value == null ||
        this.boundingBox.value == null
      ) {
        this.childrenMatrix.copy(IdentityMatrix)
        return
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

      const pixelSize = this.properties.value.pixelSize
      scaleHelper
        .set(
          innerWidth * pixelSize,
          innerHeight * pixelSize,
          this.properties.value.keepAspectRatio
            ? (innerHeight * pixelSize * this.boundingBox.value.size.z) / this.boundingBox.value.size.y
            : this.boundingBox.value.size.z,
        )
        .divide(this.boundingBox.value.size)

      positionHelper.copy(this.boundingBox.value.center).negate()

      positionHelper.z -= alignmentZMap[this.properties.value.depthAlign] * this.boundingBox.value.size.z
      positionHelper.multiply(scaleHelper)
      positionHelper.add(
        vectorHelper.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0),
      )
      this.childrenMatrix.compose(positionHelper, IdentityQuaternion, scaleHelper)
    }, this.abortSignal)

    setupMatrixWorldUpdate(this, this.root, undefined, this.abortSignal)

    setupOrderInfo(
      this.orderInfo,
      this.properties,
      'zIndex',
      ElementType.Content,
      undefined,
      backgroundOrderInfo,
      this.abortSignal,
    )

    this.clippingPlanes = createGlobalClippingPlanes(this)

    abortableEffect(() => {
      this.visible = this.isVisible.value
      applyAppearancePropertiesToGroup(
        this.properties,
        this,
        this.config?.depthWriteDefault ?? DepthWriteDefaultDefault,
        this.config?.supportFillProperty ?? SupportFillPropertyDefault,
      )
      this.root.peek().requestRender?.()
    }, this.abortSignal)

    const remeasureOnChildrenChange = this.config?.remeasureOnChildrenChange ?? RemeasureOnChildrenChangeDefault
    if (remeasureOnChildrenChange) {
      const onChildrenChanged = this.debounceNotifyAncestorsChanged.bind(this)
      this.addEventListener('childadded', onChildrenChanged)
      this.addEventListener('childremoved', onChildrenChanged)
      this.abortSignal.addEventListener('abort', () => {
        this.removeEventListener('childadded', onChildrenChanged)
        this.removeEventListener('childremoved', onChildrenChanged)
      })
    }
  }

  private childUpdateWorldMatrix(child: Object3D, updateParents: boolean, updateChildren: boolean) {
    if (!(child.parent instanceof Content)) {
      Object3D.prototype.updateWorldMatrix.apply(child, [updateParents, updateChildren])
      return
    }
    if (updateParents) {
      this.updateWorldMatrix(true, false)
    }
    child.updateMatrix()
    child.matrixWorld
      .copy(child.matrix)
      .premultiply(this.childrenMatrix)
      .premultiply(this.globalMatrix.peek() ?? IdentityMatrix)
      .premultiply(this.root.peek().component.parent?.matrixWorld ?? IdentityMatrix)
    if (updateChildren) {
      for (const childChild of child.children) {
        childChild.updateMatrixWorld(true)
      }
    }
  }

  private timeoutRef?: number

  private debounceNotifyAncestorsChanged() {
    if (this.timeoutRef != null) {
      return
    }
    this.timeoutRef = setTimeout(this.notifyAncestorsChanged.bind(this), 0) as any
  }

  notifyAncestorsChanged() {
    this.timeoutRef = undefined
    applyAppearancePropertiesToGroup(
      this.properties,
      this,
      this.config?.depthWriteDefault ?? DepthWriteDefaultDefault,
      this.config?.supportFillProperty ?? SupportFillPropertyDefault,
    )
    this.traverse((descendant) => {
      if (
        descendant instanceof InstancedGlyphMesh ||
        descendant instanceof InstancedPanelMesh ||
        !(descendant instanceof Mesh)
      ) {
        return
      }
      setupRenderOrder(descendant, this.root, this.orderInfo)
      descendant.material.clippingPlanes = this.clippingPlanes
      descendant.material.needsUpdate = true
      descendant.material.transparent = true
      descendant.raycast = makeClippedCast(
        this,
        descendant.raycast.bind(descendant),
        this.root,
        this.parentContainer,
        this.orderInfo,
      )
      descendant.spherecast =
        descendant.spherecast != null
          ? makeClippedCast(
              this,
              descendant.spherecast?.bind(descendant),
              this.root,
              this.parentContainer,
              this.orderInfo,
            )
          : undefined
    })

    for (const child of this.children) {
      child.updateMatrixWorld = this.childUpdateWorldMatrix.bind(this, child, false, true)
      child.updateWorldMatrix = this.childUpdateWorldMatrix.bind(this, child)
    }

    if (this.config?.boundingBox == null) {
      //no need to compute the bounding box ourselves
      box3Helper.makeEmpty()
      for (const child of this.children) {
        if (child instanceof InstancedGlyphMesh || child instanceof InstancedPanelMesh) {
          continue
        }
        child.parent = null
        box3Helper.expandByObject(child)
        child.parent = this
      }

      const size = new Vector3()
      const center = new Vector3()
      box3Helper.getSize(size).max(smallValue)
      box3Helper.getCenter(center)
      this.boundingBox.value = { center, size }
    }

    this.root.peek().requestRender?.()
  }

  updateWorldMatrix(updateParents: boolean, updateChildren: boolean): void {
    super.updateWorldMatrix(updateParents, updateChildren)
    if (updateChildren) {
      for (const child of this.children) {
        child.updateWorldMatrix(false, true)
      }
    }
  }

  dispose(): void {
    if (this.timeoutRef != null) {
      this.timeoutRef = undefined
      clearInterval(this.timeoutRef)
    }
    super.dispose()
  }
}

const colorHelper = new Color()
const colorArrayHelper = [0, 0, 0, 0]

function applyAppearancePropertiesToGroup(
  properties: Properties,
  group: Object3D,
  depthWriteDefault: boolean,
  supportFillProperty: boolean,
) {
  const color = (supportFillProperty ? properties.value.fill : undefined) ?? properties.value.color
  const opacity = toAbsoluteNumber(properties.value.opacity, () => 1)
  if (color != null) {
    writeColor(colorArrayHelper, 0, color, opacity, undefined)
    colorHelper.fromArray(colorArrayHelper)
  }
  const depthTest = properties.value.depthTest
  const depthWrite = properties.value.depthWrite ?? depthWriteDefault
  const renderOrder = properties.value.renderOrder
  group.traverse((child) => {
    if (child instanceof InstancedGlyphMesh || child instanceof InstancedPanelMesh || !(child instanceof Mesh)) {
      return
    }

    child.renderOrder = renderOrder
    const material: MeshBasicMaterial = child.material
    child.userData.color ??= material.color.clone()
    material.color.copy(color != null ? colorHelper : child.userData.color)
    material.opacity = color != null ? colorArrayHelper[3]! : opacity
    material.depthTest = depthTest
    material.depthWrite = depthWrite
  })
}
