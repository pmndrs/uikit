import { Signal, computed, effect, signal } from '@preact/signals-core'
import {
  Mesh,
  MeshBasicMaterial,
  Plane,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2Tuple,
} from 'three'
import { Listeners } from '..'
import { Object3DRef, WithContext } from '../context'
import { Inset, YogaProperties } from '../flex'
import { ElementType, ZIndexOffset, computeOrderInfo, setupRenderOrder } from '../order'
import { PanelProperties } from '../panel/instanced-panel'
import { ShadowProperties } from '../panel/instanced-panel-group'
import {
  MaterialClass,
  PanelDepthMaterial,
  PanelDistanceMaterial,
  applyPropsToMaterialData,
  createPanelMaterial,
  panelMaterialDefaultData,
  setupPanelMaterials,
} from '../panel/panel-material'
import { WithAllAliases } from '../properties/alias'
import { AllOptionalProperties, Properties, WithClasses, WithReactive } from '../properties/default'
import {
  ScrollbarProperties,
  applyScrollPosition,
  computeGlobalScrollMatrix,
  createScrollPosition,
  createScrollbars,
  setupScrollHandler,
} from '../scroll'
import { TransformProperties, applyTransform, computeTransformMatrix } from '../transform'
import { WithConditionals, computeGlobalMatrix, loadResourceWithParams } from './utils'
import { MergedProperties, PropertyTransformers } from '../properties/merged'
import { Subscriptions, readReactive, unsubscribeSubscriptions } from '../utils'
import { computeIsPanelVisible, panelGeometry } from '../panel/utils'
import { setupImmediateProperties } from '../properties/immediate'
import { makeClippedRaycast, makePanelRaycast } from '../panel/interaction-panel-mesh'
import {
  computeIsClipped,
  computeClippingRect,
  createGlobalClippingPlanes,
  updateGlobalClippingPlanes,
} from '../clipping'
import { setupLayoutListeners, setupViewportListeners } from '../listeners'
import { createGetBatchedProperties } from '../properties/batched'
import { addActiveHandlers, createActivePropertyTransfomers } from '../active'
import { addHoverHandlers, createHoverPropertyTransformers, setupCursorCleanup } from '../hover'
import { cloneHandlers } from '../panel/instanced-panel-mesh'
import { preferredColorSchemePropertyTransformers } from '../dark'
import { createResponsivePropertyTransformers } from '../responsive'
import { EventHandlers } from '../events'

export type ImageFit = 'cover' | 'fill'
const FIT_DEFAULT: ImageFit = 'fill'

export type InheritableImageProperties = WithConditionals<
  WithClasses<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          Omit<PanelProperties, 'backgroundColor' | 'backgroundOpacity'> & {
            opacity?: number
            fit?: ImageFit
            panelMaterialClass?: MaterialClass
            zIndexOffset?: ZIndexOffset
            keepAspectRatio?: boolean
          } & TransformProperties &
          ShadowProperties
      > &
        ScrollbarProperties
    >
  >
>

export type ImageProperties = InheritableImageProperties & Listeners & EventHandlers & { src: Signal<string> | string }

const shadowProperties = ['castShadow', 'receiveShadow']

