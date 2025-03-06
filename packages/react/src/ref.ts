import { ReadonlySignal, Signal, untracked } from '@preact/signals-core'
import {
  Inset,
  ContainerProperties,
  MergedProperties,
  createContainerState,
  createCustomContainerState,
  createIconState,
  createTextState,
  createSvgState,
  createRootState,
  createImageState,
  createInputState,
  createContentState,
} from '@pmndrs/uikit/internals'
import { ForwardedRef, RefObject, useImperativeHandle } from 'react'
import { Vector2Tuple, Mesh, Matrix4 } from 'three'

export type ComponentInternals<T = ContainerProperties> = {
  globalMatrix: ReadonlySignal<Matrix4 | undefined>
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
   * exploses whether the element is not fully clipped, has a size greater then 0, is not set to invisible, or display unequal to "none" by itself and all ancestors
   */
  isVisible: ReadonlySignal<boolean>
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
    | typeof createContainerState
    | typeof createContentState
    | typeof createImageState
    | typeof createRootState
    | typeof createSvgState
    | typeof createTextState
    | typeof createIconState
    | typeof createInputState
    | typeof createCustomContainerState
  > & {
    isClipped?: Signal<boolean>
    scrollPosition?: Signal<Vector2Tuple>
    mergedProperties: Signal<MergedProperties>
  },
  interactionPanel: Mesh | RefObject<Mesh | null>,
  additional?: O,
): void {
  useImperativeHandle(ref, () => {
    const { scrollPosition, paddingInset, borderInset, globalMatrix, relativeCenter, size, maxScrollPosition } =
      internals
    return {
      isVisible: internals.isVisible,
      setStyle: (style: T | undefined, replace?: boolean) =>
        (styleSignal.value = replace ? style : ({ ...styleSignal.value, ...style } as T)),
      getStyle: () => styleSignal.peek(),
      getComputedProperty: <K extends keyof T>(key: K) =>
        untracked(() => internals.mergedProperties.value.read<T[K] | undefined>(key as string, undefined)),
      pixelSize,
      borderInset,
      paddingInset,
      center: relativeCenter,
      globalMatrix,
      maxScrollPosition,
      size,
      interactionPanel: interactionPanel instanceof Mesh ? interactionPanel : interactionPanel.current!,
      scrollPosition,
      isClipped: internals.isClipped,
      ...(additional as O),
    }
  }, [internals, pixelSize, interactionPanel, additional, styleSignal])
}
