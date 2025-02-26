import { ReadonlySignal, Signal, computed, effect, signal } from '@preact/signals-core'
import { Box2, Matrix4, Vector2, Vector2Tuple, Vector3, Vector4Tuple } from 'three'
import { FlexNodeState, Inset } from './flex/node.js'
import { ColorRepresentation, Initializers, computedBorderInset } from './utils.js'
import { ClippingRect } from './clipping.js'
import { clamp } from 'three/src/math/MathUtils.js'
import { PanelProperties, createInstancedPanel } from './panel/instanced-panel.js'
import { ElementType, OrderInfo, ZIndexOffset, computedOrderInfo } from './order.js'
import { MergedProperties } from './properties/merged.js'
import { PanelMaterialConfig, createPanelMaterialConfig } from './panel/panel-material.js'
import { PanelGroupManager, defaultPanelDependencies } from './panel/instanced-panel-group.js'
import { Object3DRef, RootContext } from './context.js'
import { ScrollListeners } from './listeners.js'
import { EventHandlers, ThreeMouseEvent, ThreePointerEvent } from './events.js'

const distanceHelper = new Vector3()
const localPointHelper = new Vector3()

export type ScrollEventHandlers = Pick<
  EventHandlers,
  'onPointerDown' | 'onPointerUp' | 'onPointerMove' | 'onWheel' | 'onPointerLeave' | 'onPointerCancel'
>

export function createScrollPosition() {
  return signal<Vector2Tuple>([0, 0])
}

export function computedGlobalScrollMatrix(
  scrollPosition: Signal<Vector2Tuple>,
  globalMatrix: Signal<Matrix4 | undefined>,
  pixelSizeSignal: Signal<number>,
) {
  return computed(() => {
    const global = globalMatrix.value
    if (global == null) {
      return undefined
    }
    const [scrollX, scrollY] = scrollPosition.value
    const pixelSize = pixelSizeSignal.value
    return new Matrix4().makeTranslation(-scrollX * pixelSize, scrollY * pixelSize, 0).premultiply(global)
  })
}

export function applyScrollPosition(
  object: Object3DRef,
  scrollPosition: Signal<Vector2Tuple>,
  pixelSizeSignal: Signal<number>,
  initializers: Initializers,
) {
  return initializers.push(() =>
    effect(() => {
      const [scrollX, scrollY] = scrollPosition.value
      const pixelSize = pixelSizeSignal.value
      object.current?.position.set(-scrollX * pixelSize, scrollY * pixelSize, 0)
      object.current?.updateMatrix()
    }),
  )
}

export function computedAnyAncestorScrollable(
  scrollable: Signal<[boolean, boolean]>,
  anyAncestorScrollable: Signal<readonly [boolean, boolean]> | undefined,
) {
  return computed(() => {
    const [ancestorX, ancestorY] = anyAncestorScrollable?.value ?? [false, false]
    const [x, y] = scrollable.value
    return [ancestorX || x, ancestorY || y] as const
  })
}

