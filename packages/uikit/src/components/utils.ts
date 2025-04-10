import { ReadonlySignal, Signal, computed } from '@preact/signals-core'
import { BufferGeometry, Color, Material, Matrix4, Mesh, MeshBasicMaterial, Object3D } from 'three'
import { addActiveHandlers } from '../active.js'
import { addHoverHandlers } from '../hover.js'
import { abortableEffect, readReactive } from '../utils.js'
import { FlexNode, FlexNodeState } from '../flex/index.js'
import { ParentContext, RootContext } from '../context.js'
import { EventHandlers } from '../events.js'
import { Properties } from '../properties/index.js'
import { AllowedPointerEventsType } from '../panel/interaction-panel-mesh.js'

export function disposeGroup(object: Object3D | undefined) {
  object?.traverse((mesh) => {
    if (!(mesh instanceof Mesh)) {
      return
    }

    if (mesh.material instanceof Material) {
      mesh.material.dispose()
    }

    if (mesh.geometry instanceof BufferGeometry) {
      mesh.geometry.dispose()
    }
  })
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
  flexState: FlexNodeState,
  isClipped: Signal<boolean> | undefined,
  properties: Properties,
) {
  return computed(
    () =>
      flexState.displayed.value &&
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
  if (!(param instanceof Signal)) {
    fn(param, ...additionals).then((value) => (abortSignal.aborted ? undefined : (target.value = value)))
    return
  }
  abortableEffect(() => {
    let canceled = false
    fn(param.value, ...additionals)
      .then((value) => (canceled ? undefined : (target.value = value)))
      .catch(console.error)
    return () => (canceled = true)
  }, abortSignal)

  if (cleanup != null) {
    abortSignal.addEventListener('abort', () => {
      const { value } = target
      if (value == null) {
        return
      }
      cleanup(value)
    })
  }
}

export function setupNode(
  state: FlexNodeState & {
    root: RootContext
    node: Signal<FlexNode | undefined>
    properties: Properties
  },
  parentContext: ParentContext | undefined,
  object: Object3D,
  objectVisibleDefault: boolean,
  abortSignal: AbortSignal,
) {
  const node = new FlexNode(state, object, objectVisibleDefault, abortSignal)
  if (parentContext != null) {
    abortableEffect(() => {
      const { value: parentNode } = parentContext.node
      if (parentNode == null) {
        return
      }
      parentNode.addChild(node)
      return () => parentNode.removeChild(node)
    }, abortSignal)
  }
  return (state.node.value = node)
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
    addHoverHandlers(handlers, properties, hoveredSignal, properties.conditionals.hover.anyLayers, defaultCursor)
    addActiveHandlers(handlers, properties, activeSignal, properties.conditionals.active.anyLayers)
    return handlers
  })
}

export function computedAncestorsHaveListeners(
  parentContext: ParentContext | undefined,
  handlers: ReadonlySignal<EventHandlers>,
) {
  return computed(
    () => (parentContext?.ancestorsHaveListeners.value ?? false) || Object.keys(handlers.value).length > 0,
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
      if (!(mesh instanceof Mesh)) {
        return
      }
      mesh.renderOrder = renderOrder
      const material: MeshBasicMaterial = mesh.material
      console.log(c, mesh.userData.color)
      material.color.copy(c ?? mesh.userData.color)
      material.opacity = opacity
      material.depthTest = depthTest
      material.depthWrite = depthWrite
    })
  }, abortSignal)
}

export function computeMatrixWorld(
  target: Matrix4,
  localMatrix: Matrix4 | undefined,
  rootObjectMatrixWorld: Matrix4,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
) {
  const globalMatrix = globalMatrixSignal.peek()
  if (globalMatrix == null) {
    return false
  }
  target.multiplyMatrices(rootObjectMatrixWorld, globalMatrix)
  if (localMatrix != null) {
    target.multiply(localMatrix)
  }
  return true
}

export type UpdateMatrixWorldProperties = {
  updateMatrixWorld?: boolean
}

export function setupMatrixWorldUpdate(
  updateMatrixWorld: Signal<boolean> | true,
  updateChildrenMatrixWorld: boolean,
  object: Object3D,
  rootContext: RootContext,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  useOwnMatrix: boolean,
  abortSignal: AbortSignal,
): void {
  abortableEffect(() => {
    if (updateMatrixWorld != true && !updateMatrixWorld.value) {
      return
    }
    const onFrame = () => {
      const rootObject = rootContext.objectRef
      if (object == null || rootObject.current == null) {
        return
      }
      computeMatrixWorld(
        object.matrixWorld,
        useOwnMatrix ? object.matrix : undefined,
        rootObject.current.matrixWorld,
        globalMatrixSignal,
      )
      if (!updateChildrenMatrixWorld) {
        return
      }
      const length = object.children.length
      for (let i = 0; i < length; i++) {
        object.children[i]!.updateMatrixWorld(true)
      }
    }
    rootContext.onUpdateMatrixWorldSet.add(onFrame)
    return () => rootContext.onUpdateMatrixWorldSet.delete(onFrame)
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

export function setupPointerEvents(
  properties: Properties,
  ancestorsHaveListeners: ReadonlySignal<boolean>,
  rootContext: RootContext,
  target: Object3D,
  canHaveNonUikitChildren: boolean,
  abortSignal: AbortSignal,
) {
  if (target == null) {
    return
  }
  target.defaultPointerEvents = 'auto'
  abortableEffect(() => {
    target.ancestorsHaveListeners = ancestorsHaveListeners.value
    target.pointerEvents = properties.get('pointerEvents')
    target.pointerEventsOrder = properties.get('pointerEventsOrder')
    target.pointerEventsType = properties.get('pointerEventsType')
  }, abortSignal)
  abortableEffect(() => {
    if (!canHaveNonUikitChildren && properties.get('pointerEvents') === 'none') {
      return
    }
    const descendants = rootContext.interactableDescendants
    if (descendants == null || target == null) {
      return
    }
    descendants.push(target)
    return () => {
      const index = descendants.indexOf(target)
      if (index === -1) {
        return
      }
      descendants.splice(index, 1)
    }
  }, abortSignal)
}