export function createImage(
  parentContext: WithContext,
  properties: ImageProperties,
  defaultProperties: AllOptionalProperties | undefined,
  object: Object3DRef,
  childrenContainer: Object3DRef,
) {
  const subscriptions: Subscriptions = []
  const texture = signal<Texture | undefined>(undefined)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  setupCursorCleanup(hoveredSignal, subscriptions)
  const scrollHandlers = signal<EventHandlers>({})
  const propertiesSignal = signal(properties)
  const defaultPropertiesSignal = signal(defaultProperties)

  const src = computed(() => readReactive(propertiesSignal.value.src))
  loadResourceWithParams(texture, loadTextureImpl, subscriptions, src)

  const textureAspectRatio = computed(() => {
    const tex = texture.value
    if (tex == null) {
      return undefined
    }
    const image = tex.source.data as { width: number; height: number }
    return image.width / image.height
  })

  const propertyTransformers: PropertyTransformers = {
    keepAspectRatio: (value, target) => {
      if (value !== false) {
        return
      }
      target.remove('aspectRatio')
    },
    ...preferredColorSchemePropertyTransformers,
    ...createResponsivePropertyTransformers(parentContext.root.node.size),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  }

  const mergedProperties = computed(() => {
    const merged = new MergedProperties(propertyTransformers)
    merged.add('backgroundColor', 0xffffff)
    merged.add('aspectRatio', textureAspectRatio)
    merged.addAll(defaultPropertiesSignal.value, propertiesSignal.value)
    return merged
  })

  const node = parentContext.node.createChild(mergedProperties, object, subscriptions)
  parentContext.node.addChild(node)

  const transformMatrix = computeTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computeGlobalMatrix(parentContext.matrix, transformMatrix)

  const isClipped = computeIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)
  const isHidden = computed(() => isClipped.value || texture.value == null)

  const orderInfo = computeOrderInfo(mergedProperties, ElementType.Image, undefined, parentContext.orderInfo)

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentContext.root.pixelSize)
  const matrix = computeGlobalScrollMatrix(scrollPosition, globalMatrix, parentContext.root.pixelSize)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    parentContext.clippingRect,
    orderInfo,
    parentContext.root.panelGroupManager,
    subscriptions,
  )

  const clippingRect = computeClippingRect(
    globalMatrix,
    node.size,
    node.borderInset,
    node.overflow,
    parentContext.root.pixelSize,
    parentContext.clippingRect,
  )

  setupLayoutListeners(propertiesSignal, node.size, subscriptions)
  setupViewportListeners(propertiesSignal, isClipped, subscriptions)

  const onScrollFrame = setupScrollHandler(
    node,
    scrollPosition,
    object,
    propertiesSignal,
    parentContext.root.pixelSize,
    scrollHandlers,
    subscriptions,
  )
  parentContext.root.onFrameSet.add(onScrollFrame)

  subscriptions.push(() => {
    parentContext.root.onFrameSet.delete(onScrollFrame)
    parentContext.node.removeChild(node)
    node.destroy()
  })

  const ctx: WithContext = {
    clippingRect,
    matrix,
    node,
    object,
    orderInfo,
    root: parentContext.root,
  }
  return Object.assign(ctx, {
    subscriptions,
    scrollHandlers,
    propertiesSignal,
    defaultPropertiesSignal,
    handlers: computed(() => {
      const handlers = cloneHandlers(properties)
      addHoverHandlers(handlers, properties, defaultProperties, hoveredSignal)
      addActiveHandlers(handlers, properties, defaultProperties, activeSignal)
      return handlers
    }),
    interactionPanel: createImageMesh(mergedProperties, texture, parentContext, ctx, isHidden, subscriptions),
  })
}

export function destroyImage(internals: ReturnType<typeof createImage>) {
  unsubscribeSubscriptions(internals.subscriptions)
}

function createImageMesh(
  propertiesSignal: Signal<MergedProperties>,
  texture: Signal<Texture | undefined>,
  parent: WithContext,
  { node, orderInfo, root, clippingRect }: WithContext,
  isHidden: Signal<boolean>,
  subscriptions: Subscriptions,
) {
  const mesh = new Mesh<PlaneGeometry, MeshBasicMaterial>(panelGeometry)
  mesh.matrixAutoUpdate = false
  const clippingPlanes = createGlobalClippingPlanes()
  const updateClippingPlanes = () => updateGlobalClippingPlanes(clippingRect, root.object, clippingPlanes)
  root.onFrameSet.add(updateClippingPlanes)
  subscriptions.push(() => root.onFrameSet.delete(updateClippingPlanes))
  setupPanelMaterials(propertiesSignal, mesh, node.size, node.borderInset, isHidden, clippingPlanes, subscriptions)
  const isVisible = computeIsPanelVisible(propertiesSignal, node.borderInset, node.size, isHidden, 0xffffff)
  setupImmediateProperties(
    propertiesSignal,
    isVisible,
    (key) => shadowProperties.includes(key),
    (key, value) => (mesh[key as 'castShadow' | 'receiveShadow'] = (value as boolean | undefined) ?? false),
    subscriptions,
  )
  mesh.raycast = makeClippedRaycast(mesh, makePanelRaycast(mesh), root.object, parent.clippingRect, orderInfo)
  subscriptions.push(effect(() => setupRenderOrder(mesh, root, orderInfo.value)))

  setupTextureFit(propertiesSignal, texture, node.borderInset, node.size, subscriptions)

  subscriptions.push(() => effect(() => (mesh.visible = isVisible.value)))

  subscriptions.push(
    effect(() => {
      const map = texture.value ?? null
      if (mesh.material.map === map) {
        return
      }
      mesh.material.map = map
      mesh.material.needsUpdate = true
    }),
  )

  subscriptions.push(
    effect(() => {
      const [width, height] = node.size.value
      const pixelSize = parent.root.pixelSize
      mesh.scale.set(width * pixelSize, height * pixelSize, 1)
      mesh.updateMatrix()
    }),
  )
  return mesh
}