export function computedScrollHandlers(
  scrollPosition: Signal<Vector2Tuple | undefined>,
  anyAncestorScrollable: Signal<readonly [boolean, boolean]> | undefined,
  nodeState: FlexNodeState,
  object: Object3DRef,
  scrollbarWidth: Signal<number>,
  listeners: Signal<ScrollListeners | undefined>,
  root: Pick<RootContext, 'onFrameSet' | 'requestRender' | 'pixelSize' | 'requestFrame'>,
  initializers: Initializers,
) {
  const isScrollable = computed(() => nodeState.scrollable.value?.some((scrollable) => scrollable) ?? false)

  const downPointerMap = new Map<
    number,
    | { type: 'scroll-bar'; localPoint: Vector3; axisIndex: number }
    | { type: 'scroll-panel'; localPoint: Vector3; timestamp: number }
  >()
  const scrollVelocity = new Vector2()

  const scroll = (
    event: ThreePointerEvent | ThreeMouseEvent | undefined,
    deltaX: number,
    deltaY: number,
    deltaTime: number | undefined,
    enableRubberBand: boolean,
  ) => {
    if (scrollPosition.value == null) {
      return
    }
    const [wasScrolledX, wasScrolledY] = event == null ? [false, false] : getWasScrolled(event.nativeEvent)
    if (wasScrolledX) {
      deltaX = 0
    }
    if (wasScrolledY) {
      deltaY = 0
    }
    const [x, y] = scrollPosition.value
    const [maxX, maxY] = nodeState.maxScrollPosition.value
    let [newX, newY] = scrollPosition.value
    const [ancestorScrollableX, ancestorScrollableY] = anyAncestorScrollable?.value ?? [false, false]
    newX = computeScroll(x, maxX, deltaX, enableRubberBand && !ancestorScrollableX)
    newY = computeScroll(y, maxY, deltaY, enableRubberBand && !ancestorScrollableY)

    if (deltaTime != null && deltaTime > 0) {
      scrollVelocity.set(deltaX, deltaY).divideScalar(deltaTime)
    }

    if (event != null) {
      setWasScrolled(
        event.nativeEvent,
        wasScrolledX || Math.min(x, (maxX ?? 0) - x) > 5,
        wasScrolledY || Math.min(y, (maxY ?? 0) - y) > 5,
      )
    }
    const preventScroll = listeners.peek()?.onScroll?.(newX, newY, scrollPosition, event)
    if (preventScroll === false || (x === newX && y === newY)) {
      return
    }
    scrollPosition.value = [newX, newY]
  }

  const onFrame = (delta: number) => {
    if (downPointerMap.size > 0 || scrollPosition.value == null) {
      return
    }

    let deltaX = 0
    let deltaY = 0
    const [x, y] = scrollPosition.value
    const [maxX, maxY] = nodeState.maxScrollPosition.value

    const outsideDistanceX = outsideDistance(x, 0, maxX ?? 0)
    const outsideDistanceY = outsideDistance(y, 0, maxY ?? 0)

    if (Math.abs(outsideDistanceX) > 1 || Math.abs(outsideDistanceY) > 1) {
      root.requestFrame()
    }

    deltaX += outsideDistanceX * -0.3
    deltaY += outsideDistanceY * -0.3

    deltaX += scrollVelocity.x * delta
    deltaY += scrollVelocity.y * delta

    scrollVelocity.multiplyScalar(0.9) //damping scroll factor

    if (Math.abs(scrollVelocity.x) < 0.01 /** 10 px per second */) {
      scrollVelocity.x = 0
    } else {
      root.requestFrame()
    }

    if (Math.abs(scrollVelocity.y) < 0.01 /** 10 px per second */) {
      scrollVelocity.y = 0
    } else {
      root.requestFrame()
    }

    if (deltaX === 0 && deltaY === 0) {
      return
    }
    scroll(undefined, deltaX, deltaY, undefined, true)
  }

  initializers.push(() =>
    effect(() => {
      //this also needs to be executed when isScrollable is false since when the max scroll position is lower then the current scroll position, the onFrame callback will animate the scroll position back to 0
      root.onFrameSet.add(onFrame)
      return () => root.onFrameSet.delete(onFrame)
    }),
  )

  return computed<ScrollEventHandlers | undefined>(() => {
    if (!isScrollable.value) {
      return undefined
    }
    const onPointerFinish = (event: ThreePointerEvent) => {
      if ('releasePointerCapture' in object && typeof object.releasePointerCapture === 'function') {
        object.releasePointerCapture(event.pointerId)
      }
      if (!downPointerMap.delete(event.pointerId) || scrollPosition.value == null) {
        return
      }
      event.stopImmediatePropagation?.()
      if (downPointerMap.size > 0) {
        return
      }
      //only request a render if the last pointer that was dragging stopped dragging and this panel is actually scrollable
      root.requestRender()
    }
    return {
      onPointerDown: (event) => {
        event.stopImmediatePropagation?.()
        const localPoint = object.current!.worldToLocal(event.point.clone())

        const ponterIsMouse =
          event.nativeEvent != null &&
          typeof event.nativeEvent === 'object' &&
          'pointerType' in event.nativeEvent &&
          event.nativeEvent.pointerType === 'mouse'

        const scrollbarAxisIndex = ponterIsMouse
          ? getIntersectedScrollbarIndex(
              localPoint,
              root.pixelSize.peek(),
              scrollbarWidth.peek(),
              nodeState.size.peek(),
              nodeState.maxScrollPosition.peek(),
              nodeState.borderInset.peek(),
              scrollPosition.peek(),
            )
          : undefined

        if (ponterIsMouse && scrollbarAxisIndex == null) {
          return
        }

        if ('setPointerCapture' in event.object && typeof event.object.setPointerCapture === 'function') {
          event.object.setPointerCapture(event.pointerId)
        }

        downPointerMap.set(
          event.pointerId,
          scrollbarAxisIndex != null
            ? {
                type: 'scroll-bar',
                localPoint,
                axisIndex: scrollbarAxisIndex,
              }
            : {
                type: 'scroll-panel',
                timestamp: performance.now(),
                localPoint,
              },
        )
      },
      onPointerUp: onPointerFinish,
      onPointerLeave: onPointerFinish,
      onPointerCancel: onPointerFinish,
      onPointerMove: (event) => {
        const prevInteraction = downPointerMap.get(event.pointerId)
        if (prevInteraction == null) {
          return
        }
        event.stopImmediatePropagation?.()
        object.current!.worldToLocal(localPointHelper.copy(event.point))
        distanceHelper.copy(localPointHelper).sub(prevInteraction.localPoint)
        distanceHelper.divideScalar(root.pixelSize.peek())
        prevInteraction.localPoint.copy(localPointHelper)

        if (prevInteraction.type === 'scroll-bar') {
          const size = nodeState.size.peek()
          if (size == null) {
            return
          }
          //convert distanceHelper to (drag delta) * maxScrollPosition
          toScrollbarScrollDistance(
            distanceHelper,
            prevInteraction.axisIndex,
            size,
            nodeState.borderInset.peek(),
            nodeState.maxScrollPosition.peek(),
            scrollbarWidth.peek(),
          )
          scroll(event, distanceHelper.x, -distanceHelper.y, undefined, false)
          return
        }
        const timestamp = performance.now()
        const deltaTime = timestamp - prevInteraction.timestamp
        scroll(event, -distanceHelper.x, distanceHelper.y, deltaTime, true)
        prevInteraction.timestamp = timestamp
      },
      onWheel: (event) => {
        const { nativeEvent } = event
        if (
          nativeEvent == null ||
          typeof nativeEvent != 'object' ||
          !('deltaX' in nativeEvent) ||
          typeof nativeEvent.deltaX != 'number' ||
          !('deltaY' in nativeEvent) ||
          typeof nativeEvent.deltaY != 'number'
        ) {
          return
        }
        scroll(event, nativeEvent.deltaX, nativeEvent.deltaY, undefined, false)
      },
    }
  })
}

