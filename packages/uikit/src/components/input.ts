import { YogaProperties } from '../flex/node.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped, computedClippingRect } from '../clipping.js'
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
import { Subscriptions, readReactive } from '../utils.js'
import { Listeners, setupLayoutListeners, setupViewportListeners } from '../listeners.js'
import { Object3DRef, ParentContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { EventHandlers } from '../events.js'
import {
  FlexNode,
  FontFamilies,
  GetBatchedProperties,
  InstancedText,
  InstancedTextProperties,
  computedFont,
  computedGylphGroupDependencies,
  createGetBatchedProperties,
  createInstancedText,
  darkPropertyTransformers,
  getDefaultPanelMaterialConfig,
} from '../internals.js'
import { Vector2Tuple, Vector2, Vector3Tuple } from 'three'
import { createCaret } from '../caret.js'
import { SelectionBoxes, createSelection } from '../selection.js'

export type InheritableInputProperties = WithClasses<
  WithConditionals<
    WithAllAliases<
      WithReactive<
        YogaProperties &
          PanelProperties &
          ZIndexProperties &
          TransformProperties &
          ScrollbarProperties &
          PanelGroupProperties &
          InstancedTextProperties &
          DisabledProperties
      >
    >
  >
>

export type DisabledProperties = {
  disabled?: boolean
}
const disabledKeys = ['disabled'] as const

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
  Listeners &
  EventHandlers & {
    onValueChange?: (value: string) => void
  }

export function createInput(
  parentContext: ParentContext,
  proviedValue: string | Signal<string | Signal<string>>,
  multiline: boolean,
  fontFamilies: Signal<FontFamilies | undefined> | undefined,
  properties: Signal<InputProperties>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3DRef,
) {
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const subscriptions = [] as Subscriptions
  setupCursorCleanup(hoveredSignal, subscriptions)

  const mergedProperties = computedMergedProperties(properties, defaultProperties, {
    ...darkPropertyTransformers,
    ...createResponsivePropertyTransformers(parentContext.root.node.size),
    ...createHoverPropertyTransformers(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
  })

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

  let valueSignal: Signal<string>
  let controlled: boolean
  if (proviedValue instanceof Signal) {
    valueSignal = computed(() => readReactive(valueSignal.value))
    controlled = true
  } else {
    valueSignal = signal(proviedValue)
    controlled = false
  }

  const instancedTextRef: { current?: InstancedText } = {}
  const selectionBoxes = signal<SelectionBoxes>([])
  const caretPosition = signal<Vector3Tuple | undefined>(undefined)
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
    undefined,
    undefined,
    undefined,
    instancedTextRef,
    subscriptions,
  )
  subscriptions.push(node.setMeasureFunc(measureFunc))

  setupLayoutListeners(properties, node.size, subscriptions)
  setupViewportListeners(properties, isClipped, subscriptions)

  const getDisabled = createGetBatchedProperties<DisabledProperties>(mergedProperties, disabledKeys)

  const selectionRange = signal<Vector2Tuple | undefined>(undefined)
  const element = createHtmlInputElement(
    valueSignal,
    selectionRange,
    (newValue) => {
      if (!controlled) {
        valueSignal.value = newValue
      }
      properties.peek().onValueChange?.(newValue)
    },
    multiline,
    getDisabled,
    subscriptions,
  )
  const hasFocusSignal = computedHasFocus(element, subscriptions)
  const selectionHandlers = computedSelectionHandlers(
    node,
    element,
    instancedTextRef,
    selectionRange,
    (focus) => {
      if (hasFocusSignal.peek() === focus) {
        return
      }
      if (focus) {
        element.focus()
      } else {
        element.blur()
      }
    },
    getDisabled,
  )

  return {
    element,
    node,
    interactionPanel: createInteractionPanel(
      node,
      backgroundOrderInfo,
      parentContext.root,
      parentContext.clippingRect,
      subscriptions,
    ),
    handlers: computedHandlers(properties, defaultProperties, hoveredSignal, activeSignal, selectionHandlers),
    subscriptions,
  }
}

export function computedSelectionHandlers(
  node: FlexNode,
  element: HTMLInputElement | HTMLTextAreaElement,
  instancedTextRef: { current?: InstancedText },
  selectionRange: Signal<Vector2Tuple | undefined>,
  setFocus: (focus: boolean) => void,
  getDisabled: GetBatchedProperties<DisabledProperties>,
) {
  return computed<EventHandlers | undefined>(() => {
    if (getDisabled('disabled') === true) {
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
          setFocus(true)
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
          setFocus(true)
          selectionRange.value = [start, end]
          element.setSelectionRange(start, end, direction)
        })
      },
    }
  })
}

export function createHtmlInputElement(
  value: string | Signal<string>,
  selectionRange: Signal<Vector2Tuple | undefined>,
  onChange: (value: string) => void,
  multiline: boolean,
  getDisabled: GetBatchedProperties<DisabledProperties>,
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
    effect(() => (element.value = readReactive(value))),
    effect(() => (element.disabled = getDisabled('disabled') ?? false)),
    () => element.remove(),
  )
  return element
}

function computedHasFocus(element: HTMLElement, subscriptions: Subscriptions) {
  const hasFocusSignal = signal(document.activeElement === element)
  subscriptions.push(
    effect(() => {
      const updateFocus = () => (hasFocusSignal.value = document.activeElement === element)
      element.addEventListener('focus', updateFocus)
      element.addEventListener('blur', updateFocus)
      return () => {
        element.removeEventListener('focus', updateFocus)
        element.removeEventListener('blur', updateFocus)
      }
    }),
  )
  return hasFocusSignal
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
