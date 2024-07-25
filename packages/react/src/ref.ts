import { ReadonlySignal, Signal, untracked } from '@preact/signals-core'
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
  MergedProperties,
} from '@pmndrs/uikit/internals'
import { ForwardedRef, RefObject, useImperativeHandle } from 'react'
import { Vector2Tuple, Mesh } from 'three'

export type ComponentInternals<T = ContainerProperties> = {
  /**
   * the size of one pixel
   */
  pixelSize: ReadonlySignal<number>
  /**
   *  the outer width/height of the element
   */
  size: ReadonlySignal<Vector2Tuple | undefined>
  /**
   * the offset between from the element's center to its parent's center
   */
  center: ReadonlySignal<Vector2Tuple | undefined>
  /**
   * a tuple containing the border sizes on all 4 sides `[top, right, bottom, left]`
   */
  borderInset: ReadonlySignal<Inset | undefined>
  /**
   *  a tuple containing the padding sizes on all 4 sides `[top, right, bottom, left]`
   */
  paddingInset: ReadonlySignal<Inset | undefined>
  /**
   * the x/y scroll position of the children when the element is scrollable
   */
  scrollPosition?: Signal<Vector2Tuple | undefined>
  /**
   * the maximum x/y scroll position, based on the size of the children
   */
  maxScrollPosition?: ReadonlySignal<Partial<Vector2Tuple>>
  /**
   * the mesh added to the scene graph to capture events
   */
  interactionPanel: Mesh
  /**
   * exploses whether the element is fully clipped by some ancestor
   */
  isClipped?: ReadonlySignal<boolean>
  /**
   * set the styles of the element (the provided styles have a higher precedence then the element's properties)
   */
  setStyle(style: T | undefined, replace?: boolean): void
  /**
   * get the object last written to `setStyle`
   */
  getStyle(): Readonly<T> | undefined
  /**
   * read the current value for any property (combines default properties, direct properties, and styles)
   * @param key the name of the property
   */
  getComputedProperty<K extends keyof T>(key: K): T[K] | undefined
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
    isClipped?: Signal<boolean>
    scrollPosition?: Signal<Vector2Tuple>
    mergedProperties: Signal<MergedProperties>
  },
  interactionPanel: Mesh | RefObject<Mesh>,
  additional?: O,
): void {
  useImperativeHandle(
    ref,
    () => {
      const { scrollPosition, paddingInset, borderInset, relativeCenter, size, maxScrollPosition } = internals
      return {
        setStyle: (style: T | undefined, replace?: boolean) =>
          (styleSignal.value = replace ? style : ({ ...styleSignal.value, ...style } as T)),
        getStyle: () => styleSignal.peek(),
        getComputedProperty: <K extends keyof T>(key: K) =>
          untracked(() => internals.mergedProperties.value.read<T[K] | undefined>(key as string, undefined)),
        pixelSize,
        borderInset,
        paddingInset,
        center: relativeCenter,
        maxScrollPosition,
        size,
        interactionPanel: interactionPanel instanceof Mesh ? interactionPanel : interactionPanel.current!,
        scrollPosition,
        isClipped: internals.isClipped,
        ...(additional as O),
      }
    },
    [internals, pixelSize, interactionPanel, additional, styleSignal],
  )
}