const wasScrolledSymbol = Symbol('was-scrolled')

function getWasScrolled(event: any) {
  return (event[wasScrolledSymbol] as [boolean, boolean]) ?? [false, false]
}

function setWasScrolled(event: any, x: boolean, y: boolean): void {
  event[wasScrolledSymbol] = [x, y]
}

function computeScroll(
  position: number,
  maxPosition: number | undefined,
  delta: number,
  enableRubberBand: boolean,
): number {
  if (delta === 0) {
    return position
  }
  const outside = outsideDistance(position, 0, maxPosition ?? 0)
  if (sign(delta) === sign(outside)) {
    delta *= Math.max(0, 1 - Math.abs(outside) / 100)
  }
  let newPosition = position + delta
  if (enableRubberBand && maxPosition != null) {
    return newPosition
  }
  return clamp(newPosition, 0, maxPosition ?? 0)
}

/**
 * true = positivie
 * false = negative
 */
export type Sign = boolean

function sign(value: number): Sign {
  return value >= 0
}

function outsideDistance(value: number, min: number, max: number): number {
  if (value < min) {
    return value - min
  }
  if (value > max) {
    return value - max
  }
  return 0
}

export type ScrollbarWidthProperties = {
  scrollbarWidth?: number
}

export type ScrollbarBorderSizeProperties = {
  scrollbarBorderRightWidth?: number
  scrollbarBorderTopWidth?: number
  scrollbarBorderLeftWidth?: number
  scrollbarBorderBottomWidth?: number
}

export type ScrollbarProperties = {
  scrollbarOpacity?: number
  scrollbarColor?: ColorRepresentation
  scrollbarZIndexOffset?: ZIndexOffset
} & ScrollbarWidthProperties &
  ScrollbarBorderSizeProperties & {
    [Key in Exclude<
      keyof PanelProperties,
      'backgroundColor' | 'backgroundOpacity'
    > as `scrollbar${Capitalize<Key>}`]: PanelProperties[Key]
  }

const scrollbarBorderPropertyKeys = [
  'scrollbarBorderLeftWidth',
  'scrollbarBorderRightWidth',
  'scrollbarBorderTopWidth',
  'scrollbarBorderBottomWidth',
] as const

