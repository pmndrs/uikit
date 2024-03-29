import { ReadonlySignal, Signal, computed, effect } from '@preact/signals-core'
import {
  useMemo,
  useEffect,
  createContext,
  useContext,
  useImperativeHandle,
  ForwardedRef,
  RefObject,
  ReactNode,
} from 'react'
import { Matrix4, Mesh, Vector2Tuple } from 'three'
import { FlexNode, Inset } from '../flex/node.js'
import { WithHover } from '../hover.js'
import { WithResponsive } from '../responsive.js'
import { WithPreferredColorScheme } from '../dark.js'
import { WithActive } from '../active.js'
import { ClippingRectProvider, useClippingRect, useParentClippingRect } from '../clipping.js'
import { FlexProvider } from '../flex/react.js'
import { OrderInfo, OrderInfoProvider } from '../order.js'
import { ScrollGroup, useGlobalScrollMatrix } from '../scroll.js'

export type WithConditionals<T> = WithHover<T> & WithResponsive<T> & WithPreferredColorScheme<T> & WithActive<T>

export type ComponentInternals = {
  pixelSize: number
  size: ReadonlySignal<Vector2Tuple>
  center: ReadonlySignal<Vector2Tuple>
  borderInset: ReadonlySignal<Inset>
  paddingInset: ReadonlySignal<Inset>
  scrollPosition?: Signal<Vector2Tuple>
  maxScrollPosition?: Signal<Partial<Vector2Tuple>>
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
      maxScrollPosition: node.maxScrollPosition,
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

export function useGlobalMatrix(localMatrix: Signal<Matrix4 | undefined>): Signal<Matrix4 | undefined> {
  const parentMatrix = useContext(MatrixContext)
  if (parentMatrix == null) {
    throw new Error(`Can only be used inside a uikit component.`)
  }
  return useMemo(
    () =>
      computed(() => {
        const local = localMatrix.value
        const parent = parentMatrix.value
        if (local == null || parent == null) {
          return undefined
        }
        return parent.clone().multiply(local)
      }),
    [localMatrix, parentMatrix],
  )
}

const MatrixContext = createContext<Signal<Matrix4 | undefined> | undefined>(undefined)

export const MatrixProvider = MatrixContext.Provider

export function ChildrenProvider({
  globalMatrix,
  node,
  scrollPosition,
  children,
  orderInfo,
}: {
  node: FlexNode
  scrollPosition: Signal<Vector2Tuple>
  globalMatrix: Signal<Matrix4 | undefined>
  children?: ReactNode
  orderInfo: OrderInfo
}) {
  const parentClippingRect = useParentClippingRect()
  const clippingRect = useClippingRect(
    globalMatrix,
    node.size,
    node.borderInset,
    node.overflow,
    node,
    parentClippingRect,
  )
  const globalScrollMatrix = useGlobalScrollMatrix(scrollPosition, node, globalMatrix)
  return (
    <ScrollGroup node={node} scrollPosition={scrollPosition}>
      <MatrixProvider value={globalScrollMatrix}>
        <FlexProvider value={node}>
          <ClippingRectProvider value={clippingRect}>
            <OrderInfoProvider value={orderInfo}>{children}</OrderInfoProvider>
          </ClippingRectProvider>
        </FlexProvider>
      </MatrixProvider>
    </ScrollGroup>
  )
}
