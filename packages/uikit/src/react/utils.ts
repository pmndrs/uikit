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

const MatrixContext = createContext<Signal<Matrix4 | undefined>>(null as any)

export const MatrixProvider = MatrixContext.Provider

const RootGroupRefContext = createContext<RefObject<Group>>(null as any)

export function useRootGroupRef() {
  return useContext(RootGroupRefContext)
}

export const RootGroupProvider = RootGroupRefContext.Provider