export function createScrollbars(
  propertiesSignal: Signal<MergedProperties>,
  scrollPosition: Signal<Vector2Tuple>,
  flexState: FlexNodeState,
  globalMatrix: Signal<Matrix4 | undefined>,
  isVisible: Signal<boolean>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo | undefined>,
  panelGroupManager: PanelGroupManager,
  scrollbarWidth: Signal<number>,
  initializers: Initializers,
): void {
  const scrollbarOrderInfo = computedOrderInfo(
    undefined,
    'scrollbarZIndexOffset',
    ElementType.Panel,
    defaultPanelDependencies,
    orderInfo,
  )

  const borderInset = computedBorderInset(propertiesSignal, scrollbarBorderPropertyKeys)
  createScrollbar(
    propertiesSignal,
    0,
    scrollPosition,
    flexState,
    globalMatrix,
    isVisible,
    parentClippingRect,
    scrollbarOrderInfo,
    panelGroupManager,
    scrollbarWidth,
    borderInset,
    initializers,
  )
  createScrollbar(
    propertiesSignal,
    1,
    scrollPosition,
    flexState,
    globalMatrix,
    isVisible,
    parentClippingRect,
    scrollbarOrderInfo,
    panelGroupManager,
    scrollbarWidth,
    borderInset,
    initializers,
  )
}

let scrollbarMaterialConfig: PanelMaterialConfig | undefined
function getScrollbarMaterialConfig() {
  scrollbarMaterialConfig ??= createPanelMaterialConfig(
    {
      backgroundColor: 'scrollbarColor',
      borderBottomLeftRadius: 'scrollbarBorderBottomLeftRadius',
      borderBottomRightRadius: 'scrollbarBorderBottomRightRadius',
      borderTopRightRadius: 'scrollbarBorderTopRightRadius',
      borderTopLeftRadius: 'scrollbarBorderTopLeftRadius',
      borderColor: 'scrollbarBorderColor',
      borderBend: 'scrollbarBorderBend',
      borderOpacity: 'scrollbarBorderOpacity',
      backgroundOpacity: 'scrollbarOpacity',
    },
    {
      backgroundColor: 0xffffff,
      backgroundOpacity: 1,
    },
  )
  return scrollbarMaterialConfig
}

function createScrollbar(
  propertiesSignal: Signal<MergedProperties>,
  primaryIndex: number,
  scrollPosition: Signal<Vector2Tuple>,
  flexState: FlexNodeState,
  globalMatrix: Signal<Matrix4 | undefined>,
  isVisible: Signal<boolean>,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo | undefined>,
  panelGroupManager: PanelGroupManager,
  scrollbarWidth: Signal<number>,
  borderSize: ReadonlySignal<Inset>,
  initializers: Initializers,
) {
  const scrollbarTransformation = computed(() =>
    computeScrollbarTransformation(
      primaryIndex,
      scrollbarWidth.value,
      flexState.size.value,
      flexState.maxScrollPosition.value,
      flexState.borderInset.value,
      scrollPosition.value,
    ),
  )
  const scrollbarPosition = computed(() => (scrollbarTransformation.value?.slice(0, 2) ?? [0, 0]) as Vector2Tuple)
  const scrollbarSize = computed(() => (scrollbarTransformation.value?.slice(2, 4) ?? [0, 0]) as Vector2Tuple)

  initializers.push((subscriptions) =>
    createInstancedPanel(
      propertiesSignal,
      orderInfo,
      undefined,
      panelGroupManager,
      globalMatrix,
      scrollbarSize,
      scrollbarPosition,
      borderSize,
      parentClippingRect,
      isVisible,
      getScrollbarMaterialConfig(),
      subscriptions,
    ),
  )
}

