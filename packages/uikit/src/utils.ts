import { computed, effect, ReadonlySignal, Signal } from '@preact/signals-core'
import { Object3D, Vector2Tuple, Color, Vector3Tuple, Vector3, Matrix4, Vector4Tuple } from 'three'
import { Inset } from './flex/node.js'
import { BaseOutProperties, Properties } from './properties/index.js'
import { EventHandlersProperties } from './events.js'
import { addActiveHandlers } from './active.js'
import { addHoverHandlers } from './hover.js'
import { AllowedPointerEventsType } from './panel/interaction-panel-mesh.js'
import { Component } from './components/component.js'
import { Container } from './components/container.js'
import { RootContext } from './context.js'
import { writeColor } from './panel/index.js'

export function searchFor<T>(
  from: Component | Object3D,
  _class: { new (...args: Array<any>): T },
  maxSteps: number,
  allowNonUikit = false,
): T | undefined {
  if (from instanceof _class) {
    return from
  }
  let parent: Object3D | undefined | null
  if (from instanceof Component) {
    parent = from.parentContainer.value
  }
  if (allowNonUikit) {
    parent ??= from.parent
  }
  if (maxSteps === 0 || parent == null) {
    return undefined
  }
  return searchFor(parent, _class, maxSteps - 1, allowNonUikit)
}

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

const eventHandlerKeys: Array<keyof EventHandlersProperties> = [
  'onClick',
  'onContextMenu',
  'onDblClick',
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
  starProperties: Properties,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  dynamicHandlers?: Signal<EventHandlersProperties | undefined>,
) {
  return computed(() => {
    const handlers: EventHandlersProperties = {}
    for (const key of eventHandlerKeys) {
      const handler = properties.value[key as keyof EventHandlersProperties]
      if (handler != null) {
        handlers[key] = handler as any
      }
    }
    addHandlers(handlers, dynamicHandlers?.value)
    addHoverHandlers(
      handlers,
      properties,
      hoveredSignal,
      properties.usedConditionals.hover,
      starProperties.usedConditionals.hover,
    )
    addActiveHandlers(
      handlers,
      properties,
      activeSignal,
      properties.usedConditionals.active,
      starProperties.usedConditionals.active,
    )
    return handlers
  })
}

export function computedAncestorsHaveListeners(
  parent: Signal<Container | undefined>,
  handlers: ReadonlySignal<EventHandlersProperties>,
) {
  return computed(
    () => (parent.value?.ancestorsHaveListenersSignal.value ?? false) || Object.keys(handlers.value).length > 0,
  )
}

export function addHandlers(target: EventHandlersProperties, handlers: EventHandlersProperties | undefined): void {
  for (const key in handlers) {
    addHandler(key as keyof EventHandlersProperties, target, handlers[key as keyof EventHandlersProperties])
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
    handler(e)
  }) as T[K]
}

export function setupMatrixWorldUpdate(
  component: Component,
  rootSignal: Signal<RootContext>,
  globalPanelMatrixSignal: Signal<Matrix4 | undefined> | undefined,
  abortSignal: AbortSignal,
): void {
  if (globalPanelMatrixSignal != null) {
    abortableEffect(() => {
      //requesting a render every time the matrix changes
      globalPanelMatrixSignal.value
      rootSignal.peek().requestRender?.()
    }, abortSignal)
  }
  abortableEffect(() => {
    const root = rootSignal.value
    if (root.component === component) {
      return
    }
    const updateMatrixWorld = component.updateWorldMatrix.bind(component, false, true)
    root.onUpdateMatrixWorldSet.add(updateMatrixWorld)
    return () => root.onUpdateMatrixWorldSet.delete(updateMatrixWorld)
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
    component.pointerEvents = component.isVisible.value ? component.properties.value.pointerEvents : 'none'
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

export type ColorRepresentation = Color | string | number | Vector3Tuple | Vector4Tuple

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

export function readReactive<T>(value: T | 'initial' | ReadonlySignal<T | 'initial'>): T {
  value = value instanceof Signal ? value.value : value
  if (value === 'initial') {
    return undefined as T
  }
  return value as T
}

export function computedBorderInset(properties: Properties, keys: ReadonlyArray<string>): Signal<Inset> {
  return computed(() => keys.map((key) => properties.value[key as keyof BaseOutProperties] ?? 0) as Inset)
}

export function withOpacity(
  value: ReadonlySignal<ColorRepresentation> | ColorRepresentation,
  opacity: number | Signal<number>,
) {
  return computed<ColorRepresentation>(() => {
    const result: Vector4Tuple = [0, 0, 0, 0]
    writeColor(result, 0, readReactive(value), readReactive(opacity))
    return result
  })
}

type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never
type IntersectValues<T extends Record<PropertyKey, unknown>> = UnionToIntersection<T[keyof T]>
type RecursivePartial<T> = T extends Signal<unknown> ? T : { [K in keyof T]?: RecursivePartial<T[K]> }
export type UnionizeVariants<T extends Record<PropertyKey, unknown>> = Record<
  keyof T,
  RecursivePartial<IntersectValues<T>>
>

/**
 * assumes component.root.component.parent.matrixWorld and component.root.component.matrix is updated
 */
export function computeWorldToGlobalMatrix(root: Pick<RootContext, 'component'>, target: Matrix4): void {
  const rootComponent = root.component
  if (rootComponent.parent == null) {
    target.copy(rootComponent.matrix)
    return
  }
  target.multiplyMatrices(rootComponent.parent.matrixWorld, rootComponent.matrix)
}
