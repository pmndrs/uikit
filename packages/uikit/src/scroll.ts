import { ReadonlySignal, Signal, computed, effect, signal } from '@preact/signals-core'
import { Matrix4, Vector2, Vector2Tuple, Vector3, Vector4Tuple } from 'three'
import { FlexNode, Inset } from './flex/node.js'
import { ColorRepresentation, Subscriptions, computedBorderInset } from './utils.js'
import { ClippingRect } from './clipping.js'
import { clamp } from 'three/src/math/MathUtils.js'
import { PanelProperties, createInstancedPanel } from './panel/instanced-panel.js'
import { ElementType, OrderInfo, computedOrderInfo } from './order.js'
import { computedProperty } from './properties/batched.js'
import { MergedProperties } from './properties/merged.js'
import { PanelMaterialConfig, createPanelMaterialConfig } from './panel/panel-material.js'
import { PanelGroupManager, defaultPanelDependencies } from './panel/instanced-panel-group.js'
import { Object3DRef } from './context.js'
import { ScrollListeners } from './listeners.js'
import { EventHandlers, ThreeEvent } from './events.js'

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
  pixelSize: number,
) {
  return computed(() => {
    const global = globalMatrix.value
    if (global == null) {
      return undefined
    }
    const [scrollX, scrollY] = scrollPosition.value
    return new Matrix4().makeTranslation(-scrollX * pixelSize, scrollY * pixelSize, 0).premultiply(global)
  })
}

export function applyScrollPosition(object: Object3DRef, scrollPosition: Signal<Vector2Tuple>, pixelSize: number) {
  return effect(() => {
    const [scrollX, scrollY] = scrollPosition.value
    object.current?.position.set(-scrollX * pixelSize, scrollY * pixelSize, 0)
    object.current?.updateMatrix()
  })
}

