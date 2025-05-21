import { computed, effect, ReadonlySignal, Signal } from '@preact/signals-core'
import { Vector2Tuple, Color, Vector3Tuple, Vector3, Matrix4, Object3D } from 'three'
import { Inset } from './flex/node.js'
import { BaseOutProperties, Properties } from './properties/index.js'
import { EventHandlers, ThreeEventMap } from './events.js'
import { addActiveHandlers } from './active.js'
import { addHoverHandlers } from './hover.js'
import { OrderInfo } from './order.js'
import {
  AllowedPointerEventsType,
  makeClippedCast,
  makePanelRaycast,
  makePanelSpherecast,
} from './panel/interaction-panel-mesh.js'
import { Component } from './components/component.js'
import { Container } from './components/container.js'
import { RootContext } from './context.js'

export function computedGlobalMatrix(
  parentMatrix: Signal<Matrix4 | undefined>,
  localMatrix: Signal<Matrix4 | undefined>,
): Signal<Matrix4 | undefined> {
  return computed(() => {
    const local = localMatrix.value
    const parent = parentMatrix.value
    if (local == null || parent == null) {
      return undefined
    }
    return parent.clone().multiply(local)
  })
}

export type VisibilityProperties = {
  visibility?: 'visible' | 'hidden'
}

export function computedIsVisible(
  component: Component,
  isClipped: Signal<boolean> | undefined,
  properties: Properties,
) {
  return computed(
    () =>
      component.displayed.value &&
      (isClipped == null || !isClipped?.value) &&
      properties.value.visibility === 'visible',
  )
}

export function loadResourceWithParams<P, R, A extends Array<unknown>>(
  target: Signal<R | undefined>,
  fn: (param: P, ...additional: A) => Promise<R>,
  cleanup: ((value: R) => void) | undefined,
  abortSignal: AbortSignal,
  param: Signal<P> | P,
  ...additionals: A
): void {
  abortableEffect(() => {
    let canceled = false
    let current: R | undefined
    fn(readReactive(param), ...additionals)
      .then((value) => {
        if (!canceled) {
          target.value = current = value
        }
      })
      .catch(console.error)
    return () => {
      canceled = true
      if (current != null && cleanup != null) {
        cleanup(current)
      }
    }
  }, abortSignal)
}

const eventHandlerKeys: Array<keyof EventHandlers> = [
  'onClick',
  'onContextMenu',
  'onDoubleClick',
  'onPointerCancel',
  'onPointerDown',
  'onPointerEnter',
  'onPointerLeave',
  'onPointerMove',
  'onPointerOut',
  'onPointerOver',
  'onPointerUp',
  'onWheel',
]

export function computedHandlers(
  properties: Properties,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  dynamicHandlers?: Signal<EventHandlers | undefined>,
) {
  return computed(() => {
    const handlers: EventHandlers = {}
    for (const key of eventHandlerKeys) {
      const handler = properties.value[key as keyof EventHandlers]
      if (handler != null) {
        handlers[key] = handler as any
      }
    }
    addHandlers(handlers, dynamicHandlers?.value)
    addHoverHandlers(handlers, properties, hoveredSignal, properties.usedConditionals.hover)
    addActiveHandlers(handlers, properties, activeSignal, properties.usedConditionals.active)
    return handlers
  })
}

export function computedAncestorsHaveListeners(
  parent: Signal<Container | undefined>,
  handlers: ReadonlySignal<EventHandlers>,
) {
  return computed(
    () => (parent.value?.ancestorsHaveListenersSignal.value ?? false) || Object.keys(handlers.value).length > 0,
  )
}

export function addHandlers(target: EventHandlers, handlers: EventHandlers | undefined): void {
  for (const key in handlers) {
    addHandler(key as keyof EventHandlers, target, handlers[key as keyof EventHandlers])
  }
}

export function addHandler<T extends { [Key in string]?: (e: any) => void }, K extends keyof T>(
  key: K,
  target: T,
  handler: T[K],
): void {
  if (handler == null) {
    return
  }
  const existingHandler = target[key]
  if (existingHandler == null) {
    target[key] = handler
    return
  }
  target[key] = ((e) => {
    existingHandler(e as any)
    if ('stopped' in e && e.stopped) {
      return
    }
    handler(e)
  }) as T[K]
}

export function computeMatrixWorld(
  target: Matrix4,
  rootObjectParentMatrixWorld: Matrix4 | undefined,
  globalMatrix: Matrix4 | undefined,
) {
  if (globalMatrix == null) {
    return false
  }
  if (rootObjectParentMatrixWorld == null) {
    target.copy(globalMatrix)
  } else {
    target.multiplyMatrices(rootObjectParentMatrixWorld, globalMatrix)
  }
  return true
}

