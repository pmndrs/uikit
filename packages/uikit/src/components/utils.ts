import { ReadonlySignal, Signal, computed, effect } from '@preact/signals-core'
import { BufferGeometry, Color, Material, Matrix4, Mesh, MeshBasicMaterial, Object3D } from 'three'
import { WithActive, addActiveHandlers } from '../active.js'
import { WithPreferredColorScheme } from '../dark.js'
import { WithHover, addHoverHandlers } from '../hover.js'
import { WithResponsive } from '../responsive.js'
import { abortableEffect, ColorRepresentation, readReactive } from '../utils.js'
import { FlexNode, FlexNodeState } from '../flex/index.js'
import { ParentContext, RootContext } from '../context.js'
import { EventHandlers } from '../events.js'
import {
  AllOptionalProperties,
  MergedProperties,
  Properties,
  PropertyTransformers,
  computedInheritableProperty,
} from '../properties/index.js'
import { AllowedPointerEventsType, PointerEventsProperties } from '../internals.js'

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
  mergedProperties: Signal<MergedProperties>,
) {
  return computed(
    () =>
      flexState.displayed.value &&
      (isClipped == null || !isClipped?.value) &&
      mergedProperties.value.read<VisibilityProperties['visibility']>('visibility', 'visible') === 'visible',
  )
}

export type WithConditionals<T> = WithHover<T> & WithResponsive<T> & WithPreferredColorScheme<T> & WithActive<T>

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
    mergedProperties: Signal<MergedProperties>
  },
  parentContext: ParentContext | undefined,
  object: Object3D,
  objectVisibleDefault: boolean,
  abortSignal: AbortSignal,
) {
  const node = new FlexNode(state, state.mergedProperties, object, objectVisibleDefault, abortSignal)
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

const signalMap = new Map<unknown, Signal<undefined | null>>()
export const keepAspectRatioPropertyTransformer: PropertyTransformers = {
  keepAspectRatio: (value, target) => {
    let signal = signalMap.get(value)
    if (signal == null) {
      //if keep aspect ratio is "false" => we write "null" => which overrides the previous properties and returns null
      signalMap.set(value, (signal = computed(() => (readReactive(value) === false ? null : undefined))))
    }
    target.add('aspectRatio', signal)
  },
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
  style: Signal<Properties | undefined>,
  propertiesSignal: Signal<Properties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  dynamicHandlers?: Signal<EventHandlers | undefined>,
  defaultCursor?: string,
) {
  return computed(() => {
    const handlers: EventHandlers = {}
    const properties = propertiesSignal.value
    if (properties != null) {
      for (const key of eventHandlerKeys) {
        const handler = properties[key]
        if (handler != null) {
          handlers[key] = handler as any
        }
      }
    }
    addHandlers(handlers, dynamicHandlers?.value)
    addHoverHandlers(
      handlers,
      style.value,
      propertiesSignal.value,
      defaultProperties.value,
      hoveredSignal,
      defaultCursor,
    )
    addActiveHandlers(handlers, style.value, propertiesSignal.value, defaultProperties.value, activeSignal)
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

export function computedMergedProperties(
  style: Signal<Properties | undefined>,
  properties: Signal<Properties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  postTransformers: PropertyTransformers,
  preTransformers?: PropertyTransformers,
  onInit?: (merged: MergedProperties) => void,
) {
  return computed(() => {
    const merged = new MergedProperties(preTransformers)
    onInit?.(merged)
    merged.addAll(style.value, properties.value, defaultProperties.value, postTransformers)
    return merged
  })
}

const colorHelper = new Color()

/**
 * @requires that each mesh inside the group has its default color stored inside object.userData.color
 */
export function applyAppearancePropertiesToGroup(
  propertiesSignal: Signal<MergedProperties>,
  group: Signal<Object3D | undefined> | Object3D,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    const properties = propertiesSignal.value
    const color = properties.read<ColorRepresentation | undefined>('color', undefined)
    let c: Color | undefined
    if (Array.isArray(color)) {
      c = colorHelper.setRGB(...color)
    } else if (color != null) {
      c = colorHelper.set(color)
    }
    const opacity = properties.read('opacity', 1)
    const depthTest = properties.read('depthTest', true)
    const depthWrite = properties.read('depthWrite', false)
    const renderOrder = properties.read('renderOrder', 0)
    readReactive(group)?.traverse((mesh) => {
      if (!(mesh instanceof Mesh)) {
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
        object.children[i].updateMatrixWorld(true)
      }
    }
    rootContext.onUpdateMatrixWorldSet.add(onFrame)
    return () => rootContext.onUpdateMatrixWorldSet.delete(onFrame)
  }, abortSignal)
}

export function computeDefaultProperties(propertiesSignal: Signal<MergedProperties>) {
  return {
    pointerEvents: computedInheritableProperty<PointerEventsProperties['pointerEvents']>(
      propertiesSignal,
      'pointerEvents',
      undefined,
    ),
    pointerEventsOrder: computedInheritableProperty<PointerEventsProperties['pointerEventsOrder']>(
      propertiesSignal,
      'pointerEventsOrder',
      undefined,
    ),
    pointerEventsType: computedInheritableProperty<PointerEventsProperties['pointerEventsType']>(
      propertiesSignal,
      'pointerEventsType',
      undefined,
    ),
    renderOrder: computedInheritableProperty(propertiesSignal, 'renderOrder', 0),
    depthTest: computedInheritableProperty(propertiesSignal, 'depthTest', true),
    depthWrite: computedInheritableProperty(propertiesSignal, 'depthWrite', false),
  }
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
  propertiesSignal: Signal<MergedProperties>,
  ancestorsHaveListeners: ReadonlySignal<boolean>,
  rootContext: RootContext,
  target: Object3D,
  canHaveNonUikitChildren: boolean,
  abortSignal: AbortSignal,
) {
  if (target == null) {
    return
  }
  const properties = propertiesSignal.value
  target.defaultPointerEvents = 'auto'
  abortableEffect(() => {
    target.ancestorsHaveListeners = ancestorsHaveListeners.value
    target.pointerEvents = properties.read<PointerEventsProperties['pointerEvents']>('pointerEvents', undefined)
    target.pointerEventsOrder = properties.read<PointerEventsProperties['pointerEventsOrder']>(
      'pointerEventsOrder',
      undefined,
    )
    target.pointerEventsType = properties.read<PointerEventsProperties['pointerEventsType']>(
      'pointerEventsType',
      undefined,
    )
  }, abortSignal)
  abortableEffect(() => {
    if (
      !canHaveNonUikitChildren &&
      propertiesSignal.value.read<PointerEventsProperties['pointerEvents']>('pointerEvents', undefined) === 'none'
    ) {
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