export function setupScrollHandler(
  node: FlexNode,
  scrollPosition: Signal<Vector2Tuple>,
  object: Object3DRef,
  listeners: Signal<ScrollListeners>,
  pixelSize: number,
  onFrameSet: Set<(delta: number) => void>,
  subscriptions: Subscriptions,
) {
  const isScrollable = computed(() => node.scrollable.value.some((scrollable) => scrollable))

  const downPointerMap = new Map()
  const scrollVelocity = new Vector2()

  const scroll = (
    event: ThreeEvent<WheelEvent | PointerEvent> | undefined,
    deltaX: number,
    deltaY: number,
    deltaTime: number | undefined,
    enableRubberBand: boolean,
  ) => {
    const [wasScrolledX, wasScrolledY] = event == null ? [false, false] : getWasScrolled(event.nativeEvent)
    if (wasScrolledX) {
      deltaX = 0
    }
    if (wasScrolledY) {
      deltaY = 0
    }
    const [x, y] = scrollPosition.value
    const [maxX, maxY] = node.maxScrollPosition.value
    let [newX, newY] = scrollPosition.value
    const [ancestorScrollableX, ancestorScrollableY] = node.anyAncestorScrollable?.value ?? [false, false]
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
    const preventScroll = listeners.peek().onScroll?.(newX, newY, scrollPosition, event)
    if (preventScroll === false || (x === newX && y === newY)) {
      return
    }
    scrollPosition.value = [newX, newY]
  }

  const onFrame = (delta: number) => {
    if (downPointerMap.size > 0) {
      return
    }

    let deltaX = 0
    let deltaY = 0
    const [x, y] = scrollPosition.value
    const [maxX, maxY] = node.maxScrollPosition.value

    deltaX += outsideDistance(x, 0, maxX ?? 0) * -0.3
    deltaY += outsideDistance(y, 0, maxY ?? 0) * -0.3

    deltaX += scrollVelocity.x * delta
    deltaY += scrollVelocity.y * delta

    scrollVelocity.multiplyScalar(0.9) //damping scroll factor

    if (Math.abs(scrollVelocity.x) < 0.01) {
      scrollVelocity.x = 0
    }

    if (Math.abs(scrollVelocity.y) < 0.01) {
      scrollVelocity.y = 0
    }

    if (deltaX === 0 && deltaY === 0) {
      return
    }
    scroll(undefined, deltaX, deltaY, undefined, true)
  }

  onFrameSet.add(onFrame)
  subscriptions.push(() => onFrameSet.delete(onFrame))

  return computed<ScrollEventHandlers | undefined>(() => {
    if (!isScrollable.value) {
      return undefined
    }
    return {
      onPointerDown: ({ nativeEvent, point }) => {
        let interaction = downPointerMap.get(nativeEvent.pointerId)
        if (interaction == null) {
          downPointerMap.set(nativeEvent.pointerId, (interaction = { timestamp: 0, point: new Vector3() }))
        }
        interaction.timestamp = performance.now() / 1000
        object.current!.worldToLocal(interaction.point.copy(point))
      },
      onPointerUp: ({ nativeEvent }) => downPointerMap.delete(nativeEvent.pointerId),
      onPointerLeave: ({ nativeEvent }) => downPointerMap.delete(nativeEvent.pointerId),
      onPointerCancel: ({ nativeEvent }) => downPointerMap.delete(nativeEvent.pointerId),
      onPointerMove: (event) => {
        const prevInteraction = downPointerMap.get(event.nativeEvent.pointerId)

        if (prevInteraction == null) {
          return
        }
        object.current!.worldToLocal(localPointHelper.copy(event.point))
        distanceHelper.copy(localPointHelper).sub(prevInteraction.point).divideScalar(pixelSize)
        const timestamp = performance.now() / 1000
        const deltaTime = timestamp - prevInteraction.timestamp

        prevInteraction.point.copy(localPointHelper)
        prevInteraction.timestamp = timestamp

        if (event.defaultPrevented) {
          return
        }

        scroll(event, -distanceHelper.x, distanceHelper.y, deltaTime, true)
      },
      onWheel: (event) => {
        if (event.defaultPrevented) {
          return
        }
        const { nativeEvent } = event
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
  scrollbarBorderRight?: number
  scrollbarBorderTop?: number
  scrollbarBorderLeft?: number
  scrollbarBorderBottom?: number
}

export type ScrollbarProperties = {
  scrollbarOpacity?: number
  scrollbarColor?: ColorRepresentation
} & ScrollbarWidthProperties &
  ScrollbarBorderSizeProperties & {
    [Key in Exclude<
      keyof PanelProperties,
      'backgroundColor' | 'backgroundOpacity'
    > as `scrollbar${Capitalize<Key>}`]: PanelProperties[Key]
  }

const scrollbarBorderPropertyKeys = [
  'scrollbarBorderLeft',
  'scrollbarBorderRight',
  'scrollbarBorderTop',
  'scrollbarBorderBottom',
] as const

export function createScrollbars(
  propertiesSignal: Signal<MergedProperties>,
  scrollPosition: Signal<Vector2Tuple>,
  node: FlexNode,
  globalMatrix: Signal<Matrix4 | undefined>,
  isClipped: Signal<boolean> | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo>,
  panelGroupManager: PanelGroupManager,
  subscriptions: Subscriptions,
): void {
  const scrollbarOrderInfo = computedOrderInfo(undefined, ElementType.Panel, defaultPanelDependencies, orderInfo)

  const scrollbarWidth = computedProperty(propertiesSignal, 'scrollbarWidth', 10)

  const borderInset = computedBorderInset(propertiesSignal, scrollbarBorderPropertyKeys)
  createScrollbar(
    propertiesSignal,
    0,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    parentClippingRect,
    scrollbarOrderInfo,
    panelGroupManager,
    scrollbarWidth,
    borderInset,
    subscriptions,
  )
  createScrollbar(
    propertiesSignal,
    1,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    parentClippingRect,
    scrollbarOrderInfo,
    panelGroupManager,
    scrollbarWidth,
    borderInset,
    subscriptions,
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
  mainIndex: number,
  scrollPosition: Signal<Vector2Tuple>,
  node: FlexNode,
  globalMatrix: Signal<Matrix4 | undefined>,
  isClipped: Signal<boolean> | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo>,
  panelGroupManager: PanelGroupManager,
  scrollbarWidth: Signal<number>,
  borderSize: ReadonlySignal<Inset>,
  subscriptions: Subscriptions,
) {
  const scrollbarTransformation = computed(() =>
    computeScrollbarTransformation(
      mainIndex,
      scrollbarWidth.value,
      node.size.value,
      node.maxScrollPosition.value,
      node.borderInset.value,
      scrollPosition.value,
    ),
  )
  const scrollbarPosition = computed(() => (scrollbarTransformation.value?.slice(0, 2) ?? [0, 0]) as Vector2Tuple)
  const scrollbarSize = computed(() => (scrollbarTransformation.value?.slice(2, 4) ?? [0, 0]) as Vector2Tuple)

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
    isClipped,
    getScrollbarMaterialConfig(),
    subscriptions,
  )
}

function computeScrollbarTransformation(
  mainIndex: number,
  otherScrollbarSize: number,
  size: Vector2Tuple,
  maxScrollbarPosition: Partial<Vector2Tuple>,
  borderInset: Inset,
  scrollPosition: Vector2Tuple,
) {
  const result: Vector4Tuple = [0, 0, 0, 0]

  const maxMainScrollbarPosition = maxScrollbarPosition[mainIndex]

  if (maxMainScrollbarPosition == null) {
    return result
  }
  const invertedIndex = 1 - mainIndex
  const mainSizeWithoutBorder = size[mainIndex] - borderInset[invertedIndex] - borderInset[invertedIndex + 2]
  const mainScrollbarSize = Math.max(
    otherScrollbarSize,
    (mainSizeWithoutBorder * mainSizeWithoutBorder) / (maxMainScrollbarPosition + mainSizeWithoutBorder),
  )

  const maxScrollbarDistancance = mainSizeWithoutBorder - mainScrollbarSize
  const mainScrollPosition = scrollPosition[mainIndex]

  //position
  result[mainIndex] =
    size[mainIndex] * 0.5 -
    mainScrollbarSize * 0.5 -
    borderInset[(mainIndex + 3) % 4] -
    maxScrollbarDistancance * clamp(mainScrollPosition / maxMainScrollbarPosition, 0, 1)
  result[invertedIndex] = size[invertedIndex] * 0.5 - otherScrollbarSize * 0.5 - borderInset[invertedIndex + 1]

  if (mainIndex === 0) {
    result[0] *= -1
    result[1] *= -1
  }

  //size
  result[mainIndex + 2] = mainScrollbarSize
  result[invertedIndex + 2] = otherScrollbarSize

  return result
}