export function setupMatrixWorldUpdate(
  object: Object3D,
  rootSignal: Signal<RootContext>,
  matrixSignal: Signal<Matrix4 | undefined>,
  abortSignal: AbortSignal,
): void {
  abortableEffect(() => {
    //requesting a render every time the matrix changes
    matrixSignal.value
    rootSignal.peek().requestRender?.()
  }, abortSignal)
  abortableEffect(() => {
    const onFrame = () => {
      computeMatrixWorld(object.matrixWorld, rootSignal.peek().component.parent?.matrixWorld, matrixSignal.peek())
      const length = object.children.length
      for (let i = 0; i < length; i++) {
        object.children[i]!.updateMatrixWorld(true)
      }
    }
    const root = rootSignal.value
    root.onUpdateMatrixWorldSet.add(onFrame)
    return () => root.onUpdateMatrixWorldSet.delete(onFrame)
  }, abortSignal)
}

export type OutgoingDefaultProperties = {
  renderOrder: ReadonlySignal<number>
  depthTest: ReadonlySignal<boolean>
  depthWrite: ReadonlySignal<boolean>
  pointerEvents: ReadonlySignal<'none' | 'auto' | 'listener'>
  pointerEventsType: ReadonlySignal<AllowedPointerEventsType>
  pointerEventsOrder: ReadonlySignal<number>
}

export function setupPointerEvents(component: Component, canHaveNonUikitChildren: boolean) {
  component.defaultPointerEvents = 'auto'
  abortableEffect(() => {
    component.ancestorsHaveListeners = component.ancestorsHaveListenersSignal.value
    component.pointerEvents = component.properties.value.pointerEvents
    component.pointerEventsOrder = component.properties.value.pointerEventsOrder
    component.pointerEventsType = component.properties.value.pointerEventsType
  }, component.abortSignal)
  abortableEffect(() => {
    const rootComponent = component.root.value.component
    component.intersectChildren = canHaveNonUikitChildren || rootComponent === component

    if (!canHaveNonUikitChildren && component.properties.value.pointerEvents === 'none') {
      return
    }
    if (rootComponent === component) {
      //we must not add the component itself to its interactable descendants
      return
    }
    rootComponent.interactableDescendants ??= []
    const interactableDescendants = rootComponent.interactableDescendants
    interactableDescendants.push(component)
    return () => {
      const index = interactableDescendants.indexOf(component)
      if (index === -1) {
        return
      }
      interactableDescendants.splice(index, 1)
    }
  }, component.abortSignal)
}

export function buildRaycasting(
  component: Component,
  root: Signal<RootContext>,
  globalPanelMatrix: Signal<Matrix4 | undefined>,
  parent: Signal<Container | undefined>,
  orderInfo: Signal<OrderInfo | undefined>,
) {
  component.raycast = makeClippedCast(
    component,
    makePanelRaycast(component.raycast.bind(component), root, component.boundingSphere, globalPanelMatrix, component),
    root,
    parent,
    orderInfo,
  )
  component.spherecast = makeClippedCast(
    component,
    makePanelSpherecast(root, component.boundingSphere, globalPanelMatrix, component),
    root,
    parent,
    orderInfo,
  )
}

export const percentageRegex = /(-?\d+(?:\.\d+)?)%/

export type ColorRepresentation = Color | string | number | Vector3Tuple

export function abortableEffect(fn: Parameters<typeof effect>[0], abortSignal: AbortSignal): void {
  if (abortSignal.aborted) {
    return
  }
  const unsubscribe = effect(fn)
  abortSignal.addEventListener('abort', unsubscribe)
}

export const alignmentXMap = { left: 0.5, center: 0, middle: 0, right: -0.5 }
export const alignmentYMap = { top: -0.5, center: 0, middle: 0, bottom: 0.5 }
export const alignmentZMap = { back: -0.5, center: 0, middle: 0, front: 0.5 }

/**
 * calculates the offsetX, offsetY, and scale to fit content with size [aspectRatio, 1] inside
 */
export function fitNormalizedContentInside(
  offsetTarget: Vector3,
  scaleTarget: Vector3,
  size: Signal<Vector2Tuple | undefined>,
  paddingInset: Signal<Inset | undefined>,
  borderInset: Signal<Inset | undefined>,
  pixelSize: number,
  aspectRatio: number,
): void {
  if (size.value == null || paddingInset.value == null || borderInset.value == null) {
    return
  }
  const [width, height] = size.value
  const [pTop, pRight, pBottom, pLeft] = paddingInset.value
  const [bTop, bRight, bBottom, bLeft] = borderInset.value
  const topInset = pTop + bTop
  const rightInset = pRight + bRight
  const bottomInset = pBottom + bBottom
  const leftInset = pLeft + bLeft
  offsetTarget.set((leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, 0)

  const innerWidth = width - leftInset - rightInset
  const innerHeight = height - topInset - bottomInset
  const flexRatio = innerWidth / innerHeight
  if (flexRatio > aspectRatio) {
    scaleTarget.setScalar(innerHeight * pixelSize)
    return
  }
  scaleTarget.setScalar((innerWidth * pixelSize) / aspectRatio)
}

export function readReactive<T>(value: T | Signal<T>): T {
  return value instanceof Signal ? value.value : value
}

export function computedBorderInset(properties: Properties, keys: ReadonlyArray<string>): Signal<Inset> {
  return computed(
    () => keys.map((key) => properties.value[key as keyof BaseOutProperties<ThreeEventMap>] ?? 0) as Inset,
  )
}
