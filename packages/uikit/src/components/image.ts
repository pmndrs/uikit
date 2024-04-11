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
import { Object3DRef, ParentContext, RootContext } from '../context.js'
import { FlexNode, FlexNodeState, Inset, YogaProperties, createFlexNodeState } from '../flex/index.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
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
  computedScrollHandlers,
  computedAnyAncestorScrollable,
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
import { Initializers, Subscriptions, readReactive, unsubscribeSubscriptions } from '../utils.js'
import { panelGeometry } from '../panel/utils.js'
import { setupImmediateProperties } from '../properties/immediate.js'
import { makeClippedRaycast, makePanelRaycast } from '../panel/interaction-panel-mesh.js'
import { computedIsClipped, computedClippingRect, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { computedProperty } from '../properties/batched.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import {
  AppearanceProperties,
  PanelGroupProperties,
  PanelMaterialConfig,
  createPanelMaterialConfig,
  darkPropertyTransformers,
} from '../internals.js'

export type ImageFit = 'cover' | 'fill'
const defaultImageFit: ImageFit = 'fill'

export type InheritableImageProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          ZIndexProperties &
          Omit<PanelProperties, 'backgroundColor' | 'backgroundOpacity'> &
          TransformProperties &
          AppearanceProperties &
          PanelGroupProperties &
          ScrollbarProperties &
          KeepAspectRatioProperties &
          ImageFitProperties
      >
    >
  >
>

export type ImageFitProperties = {
  fit?: ImageFit
}

export type KeepAspectRatioProperties = {
  keepAspectRatio?: boolean
}

export type ImageProperties = InheritableImageProperties & Listeners

export function createImage(
  parentContext: ParentContext,
  srcSignal: Signal<Signal<string | undefined> | string | Texture | Signal<Texture | undefined> | undefined>,
  style: Signal<ImageProperties | undefined>,
  properties: Signal<ImageProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
) {
  const initializers: Initializers = []
  const texture = signal<Texture | undefined>(undefined)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  setupCursorCleanup(hoveredSignal, initializers)

  const src = computed(() => readReactive(srcSignal.value))
  loadResourceWithParams(texture, loadTextureImpl, initializers, src)

  const textureAspectRatio = computed(() => {
    const tex = texture.value
    if (tex == null) {
      return undefined
    }
    const image = tex.source.data as { width: number; height: number }
    return image.width / image.height
  })

  const mergedProperties = computedMergedProperties(
    style,
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(parentContext.root.size),
      ...createHoverPropertyTransformers(hoveredSignal),
      ...createActivePropertyTransfomers(activeSignal),
    },
    keepAspectRatioPropertyTransformer,
    (m) => m.add('aspectRatio', textureAspectRatio),
  )

  const node = signal<FlexNode | undefined>(undefined)
  const flexState = createFlexNodeState()
  createNode(node, flexState, parentContext, mergedProperties, object, initializers)

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, initializers)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(
    parentContext.clippingRect,
    globalMatrix,
    flexState.size,
    parentContext.root.pixelSize,
  )
  const isHidden = computed(() => isClipped.value || texture.value == null)

  const orderInfo = computedOrderInfo(mergedProperties, ElementType.Image, undefined, parentContext.orderInfo)

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, parentContext.root.pixelSize, initializers)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentContext.root.pixelSize)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    flexState,
    globalMatrix,
    isClipped,
    parentContext.clippingRect,
    orderInfo,
    parentContext.root.panelGroupManager,
    initializers,
  )
  const scrollHandlers = computedScrollHandlers(
    scrollPosition,
    parentContext.anyAncestorScrollable,
    flexState,
    object,
    properties,
    parentContext.root.pixelSize,
    parentContext.root.onFrameSet,
    initializers,
  )

  setupLayoutListeners(style, properties, flexState.size, initializers)
  setupViewportListeners(style, properties, isClipped, initializers)

  return Object.assign(flexState, {
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentContext.anyAncestorScrollable),
    initializers,
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers),
    interactionPanel: createImageMesh(
      mergedProperties,
      texture,
      parentContext,
      flexState,
      orderInfo,
      parentContext.root,
      isHidden,
      initializers,
    ),
    clippingRect: computedClippingRect(
      globalMatrix,
      flexState,
      parentContext.root.pixelSize,
      parentContext.clippingRect,
    ),
    childrenMatrix,
    node,
    orderInfo,
    root: parentContext.root,
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
  parent: ParentContext,
  flexState: FlexNodeState,
  orderInfo: Signal<OrderInfo | undefined>,
  root: RootContext,
  isHidden: Signal<boolean>,
  initializers: Initializers,
) {
  const mesh = new Mesh<PlaneGeometry, MeshBasicMaterial>(panelGeometry)
  mesh.matrixAutoUpdate = false
  const clippingPlanes = createGlobalClippingPlanes(root, parent.clippingRect, initializers)
  const isVisible = getImageMaterialConfig().computedIsVisibile(
    propertiesSignal,
    flexState.borderInset,
    flexState.size,
    isHidden,
  )
  setupImageMaterials(
    propertiesSignal,
    mesh,
    flexState.size,
    flexState.borderInset,
    isVisible,
    clippingPlanes,
    root,
    initializers,
  )
  mesh.raycast = makeClippedRaycast(mesh, makePanelRaycast(mesh), root.object, parent.clippingRect, orderInfo)
  setupRenderOrder(mesh, root, orderInfo)

  setupTextureFit(propertiesSignal, texture, flexState.borderInset, flexState.size, initializers)

  initializers.push(() => effect(() => (mesh.visible = isVisible.value)))

  initializers.push(
    () =>
      effect(() => {
        const map = texture.value ?? null
        if (mesh.material.map === map) {
          return
        }
        mesh.material.map = map
        mesh.material.needsUpdate = true
      }),
    () =>
      effect(() => {
        if (flexState.size.value == null) {
          return
        }
        const [width, height] = flexState.size.value
        const pixelSize = parent.root.pixelSize.value
        mesh.scale.set(width * pixelSize, height * pixelSize, 1)
        mesh.updateMatrix()
      }),
  )
  return mesh
}

