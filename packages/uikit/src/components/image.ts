import { Signal, computed, effect } from '@preact/signals-core'
import { Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, Texture, TextureLoader, Vector2Tuple } from 'three'
import { Listeners } from '..'
import { Object3DRef, WithContext } from '../context'
import { Inset, YogaProperties } from '../flex'
import { ElementType, ZIndexOffset, computeOrderInfo, setupRenderOrder } from '../order'
import { PanelProperties } from '../panel/instanced-panel'
import { ShadowProperties } from '../panel/instanced-panel-group'
import { MaterialClass, setupPanelMaterials } from '../panel/panel-material'
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
import { Subscriptions, unsubscribeSubscriptions } from '../utils'
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
import { addHoverHandlers, createHoverPropertyTransformers } from '../hover'
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
  propertiesSignal: Signal<MergedProperties>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
  parent: WithContext,
  scrollHandlers: Signal<EventHandlers | undefined>,
  listeners: Listeners,
  subscriptions: Subscriptions,
): WithContext {
  const node = parent.node.createChild(propertiesSignal, object, subscriptions)
  parent.node.addChild(node)

  const transformMatrix = computeTransformMatrix(propertiesSignal, node, parent.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computeGlobalMatrix(parent.matrix, transformMatrix)

  const isClipped = computeIsClipped(parent.clippingRect, globalMatrix, node.size, parent.root.pixelSize)

  const orderInfo = computeOrderInfo(propertiesSignal, ElementType.Image, undefined, parent.orderInfo)

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parent.root.pixelSize)
  const matrix = computeGlobalScrollMatrix(scrollPosition, globalMatrix, parent.root.pixelSize)
  createScrollbars(
    propertiesSignal,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    parent.clippingRect,
    orderInfo,
    parent.root.panelGroupManager,
    subscriptions,
  )

  const clippingRect = computeClippingRect(
    globalMatrix,
    node.size,
    node.borderInset,
    node.overflow,
    parent.root.pixelSize,
    parent.clippingRect,
  )

  setupLayoutListeners(listeners, node.size, subscriptions)
  setupViewportListeners(listeners, isClipped, subscriptions)

  const onScrollFrame = setupScrollHandler(
    node,
    scrollPosition,
    object,
    listeners,
    parent.root.pixelSize,
    scrollHandlers,
    subscriptions,
  )
  parent.root.onFrameSet.add(onScrollFrame)

  subscriptions.push(() => {
    parent.root.onFrameSet.delete(onScrollFrame)
    parent.node.removeChild(node)
    node.destroy()
  })

  return {
    isClipped,
    clippingRect,
    matrix,
    node,
    object,
    orderInfo,
    root: parent.root,
  }
}

export function computeTextureAspectRatio(texture: Signal<Texture | undefined>) {
  return computed(() => {
    const tex = texture.value
    if (tex == null) {
      return undefined
    }
    const image = tex.source.data as { width: number; height: number }
    return image.width / image.height
  })
}

export function createImagePropertyTransformers(
  rootSize: Signal<Vector2Tuple>,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
): PropertyTransformers {
  return {
    keepAspectRatio: (value, target) => {
      if (value !== false) {
        return
      }
      target.remove('aspectRatio')
    },
    ...preferredColorSchemePropertyTransformers,
    ...createResponsivePropertyTransformers(rootSize),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  }
}

export function updateImageProperties(
  propertiesSignal: Signal<MergedProperties>,
  textureAspectRatio: Signal<number | undefined>,
  properties: Properties,
  defaultProperties: AllOptionalProperties | undefined,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  transformers: PropertyTransformers,
  subscriptions: Subscriptions,
) {
  //build merged properties
  const merged = new MergedProperties(transformers)
  merged.add('backgroundColor', 0xffffff)
  merged.add('aspectRatio', textureAspectRatio)
  merged.addAll(defaultProperties, properties)
  propertiesSignal.value = merged

  //build handlers
  const handlers = cloneHandlers(properties)
  addHoverHandlers(handlers, properties, defaultProperties, hoveredSignal, subscriptions)
  addActiveHandlers(handlers, properties, defaultProperties, activeSignal)
  return handlers
}

export function createImageMesh(
  propertiesSignal: Signal<MergedProperties>,
  texture: Signal<Texture | undefined>,
  parent: WithContext,
  { node, orderInfo, root, clippingRect, isClipped }: WithContext,
  subscriptions: Subscriptions,
) {
  const mesh = new Mesh<PlaneGeometry, MeshBasicMaterial>(panelGeometry)
  mesh.matrixAutoUpdate = false
  const clippingPlanes = createGlobalClippingPlanes()
  const updateClippingPlanes = () => updateGlobalClippingPlanes(clippingRect, root.object, clippingPlanes)
  root.onFrameSet.add(updateClippingPlanes)
  subscriptions.push(() => root.onFrameSet.delete(updateClippingPlanes))
  setupPanelMaterials(propertiesSignal, mesh, node.size, node.borderInset, isClipped, clippingPlanes, subscriptions)
  const isVisible = computeIsPanelVisible(propertiesSignal, node.borderInset, node.size, isClipped)
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

export function loadImageTexture(
  target: Signal<Texture | undefined>,
  src: Signal<string> | string,
  subscriptions: Subscriptions,
): void {
  loadResourceWithParams(target, loadTextureImpl, subscriptions, src)
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
