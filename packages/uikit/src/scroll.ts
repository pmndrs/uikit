import { ReadonlySignal, Signal, computed, effect, signal } from '@preact/signals-core'
import { EventHandlers, ThreeEvent } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { Group, Matrix4, MeshBasicMaterial, Object3D, Vector2, Vector2Tuple, Vector3, Vector4Tuple } from 'three'
import { FlexNode, Inset } from './flex/node.js'
import { Color as ColorRepresentation, useFrame } from '@react-three/fiber'
import { Subscriptions } from './utils.js'
import { GetInstancedPanelGroup, PanelGroupDependencies } from './panel/react.js'
import { ClippingRect } from './clipping.js'
import { clamp } from 'three/src/math/MathUtils.js'
import { InstancedPanel, PanelProperties } from './panel/instanced-panel.js'
import { ElementType, OrderInfo, computeOrderInfo } from './order.js'
import { createGetBatchedProperties } from './properties/batched.js'
import { MergedProperties } from './properties/merged.js'
import { MaterialClass } from './panel/panel-material.js'
import { WithReactive } from './properties/default.js'

const distanceHelper = new Vector3()
const localPointHelper = new Vector3()

export type ScrollEventHandlers = Pick<
  EventHandlers,
  'onPointerDown' | 'onPointerUp' | 'onPointerMove' | 'onWheel' | 'onPointerLeave'
>

export type ScrollListeners = {
  onScroll?: (scrollX: number, scrollY: number, event?: ThreeEvent<WheelEvent | PointerEvent>) => void
}

export function createScrollPosition() {
  return signal<Vector2Tuple>([0, 0])
}

export function computeGlobalScrollMatrix(
  scrollPosition: Signal<Vector2Tuple>,
  node: FlexNode,
  globalMatrix: Signal<Matrix4 | undefined>,
) {
  return computed(() => {
    const global = globalMatrix.value
    if (global == null) {
      return undefined
    }
    const [scrollX, scrollY] = scrollPosition.value
    const { pixelSize } = node
    return new Matrix4().makeTranslation(-scrollX * pixelSize, scrollY * pixelSize, 0).premultiply(global)
  })
}

export function setupScrollGroup(node: FlexNode, scrollPosition: Signal<Vector2Tuple>, ref: { current: Object3D }) {
  return effect(() => {
    const [scrollX, scrollY] = scrollPosition.value
    const { pixelSize } = node
    ref.current?.position.set(-scrollX * pixelSize, scrollY * pixelSize, 0)
    ref.current?.updateMatrix()
  })
}

