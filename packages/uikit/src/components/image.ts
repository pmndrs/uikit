import { Signal, computed, effect, signal } from '@preact/signals-core'
import {
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Plane,
  PlaneGeometry,
  Sphere,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  Vector2Tuple,
} from 'three'
import { EventHandlers, Listeners } from '../index.js'
import { ParentContext, RootContext } from '../context.js'
import { FlexNodeState, Inset, YogaProperties, createFlexNodeState } from '../flex/index.js'
import { ElementType, OrderInfo, ZIndexProperties, computedOrderInfo, setupRenderOrder } from '../order.js'
import {} from '../panel/instanced-panel.js'
import {
  PanelDepthMaterial,
  PanelDistanceMaterial,
  createPanelMaterial,
  createPanelMaterialConfig,
  PanelGroupProperties,
  panelGeometry,
  PanelProperties,
  PanelMaterialConfig,
  computedPanelGroupDependencies,
} from '../panel/index.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import {
  ScrollbarProperties,
  createScrollPosition,
  setupScrollbars,
  computedScrollHandlers,
  computedAnyAncestorScrollable,
  createScrollState,
  setupScroll,
  computedGlobalScrollMatrix,
} from '../scroll.js'
import { TransformProperties, setupObjectTransform, computedTransformMatrix } from '../transform.js'
import {
  UpdateMatrixWorldProperties,
  VisibilityProperties,
  WithConditionals,
  computeDefaultProperties,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  setupNode,
  keepAspectRatioPropertyTransformer,
  loadResourceWithParams,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
} from './utils.js'
import { MergedProperties } from '../properties/merged.js'
import { abortableEffect, readReactive } from '../utils.js'
import { setupImmediateProperties } from '../properties/immediate.js'
import {
  setupBoundingSphere,
  makeClippedCast,
  makePanelRaycast,
  makePanelSpherecast,
  PointerEventsProperties,
} from '../panel/interaction-panel-mesh.js'
import { computedClippingRect, computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { computedInheritableProperty } from '../properties/utils.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { AppearanceProperties } from './svg.js'
import { darkPropertyTransformers } from '../dark.js'
import { ThreeEventMap } from '../events.js'

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
          ImageFitProperties &
          VisibilityProperties &
          UpdateMatrixWorldProperties &
          PointerEventsProperties
      >
    >
  >
>

export type ImageFitProperties = {
  objectFit?: ImageFit
}

export type KeepAspectRatioProperties = {
  keepAspectRatio?: boolean
}

export type ImageProperties<EM extends ThreeEventMap = ThreeEventMap> = InheritableImageProperties &
  Listeners &
  WithReactive<{ src?: string | Texture }> &
  EventHandlers<EM>

export function createImageState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  objectRef: { current?: Object3D | null },
  style: Signal<ImageProperties<EM> | undefined>,
  properties: Signal<ImageProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
) {
  const flexState = createFlexNodeState()
  const texture = signal<Texture | undefined>(undefined)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])

  const src = computed(() => readReactive(style.value?.src) ?? readReactive(properties.value?.src))

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
      ...createResponsivePropertyTransformers(parentCtx.root.size),
      ...createHoverPropertyTransformers(hoveredSignal),
      ...createActivePropertyTransfomers(activeSignal),
    },
    keepAspectRatioPropertyTransformer,
    (m) => m.add('aspectRatio', textureAspectRatio),
  )

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentCtx.root.pixelSize)
  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentCtx.clippingRect, globalMatrix, flexState.size, parentCtx.root.pixelSize)
  const isHidden = computed(() => isClipped.value || texture.value == null)
  const isVisible = computedIsVisible(flexState, isHidden, mergedProperties)

  const orderInfo = computedOrderInfo(
    mergedProperties,
    'zIndexOffset',
    ElementType.Image,
    undefined,
    parentCtx.orderInfo,
  )

  const scrollPosition = createScrollPosition()
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, globalMatrix, parentCtx.root.pixelSize)
  const scrollbarWidth = computedInheritableProperty(mergedProperties, 'scrollbarWidth', 10)

  const componentState = Object.assign(flexState, {
    texture,
    hoveredSignal,
    activeSignal,
    src,
    mergedProperties,
    transformMatrix,
    globalMatrix,
    isClipped,
    isHidden,
    isVisible,
    orderInfo,
    groupDeps: computedPanelGroupDependencies(mergedProperties),
    scrollPosition,
    scrollbarWidth,
    childrenMatrix,
    scrollState: createScrollState(),
    defaultProperties: computeDefaultProperties(mergedProperties),
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx.anyAncestorScrollable),
    root: parentCtx.root,
  })

  const scrollHandlers = computedScrollHandlers(componentState, properties, objectRef)

  const handlers = computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  return Object.assign(componentState, {
    handlers,
    ancestorsHaveListeners,
    interactionPanel: createImageMesh(componentState, globalMatrix, parentCtx, orderInfo, parentCtx.root),
    clippingRect: computedClippingRect(globalMatrix, componentState, parentCtx.root.pixelSize, parentCtx.clippingRect),
  }) satisfies ParentContext
}

