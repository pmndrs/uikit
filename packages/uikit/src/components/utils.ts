import { Signal, computed, effect } from '@preact/signals-core'
import { Color, Matrix4, Mesh, MeshBasicMaterial, Object3D } from 'three'
import { WithActive, addActiveHandlers } from '../active.js'
import { WithPreferredColorScheme } from '../dark.js'
import { WithHover, addHoverHandlers } from '../hover.js'
import { WithResponsive } from '../responsive.js'
import { ColorRepresentation, Subscriptions, readReactive } from '../utils.js'
import {
  AllOptionalProperties,
  EventHandlers,
  MergedProperties,
  Object3DRef,
  Properties,
  PropertyTransformers,
  ParentContext,
  computedProperty,
} from '../internals.js'

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

export type WithConditionals<T> = WithHover<T> & WithResponsive<T> & WithPreferredColorScheme<T> & WithActive<T>

export function loadResourceWithParams<P, R, A extends Array<unknown>>(
  target: Signal<R | undefined>,
  fn: (param: P, ...additional: A) => Promise<R>,
  subscriptions: Subscriptions,
  param: Signal<P> | P,
  ...additionals: A
): void {
  if (!(param instanceof Signal)) {
    let canceled = false
    fn(param, ...additionals).then((value) => (canceled ? undefined : (target.value = value)))
    subscriptions.push(() => (canceled = true))
    return
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
}

export function createNode(
  parentContext: ParentContext,
  mergedProperties: Signal<MergedProperties>,
  object: Object3DRef,
  subscriptions: Subscriptions,
) {
  const node = parentContext.node.createChild(mergedProperties, object, subscriptions)
  parentContext.node.addChild(node)
  subscriptions.push(() => {
    parentContext.node.removeChild(node)
    node.destroy()
  })
  return node
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
  properties: Signal<Properties>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  dynamicHandlers?: Signal<EventHandlers | undefined>,
  defaultCursor?: string,
) {
  return computed(() => {
    const handlers: EventHandlers = {}
    addHandlers(handlers, dynamicHandlers?.value)
    addHoverHandlers(handlers, properties.value, defaultProperties.value, hoveredSignal, defaultCursor)
    addActiveHandlers(handlers, properties.value, defaultProperties.value, activeSignal)
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
  properties: Signal<Properties>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  postTransformers: PropertyTransformers,
  preTransformers?: PropertyTransformers,
  onInit?: (merged: MergedProperties) => void,
) {
  return computed(() => {
    const merged = new MergedProperties(preTransformers)
    onInit?.(merged)
    merged.addAll(defaultProperties.value, properties.value, postTransformers)
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
  subscriptions: Subscriptions,
) {
  const color = computedProperty<ColorRepresentation | undefined>(propertiesSignal, 'color', undefined)
  const opacity = computedProperty(propertiesSignal, 'opacity', 1)
  subscriptions.push(
    effect(() => {
      let c: Color | undefined
      if (Array.isArray(color.value)) {
        c = colorHelper.setRGB(...color.value)
      } else if (color.value != null) {
        c = colorHelper.set(color.value)
      }
      readReactive(group)?.traverse((object) => {
        if (!(object instanceof Mesh)) {
          return
        }
        const material: MeshBasicMaterial = object.material
        material.color.copy(c ?? object.userData.color)
        material.opacity = opacity.value
      })
    }),
  )
}
