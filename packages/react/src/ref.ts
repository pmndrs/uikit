import { ReadonlySignal, Signal } from '@preact/signals-core'
import { Inset, FlexNode } from '@vanilla-three/uikit/internals'
import { utils } from 'mocha'
import { ForwardedRef, RefObject, useImperativeHandle } from 'react'
import { Vector2Tuple, Mesh } from 'three'

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
  useImperativeHandle(ref, () => ({
    borderInset: node.borderInset,
    paddingInset: node.paddingInset,
    center: node.relativeCenter,
    maxScrollPosition: node.maxScrollPosition,
    size: node.size,
    interactionPanel: interactionPanel instanceof Mesh ? interactionPanel : interactionPanel.current!,
    scrollPosition,
  }))
}