export function setupScrollHandler(
  node: FlexNode,
  scrollPosition: Signal<Vector2Tuple>,
  ref: { current: Object3D },
  onScrollRef: { current: ScrollListeners['onScroll'] },
  onFrames: Array<(delta: number) => void>,
): Signal<EventHandlers> {
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
    if (wasScrolledX && wasScrolledY) {
      return
    }
    const [x, y] = scrollPosition.value
    const [maxX, maxY] = node.maxScrollPosition.value
    let [newX, newY] = scrollPosition.value
    const [ancestorScrollableX, ancestorScrollableY] = node.anyAncestorScrollable?.value ?? [false, false]
    if (!wasScrolledX) {
      newX = computeScroll(x, maxX, deltaX, enableRubberBand && !ancestorScrollableX)
    }
    if (!wasScrolledY) {
      newY = computeScroll(y, maxY, deltaY, enableRubberBand && !ancestorScrollableY)
    }
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
    if (x != newX || y != newY) {
      scrollPosition.value = [newX, newY]
      onScrollRef.current?.(...scrollPosition.value, event)
    }
  }

  onFrames.push((deltaTime) => {
    if (downPointerMap.size > 0) {
      return
    }

    let deltaX = 0
    let deltaY = 0
    const [x, y] = scrollPosition.value
    const [maxX, maxY] = node.maxScrollPosition.value

    deltaX += outsideDistance(x, 0, maxX ?? 0) * -0.3
    deltaY += outsideDistance(y, 0, maxY ?? 0) * -0.3

    deltaX += scrollVelocity.x * deltaTime
    deltaY += scrollVelocity.y * deltaTime

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
  })

  return computed(() => {
    if (!isScrollable.value) {
      return {}
    }
    return {
      onPointerDown: (event) => {
        let interaction = downPointerMap.get(event.pointerId)
        if (interaction == null) {
          downPointerMap.set(event.pointerId, (interaction = { timestamp: 0, point: new Vector3() }))
        }
        interaction.timestamp = performance.now() / 1000
        ref.current!.worldToLocal(interaction.point.copy(event.point))
      },
      onPointerUp: (event) => downPointerMap.delete(event.pointerId),
      onPointerLeave: (event) => downPointerMap.delete(event.pointerId),
      onPointerCancel: (event) => downPointerMap.delete(event.pointerId),
      onContextMenu: (e) => e.nativeEvent.preventDefault(),
      onPointerMove: (event) => {
        const prevInteraction = downPointerMap.get(event.pointerId)

        if (prevInteraction == null) {
          return
        }
        ref.current!.worldToLocal(localPointHelper.copy(event.point))
        distanceHelper.copy(localPointHelper).sub(prevInteraction.point).divideScalar(node.pixelSize)
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
        scroll(event, event.deltaX, event.deltaY, undefined, false)
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

export type ScrollbarProperties = {
  scrollbarPanelMaterialClass?: MaterialClass
} & WithReactive<
  {
    scrollbarWidth?: number
    scrollbarOpacity?: number
    scrollbarColor?: ColorRepresentation
    scrollbarBorderRight?: number
    scrollbarBorderTop?: ColorRepresentation
    scrollbarBorderLeft?: ColorRepresentation
    scrollbarBorderBottom?: ColorRepresentation
  } & {
    [Key in `scrollbar${Capitalize<
      keyof Omit<PanelProperties, 'backgroundColor' | 'backgroundOpacity'>
    >}`]: PanelProperties
  }
>

const scrollbarPanelPropertyRename = {
  scrollbarColor: 'backgroundColor',
  scrollbarBorderBottomLeftRadius: 'borderBottomLeftRadius',
  scrollbarBorderBottomRightRadius: 'borderBottomRightRadius',
  scrollbarBorderTopRightRadius: 'borderTopRightRadius',
  scrollbarBorderTopLeftRadius: 'borderTopLeftRadius',
  scrollbarBorderColor: 'borderColor',
  scrollbarBorderBend: 'borderBend',
  scrollbarBorderOpacity: 'borderOpacity',
  scrollbarOpacity: 'backgroundOpacity',
}

const scrollbarWidthPropertyKeys = ['scrollbarWidth']

const scrollbarBorderPropertyKeys = [
  'scrollbarBorderLeft',
  'scrollbarBorderRight',
  'scrollbarBorderTop',
  'scrollbarBorderBottom',
]

export function createScrollbars(
  propertiesSignal: Signal<MergedProperties>,
  scrollPosition: Signal<Vector2Tuple>,
  node: FlexNode,
  globalMatrix: Signal<Matrix4 | undefined>,
  isClipped: Signal<boolean> | undefined,
  materialClass: MaterialClass | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo>,
  getGroup: GetInstancedPanelGroup,
  subscriptions: Subscriptions,
): void {
  const groupDeps: PanelGroupDependencies = {
    materialClass: materialClass ?? MeshBasicMaterial,
    castShadow: false,
    receiveShadow: false,
  }
  const scrollbarOrderInfo = computeOrderInfo(propertiesSignal, ElementType.Panel, groupDeps, orderInfo)

  const getScrollbarWidth = createGetBatchedProperties(propertiesSignal, scrollbarWidthPropertyKeys)
  const getBorder = createGetBatchedProperties(propertiesSignal, scrollbarBorderPropertyKeys)
  const borderSize = computed(() => scrollbarBorderPropertyKeys.map((key) => (getBorder(key) as number) ?? 0) as Inset)

  createScrollbar(
    propertiesSignal,
    0,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    materialClass,
    parentClippingRect,
    scrollbarOrderInfo,
    getGroup,
    getScrollbarWidth,
    borderSize,
    subscriptions,
  )
  createScrollbar(
    propertiesSignal,
    1,
    scrollPosition,
    node,
    globalMatrix,
    isClipped,
    materialClass,
    parentClippingRect,
    scrollbarOrderInfo,
    getGroup,
    getScrollbarWidth,
    borderSize,
    subscriptions,
  )

  //TODO: setting the scrollbar color and opacity default for all property managers of the instanced panel
  /*const collectionLength = collection.length
  for (let i = startIndex; i < collectionLength; i++) {
    collection[i].add('scrollbarColor', 0xffffff)
    collection[i].add('scrollbarOpacity', 1)
  }*/
}

function createScrollbar(
  propertiesSignal: Signal<MergedProperties>,
  mainIndex: number,
  scrollPosition: Signal<Vector2Tuple>,
  node: FlexNode,
  globalMatrix: Signal<Matrix4 | undefined>,
  panelGroupDependencies: Signal<PanelGroupDependencies>,
  isClipped: Signal<boolean> | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: Signal<OrderInfo>,
  getGroup: GetInstancedPanelGroup,
  get: (key: string) => unknown,
  borderSize: ReadonlySignal<Inset>,
  subscriptions: Subscriptions,
) {
  const scrollbarTransformation = computed(() => {
    return computeScrollbarTransformation(
      mainIndex,
      (get('scrollbarWidth') as number) ?? 10,
      node.size.value,
      node.maxScrollPosition.value,
      node.borderInset.value,
      scrollPosition.value,
    )
  })
  const scrollbarPosition = computed(() => (scrollbarTransformation.value?.slice(0, 2) ?? [0, 0]) as Vector2Tuple)
  const scrollbarSize = computed(() => (scrollbarTransformation.value?.slice(2, 4) ?? [0, 0]) as Vector2Tuple)

  subscriptions.push(
    effect(() => {
      const panel = new InstancedPanel(
        propertiesSignal,
        getGroup,
        orderInfo,
        panelGroupDependencies,
        globalMatrix,
        scrollbarSize,
        scrollbarPosition,
        borderSize,
        parentClippingRect,
        isClipped,
        subscriptions,
        scrollbarPanelPropertyRename,
      )
    }),
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
