import {
    ComponentInternals,
    LayoutListeners,
    ViewportListeners,
    useGlobalMatrix,
    useLayoutListeners,
    useViewportListeners,
  } from './utils.js'
  import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    PointerEvent as ReactPointerEvent,
  } from 'react'
  import { ReadonlySignal, Signal, signal } from '@preact/signals-core'
  import { readReactive, useRootGroupRef, useSignalEffect } from '../utils.js'
  import { TextProperties } from './text.js'
  import { Group, Vector2, Vector2Tuple, Vector3Tuple } from 'three'
  import { InstancedText } from '../text/render/instanced-text.js'
  import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
  import { MaterialClass } from '../index.js'
  import { ElementType, ZIndexOffset, useOrderInfo } from '../order.js'
  import {
    InteractionGroup,
    ShadowProperties,
    useInstancedPanel,
    useInteractionPanel,
    usePanelGroupDependencies,
  } from '../panel/react.js'
  import { ScrollListeners } from '../scroll.js'
  import { WithFocus, useApplyFocusProperties } from '../focus.js'
  import { useApplyActiveProperties } from '../active.js'
  import { useCaret } from '../caret.js'
  import { useParentClippingRect, useIsClipped } from '../clipping.js'
  import { useApplyPreferredColorSchemeProperties } from '../dark.js'
  import { useFlexNode } from '../flex/react.js'
  import { useApplyHoverProperties } from '../hover.js'
  import { flexAliasPropertyTransformation, panelAliasPropertyTransformation } from '../properties/alias.js'
  import { useApplyProperties } from '../properties/default.js'
  import { useImmediateProperties } from '../properties/immediate.js'
  import { createCollection, writeCollection, finalizeCollection } from '../properties/utils.js'
  import { useApplyResponsiveProperties } from '../responsive.js'
  import { SelectionBoxes, useSelection } from '../selection.js'
  import { useInstancedText } from '../text/react.js'
  import { useTransformMatrix } from '../transform.js'
  import { FlexNode } from '../flex/node.js'
  
  export type InputProperties = WithFocus<TextProperties>
  
  export type InputInternals = ComponentInternals & { readonly value: string | ReadonlySignal<string>; focus: () => void }
  
  const cancelSet = new Set<PointerEvent>()
  
  function cancelBlur(event: PointerEvent) {
    cancelSet.add(event)
  }
  
  export const canvasInputProps = {
    onPointerDown: (e: ReactPointerEvent) => {
      if (!(document.activeElement instanceof HTMLElement)) {
        return
      }
      if (!cancelSet.has(e.nativeEvent)) {
        return
      }
      cancelSet.delete(e.nativeEvent)
      e.preventDefault()
    },
  }
  
  export const Input = forwardRef<
    InputInternals,
    {
      panelMaterialClass?: MaterialClass
      zIndexOffset?: ZIndexOffset
      multiline?: boolean
      value?: string | Signal<string>
      defaultValue?: string
      onValueChange?: (value: string) => void
      tabIndex?: number
      disabled?: boolean
    } & InputProperties &
      EventHandlers &
      LayoutListeners &
      ViewportListeners &
      ScrollListeners &
      ShadowProperties
  >((properties, ref) => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const defaultValue = useMemo(() => signal(properties.defaultValue ?? ''), [])
    const value = useMemo(() => properties.value ?? defaultValue, [properties.value, defaultValue])
  
    const onValueChangeRef = useRef(properties.onValueChange)
    onValueChangeRef.current = properties.onValueChange
  
    const startCharIndex = useRef<number | undefined>(undefined)
  
    const isControlled = properties.value != null
    const onChange = useCallback(
      (value: string) => {
        if (!isControlled) {
          defaultValue.value = value
        }
        onValueChangeRef.current?.(value)
      },
      [defaultValue, isControlled],
    )
    const selectionRange = useMemo(() => signal<Vector2Tuple | undefined>(undefined), [])
    const element = useHtmlInputElement(value, selectionRange, onChange, properties.multiline)
    element.tabIndex = properties.tabIndex ?? 0
    element.disabled = properties.disabled ?? false
  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const hasFocusSignal = useMemo(() => signal(document.activeElement === element), [])
    useEffect(() => {
      const updateFocus = () => (hasFocusSignal.value = document.activeElement === element)
      element.addEventListener('focus', updateFocus)
      element.addEventListener('blur', updateFocus)
      return () => {
        element.removeEventListener('focus', updateFocus)
        element.removeEventListener('blur', updateFocus)
      }
    }, [element, hasFocusSignal])
    const setFocus = useCallback(
      (focus: boolean) => {
        if (hasFocusSignal.peek() === focus) {
          return
        }
        if (focus) {
          element.focus()
        } else {
          element.blur()
        }
      },
      [hasFocusSignal, element],
    )
  
    const collection = createCollection()
    const groupRef = useRef<Group>(null)
    const node = useFlexNode(groupRef)
    useImmediateProperties(collection, node, flexAliasPropertyTransformation)
    const transformMatrix = useTransformMatrix(collection, node)
    const rootGroupRef = useRootGroupRef()
    const globalMatrix = useGlobalMatrix(transformMatrix)
    const parentClippingRect = useParentClippingRect()
    const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)
    useLayoutListeners(properties, node.size)
    useViewportListeners(properties, isClipped)
    const groupDeps = usePanelGroupDependencies(properties.panelMaterialClass, properties)
    const backgroundOrderInfo = useOrderInfo(ElementType.Panel, properties.zIndexOffset, groupDeps)
    useInstancedPanel(
      collection,
      globalMatrix,
      node.size,
      undefined,
      node.borderInset,
      isClipped,
      backgroundOrderInfo,
      parentClippingRect,
      groupDeps,
      panelAliasPropertyTransformation,
    )
    const selectionBoxes = useMemo(() => signal<SelectionBoxes>([]), [])
    const caretPosition = useMemo(() => signal<Vector3Tuple | undefined>(undefined), [])
    const selectionOrderInfo = useSelection(
      globalMatrix,
      selectionBoxes,
      isClipped,
      backgroundOrderInfo,
      parentClippingRect,
    )
    useCaret(collection, globalMatrix, caretPosition, isClipped, backgroundOrderInfo, parentClippingRect)
    const interactionPanel = useInteractionPanel(node.size, node, backgroundOrderInfo, rootGroupRef)
    const instancedTextRef = useRef<InstancedText | undefined>()
    const measureFunc = useInstancedText(
      collection,
      value,
      globalMatrix,
      node,
      isClipped,
      parentClippingRect,
      selectionOrderInfo,
      selectionRange,
      selectionBoxes,
      caretPosition,
      instancedTextRef,
    )
  
    const disabled = properties.disabled ?? false
  
    useApplyProperties(collection, properties)
    useApplyPreferredColorSchemeProperties(collection, properties)
    useApplyResponsiveProperties(collection, properties)
    const hoverHandlers = useApplyHoverProperties(collection, properties, disabled ? undefined : 'text')
    const activeHandlers = useApplyActiveProperties(collection, properties)
    useApplyFocusProperties(collection, properties, hasFocusSignal)
    writeCollection(collection, 'measureFunc', measureFunc)
    finalizeCollection(collection)
  
    useImperativeHandle(
      ref,
      () => ({
        focus: () => setFocus(true),
        value,
        borderInset: node.borderInset,
        paddingInset: node.paddingInset,
        pixelSize: node.pixelSize,
        center: node.relativeCenter,
        size: node.size,
        interactionPanel,
      }),
      [interactionPanel, node, value, setFocus],
    )
  
    return (
      <InteractionGroup
        groupRef={groupRef}
        matrix={transformMatrix}
        handlers={properties}
        inputHandlers={
          disabled
            ? undefined
            : {
                onPointerDown: (e) => {
                  if (e.defaultPrevented || e.uv == null || instancedTextRef.current == null) {
                    return
                  }
                  cancelBlur(e.nativeEvent)
                  e.stopPropagation()
                  const charIndex = uvToCharIndex(node, e.uv, instancedTextRef.current)
                  startCharIndex.current = charIndex
  
                  setTimeout(() => {
                    setFocus(true)
                    selectionRange.value = [charIndex, charIndex]
                    element.setSelectionRange(charIndex, charIndex)
                  })
                },
                onPointerUp: (e) => {
                  startCharIndex.current = undefined
                },
                onPointerLeave: (e) => {
                  startCharIndex.current = undefined
                },
                onPointerMove: (e) => {
                  if (startCharIndex.current == null || e.uv == null || instancedTextRef.current == null) {
                    return
                  }
                  e.stopPropagation()
                  const charIndex = uvToCharIndex(node, e.uv, instancedTextRef.current)
  
                  const start = Math.min(startCharIndex.current, charIndex)
                  const end = Math.max(startCharIndex.current, charIndex)
                  const direction = startCharIndex.current < charIndex ? 'forward' : 'backward'
  
                  setTimeout(() => {
                    setFocus(true)
                    selectionRange.value = [start, end]
                    element.setSelectionRange(start, end, direction)
                  })
                },
              }
        }
        hoverHandlers={hoverHandlers}
        activeHandlers={activeHandlers}
      >
        <primitive object={interactionPanel} />
      </InteractionGroup>
    )
  })
  
  export function useHtmlInputElement(
    value: string | Signal<string>,
    selectionRange: Signal<Vector2Tuple | undefined>,
    onChange?: (value: string) => void,
    multiline: boolean = false,
  ): HTMLInputElement | HTMLTextAreaElement {
    const element = useMemo(() => {
      const result = document.createElement(multiline ? 'textarea' : 'input')
      const style = result.style
      style.setProperty('position', 'absolute')
      style.setProperty('left', '-1000vw')
      style.setProperty('pointerEvents', 'none')
      style.setProperty('opacity', '0')
      result.addEventListener('input', () => {
        onChange?.(result.value)
        updateSelection()
      })
      const updateSelection = () => {
        const { selectionStart, selectionEnd } = result
        if (selectionStart == null || selectionEnd == null) {
          selectionRange.value = undefined
          return
        }
        const current = selectionRange.peek()
        if (current != null && current[0] === selectionStart && current[1] === selectionEnd) {
          return
        }
        selectionRange.value = [selectionStart, selectionEnd]
      }
      result.addEventListener('keydown', updateSelection)
      result.addEventListener('keyup', updateSelection)
      result.addEventListener('blur', () => (selectionRange.value = undefined))
      document.body.appendChild(result)
      return result
    }, [onChange, selectionRange, multiline])
    useSignalEffect(() => {
      element.value = readReactive(value)
    }, [value])
    useEffect(() => () => element.remove(), [element])
    return element
  }
  
  function uvToCharIndex(
    { size, borderInset, paddingInset }: FlexNode,
    uv: Vector2,
    instancedText: InstancedText,
  ): number {
    const [width, height] = size.peek()
    const [bTop, , , bLeft] = borderInset.peek()
    const [pTop, , , pLeft] = paddingInset.peek()
    const x = uv.x * width - bLeft - pLeft
    const y = -uv.y * height + bTop + pTop
    return instancedText.getCharIndex(x, y)
  }
  