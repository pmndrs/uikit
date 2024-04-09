import { YogaProperties } from '../flex/node.js'
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
import { Subscriptions } from '../utils.js'
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
  fontFamilies: Signal<FontFamilies | undefined> | undefined,
  style: Signal<InputProperties | undefined>,
  properties: Signal<InputProperties | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
) {
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const hasFocusSignal = signal<boolean>(false)
  const subscriptions = [] as Subscriptions
  setupCursorCleanup(hoveredSignal, subscriptions)

  const mergedProperties = computedMergedProperties(
    style,
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(parentContext.root.node.size),
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

  const node = createNode(parentContext, mergedProperties, object, subscriptions)

  const transformMatrix = computedTransformMatrix(mergedProperties, node, parentContext.root.pixelSize)
  applyTransform(object, transformMatrix, subscriptions)

  const globalMatrix = computedGlobalMatrix(parentContext.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentContext.clippingRect, globalMatrix, node.size, parentContext.root.pixelSize)

  const groupDeps = computedPanelGroupDependencies(mergedProperties)
  const backgroundOrderInfo = computedOrderInfo(mergedProperties, ElementType.Panel, groupDeps, parentContext.orderInfo)
  createInstancedPanel(
    mergedProperties,
    backgroundOrderInfo,
    groupDeps,
    parentContext.root.panelGroupManager,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    parentContext.clippingRect,
    isClipped,
    getDefaultPanelMaterialConfig(),
    subscriptions,
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
    subscriptions,
  )
  const selectionOrderInfo = createSelection(
    mergedProperties,
    globalMatrix,
    selectionBoxes,
    isClipped,
    backgroundOrderInfo,
    parentContext.clippingRect,
    parentContext.root.panelGroupManager,
    subscriptions,
  )

  const fontSignal = computedFont(mergedProperties, fontFamilies, parentContext.root.renderer, subscriptions)
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
    node,
    isClipped,
    parentContext.clippingRect,
    orderInfo,
    fontSignal,
    parentContext.root.gylphGroupManager,
    selectionRange,
    selectionBoxes,
    caretPosition,
    instancedTextRef,
    subscriptions,
  )
  subscriptions.push(node.setMeasureFunc(measureFunc))

  setupLayoutListeners(style, properties, node.size, subscriptions)
  setupViewportListeners(style, properties, isClipped, subscriptions)

  const disabled = computedProperty(mergedProperties, 'disabled', false)

  const element = createHtmlInputElement(valueSignal, selectionRange, onChange, multiline, disabled, subscriptions)
  const focus = () => {
    if (hasFocusSignal.peek()) {
      return
    }
    element.focus()
  }
  updateHasFocus(element, hasFocusSignal, subscriptions)
  const selectionHandlers = computedSelectionHandlers(node, element, instancedTextRef, selectionRange, focus, disabled)

  return {
    focus,
    root: parentContext.root,
    element,
    node,
    interactionPanel: createInteractionPanel(
      node,
      backgroundOrderInfo,
      parentContext.root,
      parentContext.clippingRect,
      subscriptions,
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
    subscriptions,
  }
}

export function computedSelectionHandlers(
  node: FlexNode,
  element: HTMLInputElement | HTMLTextAreaElement,
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
        const charIndex = uvToCharIndex(node, e.uv, instancedTextRef.current)
        startCharIndex = charIndex

        setTimeout(() => {
          focus()
          selectionRange.value = [charIndex, charIndex]
          element.setSelectionRange(charIndex, charIndex)
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
        const charIndex = uvToCharIndex(node, e.uv, instancedTextRef.current)

        const start = Math.min(startCharIndex, charIndex)
        const end = Math.max(startCharIndex, charIndex)
        const direction = startCharIndex < charIndex ? 'forward' : 'backward'

        setTimeout(() => {
          focus()
          selectionRange.value = [start, end]
          element.setSelectionRange(start, end, direction)
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
  subscriptions: Subscriptions,
): HTMLInputElement | HTMLTextAreaElement {
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
  subscriptions.push(
    effect(() => (element.value = value.value)),
    effect(() => (element.disabled = disabled.value)),
    () => element.remove(),
  )
  return element
}

function updateHasFocus(element: HTMLElement, hasFocusSignal: Signal<boolean>, subscriptions: Subscriptions) {
  subscriptions.push(
    effect(() => {
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