export function setupImage<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createImageState>,
  parentCtx: ParentContext,
  style: Signal<ImageProperties<EM> | undefined>,
  properties: Signal<ImageProperties<EM> | undefined>,
  object: Object3D,
  childrenContainer: Object3D,
  abortSignal: AbortSignal,
) {
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  loadResourceWithParams(state.texture, loadTextureImpl, cleanupTexture, abortSignal, state.src)

  setupNode(state, parentCtx, object, true, abortSignal)
  setupObjectTransform(parentCtx.root, object, state.transformMatrix, abortSignal)

  setupScroll(state, properties, parentCtx.root.pixelSize, childrenContainer, abortSignal)

  setupScrollbars(
    state.mergedProperties,
    state.scrollPosition,
    state,
    state.globalMatrix,
    state.isVisible,
    parentCtx.clippingRect,
    state.orderInfo,
    state.groupDeps,
    parentCtx.root.panelGroupManager,
    state.scrollbarWidth,
    abortSignal,
  )

  setupPointerEvents(
    state.mergedProperties,
    state.ancestorsHaveListeners,
    parentCtx.root,
    state.interactionPanel,
    false,
    abortSignal,
  )

  const updateMatrixWorld = computedInheritableProperty(state.mergedProperties, 'updateMatrixWorld', false)
  setupMatrixWorldUpdate(updateMatrixWorld, false, object, parentCtx.root, state.globalMatrix, false, abortSignal)
  setupMatrixWorldUpdate(true, false, state.interactionPanel, parentCtx.root, state.globalMatrix, true, abortSignal)

  setupLayoutListeners(style, properties, state.size, abortSignal)
  setupClippedListeners(style, properties, state.isClipped, abortSignal)

  setupImageMesh(
    state.interactionPanel,
    state.mergedProperties,
    state.texture,
    state.globalMatrix,
    parentCtx,
    state,
    state.root,
    state.isVisible,
    abortSignal,
  )
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
  flexState: FlexNodeState,
  globalMatrix: Signal<Matrix4 | undefined>,
  parentContext: ParentContext,
  orderInfo: Signal<OrderInfo | undefined>,
  root: RootContext,
) {
  const mesh = Object.assign(new Mesh<PlaneGeometry, MeshBasicMaterial>(panelGeometry), {
    boundingSphere: new Sphere(),
  })
  mesh.frustumCulled = false
  mesh.matrixAutoUpdate = false
  mesh.raycast = makeClippedCast(
    mesh,
    makePanelRaycast(mesh.raycast.bind(mesh), root.objectRef, mesh.boundingSphere, globalMatrix, mesh),
    root.objectRef,
    parentContext.clippingRect,
    orderInfo,
    flexState,
  )
  mesh.spherecast = makeClippedCast(
    mesh,
    makePanelSpherecast(root.objectRef, mesh.boundingSphere, globalMatrix, mesh),
    root.objectRef,
    parentContext.clippingRect,
    orderInfo,
    flexState,
  )

  setupRenderOrder(mesh, root, orderInfo)
  return mesh
}

