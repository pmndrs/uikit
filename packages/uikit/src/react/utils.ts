import { ReadonlySignal, Signal, computed, effect } from '@preact/signals-core'
import { useMemo, useEffect, createContext, useContext, useImperativeHandle, ForwardedRef, RefObject } from 'react'
import { Group, Matrix4, Mesh, Vector2Tuple } from 'three'
import { FlexNode, Inset } from '../flex/node.js'
import { WithHover } from '../hover.js'
import { WithResponsive } from '../responsive.js'
import { WithPreferredColorScheme } from '../dark.js'
import { WithActive } from '../active.js'

export type WithConditionals<T> = WithHover<T> & WithResponsive<T> & WithPreferredColorScheme<T> & WithActive<T>

export type ComponentInternals = {
  pixelSize: number
  size: ReadonlySignal<Vector2Tuple>
  center: ReadonlySignal<Vector2Tuple>
  borderInset: ReadonlySignal<Inset>
  paddingInset: ReadonlySignal<Inset>
  scrollPosition?: Signal<Vector2Tuple>
  interactionPanel: Mesh
}

export function useComponentInternals(
  ref: ForwardedRef<ComponentInternals>,
  node: FlexNode,
  interactionPanel: Mesh | RefObject<Mesh>,
  scrollPosition?: Signal<Vector2Tuple>,
): void {
  useImperativeHandle(
    ref,
    () => ({
      borderInset: node.borderInset,
      paddingInset: node.paddingInset,
      pixelSize: node.pixelSize,
      center: node.relativeCenter,
      size: node.size,
      interactionPanel: interactionPanel instanceof Mesh ? interactionPanel : interactionPanel.current!,
      scrollPosition,
    }),
    [interactionPanel, node, scrollPosition],
  )
}

export type LayoutListeners = {
  onSizeChange?: (width: number, height: number) => void
}

export function useLayoutListeners({ onSizeChange }: LayoutListeners, size: Signal<Vector2Tuple>): void {
  const unsubscribe = useMemo(() => {
    if (onSizeChange == null) {
      return undefined
    }
    let first = true
    return effect(() => {
      const s = size.value
      if (first) {
        first = false
        return
      }
      onSizeChange(...s)
    })
  }, [onSizeChange, size])
  useEffect(() => unsubscribe, [unsubscribe])
}

export type ViewportListeners = {
  onIsInViewportChange?: (isInViewport: boolean) => void
}

export function useViewportListeners({ onIsInViewportChange }: ViewportListeners, isClipped: Signal<boolean>) {
  const unsubscribe = useMemo(() => {
    if (onIsInViewportChange == null) {
      return undefined
    }
    let first = true
    return effect(() => {
      const isInViewport = !isClipped.value
      if (first) {
        first = false
        return
      }
      onIsInViewportChange(isInViewport)
    })
  }, [isClipped, onIsInViewportChange])
  useEffect(() => unsubscribe, [unsubscribe])
}

const MatrixContext = createContext<Signal<Matrix4 | undefined>>(null as any)

export const MatrixProvider = MatrixContext.Provider

const RootGroupRefContext = createContext<RefObject<Group>>(null as any)

export function useRootGroupRef() {
  return useContext(RootGroupRefContext)
}

export const RootGroupProvider = RootGroupRefContext.Provider