const propertyKeys = ['fit']

function setupTextureFit(
  propertiesSignal: Signal<MergedProperties>,
  textureSignal: Signal<Texture | undefined>,
  borderInset: Signal<Inset>,
  size: Signal<Vector2Tuple>,
  subscriptions: Subscriptions,
): void {
  const get = createGetBatchedProperties(propertiesSignal, propertyKeys)
  subscriptions.push(
    effect(() => {
      const texture = textureSignal.value
      if (texture == null) {
        return
      }
      const fit = (get('fit') as ImageFit | undefined) ?? FIT_DEFAULT
      texture.matrix.identity()

      if (fit === 'fill' || texture == null) {
        transformInsideBorder(borderInset, size, texture)
        return
      }

      const { width: textureWidth, height: textureHeight } = texture.source.data as { width: number; height: number }
      const textureRatio = textureWidth / textureHeight

      const [width, height] = size.value
      const [top, right, bottom, left] = borderInset.value
      const boundsRatioValue = (width - left - right) / (height - top - bottom)

      if (textureRatio > boundsRatioValue) {
        texture.matrix
          .translate(-(0.5 * (boundsRatioValue - textureRatio)) / boundsRatioValue, 0)
          .scale(boundsRatioValue / textureRatio, 1)
      } else {
        texture.matrix
          .translate(0, -(0.5 * (textureRatio - boundsRatioValue)) / textureRatio)
          .scale(1, textureRatio / boundsRatioValue)
      }
      transformInsideBorder(borderInset, size, texture)
    }),
  )
}

function transformInsideBorder(borderInset: Signal<Inset>, size: Signal<Vector2Tuple>, texture: Texture): void {
  const [outerWidth, outerHeight] = size.value
  const [top, right, bottom, left] = borderInset.value

  const width = outerWidth - left - right
  const height = outerHeight - top - bottom

  texture.matrix
    .translate(-1 + (left + width) / outerWidth, -1 + (top + height) / outerHeight)
    .scale(outerWidth / width, outerHeight / height)
}

const textureLoader = new TextureLoader()

async function loadTextureImpl(src?: string | Texture) {
  if (src == null) {
    return Promise.resolve(undefined)
  }
  if (src instanceof Texture) {
    return Promise.resolve(src)
  }
  try {
    const texture = await textureLoader.loadAsync(src)
    texture.colorSpace = SRGBColorSpace
    texture.matrixAutoUpdate = false
    return texture
  } catch (error) {
    console.error(error)
    return undefined
  }
}

const panelMaterialClassKey = ['panelMaterialClass']

//TODO: rename setter: opacity => backgroundOpacity and remove backgroundColor
//TODO: allow providing own default material data

const imageMaterialDefaultData = [...panelMaterialDefaultData]
imageMaterialDefaultData[4] = 1
imageMaterialDefaultData[5] = 1
imageMaterialDefaultData[6] = 1

export function setupPanelMaterials(
  propertiesSignal: Signal<MergedProperties>,
  target: Mesh,
  size: Signal<Vector2Tuple>,
  borderInset: Signal<Inset>,
  isClipped: Signal<boolean>,
  clippingPlanes: Array<Plane>,
  subscriptions: Subscriptions,
  renameOutput?: Record<string, string>,
) {
  const data = new Float32Array(16)
  const info = { data: data, type: 'normal' } as const
  target.customDepthMaterial = new PanelDepthMaterial(info)
  target.customDistanceMaterial = new PanelDistanceMaterial(info)
  target.customDepthMaterial.clippingPlanes = clippingPlanes
  target.customDistanceMaterial.clippingPlanes = clippingPlanes

  const get = createGetBatchedProperties(propertiesSignal, panelMaterialClassKey)
  subscriptions.push(
    effect(() => {
      const materialClass = get('panelMaterialClass') as MaterialClass | undefined
      target.material = createPanelMaterial(materialClass ?? MeshBasicMaterial, info)
      target.material.clippingPlanes = clippingPlanes
    }),
  )
  applyPropsToMaterialData(propertiesSignal, data, size, borderInset, isClipped, [], subscriptions, renameOutput)
}
