import { FlexNodeState, YogaProperties, createFlexNodeState } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped } from '../clipping.js'
import { ScrollbarProperties } from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties, createInstancedPanel } from '../panel/instanced-panel.js'
import { TransformProperties, applyTransform, computedTransformMatrix } from '../transform.js'
import { AllOptionalProperties, WithClasses, WithReactive } from '../properties/default.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { ElementType, ZIndexProperties, computedOrderInfo } from '../order.js'
import { createActivePropertyTransfomers } from '../active.js'
import { Signal, computed, effect, signal } from '@preact/signals-core'
import {
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedMergedProperties,
  createNode,
} from './utils.js'
import { Initializers } from '../utils.js'
import { Listeners, setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { Object3DRef, ParentContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { EventHandlers } from '../events.js'
import {
  FlexNode,
  FontFamilies,
  InstancedText,
  InstancedTextProperties,
  computedFont,
  computedGylphGroupDependencies,
  computedProperty,
  createInstancedText,
  darkPropertyTransformers,
  getDefaultPanelMaterialConfig,
  traverseProperties,
} from '../internals.js'
import { Vector2Tuple, Vector2, Vector3Tuple } from 'three'
import { CaretProperties, createCaret } from '../caret.js'
import { SelectionBoxes, SelectionProperties, createSelection } from '../selection.js'
import { WithFocus, createFocusPropertyTransformers } from '../focus.js'

export type InheritableInputProperties = WithClasses<
  WithFocus<
    WithConditionals<
      WithAllAliases<
        WithReactive<
          YogaProperties &
            PanelProperties &
            ZIndexProperties &
            TransformProperties &
            ScrollbarProperties &
            CaretProperties &
            SelectionProperties &
            PanelGroupProperties &
            InstancedTextProperties &
            DisabledProperties
        >
      >
    >
  >
>

export type DisabledProperties = {
  disabled?: boolean
}

const cancelSet = new Set<PointerEvent>()

function cancelBlur(event: PointerEvent) {
  cancelSet.add(event)
}

export const canvasInputProps = {
  onPointerDown: (e: { nativeEvent: any; preventDefault: () => void }) => {
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

export type InputProperties = InheritableInputProperties &
  Listeners & {
    onValueChange?: (value: string) => void
  }

export function createInput(
  parentContext: ParentContext,
  valueSignal: Signal<string>,
  onChange: (newValue: string) => void,
  multiline: boolean,
  fontFamilies: Signal<FontFamilies | undefined>,
  style: Signal<InputProperties | undefined>,
  properties: Signal<InputProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
) {
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const hasFocusSignal = signal<boolean>(false)
  const initializers: Initializers = []
  setupCursorCleanup(hoveredSignal, initializers)

  const mergedProperties = computedMergedProperties(
    style,
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(parentContext.root.size),
      ...createHoverPropertyTransformers(hoveredSignal),
      ...createActivePropertyTransfomers(activeSignal),
      ...createFocusPropertyTransformers(hasFocusSignal),
    },
    undefined,
    (m) => {
      traverseProperties(style.value, properties.value, defaultProperties.value, (p) => {
        m.add('caretOpacity', p.opacity)
        m.add('caretColor', p.color)
      })
    },
  )

  const flexState = createFlexNodeState(parentContext.anyAncestorScrollable)
  const nodeSignal = signal<FlexNode | undefined>(undefined)
  createNode(nodeSignal, flexState, parentContext, mergedProperties, object, initializers)

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, initializers)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(
    parentContext.clippingRect,
    globalMatrix,
    flexState.size,
    parentContext.root.pixelSize,
  )

  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const backgroundOrderInfo = computedOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentContext.orderInfo)
  initializers.push((subscriptions) =>
    createInstancedPanel(
      mergedProperties,
      backgroundOrderInfo,
      groupDeps,
      parentContext.root.panelGroupManager,
      globalMatrix,
      flexState.size,
      undefined,
      flexState.borderInset,
      parentContext.clippingRect,
      isClipped,
      getDefaultPanelMaterialConfig(),
      subscriptions,
    ),
  )

  const instancedTextRef: { current?: InstancedText } = {}
  const selectionBoxes = signal<SelectionBoxes>([])
  const caretPosition = signal<Vector3Tuple | undefined>(undefined)
  const selectionRange = signal<Vector2Tuple | undefined>(undefined)
  createCaret(
    mergedProperties,
    globalMatrix,
    caretPosition,
    isClipped,
    backgroundOrderInfo,
    parentContext.clippingRect,
    parentContext.root.panelGroupManager,
    initializers,
  )
  const selectionOrderInfo = createSelection(
    mergedProperties,
    globalMatrix,
    selectionBoxes,
    isClipped,
    backgroundOrderInfo,
    parentContext.clippingRect,
    parentContext.root.panelGroupManager,
    initializers,
  )

  const fontSignal = computedFont(mergedProperties, fontFamilies, parentContext.root.renderer, initializers)
  const orderInfo = computedOrderInfo(
    undefined,
    ElementType.Text,
    computedGylphGroupDependencies(fontSignal),
    selectionOrderInfo,
  )
  const measureFunc = createInstancedText(
    mergedProperties,
    valueSignal,
    globalMatrix,
    nodeSignal,
    flexState,
    isClipped,
    parentContext.clippingRect,
    orderInfo,
    fontSignal,
    parentContext.root.gylphGroupManager,
    selectionRange,
    selectionBoxes,
    caretPosition,
    instancedTextRef,
    initializers,
  )
  initializers.push(() => effect(() => nodeSignal.value?.setMeasureFunc(measureFunc)))

  setupLayoutListeners(style, properties, flexState.size, initializers)
  setupViewportListeners(style, properties, isClipped, initializers)

  const disabled = computedProperty(mergedProperties, 'disabled', false)

  const element = createHtmlInputElement(valueSignal, selectionRange, onChange, multiline, disabled, initializers)
  const focus = () => {
    if (hasFocusSignal.peek()) {
      return
    }
    element.peek()?.focus()
  }
  updateHasFocus(element, hasFocusSignal, initializers)
  const selectionHandlers = computedSelectionHandlers(
    flexState,
    element,
    instancedTextRef,
    selectionRange,
    focus,
    disabled,
  )

  return Object.assign(flexState, {
    focus,
    root: parentContext.root,
    element,
    node: nodeSignal,
    interactionPanel: createInteractionPanel(
      backgroundOrderInfo,
      parentContext.root,
      parentContext.clippingRect,
      flexState.size,
      initializers,
    ),
    handlers: computedHandlers(
      style,
      properties,
      defaultProperties,
      hoveredSignal,
      activeSignal,
      selectionHandlers,
      'text',
    ),
    initializers,
  })
}

export function computedSelectionHandlers(
  flexState: FlexNodeState,
  element: Signal<HTMLInputElement | HTMLTextAreaElement | undefined>,
  instancedTextRef: { current?: InstancedText },
  selectionRange: Signal<Vector2Tuple | undefined>,
  focus: () => void,
  disabled: Signal<boolean>,
) {
  return computed<EventHandlers | undefined>(() => {
    if (disabled.value) {
      return undefined
    }
    let startCharIndex: number | undefined
    return {
      onPointerDown: (e) => {
        if (e.defaultPrevented || e.uv == null || instancedTextRef.current == null) {
          return
        }
        cancelBlur(e.nativeEvent)
        e.stopPropagation?.()
        const charIndex = uvToCharIndex(flexState, e.uv, instancedTextRef.current)
        startCharIndex = charIndex

        setTimeout(() => {
          focus()
          selectionRange.value = [charIndex, charIndex]
          element.peek()?.setSelectionRange(charIndex, charIndex)
        })
      },
      onPointerUp: (e) => {
        startCharIndex = undefined
      },
      onPointerLeave: (e) => {
        startCharIndex = undefined
      },
      onPointerMove: (e) => {
        if (startCharIndex == null || e.uv == null || instancedTextRef.current == null) {
          return
        }
        e.stopPropagation?.()
        const charIndex = uvToCharIndex(flexState, e.uv, instancedTextRef.current)

        const start = Math.min(startCharIndex, charIndex)
        const end = Math.max(startCharIndex, charIndex)
        const direction = startCharIndex < charIndex ? 'forward' : 'backward'

        setTimeout(() => {
          focus()
          selectionRange.value = [start, end]
          element.peek()?.setSelectionRange(start, end, direction)
        })
      },
    }
  })
}

export function createHtmlInputElement(
  value: Signal<string>,
  selectionRange: Signal<Vector2Tuple | undefined>,
  onChange: (value: string) => void,
  multiline: boolean,
  disabled: Signal<boolean>,
  initializers: Initializers,
) {
  const elementSignal = signal<HTMLInputElement | HTMLTextAreaElement | undefined>(undefined)
  initializers.push((subscriptions) => {
    const element = document.createElement(multiline ? 'textarea' : 'input')
    const style = element.style
    style.setProperty('position', 'absolute')
    style.setProperty('left', '-1000vw')
    style.setProperty('pointerEvents', 'none')
    style.setProperty('opacity', '0')
    element.addEventListener('input', () => {
      onChange?.(element.value)
      updateSelection()
    })
    const updateSelection = () => {
      const { selectionStart, selectionEnd } = element
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
    element.addEventListener('keydown', updateSelection)
    element.addEventListener('keyup', updateSelection)
    element.addEventListener('blur', () => (selectionRange.value = undefined))
    document.body.appendChild(element)
    elementSignal.value = element
    subscriptions.push(
      () => {
        elementSignal.value = undefined
        element.remove()
      },
      effect(() => (element.value = value.value)),
      effect(() => (element.disabled = disabled.value)),
    )
    return subscriptions
  })

  return elementSignal
}

function updateHasFocus(
  elementSignal: Signal<HTMLElement | undefined>,
  hasFocusSignal: Signal<boolean>,
  initializers: Initializers,
) {
  initializers.push(() =>
    effect(() => {
      const element = elementSignal.value
      if (element == null) {
        return
      }
      const updateFocus = () => (hasFocusSignal.value = document.activeElement === element)
      updateFocus()
      element.addEventListener('focus', updateFocus)
      element.addEventListener('blur', updateFocus)
      return () => {
        element.removeEventListener('focus', updateFocus)
        element.removeEventListener('blur', updateFocus)
      }
    }),
  )
}

function uvToCharIndex(
  { size: s, borderInset: b, paddingInset: p }: FlexNodeState,
  uv: Vector2,
  instancedText: InstancedText,
): number {
  const size = s.peek()
  const borderInset = b.peek()
  const paddingInset = p.peek()
  if (size == null || borderInset == null || paddingInset == null) {
    return 0
  }
  const [width, height] = size
  const [bTop, , , bLeft] = borderInset
  const [pTop, , , pLeft] = paddingInset
  const x = uv.x * width - bLeft - pLeft
  const y = -uv.y * height + bTop + pTop
  return instancedText.getCharIndex(x, y)
}
