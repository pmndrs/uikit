import { ReadonlySignal, Signal } from '@preact/signals-core'
import {
  Inset,
  createContainer,
  createImage,
  createRoot,
  createSvg,
  createText,
  createIcon,
  createCustomContainer,
} from '@pmndrs/uikit/internals'
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

export function useComponentInternals<T, O = {}>(
  ref: ForwardedRef<ComponentInternals & O>,
  styleSignal: Signal<T>,
  internals: ReturnType<
    | typeof createContainer
    | typeof createImage
    | typeof createRoot
    | typeof createSvg
    | typeof createText
    | typeof createIcon
    | typeof createCustomContainer
  > & {
    scrollPosition?: Signal<Vector2Tuple>
  },
  interactionPanel: Mesh | RefObject<Mesh>,
  additional?: O,
): void {
  useImperativeHandle(
    ref,
    () => {
      const { scrollPosition, node, root } = internals
      return {
        setStyle: (style: T) => (styleSignal.value = style),
        pixelSize: root.pixelSize,
        borderInset: node.borderInset,
        paddingInset: node.paddingInset,
        center: node.relativeCenter,
        maxScrollPosition: node.maxScrollPosition,
        size: node.size,
        interactionPanel: interactionPanel instanceof Mesh ? interactionPanel : interactionPanel.current!,
        scrollPosition,
        ...(additional as any),
      }
    },
    [internals, interactionPanel, styleSignal, additional],
  )
}
