import { Signal, computed, signal } from '@preact/signals-core'
import { Object3DRef, RootContext } from '../context.js'
import { FlexNode, YogaProperties, createFlexNodeState } from '../flex/index.js'
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
  computedScrollHandlers,
} from '../scroll.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import { Initializers, alignmentXMap, alignmentYMap, readReactive } from '../utils.js'
import { WithConditionals, computedHandlers, computedMergedProperties } from './utils.js'
import { computedClippingRect } from '../clipping.js'
import { computedOrderInfo, ElementType, WithCameraDistance } from '../order.js'
import { Camera, Matrix4, Plane, Vector2Tuple, Vector3, WebGLRenderer } from 'three'
import { GlyphGroupManager } from '../text/render/instanced-glyph-group.js'
import { createActivePropertyTransfomers } from '../active.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { darkPropertyTransformers } from '../dark.js'
import { computedProperty } from '../properties/index.js'
import { getDefaultPanelMaterialConfig } from '../panel/index.js'

export type InheritableRootProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          TransformProperties &
          PanelProperties &
          ScrollbarProperties &
          PanelGroupProperties & {
            renderOrder?: number
            depthTest?: boolean
            sizeX?: number
            sizeY?: number
            anchorX?: keyof typeof alignmentXMap
            anchorY?: keyof typeof alignmentYMap
          }
      >
    >
  >
>

export type RootProperties = InheritableRootProperties & LayoutListeners & ScrollListeners

export const DEFAULT_PIXEL_SIZE = 0.01

const vectorHelper = new Vector3()
const planeHelper = new Plane()

const identityMatrix = signal(new Matrix4())

export function createRoot(
  pixelSize: Signal<number>,
  style: Signal<RootProperties | undefined>,
  properties: Signal<RootProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
  childrenContainer: Object3DRef,
  getCamera: () => Camera,
  renderer: WebGLRenderer,
  onFrameSet: Set<(delta: number) => void>,
) {
  const rootSize = signal<Vector2Tuple>([0, 0])
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const initializers: Initializers = []
  setupCursorCleanup(hoveredSignal, initializers)
  const mergedProperties = computedMergedProperties(
    style,
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

  const renderOrder = computedProperty(mergedProperties, 'renderOrder', 0)
  const depthTest = computedProperty(mergedProperties, 'depthTest', true)

  const node = signal<FlexNode | undefined>(undefined)
  const requestCalculateLayout = createDeferredRequestLayoutCalculation(onFrameSet, node, initializers)
  const flexState = createFlexNodeState()
  initializers.push((subscriptions) => {
    const newNode = new FlexNode(flexState, mergedProperties, requestCalculateLayout, object, subscriptions)
    node.value = newNode
    return subscriptions
  })

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, pixelSize)
  const rootMatrix = computedRootMatrix(mergedProperties, transformMatrix, flexState.size, pixelSize)

  //rootMatrix is automatically applied to everything, even the instanced things because everything is part of object
  applyTransform(object, rootMatrix, initializers)
  const groupDeps = computedPanelGroupDependencies(mergedProperties)

  const orderInfo = computedOrderInfo(undefined, ElementType.Panel, groupDeps, undefined)

  const ctx: WithCameraDistance & Pick<RootContext, 'onFrameSet'> = { cameraDistance: 0, onFrameSet }

  const panelGroupManager = new PanelGroupManager(renderOrder, depthTest, pixelSize, ctx, object, initializers)

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
  initializers.push(() => {
    onFrameSet.add(onCameraDistanceFrame)
    return () => onFrameSet.delete(onCameraDistanceFrame)
  })
  initializers.push((subscriptions) =>
    createInstancedPanel(
      mergedProperties,
      orderInfo,
      groupDeps,
      panelGroupManager,
      identityMatrix,
      flexState.size,
      undefined,
      flexState.borderInset,
      undefined,
      undefined,
      getDefaultPanelMaterialConfig(),
      subscriptions,
    ),
  )

  const scrollPosition = createScrollPosition()
  applyScrollPosition(childrenContainer, scrollPosition, pixelSize, initializers)
  const childrenMatrix = computedGlobalScrollMatrix(scrollPosition, identityMatrix, pixelSize)
  createScrollbars(
    mergedProperties,
    scrollPosition,
    flexState,
    identityMatrix,
    undefined,
    undefined,
    orderInfo,
    panelGroupManager,
    initializers,
  )

  const scrollHandlers = computedScrollHandlers(
    scrollPosition,
    undefined,
    flexState,
    object,
    properties,
    pixelSize,
    onFrameSet,
    initializers,
  )

  setupLayoutListeners(style, properties, flexState.size, initializers)

  const gylphGroupManager = new GlyphGroupManager(renderOrder, depthTest, pixelSize, ctx, object, initializers)

  const rootCtx: RootContext = Object.assign(ctx, {
    requestCalculateLayout,
    cameraDistance: 0,
    gylphGroupManager,
    object,
    panelGroupManager,
    pixelSize,
    renderOrder,
    depthTest,
    renderer,
    size: flexState.size,
  })

  return Object.assign(flexState, {
    anyAncestorScrollable: flexState.scrollable,
    clippingRect: computedClippingRect(identityMatrix, flexState, pixelSize, undefined),
    childrenMatrix,
    node,
    orderInfo,
    initializers,
    interactionPanel: createInteractionPanel(orderInfo, rootCtx, undefined, flexState.size, initializers),
    handlers: computedHandlers(style, properties, defaultProperties, hoveredSignal, activeSignal, scrollHandlers),
    root: rootCtx,
  })
}

function createDeferredRequestLayoutCalculation(
  onFrameSet: Set<(delta: number) => void>,
  nodeSignal: Signal<FlexNode | undefined>,
  initializers: Initializers,
) {
  let requested: boolean = false
  const onFrame = () => {
    const node = nodeSignal.peek()
    if (!requested || node == null) {
      return
    }
    requested = false
    node.calculateLayout()
  }
  initializers.push(() => {
    onFrameSet.add(onFrame)
    return () => onFrameSet.delete(onFrame)
  })
  return () => (requested = true)
}

function createSizeTranslator(pixelSize: Signal<number>, key: 'sizeX' | 'sizeY', to: string): PropertyTransformers {
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
            return s / pixelSize.value
          })),
        )
      }
      target.add(to, entry)
    },
  }
}
const matrixHelper = new Matrix4()

const defaultAnchorX: keyof typeof alignmentXMap = 'center'
const defaultAnchorY: keyof typeof alignmentYMap = 'center'

function computedRootMatrix(
  propertiesSignal: Signal<MergedProperties>,
  matrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  pixelSize: Signal<number>,
) {
  const anchorX = computedProperty(propertiesSignal, 'anchorX', defaultAnchorX)
  const anchorY = computedProperty(propertiesSignal, 'anchorY', defaultAnchorY)
  return computed(() => {
    if (size.value == null) {
      return undefined
    }
    const [width, height] = size.value
    return matrix.value
      ?.clone()
      .premultiply(
        matrixHelper.makeTranslation(
          alignmentXMap[anchorX.value] * width * pixelSize.value,
          alignmentYMap[anchorY.value] * height * pixelSize.value,
          0,
        ),
      )
  })
}
