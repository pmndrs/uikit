import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Matrix4, Mesh, Plane, Sphere, SRGBColorSpace, Texture, TextureLoader, Vector2Tuple } from 'three'
import { ElementType, setupRenderOrder } from '../order.js'
import {
  PanelDepthMaterial,
  PanelDistanceMaterial,
  createPanelMaterial,
  createPanelMaterialConfig,
  PanelMaterialConfig,
  computedPanelGroupDependencies,
} from '../panel/index.js'
import {
  setupScrollbars,
  computedScrollHandlers,
  computedAnyAncestorScrollable,
  setupScroll,
  computedGlobalScrollMatrix,
} from '../scroll.js'
import { computedTransformMatrix } from '../transform.js'
import {
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  loadResourceWithParams,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
  buildRaycasting,
} from './utils.js'
import { abortableEffect } from '../utils.js'
import { setupBoundingSphere } from '../panel/interaction-panel-mesh.js'
import { computedClippingRect, computedIsClipped, createGlobalClippingPlanes } from '../clipping.js'
import { ThreeEventMap } from '../events.js'
import { AllProperties, Properties } from '../properties/index.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { setupCursorCleanup } from '../hover.js'
import { computedFontFamilies } from '../text/font.js'
import { buildRootMatrix, buildRootContext, RenderContext, RootContext } from './index.js'


export function createImageState<EM extends ThreeEventMap = ThreeEventMap>(
  object: Component,
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = buildRootContext(parentCtx, object, flexState.size, renderContext)
  const texture = signal<Texture | undefined>(undefined)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])

  const properties: Properties<EM, AdditionalImageProperties, Partial<AdditionalImageDefaults>> = new Properties<
    EM,
    AdditionalImageProperties,
    Partial<AdditionalImageDefaults>
  >(allAliases, createConditionals(rootContext.root.size, hoveredSignal, activeSignal), parentCtx?.properties, {
    aspectRatio: computed(() => {
      if (!properties.get('keepAspectRatio')) {
        return undefined
      }
      const tex = texture.value
      if (tex == null) {
        return undefined
      }
      const image = tex.source.data as { width: number; height: number }
      return image.width / image.height
    }),
    ...additionalImageDefaults,
  })

  const transformMatrix = computedTransformMatrix(properties, flexState)
  const globalMatrix = computedGlobalMatrix(
    parentCtx?.childrenMatrix ?? buildRootMatrix(properties, rootContext.root.size),
    transformMatrix,
  )

  const isClipped = computedIsClipped(
    parentCtx?.clippingRect,
    globalMatrix,
    flexState.size,
    properties.getSignal('pixelSize'),
  )
  const isHidden = computed(() => isClipped.value || texture.value == null)
  const isVisible = computedIsVisible(flexState, isHidden, properties)

  const orderInfo = computedOrderInfo(properties, 'zIndexOffset', ElementType.Image, undefined, parentCtx?.orderInfo)

  object.frustumCulled = false
  setupRenderOrder(object, rootContext.root, orderInfo)

  const scrollPosition = createScrollPosition()
  const childrenMatrix = computedGlobalScrollMatrix(properties, scrollPosition, globalMatrix)

  buildRaycasting(object, rootContext.root, globalMatrix, parentCtx?.clippingRect, orderInfo, flexState)

  const componentState = Object.assign(flexState, rootContext, {
    texture,
    hoveredSignal,
    activeSignal,
    properties,
    transformMatrix,
    globalMatrix,
    isClipped,
    isHidden,
    isVisible,
    orderInfo,
    groupDeps: computedPanelGroupDependencies(properties),
    scrollPosition,
    childrenMatrix,
    scrollState: createScrollState(),
    anyAncestorScrollable: computedAnyAncestorScrollable(flexState.scrollable, parentCtx?.anyAncestorScrollable),
  })

  const scrollHandlers = computedScrollHandlers(componentState, object)

  const handlers = computedHandlers(properties, hoveredSignal, activeSignal, scrollHandlers)
  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, handlers)

  return Object.assign(componentState, {
    object,
    handlers,
    ancestorsHaveListeners,
    fontFamilies: computedFontFamilies(properties, parentCtx),
    clippingRect: computedClippingRect(
      globalMatrix,
      componentState,
      properties.getSignal('pixelSize'),
      parentCtx?.clippingRect,
    ),
  }) satisfies ParentContext
}

