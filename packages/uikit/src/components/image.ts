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
import { Listeners } from '../index.js'
import { Object3DRef, WithContext } from '../context.js'
import { Inset, YogaProperties } from '../flex/index.js'
import { ElementType, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { PanelDepthMaterial, PanelDistanceMaterial, createPanelMaterial } from '../panel/panel-material.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import {
  ScrollbarProperties,
  applyScrollPosition,
  computedGlobalScrollMatrix,
  createScrollPosition,
  createScrollbars,
  setupScrollHandler,
} from '../scroll.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import {
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedMergedProperties,
  createNode,
  keepAspectRatioPropertyTransformer,
  loadResourceWithParams,
} from './utils.js'
import { MergedProperties } from '../properties/merged.js'
import { Subscriptions, readReactive, unsubscribeSubscriptions } from '../utils.js'
import { panelGeometry } from '../panel/utils.js'
import { setupImmediateProperties } from '../properties/immediate.js'
import { makeClippedRaycast, makePanelRaycast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, computedClippingRect, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { createGetBatchedProperties } from '../properties/batched.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { EventHandlers } from '../events.js'
import {
  PanelGroupProperties,
  PanelMaterialConfig,
  createPanelMaterialConfig,
  darkPropertyTransformers,
} from '../internals.js'

export type ImageFit = 'cover' | 'fill'
const FIT_DEFAULT: ImageFit = 'fill'

export type InheritableImageProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          ZIndexProperties &
          Omit<PanelProperties, 'backgroundColor' | 'backgroundOpacity'> & {
            opacity?: number
            fit?: ImageFit
            keepAspectRatio?: boolean
          } & TransformProperties &
          PanelGroupProperties &
          ScrollbarProperties
      >
    >
  >
>

export type ImageProperties = InheritableImageProperties & Listeners & EventHandlers

export function createImage(
  parentContext: WithContext,
  srcSignal: Signal<Signal<string> | string | Texture | Signal<Texture>>,
  properties: Signal<ImageProperties>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
) {
  const subscriptions: Subscriptions = []
  const texture = signal<Texture | undefined>(undefined)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  setupCursorCleanup(hoveredSignal, subscriptions)

  const src = computed(() => readReactive(srcSignal.value))
  loadResourceWithParams(texture, loadTextureImpl, subscriptions, src)

  const textureAspectRatio = computed(() => {
    const tex = texture.value
    if (tex == null) {
      return undefined
    }
    const image = tex.source.data as { width: number; height: number }
    return image.width / image.height
  })

  const mergedProperties = computedMergedProperties(
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(parentContext.root.node.size),
      ...createHoverPropertyTransformers(hoveredSignal),
      ...createActivePropertyTransfomers(activeSignal),
    },
    keepAspectRatioPropertyTransformer,
    (m) => m.add('aspectRatio', textureAspectRatio),
  )

  const node = createNode(parentContext, mergedProperties, object, subscriptions)

  const transformMatrix = computedTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)
  const isHidden = computed(() => isClipped.value || texture.value == null)

  const orderInfo = computedOrderInfo(mergedProperties, ElementType.Image, undefined, parentContext.orderInfo)

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentContext.root.pixelSize)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentContext.root.pixelSize)
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
  const scrollHandlers = setupScrollHandler(
    node,
    scrollPosition,
    object,
    properties,
    parentContext.root.pixelSize,
    parentContext.root.onFrameSet,
    subscriptions,
  )

  setupLayoutListeners(properties, node.size, subscriptions)
  setupViewportListeners(properties, isClipped, subscriptions)

  const ctx: WithContext = {
    clippingRect: computedClippingRect(
      globalMatrix,
      node.size,
      node.borderInset,
      node.overflow,
      parentContext.root.pixelSize,
      parentContext.clippingRect,
    ),
    childrenMatrix,
    node,
    object,
    orderInfo,
    root: parentContext.root,
  }
  return Object.assign(ctx, {
    subscriptions,
    handlers: computedHandlers(properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers),
    interactionPanel: createImageMesh(mergedProperties, texture, parentContext, ctx, isHidden, subscriptions),
  })
}

let imageMaterialConfig: PanelMaterialConfig | undefined
function getImageMaterialConfig() {
  imageMaterialConfig ??= createPanelMaterialConfig(
    {
      borderBend: 'borderBend',
      borderBottomLeftRadius: 'borderBottomLeftRadius',
      borderBottomRightRadius: 'borderBottomRightRadius',
      borderColor: 'borderColor',
      borderOpacity: 'borderOpacity',
      borderTopLeftRadius: 'borderTopLeftRadius',
      borderTopRightRadius: 'borderTopRightRadius',
      backgroundOpacity: 'opacity',
    },
    {
      backgroundColor: 0xffffff,
    },
  )
  return imageMaterialConfig
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
  const clippingPlanes = createGlobalClippingPlanes(root, clippingRect, subscriptions)
  const isVisible = getImageMaterialConfig().computedIsVisibile(propertiesSignal, node.borderInset, node.size, isHidden)
  setupImageMaterials(propertiesSignal, mesh, node.size, node.borderInset, isVisible, clippingPlanes, subscriptions)
  mesh.raycast = makeClippedRaycast(mesh, makePanelRaycast(mesh), root.object, parent.clippingRect, orderInfo)
  setupRenderOrder(mesh, root, orderInfo)

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

const panelMaterialClassKey = ['panelMaterialClass'] as const

function setupImageMaterials(
  propertiesSignal: Signal<MergedProperties>,
  target: Mesh,
  size: Signal<Vector2Tuple>,
  borderInset: Signal<Inset>,
  isVisible: Signal<boolean>,
  clippingPlanes: Array<Plane>,
  subscriptions: Subscriptions,
) {
  const data = new Float32Array(16)
  const info = { data: data, type: 'normal' } as const
  target.customDepthMaterial = new PanelDepthMaterial(info)
  target.customDistanceMaterial = new PanelDistanceMaterial(info)
  target.customDepthMaterial.clippingPlanes = clippingPlanes
  target.customDistanceMaterial.clippingPlanes = clippingPlanes

  const get = createGetBatchedProperties<PanelGroupProperties>(propertiesSignal, panelMaterialClassKey)
  subscriptions.push(
    effect(() => {
      target.material = createPanelMaterial(get('panelMaterialClass') ?? MeshBasicMaterial, info)
      target.material.clippingPlanes = clippingPlanes
    }),
    effect(() => (target.castShadow = get('castShadow') ?? false)),
    effect(() => (target.receiveShadow = get('receiveShadow') ?? false)),
  )

  const imageMaterialConfig = getImageMaterialConfig()
  const internalSubscriptions: Array<() => void> = []
  subscriptions.push(
    effect(() => {
      if (!isVisible.value) {
        return
      }

      data.set(imageMaterialConfig.defaultData)

      internalSubscriptions.push(
        effect(() => data.set(size.value, 13)),
        effect(() => data.set(borderInset.value, 0)),
      )
      return () => unsubscribeSubscriptions(internalSubscriptions)
    }),
  )
  const setters = imageMaterialConfig.setters
  setupImmediateProperties(
    propertiesSignal,
    isVisible,
    imageMaterialConfig.hasProperty,
    (key, value) => setters[key](data, 0, value as any, size, undefined),
    subscriptions,
  )
}
