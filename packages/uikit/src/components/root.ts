import { Signal, computed, signal, untracked } from '@preact/signals-core'
import { Object3DRef, RootContext } from '../context.js'
import { FlexNode, YogaProperties } from '../flex/index.js'
import { LayoutListeners, ScrollListeners, setupLayoutListeners } from '../listeners.js'
import { PanelProperties, createInstancedPanel } from '../panel/instanced-panel.js'
import {
  PanelGroupManager,
  PanelGroupProperties,
  computedPanelGroupDependencies,
} from '../panel/instanced-panel-group.js'
import { WithAllAliases } from '../properties/alias.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { MergedProperties, PropertyTransformers } from '../properties/merged.js'
import {
  ScrollbarProperties,
  applyScrollPosition,
  computedGlobalScrollMatrix,
  createScrollPosition,
  createScrollbars,
  setupScrollHandler,
} from '../scroll.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import { Subscriptions, alignmentXMap, alignmentYMap, readReactive } from '../utils.js'
import { WithConditionals, computedHandlers, computedMergedProperties } from './utils.js'
import { computedClippingRect } from '../clipping.js'
import { computedOrderInfo, ElementType, WithCameraDistance } from '../order.js'
import { Camera, Matrix4, Plane, Vector2Tuple, Vector3, WebGLRenderer } from 'three'
import { GlyphGroupManager } from '../text/render/instanced-glyph-group.js'
import { createGetBatchedProperties } from '../properties/batched.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { EventHandlers } from '../events.js'
import { darkPropertyTransformers, getDefaultPanelMaterialConfig } from '../internals.js'

export type InheritableRootProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          TransformProperties &
          PanelProperties &
          ScrollbarProperties &
          PanelGroupProperties & {
            sizeX?: number
            sizeY?: number
            anchorX?: keyof typeof alignmentXMap
            anchorY?: keyof typeof alignmentYMap
          }
      >
    >
  >
>

export type RootProperties = InheritableRootProperties & {
  pixelSize?: number
} & EventHandlers &
  LayoutListeners &
  ScrollListeners

const DEFAULT_PIXEL_SIZE = 0.01

const vectorHelper = new Vector3()
const planeHelper = new Plane()