export function setupImage(
  state: ReturnType<typeof createImageState>,
  parentCtx: ParentContext | undefined,
  abortSignal: AbortSignal,
) {
  buildRootContext(state, state.object, abortSignal)
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  loadResourceWithParams(state.texture, loadTextureImpl, cleanupTexture, abortSignal, state.properties.getSignal('src'))

  createNode(state, parentCtx, state.object, true, abortSignal)

  setupScroll(state, abortSignal)

  setupScrollbars(
    state.properties,
    state.scrollPosition,
    state,
    state.globalMatrix,
    state.isVisible,
    parentCtx?.clippingRect,
    state.orderInfo,
    state.groupDeps,
    state.root.panelGroupManager,
    abortSignal,
  )

  setupPointerEvents(state.properties, state.ancestorsHaveListeners, state.root, state.object, false, abortSignal)

  setupMatrixWorldUpdate(
    true,
    false,
    state.properties,
    state.size,
    state.object,
    state.root,
    state.globalMatrix,
    abortSignal,
  )

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)

  setupImageMesh(
    state.object,
    state.properties,
    state.texture,
    state.globalMatrix,
    parentCtx,
    state,
    state.root,
    state.isVisible,
    abortSignal,
  )
}


function setupImageMesh(
  mesh: Mesh & { boundingSphere: Sphere },
  properties: Properties<ThreeEventMap, AdditionalImageProperties, Partial<AdditionalImageDefaults>>,
  textureSignal: Signal<Texture | undefined>,
  globalMatrix: Signal<Matrix4 | undefined>,
  parentContext: ParentContext | undefined,
  flexState: FlexNodeState,
  root: RootContext,
  isVisible: Signal<boolean>,
  abortSignal: AbortSignal,
) {
  const clippingPlanes = createGlobalClippingPlanes(root, parentContext?.clippingRect)
  const isMeshVisible = getImageMaterialConfig().computedIsVisibile(
    properties,
    flexState.borderInset,
    flexState.size,
    isVisible,
  )
  setupImageMaterials(
    properties,
    textureSignal,
    mesh,
    flexState.size,
    flexState.borderInset,
    isMeshVisible,
    clippingPlanes,
    root,
    abortSignal,
  )
  setupBoundingSphere(mesh.boundingSphere, properties.getSignal('pixelSize'), globalMatrix, flexState.size, abortSignal)

  abortableEffect(() => {
    const texture = textureSignal.value
    if (texture == null || flexState.size.value == null || flexState.borderInset.value == null) {
      return
    }
    texture.matrix.identity()
    root.requestRender?.()

    if (properties.get('objectFit') === 'fill' || texture == null) {
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
    root.requestRender?.()
  }, abortSignal)
  abortableEffect(() => {
    if (flexState.size.value == null) {
      return
    }
    const [width, height] = flexState.size.value
    const pixelSize = properties.get('pixelSize')
    mesh.scale.set(width * pixelSize, height * pixelSize, 1)
    mesh.updateMatrix()
    root.requestRender?.()
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
  properties: Properties,
  textureSignal: Signal<Texture | undefined>,
  target: Mesh,
  size: Signal<Vector2Tuple | undefined>,
  borderInset: Signal<Inset | undefined>,
  isVisible: Signal<boolean>,
  clippingPlanes: Array<Plane> | null,
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
    const material = createPanelMaterial(properties.get('panelMaterialClass'), info)
    material.clippingPlanes = clippingPlanes
    target.material = material
    const cleanupDepthTestEffect = effect(() => {
      material.depthTest = properties.get('depthTest')
      root.requestRender?.()
    })
    const cleanupDepthWriteEffect = effect(() => {
      material.depthWrite = properties.get('depthWrite')
      root.requestRender?.()
    })
    const cleanupTextureEffect = effect(() => {
      ;(material as any).map = textureSignal.value ?? null
      material.needsUpdate = true
      root.requestRender?.()
    })
    return () => {
      cleanupTextureEffect()
      cleanupDepthWriteEffect()
      cleanupDepthTestEffect()
      material.dispose()
    }
  }, abortSignal)
  abortableEffect(() => {
    target.renderOrder = properties.get('renderOrder')
    root.requestRender?.()
  }, abortSignal)
  abortableEffect(() => {
    target.castShadow = properties.get('castShadow')
    root.requestRender?.()
  }, abortSignal)
  abortableEffect(() => {
    target.receiveShadow = properties.get('receiveShadow')
    root.requestRender?.()
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
    root.requestRender?.()
    return () => innerAbortController.abort()
  }, abortSignal)
  const setters = imageMaterialConfig.setters
  abortableEffect(() => {
    if (!isVisible.value) {
      return
    }
    return properties.subscribePropertyKeys((key) => {
      if (!imageMaterialConfig.hasProperty(key as string)) {
        return
      }
      abortableEffect(() => {
        setters[key as any]!(data, 0, properties.get(key as any), size, undefined)
        root.requestRender?.()
      }, abortSignal)
    })
  }, abortSignal)
}
