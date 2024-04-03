import { ReadonlySignal, Signal } from '@preact/signals-core'
import {
  Inset,
  createContainer,
  createImage,
  createRoot,
  createSVG,
  createText,
  createIcon,
} from '@vanilla-three/uikit/internals'
import { ForwardedRef, useImperativeHandle } from 'react'
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

export function useComponentInternals<T>(
  ref: ForwardedRef<ComponentInternals>,
  styleSignal: Signal<T>,
  internals: ReturnType<
    | typeof createContainer
    | typeof createImage
    | typeof createRoot
    | typeof createSVG
    | typeof createText
    | typeof createIcon
  > & {
    scrollPosition?: Signal<Vector2Tuple>
  },
): void {
  useImperativeHandle(
    ref,
    () => {
      const {
        scrollPosition,
        node,
        root: { pixelSize },
        interactionPanel,
      } = internals
      return {
        setStyle: (style: T) => (styleSignal.value = style),
        pixelSize,
        borderInset: node.borderInset,
        paddingInset: node.paddingInset,
        center: node.relativeCenter,
        maxScrollPosition: node.maxScrollPosition,
        size: node.size,
        interactionPanel,
        scrollPosition,
      }
    },
    [styleSignal, internals],
  )
}