export function createRoot(
  properties: Signal<RootProperties>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
  getCamera: () => Camera,
  renderer: WebGLRenderer,
) {
  const rootSize = signal<Vector2Tuple>([0, 0])
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const subscriptions = [] as Subscriptions
  setupCursorCleanup(hoveredSignal, subscriptions)
  const pixelSize = untracked(() => properties.value.pixelSize ?? DEFAULT_PIXEL_SIZE)

  const onFrameSet = new Set<(delta: number) => void>()

  const mergedProperties = computedMergedProperties(
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(rootSize),
      ...createHoverPropertyTransformers(hoveredSignal),
      ...createActivePropertyTransfomers(activeSignal),
    },
    {
      ...createSizeTranslator(pixelSize, 'sizeX', 'width'),
      ...createSizeTranslator(pixelSize, 'sizeY', 'height'),
    },
  )

  const requestCalculateLayout = createDeferredRequestLayoutCalculation(onFrameSet, subscriptions)
  const node = new FlexNode(mergedProperties, rootSize, object, requestCalculateLayout, undefined, subscriptions)
  subscriptions.push(() => node.destroy())

  const transformMatrix = computedTransformMatrix(mergedProperties, node, pixelSize)
  const rootMatrix = computedRootMatrix(mergedProperties, transformMatrix, node.size, pixelSize)

  applyTransform(object, transformMatrix, subscriptions)
  const groupDeps = computedPanelGroupDependencies(mergedProperties)

  const orderInfo = computedOrderInfo(undefined, ElementType.Panel, groupDeps, undefined)

  const ctx: WithCameraDistance = { cameraDistance: 0 }

  const panelGroupManager = new PanelGroupManager(pixelSize, ctx, object)
  onFrameSet.add(panelGroupManager.onFrame)
  subscriptions.push(() => onFrameSet.delete(panelGroupManager.onFrame))

  const onCameraDistanceFrame = () => {
    if (object.current == null) {
      ctx.cameraDistance = 0
      return
    }
    planeHelper.normal.set(0, 0, 1)
    planeHelper.constant = 0
    planeHelper.applyMatrix4(object.current.matrixWorld)
    vectorHelper.setFromMatrixPosition(getCamera().matrixWorld)
    ctx.cameraDistance = planeHelper.distanceToPoint(vectorHelper)
  }
  onFrameSet.add(onCameraDistanceFrame)
  subscriptions.push(() => onFrameSet.delete(onCameraDistanceFrame))

  createInstancedPanel(
    mergedProperties,
    orderInfo,
    groupDeps,
    panelGroupManager,
    rootMatrix,
    node.size,
    undefined,
    node.borderInset,
    undefined,
    undefined,
    getDefaultPanelMaterialConfig(),
    subscriptions,
  )

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, pixelSize)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, rootMatrix, pixelSize)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    node,
    rootMatrix,
    undefined,
    undefined,
    orderInfo,
    panelGroupManager,
    subscriptions,
  )

  const scrollHandlers = setupScrollHandler(
    node,
    scrollPosition,
    object,
    properties,
    pixelSize,
    onFrameSet,
    subscriptions,
  )

  setupLayoutListeners(properties, node.size, subscriptions)

  const gylphGroupManager = new GlyphGroupManager(pixelSize, ctx, object)
  onFrameSet.add(gylphGroupManager.onFrame)
  subscriptions.push(() => onFrameSet.delete(gylphGroupManager.onFrame))

  const rootCtx: RootContext = Object.assign(ctx, {
    onFrameSet,
    cameraDistance: 0,
    clippingRect: computedClippingRect(rootMatrix, node.size, node.borderInset, node.overflow, pixelSize, undefined),
    gylphGroupManager,
    childrenMatrix,
    node,
    object,
    orderInfo,
    panelGroupManager,
    pixelSize,
    renderer,
  })

  return Object.assign(rootCtx, {
    subscriptions,
    interactionPanel: createInteractionPanel(node, orderInfo, rootCtx, undefined, subscriptions),
    handlers: computedHandlers(properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers),
    root: rootCtx,
  })
}

function createDeferredRequestLayoutCalculation(
  onFrameSet: Set<(delta: number) => void>,
  subscriptions: Subscriptions,
) {
  let requestedNode: FlexNode | undefined
  const onFrame = () => {
    if (requestedNode == null) {
      return
    }
    const node = requestedNode
    requestedNode = undefined
    node.calculateLayout()
  }
  onFrameSet.add(onFrame)
  subscriptions.push(() => onFrameSet.delete(onFrame))
  return (node: FlexNode) => {
    if (requestedNode != null || node['yogaNode'] == null) {
      return
    }
    requestedNode = node
  }
}

function createSizeTranslator(pixelSize: number, key: 'sizeX' | 'sizeY', to: string): PropertyTransformers {
  const map = new Map<unknown, Signal<number | undefined>>()
  return {
    [key]: (value: unknown, target: MergedProperties) => {
      let entry = map.get(value)
      if (entry == null) {
        map.set(
          value,
          (entry = computed(() => {
            const s = readReactive(value) as number | undefined
            if (s == null) {
              return undefined
            }
            return s / pixelSize
          })),
        )
      }
      target.add(to, entry)
    },
  }
}
const matrixHelper = new Matrix4()

const keys = ['anchorX', 'anchorY']

function computedRootMatrix(
  propertiesSignal: Signal<MergedProperties>,
  matrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple>,
  pixelSize: number,
) {
  const get = createGetBatchedProperties(propertiesSignal, keys)
  return computed(() => {
    const [width, height] = size.value
    return matrix.value
      ?.clone()
      .premultiply(
        matrixHelper.makeTranslation(
          alignmentXMap[(get('anchorX') as keyof typeof alignmentXMap) ?? 'center'] * width * pixelSize,
          alignmentYMap[(get('anchorY') as keyof typeof alignmentYMap) ?? 'center'] * height * pixelSize,
          0,
        ),
      )
  })
}