function computeScrollbarTransformation(
  primaryAxisIndex: number,
  secondaryScrollbarSize: number,
  size: Vector2Tuple | undefined,
  maxScrollPosition: Partial<Vector2Tuple>,
  borderInset: Inset | undefined,
  scrollPosition: Vector2Tuple | undefined,
) {
  if (size == null || borderInset == null || scrollPosition == null) {
    return undefined
  }

  const primaryMaxScrollPosition = maxScrollPosition[primaryAxisIndex]
  if (primaryMaxScrollPosition == null) {
    return undefined
  }

  const result: Vector4Tuple = [0, 0, 0, 0]
  const endInsetIndex = 1 - primaryAxisIndex
  const primarySizeWithoutBorder = size[primaryAxisIndex] - borderInset[endInsetIndex] - borderInset[endInsetIndex + 2]
  const primaryScrollbarSize = computePrimaryScrollbarSize(
    primarySizeWithoutBorder,
    primaryMaxScrollPosition,
    secondaryScrollbarSize,
  )

  const primaryMaxScrollbarPosition = primarySizeWithoutBorder - primaryScrollbarSize
  const primaryScrollPosition = scrollPosition[primaryAxisIndex]

  //position
  const invertedIndex = 1 - primaryAxisIndex
  result[primaryAxisIndex] =
    size[primaryAxisIndex] * 0.5 -
    primaryScrollbarSize * 0.5 -
    borderInset[(primaryAxisIndex + 3) % 4] -
    primaryMaxScrollbarPosition * clamp(primaryScrollPosition / primaryMaxScrollPosition, 0, 1)
  result[invertedIndex] = size[invertedIndex] * 0.5 - secondaryScrollbarSize * 0.5 - borderInset[invertedIndex + 1]

  if (primaryAxisIndex === 0) {
    result[0] *= -1
    result[1] *= -1
  }

  //size
  result[primaryAxisIndex + 2] = primaryScrollbarSize
  result[endInsetIndex + 2] = secondaryScrollbarSize

  return result
}

function computePrimaryScrollbarSize(
  primarySizeWithoutBorder: number,
  primaryMaxScrollPosition: number,
  secondaryScrollbarSize: number,
) {
  return Math.max(
    secondaryScrollbarSize,
    (primarySizeWithoutBorder * primarySizeWithoutBorder) / (primaryMaxScrollPosition + primarySizeWithoutBorder),
  )
}

/**
 * @param target contains the delta movement in pixels and will receive the delta scroll distance in pixels
 */
function toScrollbarScrollDistance(
  target: Vector3,
  primaryAxisIndex: number,
  size: Vector2Tuple | undefined,
  borderInset: Inset | undefined,
  maxScrollPosition: Partial<Vector2Tuple>,
  secondaryScrollbarSize: number,
): void {
  const primaryMaxScrollPosition = maxScrollPosition[primaryAxisIndex]
  if (size == null || borderInset == null || primaryMaxScrollPosition == null) {
    return
  }

  const delta = target.getComponent(primaryAxisIndex)
  const primarySizeWithoutBorder =
    size[primaryAxisIndex] - borderInset[1 - primaryAxisIndex] - borderInset[1 - primaryAxisIndex + 2]
  const primaryScrollbarSize = computePrimaryScrollbarSize(
    primarySizeWithoutBorder,
    primaryMaxScrollPosition,
    secondaryScrollbarSize,
  )
  const primaryMaxScrollbarPosition = primarySizeWithoutBorder - primaryScrollbarSize
  target.setComponent(primaryAxisIndex, (delta / primaryMaxScrollbarPosition) * primaryMaxScrollPosition)
  target.setComponent(1 - primaryAxisIndex, 0)
  target.z = 0
}

const box2Helper = new Box2()
const point2Helper = new Vector2()

function getIntersectedScrollbarIndex(
  point: Vector3,
  pixelSize: number,
  secondaryScrollbarSize: number,
  size: Vector2Tuple | undefined,
  maxScrollPosition: Partial<Vector2Tuple>,
  borderInset: Inset | undefined,
  scrollPosition: Vector2Tuple | undefined,
): number | undefined {
  if (size == null) {
    return undefined
  }
  point2Helper.copy(point).divideScalar(pixelSize)
  for (let i = 0; i < 2; i++) {
    if (
      intersectsScrollbar(point2Helper, i, secondaryScrollbarSize, size, maxScrollPosition, borderInset, scrollPosition)
    ) {
      return i
    }
  }
  return undefined
}

const centerHelper = new Vector2()
const sizeHelper = new Vector2()

function intersectsScrollbar(
  point: Vector2,
  axisIndex: number,
  secondaryScrollbarSize: number,
  size: Vector2Tuple | undefined,
  maxScrollPosition: Partial<Vector2Tuple>,
  borderInset: Inset | undefined,
  scrollPosition: Vector2Tuple | undefined,
): boolean {
  const result = computeScrollbarTransformation(
    axisIndex,
    secondaryScrollbarSize,
    size,
    maxScrollPosition,
    borderInset,
    scrollPosition,
  )
  if (result == null) {
    return false
  }
  box2Helper.setFromCenterAndSize(centerHelper.fromArray(result, 0), sizeHelper.fromArray(result, 2))
  return box2Helper.containsPoint(point)
}
