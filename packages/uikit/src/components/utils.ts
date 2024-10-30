import { Signal, computed, effect } from '@preact/signals-core'
import { BufferGeometry, Color, Material, Matrix4, Mesh, MeshBasicMaterial, Object3D } from 'three'
import { WithActive, addActiveHandlers } from '../active.js'
import { WithPreferredColorScheme } from '../dark.js'
import { WithHover, addHoverHandlers } from '../hover.js'
import { WithResponsive } from '../responsive.js'
import { ColorRepresentation, Initializers, readReactive } from '../utils.js'
import { FlexNode, FlexNodeState } from '../flex/index.js'
import { ParentContext, Object3DRef, RootContext } from '../context.js'
import { EventHandlers } from '../events.js'
import {
  AllOptionalProperties,
  MergedProperties,
  Properties,
  PropertyTransformers,
  computedInheritableProperty,
} from '../properties/index.js'

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
  initializers: Initializers,
  param: Signal<P> | P,
  ...additionals: A
): void {
  initializers.push((subscriptions) => {
    if (!(param instanceof Signal)) {
      let canceled = false
      fn(param, ...additionals).then((value) => (canceled ? undefined : (target.value = value)))
      subscriptions.push(() => (canceled = true))
      return subscriptions
    }
    subscriptions.push(
      effect(() => {
        let canceled = false
        fn(param.value, ...additionals)
          .then((value) => (canceled ? undefined : (target.value = value)))
          .catch(console.error)
        return () => (canceled = true)
      }),
    )
    if (cleanup != null) {
      subscriptions.push(() => {
        const { value } = target
        if (value == null) {
          return
        }
        cleanup(value)
      })
    }
    return subscriptions
  })
}

export function createNode(
  target: Signal<FlexNode | undefined> | undefined,
  state: FlexNodeState,
  parentContext: ParentContext,
  mergedProperties: Signal<MergedProperties>,
  object: Object3DRef,
  objectVisibleDefault: boolean,
  initializers: Initializers,
) {
  initializers.push((subscriptions) => {
    const node = new FlexNode(
      state,
      mergedProperties,
      parentContext.root.requestCalculateLayout,
      object,
      objectVisibleDefault,
      subscriptions,
    )
    if (target != null) {
      target.value = node
    }
    subscriptions.push(
      effect(() => {
        const parentNode = parentContext.node.value
        if (parentNode == null) {
          return
        }
        parentNode.addChild(node)
        return () => parentNode.removeChild(node)
      }),
    )
    return subscriptions
  })
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

export function computedHandlers(
  style: Signal<Properties | undefined>,
  properties: Signal<Properties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  dynamicHandlers?: Signal<EventHandlers | undefined>,
  defaultCursor?: string,
) {
  return computed(() => {
    const handlers: EventHandlers = {}
    addHandlers(handlers, dynamicHandlers?.value)
    addHoverHandlers(handlers, style.value, properties.value, defaultProperties.value, hoveredSignal, defaultCursor)
    addActiveHandlers(handlers, style.value, properties.value, defaultProperties.value, activeSignal)
    return handlers
  })
}

export function addHandlers(target: EventHandlers, handlers: EventHandlers | undefined) {
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
  initializers: Initializers,
  root: RootContext,
) {
  const color = computedInheritableProperty<ColorRepresentation | undefined>(propertiesSignal, 'color', undefined)
  const opacity = computedInheritableProperty(propertiesSignal, 'opacity', 1)
  initializers.push(() =>
    effect(() => {
      let c: Color | undefined
      if (Array.isArray(color.value)) {
        c = colorHelper.setRGB(...color.value)
      } else if (color.value != null) {
        c = colorHelper.set(color.value)
      }
      readReactive(group)?.traverse((mesh) => {
        if (!(mesh instanceof Mesh)) {
          return
        }
        mesh.renderOrder = root.renderOrder.value
        const material: MeshBasicMaterial = mesh.material
        material.color.copy(c ?? mesh.userData.color)
        material.opacity = opacity.value
        material.depthTest = root.depthTest.value
      })
    }),
  )
}

export function computeMatrixWorld(
  target: Matrix4,
  localMatrix: Matrix4 | undefined,
  rootObjectRef: Object3DRef,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
) {
  const rootObject = rootObjectRef.current
  const globalMatrix = globalMatrixSignal.peek()
  if (rootObject == null || globalMatrix == null) {
    return false
  }
  target.multiplyMatrices(rootObject.matrixWorld, globalMatrix)
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
  objectRef: Object3DRef | Object3D,
  rootContext: RootContext,
  globalMatrixSignal: Signal<Matrix4 | undefined>,
  initializers: Initializers,
  useOwnMatrix: boolean,
): void {
  initializers.push(() =>
    effect(() => {
      if (updateMatrixWorld != true && !updateMatrixWorld.value) {
        return
      }
      const fn = () => {
        const object = objectRef instanceof Object3D ? objectRef : objectRef.current
        if (object == null) {
          return
        }
        computeMatrixWorld(
          object.matrixWorld,
          useOwnMatrix ? object.matrix : undefined,
          rootContext.object,
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
      rootContext.onUpdateMatrixWorldSet.add(fn)
      return () => rootContext.onUpdateMatrixWorldSet.delete(fn)
    }),
  )
}
