import { ReadonlySignal, Signal, computed, effect, signal } from '@preact/signals-core'
import { Matrix4, Mesh, Vector2, Vector2Tuple, Vector3, Vector4Tuple } from 'three'
import { FlexNodeState, Inset } from './flex/node.js'
import { ColorRepresentation, Initializers, computedBorderInset } from './utils.js'
import { ClippingRect } from './clipping.js'
import { clamp } from 'three/src/math/MathUtils.js'
import { PanelProperties, createInstancedPanel } from './panel/instanced-panel.js'
import { ElementType, OrderInfo, computedOrderInfo } from './order.js'
import { computedInheritableProperty } from './properties/utils.js'
import { MergedProperties } from './properties/merged.js'
import { PanelMaterialConfig, createPanelMaterialConfig } from './panel/panel-material.js'
import { PanelGroupManager, defaultPanelDependencies } from './panel/instanced-panel-group.js'
import { Object3DRef, RootContext } from './context.js'
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
  { scrollable, maxScrollPosition }: FlexNodeState,
  object: Object3DRef,
  interactionPanel: Mesh,
  listeners: Signal<ScrollListeners | undefined>,
  root: Pick<RootContext, 'onFrameSet' | 'requestRender' | 'pixelSize' | 'requestFrame'>,
  initializers: Initializers,
) {
  const isScrollable = computed(() => scrollable.value?.some((scrollable) => scrollable) ?? false)

  const downPointerMap = new Map()
  const scrollVelocity = new Vector2()

  const scroll = (
    event: ThreeEvent<WheelEvent | PointerEvent> | undefined,
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
    const [maxX, maxY] = maxScrollPosition.value
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
    const [maxX, maxY] = maxScrollPosition.value

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

    if (Math.abs(scrollVelocity.x) < 10 /** px per second */) {
      scrollVelocity.x = 0
    } else {
      root.requestFrame()
    }

    if (Math.abs(scrollVelocity.y) < 10 /** px per second */) {
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
      if (!isScrollable.value) {
        return
      }
      root.onFrameSet.add(onFrame)
      return () => root.onFrameSet.delete(onFrame)
    }),
  )

  return computed<ScrollEventHandlers | undefined>(() => {
    if (!isScrollable.value) {
      return undefined
    }
    const onPointerFinish = ({ nativeEvent }: ThreeEvent<PointerEvent>) => {
      if (!downPointerMap.delete(nativeEvent.pointerId) || downPointerMap.size > 0 || scrollPosition.value == null) {
        return
      }
      //only request a render if the last pointer that was dragging stopped dragging and this panel is actually scrollable
      root.requestRender()
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
      onPointerUp: onPointerFinish,
      onPointerLeave: onPointerFinish,
      onPointerCancel: onPointerFinish,
      onPointerMove: (event) => {
        const prevInteraction = downPointerMap.get(event.nativeEvent.pointerId)

        if (prevInteraction == null) {
          return
        }
        object.current!.worldToLocal(localPointHelper.copy(event.point))
        distanceHelper.copy(localPointHelper).sub(prevInteraction.point).divideScalar(root.pixelSize.peek())
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
  scrollbarBorderRightWidth?: number
  scrollbarBorderTopWidth?: number
  scrollbarBorderLeftWidth?: number
  scrollbarBorderBottomWidth?: number
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
  initializers: Initializers,
): void {
  const scrollbarOrderInfo = computedOrderInfo(undefined, ElementType.Panel, defaultPanelDependencies, orderInfo)

  const scrollbarWidth = computedInheritableProperty(propertiesSignal, 'scrollbarWidth', 10)

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
  mainIndex: number,
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
      mainIndex,
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
  mainIndex: number,
  otherScrollbarSize: number,
  size: Vector2Tuple | undefined,
  maxScrollbarPosition: Partial<Vector2Tuple>,
  borderInset: Inset | undefined,
  scrollPosition: Vector2Tuple,
) {
  if (size == null || borderInset == null || scrollPosition == null) {
    return undefined
  }

  const maxMainScrollbarPosition = maxScrollbarPosition[mainIndex]
  if (maxMainScrollbarPosition == null) {
    return undefined
  }

  const result: Vector4Tuple = [0, 0, 0, 0]
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