function setupImageMesh(
  mesh: Mesh & { boundingSphere: Sphere },
  propertiesSignal: Signal<MergedProperties>,
  textureSignal: Signal<Texture | undefined>,
  globalMatrix: Signal<Matrix4 | undefined>,
  parentContext: ParentContext,
  flexState: FlexNodeState,
  root: RootContext,
  isVisible: Signal<boolean>,
  abortSignal: AbortSignal,
) {
  const clippingPlanes = createGlobalClippingPlanes(root, parentContext.clippingRect)
  const isMeshVisible = getImageMaterialConfig().computedIsVisibile(
    propertiesSignal,
    flexState.borderInset,
    flexState.size,
    isVisible,
  )
  setupImageMaterials(
    propertiesSignal,
    textureSignal,
    mesh,
    flexState.size,
    flexState.borderInset,
    isMeshVisible,
    clippingPlanes,
    root,
    abortSignal,
  )
  setupBoundingSphere(mesh.boundingSphere, parentContext.root.pixelSize, globalMatrix, flexState.size, abortSignal)

  const objectFit = computedInheritableProperty(propertiesSignal, 'objectFit', defaultImageFit)

  abortableEffect(() => {
    const texture = textureSignal.value
    if (texture == null || flexState.size.value == null || flexState.borderInset.value == null) {
      return
    }
    texture.matrix.identity()
    root.requestRender()

    if (objectFit.value === 'fill' || texture == null) {
      transformInsideBorder(flexState.borderInset, flexState.size, texture)
      return
    }

    const { width: textureWidth, height: textureHeight } = texture.source.data as { width: number; height: number }
    const textureRatio = textureWidth / textureHeight

    const [width, height] = flexState.size.value
    const [top, right, bottom, left] = flexState.borderInset.value
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
    transformInsideBorder(flexState.borderInset, flexState.size, texture)
  }, abortSignal)
  abortableEffect(() => {
    mesh.visible = isMeshVisible.value
    parentContext.root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    if (flexState.size.value == null) {
      return
    }
    const [width, height] = flexState.size.value
    const pixelSize = parentContext.root.pixelSize.value
    mesh.scale.set(width * pixelSize, height * pixelSize, 1)
    mesh.updateMatrix()
    parentContext.root.requestRender()
  }, abortSignal)
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

function cleanupTexture(texture: (Texture & { disposable?: boolean }) | undefined): void {
  if (texture?.disposable === true) {
    texture.dispose()
  }
}

async function loadTextureImpl(src?: string | Texture): Promise<(Texture & { disposable?: boolean }) | undefined> {
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
    return Object.assign(texture, { disposable: true })
  } catch (error) {
    console.error(error)
    return undefined
  }
}

function setupImageMaterials(
  propertiesSignal: Signal<MergedProperties>,
  textureSignal: Signal<Texture | undefined>,
  target: Mesh,
  size: Signal<Vector2Tuple | undefined>,
  borderInset: Signal<Inset | undefined>,
  isVisible: Signal<boolean>,
  clippingPlanes: Array<Plane>,
  root: RootContext,
  abortSignal: AbortSignal,
) {
  const data = new Float32Array(16)
  const info = { data: data, type: 'normal' } as const
  target.customDepthMaterial = new PanelDepthMaterial(info)
  target.customDistanceMaterial = new PanelDistanceMaterial(info)
  target.customDepthMaterial.clippingPlanes = clippingPlanes
  target.customDistanceMaterial.clippingPlanes = clippingPlanes

  abortableEffect(() => {
    const material = createPanelMaterial(propertiesSignal.value.read('panelMaterialClass', MeshBasicMaterial), info)
    material.clippingPlanes = clippingPlanes
    target.material = material
    const cleanupDepthTestEffect = effect(() => {
      material.depthTest = propertiesSignal.value.read('depthTest', true)
      root.requestRender()
    })
    const cleanupDepthWriteEffect = effect(() => {
      material.depthWrite = propertiesSignal.value.read('depthWrite', false)
      root.requestRender()
    })
    const cleanupTextureEffect = effect(() => {
      ;(material as any).map = textureSignal.value ?? null
      material.needsUpdate = true
      root.requestRender()
    })
    return () => {
      cleanupTextureEffect()
      cleanupDepthWriteEffect()
      cleanupDepthTestEffect()
      material.dispose()
    }
  }, abortSignal)
  abortableEffect(() => {
    target.renderOrder = propertiesSignal.value.read('renderOrder', 0)
    root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    target.castShadow = propertiesSignal.value.read('castShadow', false)
    root.requestRender()
  }, abortSignal)
  abortableEffect(() => {
    target.receiveShadow = propertiesSignal.value.read('receiveShadow', false)
    root.requestRender()
  }, abortSignal)

  const imageMaterialConfig = getImageMaterialConfig()
  abortableEffect(() => {
    if (!isVisible.value) {
      return
    }

    const innerAbortController = new AbortController()
    data.set(imageMaterialConfig.defaultData)

    abortableEffect(() => void (size.value != null && data.set(size.value, 13)), innerAbortController.signal)
    abortableEffect(
      () => void (borderInset.value != null && data.set(borderInset.value, 0)),
      innerAbortController.signal,
    )
    root.requestRender()
    return () => innerAbortController.abort()
  }, abortSignal)
  const setters = imageMaterialConfig.setters
  setupImmediateProperties(
    propertiesSignal,
    isVisible,
    imageMaterialConfig.hasProperty,
    (key, value) => {
      setters[key](data, 0, value as any, size, undefined)
      root.requestRender()
    },
    abortSignal,
  )
}