function setupTextureFit(
  propertiesSignal: Signal<MergedProperties>,
  textureSignal: Signal<Texture | undefined>,
  borderInset: Signal<Inset | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  initializers: Initializers,
): void {
  const fit = computedProperty(propertiesSignal, 'fit', defaultImageFit)
  initializers.push(() =>
    effect(() => {
      const texture = textureSignal.value
      if (texture == null || size.value == null || borderInset.value == null) {
        return
      }
      texture.matrix.identity()

      if (fit.value === 'fill' || texture == null) {
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

function transformInsideBorder(
  borderInset: Signal<Inset | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  texture: Texture,
): void {
  if (size.value == null || borderInset.value == null) {
    return
  }

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

function setupImageMaterials(
  propertiesSignal: Signal<MergedProperties>,
  target: Mesh,
  size: Signal<Vector2Tuple | undefined>,
  borderInset: Signal<Inset | undefined>,
  isVisible: Signal<boolean>,
  clippingPlanes: Array<Plane>,
  root: RootContext,
  initializers: Initializers,
) {
  const data = new Float32Array(16)
  const info = { data: data, type: 'normal' } as const
  target.customDepthMaterial = new PanelDepthMaterial(info)
  target.customDistanceMaterial = new PanelDistanceMaterial(info)
  target.customDepthMaterial.clippingPlanes = clippingPlanes
  target.customDistanceMaterial.clippingPlanes = clippingPlanes

  const panelMaterialClass = computedProperty(propertiesSignal, 'panelMaterialClass', MeshBasicMaterial)
  initializers.push((subscriptions) => {
    subscriptions.push(
      effect(() => {
        const material = createPanelMaterial(panelMaterialClass.value, info)
        material.clippingPlanes = clippingPlanes
        target.material = material
        return effect(() => (material.depthTest = root.depthTest.value))
      }),
      effect(() => (target.renderOrder = root.renderOrder.value)),
      effect(() => (target.castShadow = propertiesSignal.value.read('castShadow', false))),
      effect(() => (target.receiveShadow = propertiesSignal.value.read('receiveShadow', false))),
    )
    return subscriptions
  })

  const imageMaterialConfig = getImageMaterialConfig()
  const internalSubscriptions: Array<() => void> = []
  initializers.push(() =>
    effect(() => {
      if (!isVisible.value) {
        return
      }

      data.set(imageMaterialConfig.defaultData)

      internalSubscriptions.push(
        effect(() => size.value != null && data.set(size.value, 13)),
        effect(() => borderInset.value != null && data.set(borderInset.value, 0)),
      )
      return () => unsubscribeSubscriptions(internalSubscriptions)
    }),
  )
  const setters = imageMaterialConfig.setters
  initializers.push((subscriptions) => {
    setupImmediateProperties(
      propertiesSignal,
      isVisible,
      imageMaterialConfig.hasProperty,
      (key, value) => setters[key](data, 0, value as any, size, undefined),
      subscriptions,
    )
    return subscriptions
  })
}
