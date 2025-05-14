import { ReadonlySignal, Signal, computed } from '@preact/signals-core'
import { Color, Matrix4, Mesh, MeshBasicMaterial, Object3D } from 'three'
import { addActiveHandlers } from '../active.js'
import { addHoverHandlers } from '../hover.js'
import { abortableEffect, readReactive } from '../utils.js'
import { EventHandlers } from '../events.js'
import { Properties } from '../properties/index.js'
import {
  AllowedPointerEventsType,
  makeClippedCast,
  makePanelRaycast,
  makePanelSpherecast,
} from '../panel/interaction-panel-mesh.js'
import { RootContext } from './root.js'
import { Component } from '../vanilla/component.js'
import { OrderInfo } from '../order.js'
import { Container } from '../vanilla/container.js'

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
      properties.get('visibility') === 'visible',
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
  defaultCursor?: string,
) {
  return computed(() => {
    const handlers: EventHandlers = {}
    for (const key of eventHandlerKeys) {
      const handler = properties.get(key as keyof EventHandlers)
      if (handler != null) {
        handlers[key] = handler as any
      }
    }
    addHandlers(handlers, dynamicHandlers?.value)
    addHoverHandlers(handlers, properties, hoveredSignal, properties.usedConditionals.hover, defaultCursor)
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

const colorHelper = new Color()

/**
 * @requires that each mesh inside the group has its default color stored inside object.userData.color
 */
export function applyAppearancePropertiesToGroup(
  properties: Properties,
  group: Signal<Object3D | undefined> | Object3D,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    const color = properties.get('color')
    let c: Color | undefined
    if (Array.isArray(color)) {
      c = colorHelper.setRGB(...color)
    } else if (color != null) {
      c = colorHelper.set(color)
    }
    const opacity = properties.get('opacity')
    const depthTest = properties.get('depthTest')
    const depthWrite = properties.get('depthWrite')
    const renderOrder = properties.get('renderOrder')
    readReactive(group)?.traverse((mesh) => {
      if (!(mesh instanceof Mesh && mesh.userData.color != null)) {
        return
      }
      mesh.renderOrder = renderOrder
      const material: MeshBasicMaterial = mesh.material
      material.color.copy(c ?? mesh.userData.color)
      material.opacity = opacity
      material.depthTest = depthTest
      material.depthWrite = depthWrite
    })
  }, abortSignal)
}

export function computeMatrixWorld(
  target: Matrix4,
  rootObjectParentMatrixWorld: Matrix4,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
) {
  const globalMatrix = globalMatrixSignal.peek()
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

export type UpdateMatrixWorldProperties = {
  updateMatrixWorld?: boolean
}

export function setupMatrixWorldUpdate(
  updateMatrixWorld: true | 'recursive' | Signal<boolean>,
  object: Object3D,
  rootContext: Signal<RootContext>,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  abortSignal: AbortSignal,
): void {
  abortableEffect(() => {
    if (updateMatrixWorld instanceof Signal && !updateMatrixWorld.value) {
      return
    }
    const onFrame = () => {
      const rootObject = rootContext.peek().component
      if (object == null) {
        return
      }
      computeMatrixWorld(object.matrixWorld, rootObject.matrixWorld, globalMatrixSignal)
      if (updateMatrixWorld != 'recursive') {
        return
      }
      const length = object.children.length
      for (let i = 0; i < length; i++) {
        object.children[i]!.updateMatrixWorld(true)
      }
    }
    rootContext.peek().onUpdateMatrixWorldSet.add(onFrame)
    return () => rootContext.peek().onUpdateMatrixWorldSet.delete(onFrame)
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
    component.pointerEvents = component.properties.get('pointerEvents')
    component.pointerEventsOrder = component.properties.get('pointerEventsOrder')
    component.pointerEventsType = component.properties.get('pointerEventsType')
  }, component.abortSignal)
  abortableEffect(() => {
    const rootComponent = component.root.value.component
    component.intersectChildren = canHaveNonUikitChildren || rootComponent === component

    if (!canHaveNonUikitChildren && component.properties.get('pointerEvents') === 'none') {
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
