import { RefObject, createContext, useContext, useEffect, useMemo } from 'react'
import { computed, effect, Signal, signal } from '@preact/signals-core'
import { Vector2Tuple, BufferAttribute, Color, Group } from 'three'
import { Color as ColorRepresentation } from '@react-three/fiber'
import { Inset } from './flex/node.js'
import { ManagerCollection, Properties } from './properties/utils.js'

export const alignmentXMap = { left: 0.5, center: 0, right: -0.5 }
export const alignmentYMap = { top: -0.5, center: 0, bottom: 0.5 }
export const alignmentZMap = { back: -0.5, center: 0, front: 0.5 }

export function useSignalEffect(fn: () => (() => void) | void, deps: Array<any>) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const unsubscribe = useMemo(() => effect(fn), deps)
  useEffect(() => unsubscribe, [unsubscribe])
}

export function useResource<R>(fn: () => Promise<R>, deps: Array<any>): Signal<R | undefined> {
  const result = useMemo(() => signal<R | undefined>(undefined), [])
  useEffect(() => {
    fn().then((value) => (result.value = value))
    return
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return result
}

export function useResourceWithParams<P, R, A extends Array<unknown>>(
  fn: (param: P, ...additional: A) => Promise<R>,
  param: Signal<P> | P,
  ...additionals: A
): Signal<R | undefined> {
  const result = useMemo(() => signal<R | undefined>(undefined), [])
  useEffect(() => {
    if (!(param instanceof Signal)) {
      fn(param, ...additionals).then((value) => (result.value = value))
      return
    }
    return effect(() =>
      fn(param.value, ...additionals)
        .then((value) => (result.value = value))
        .catch(console.error),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [param, ...additionals])
  return result
}

/**
 * calculates the offsetX, offsetY, and scale to fit content with size [aspectRatio, 1] inside
 */
export function fitNormalizedContentInside(
  size: Signal<Vector2Tuple>,
  paddingInset: Signal<Inset>,
  borderInset: Signal<Inset>,
  pixelSize: number,
  aspectRatio: number,
): [offsetX: number, offsetY: number, scale: number] {
  const [width, height] = size.value
  const [pTop, pRight, pBottom, pLeft] = paddingInset.value
  const [bTop, bRight, bBottom, bLeft] = borderInset.value
  const topInset = pTop + bTop
  const rightInset = pRight + bRight
  const bottomInset = pBottom + bBottom
  const leftInset = pLeft + bLeft

  const innerWidth = width - leftInset - rightInset
  const innerHeight = height - topInset - bottomInset
  const flexRatio = innerWidth / innerHeight
  let scaling = 1
  if (flexRatio > aspectRatio) {
    scaling = innerHeight * pixelSize
  } else {
    scaling = (innerWidth * pixelSize) / aspectRatio
  }
  return [(leftInset - rightInset) * 0.5 * pixelSize, (bottomInset - topInset) * 0.5 * pixelSize, scaling]
}

const colorHelper = new Color()

export function colorToBuffer(buffer: BufferAttribute, index: number, color: ColorRepresentation, offset = 0): void {
  const bufferIndex = index * buffer.itemSize + offset
  buffer.addUpdateRange(bufferIndex, 3)
  if (Array.isArray(color)) {
    buffer.set(color, bufferIndex)
  } else {
    colorHelper.set(color)
    colorHelper.toArray(buffer.array, bufferIndex)
  }
  buffer.needsUpdate = true
}

export function readReactive<T>(value: T | Signal<T>): T {
  return value instanceof Signal ? value.value : value
}

const RootGroupRefContext = createContext<RefObject<Group>>(null as any)

export function useRootGroupRef() {
  return useContext(RootGroupRefContext)
}

export const RootGroupProvider = RootGroupRefContext.Provider

export function createConditionalPropertyTranslator(
  condition: () => boolean,
): (collection: ManagerCollection, properties: Properties) => void {
  const signalMap = new Map<unknown, Signal<unknown>>()
  return (collection, properties) => {
    const collectionLength = collection.length
    for (const key in properties) {
      const value = properties[key]
      if (value === undefined) {
        return
      }
      let result = signalMap.get(value)
      if (result == null) {
        signalMap.set(value, (result = computed(() => (condition() ? readReactive(value) : undefined))))
      }
      for (let i = 0; i < collectionLength; i++) {
        collection[i].add(key, result)
      }
    }
  }
}
