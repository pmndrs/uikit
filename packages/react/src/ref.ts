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
  ContainerProperties,
} from '@pmndrs/uikit/internals'
import { ForwardedRef, RefObject, useImperativeHandle } from 'react'
import { Vector2Tuple, Mesh } from 'three'

export type ComponentInternals<T = ContainerProperties> = {
  pixelSize: Signal<number>
  size: ReadonlySignal<Vector2Tuple | undefined>
  center: ReadonlySignal<Vector2Tuple | undefined>
  borderInset: ReadonlySignal<Inset | undefined>
  paddingInset: ReadonlySignal<Inset | undefined>
  scrollPosition?: Signal<Vector2Tuple | undefined>
  maxScrollPosition?: Signal<Partial<Vector2Tuple>>
  interactionPanel: Mesh
  setStyle(style: T | undefined): void
}

export function useComponentInternals<T, O = {}>(
  ref: ForwardedRef<ComponentInternals<T> & O>,
  pixelSize: Signal<number>,
  styleSignal: Signal<T | undefined>,
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
      const { scrollPosition, paddingInset, borderInset, relativeCenter, size, maxScrollPosition } = internals
      return {
        setStyle: (style: T | undefined) => (styleSignal.value = style),
        pixelSize,
        borderInset,
        paddingInset,
        center: relativeCenter,
        maxScrollPosition,
        size,
        interactionPanel: interactionPanel instanceof Mesh ? interactionPanel : interactionPanel.current!,
        scrollPosition,
        ...(additional as any),
      }
    },
    [internals, pixelSize, interactionPanel, additional, styleSignal],
  )
}
