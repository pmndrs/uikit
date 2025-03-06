import { FlexNodeState, YogaProperties, createFlexNodeState } from '../flex/index.js'
import { createHoverPropertyTransformers, setupCursorCleanup } from '../hover.js'
import { computedIsClipped } from '../clipping.js'
import { ScrollbarProperties } from '../scroll.js'
import { WithAllAliases } from '../properties/alias.js'
import { PanelProperties, setupInstancedPanel } from '../panel/instanced-panel.js'
import { TransformProperties, setupObjectTransform, computedTransformMatrix } from '../transform.js'
import {
  AllOptionalProperties,
  WithClasses,
  WithReactive,
  computedInheritableProperty,
  computedNonInheritableProperty,
  traverseProperties,
} from '../properties/index.js'
import { createResponsivePropertyTransformers } from '../responsive.js'
import { computedOrderInfo, ElementType, ZIndexProperties } from '../order.js'
import { createActivePropertyTransfomers } from '../active.js'
import { ReadonlySignal, Signal, computed, effect, signal } from '@preact/signals-core'
import {
  UpdateMatrixWorldProperties,
  VisibilityProperties,
  WithConditionals,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  computedMergedProperties,
  setupNode,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  computedAncestorsHaveListeners,
} from './utils.js'
import { abortableEffect, readReactive } from '../utils.js'
import { Listeners, setupLayoutListeners, setupClippedListeners } from '../listeners.js'
import { ParentContext } from '../context.js'
import { PanelGroupProperties, computedPanelGroupDependencies } from '../panel/instanced-panel-group.js'
import { createInteractionPanel, setupInteractionPanel } from '../panel/instanced-panel-mesh.js'
import { EventHandlers, ThreeEventMap, ThreePointerEvent } from '../events.js'
import { Vector2Tuple, Vector2, Vector3Tuple, Object3D } from 'three'
import { CaretProperties, CaretTransformation, createCaret } from '../caret.js'
import { SelectionTransformation, SelectionProperties, createSelection } from '../selection.js'
import { WithFocus, createFocusPropertyTransformers } from '../focus.js'
import {
  FontFamilies,
  InstancedText,
  InstancedTextProperties,
  computedFont,
  computedGylphGroupDependencies,
  createInstancedText,
} from '../text/index.js'
import { darkPropertyTransformers } from '../dark.js'
import { getDefaultPanelMaterialConfig, PointerEventsProperties } from '../panel/index.js'

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
            DisabledProperties &
            VisibilityProperties &
            UpdateMatrixWorldProperties &
            PointerEventsProperties
        >
      >
    >
  >
>

export type DisabledProperties = {
  disabled?: boolean
}

const cancelSet = new Set<unknown>()

function cancelBlur(event: unknown) {
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

export type InputType = 'text' | 'password'

export type InputProperties<EM extends ThreeEventMap = ThreeEventMap> = InheritableInputProperties &
  Listeners & {
    onValueChange?: (value: string) => void
  } & WithReactive<{
    type?: InputType
    value?: string
    tabIndex?: number
    disabled?: boolean
  }> & {
    multiline?: boolean
    defaultValue?: string
  } & EventHandlers<EM>

export function createInputState<EM extends ThreeEventMap = ThreeEventMap>(
  parentCtx: ParentContext,
  fontFamilies: Signal<FontFamilies | undefined>,
  style: Signal<InputProperties<EM> | undefined>,
  properties: Signal<InputProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
) {
  const flexState = createFlexNodeState()
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const hasFocusSignal = signal<boolean>(false)

  const mergedProperties = computedMergedProperties(
    style,
    properties,
    defaultProperties,
    {
      ...darkPropertyTransformers,
      ...createResponsivePropertyTransformers(parentCtx.root.size),
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

  const transformMatrix = computedTransformMatrix(mergedProperties, flexState, parentCtx.root.pixelSize)
  const globalMatrix = computedGlobalMatrix(parentCtx.childrenMatrix, transformMatrix)

  const isClipped = computedIsClipped(parentCtx.clippingRect, globalMatrix, flexState.size, parentCtx.root.pixelSize)
  const isVisible = computedIsVisible(flexState, isClipped, mergedProperties)

  const backgroundGroupDeps = computedPanelGroupDependencies(mergedProperties)
  const backgroundOrderInfo = computedOrderInfo(
    mergedProperties,
    'zIndexOffset',
    ElementType.Panel,
    backgroundGroupDeps,
    parentCtx.orderInfo,
  )

  const selectionTransformations = signal<Array<SelectionTransformation>>([])
  const caretTransformation = signal<CaretTransformation | undefined>(undefined)
  const selectionRange = signal<Vector2Tuple | undefined>(undefined)

  const fontSignal = computedFont(mergedProperties, fontFamilies, parentCtx.root.renderer)
  const orderInfo = computedOrderInfo(
    undefined,
    'zIndexOffset',
    ElementType.Text,
    computedGylphGroupDependencies(fontSignal),
    backgroundOrderInfo,
  )

  const defaultValue = style.peek()?.defaultValue ?? properties.peek()?.defaultValue
  const writeValue =
    style.peek()?.value == null && properties.peek()?.value == null ? signal(defaultValue ?? '') : undefined

  const valueSignal = computed(
    () => writeValue?.value ?? readReactive(style.value?.value) ?? readReactive(properties.value?.value) ?? '',
  )

  const type = computedNonInheritableProperty<InputType>(style, properties, 'type', 'text')
  const displayValueSignal = computed(() =>
    type.value === 'text' ? valueSignal.value : '*'.repeat(valueSignal.value.length ?? 0),
  )

  const disabled = computedNonInheritableProperty(style, properties, 'disabled', false)
  const updateMatrixWorld = computedInheritableProperty(mergedProperties, 'updateMatrixWorld', false)

  const instancedTextRef: { current?: InstancedText } = {}

  const focus = (start?: number, end?: number, direction?: 'forward' | 'backward' | 'none') => {
    if (!hasFocusSignal.peek()) {
      element.focus()
    }
    if (start != null && end != null) {
      element.setSelectionRange(start, end, direction)
    }
    selectionRange.value = [element.selectionStart ?? 0, element.selectionEnd ?? 0]
  }

  const selectionHandlers = computedSelectionHandlers(type, valueSignal, flexState, instancedTextRef, focus, disabled)

  const multiline = style.peek()?.multiline ?? properties.peek()?.multiline ?? false

  const element = createHtmlInputElement(
    selectionRange,
    (newValue) => {
      if (writeValue != null) {
        writeValue.value = newValue
      }
      style.peek()?.onValueChange?.(newValue)
      properties.peek()?.onValueChange?.(newValue)
    },
    multiline,
  )

  return Object.assign(flexState, {
    multiline,
    element,
    instancedTextRef,
    interactionPanel: createInteractionPanel(
      backgroundOrderInfo,
      parentCtx.root,
      parentCtx.clippingRect,
      globalMatrix,
      flexState,
    ),
    hoveredSignal,
    activeSignal,
    hasFocusSignal,
    mergedProperties,
    transformMatrix,
    globalMatrix,
    isClipped,
    isVisible,
    backgroundGroupDeps,
    backgroundOrderInfo,
    orderInfo,
    selectionTransformations,
    caretTransformation,
    selectionRange,
    fontSignal,
    valueSignal,
    writeValue,
    type,
    displayValueSignal,
    disabled,
    updateMatrixWorld,
    root: parentCtx.root,
    handlers: computedHandlers(
      style,
      properties,
      defaultProperties,
      hoveredSignal,
      activeSignal,
      selectionHandlers,
      'text',
    ),
    focus,
    blur() {
      element.blur()
      selectionRange.value = undefined
    },
  })
}

export function setupInput<EM extends ThreeEventMap = ThreeEventMap>(
  state: ReturnType<typeof createInputState>,
  parentCtx: ParentContext,
  style: Signal<InputProperties<EM> | undefined>,
  properties: Signal<InputProperties<EM> | undefined>,
  defaultProperties: Signal<AllOptionalProperties | undefined>,
  object: Object3D,
  abortSignal: AbortSignal,
) {
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  setupNode(state, parentCtx, object, false, abortSignal)
  setupObjectTransform(parentCtx.root, object, state.transformMatrix, abortSignal)

  setupInstancedPanel(
    state.mergedProperties,
    state.backgroundOrderInfo,
    state.backgroundGroupDeps,
    parentCtx.root.panelGroupManager,
    state.globalMatrix,
    state.size,
    undefined,
    state.borderInset,
    parentCtx.clippingRect,
    state.isVisible,
    getDefaultPanelMaterialConfig(),
    abortSignal,
  )

  createCaret(
    state.mergedProperties,
    state.globalMatrix,
    state.caretTransformation,
    state.isVisible,
    state.backgroundOrderInfo,
    state.backgroundGroupDeps,
    parentCtx.clippingRect,
    parentCtx.root.panelGroupManager,
    abortSignal,
  )

  createSelection(
    state.mergedProperties,
    state.globalMatrix,
    state.selectionTransformations,
    state.isVisible,
    state.backgroundOrderInfo,
    state.backgroundGroupDeps,
    parentCtx.clippingRect,
    parentCtx.root.panelGroupManager,
    abortSignal,
  )

  const customLayouting = createInstancedText(
    state.mergedProperties,
    state.displayValueSignal,
    state.globalMatrix,
    state.node,
    state,
    state.isVisible,
    parentCtx.clippingRect,
    state.orderInfo,
    state.fontSignal,
    parentCtx.root.gylphGroupManager,
    state.selectionRange,
    state.selectionTransformations,
    state.caretTransformation,
    state.instancedTextRef,
    state.multiline ? 'break-word' : 'keep-all',
    abortSignal,
  )

  abortableEffect(() => state.node.value?.setCustomLayouting(customLayouting.value), abortSignal)

  setupInteractionPanel(state.interactionPanel, state.root, state.globalMatrix, state.size, abortSignal)

  setupMatrixWorldUpdate(state.updateMatrixWorld, false, object, state.root, state.globalMatrix, false, abortSignal)
  setupMatrixWorldUpdate(
    state.updateMatrixWorld,
    false,
    state.interactionPanel,
    state.root,
    state.globalMatrix,
    true,
    abortSignal,
  )

  setupLayoutListeners(style, properties, state.size, abortSignal)
  setupClippedListeners(style, properties, state.isClipped, abortSignal)

  setupHtmlInputElement(
    state.element,
    state.valueSignal,
    state.type,
    state.disabled,
    computedNonInheritableProperty(style, properties, 'tabIndex', 0),
    abortSignal,
  )

  setupUpdateHasFocus(
    state.element,
    state.hasFocusSignal,
    (hasFocus) => {
      properties.peek()?.onFocusChange?.(hasFocus)
      style.peek()?.onFocusChange?.(hasFocus)
    },
    abortSignal,
  )

  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, state.handlers)
  setupPointerEvents(
    state.mergedProperties,
    ancestorsHaveListeners,
    parentCtx.root,
    state.interactionPanel,
    false,
    abortSignal,
  )
}

const segmenter = typeof Intl === 'undefined' ? undefined : new Intl.Segmenter(undefined, { granularity: 'word' })

export function computedSelectionHandlers(
  type: Signal<InputType>,
  text: ReadonlySignal<string>,
  flexState: FlexNodeState,
  instancedTextRef: { current?: InstancedText },
  focus: (start?: number, end?: number, direction?: 'forward' | 'backward' | 'none') => void,
  disabled: Signal<boolean>,
) {
  return computed<EventHandlers | undefined>(() => {
    if (disabled.value) {
      return undefined
    }
    let dragState: { startCharIndex: number; pointerId: number } | undefined
    const onPointerFinish = (e: ThreePointerEvent) => {
      if (dragState == null || dragState.pointerId != e.pointerId) {
        return
      }
      e.stopImmediatePropagation?.()
      dragState = undefined
    }
    return {
      onPointerDown: (e) => {
        if (dragState != null || e.uv == null || instancedTextRef.current == null) {
          return
        }
        cancelBlur(e.nativeEvent)
        e.stopImmediatePropagation?.()
        if ('setPointerCapture' in e.object && typeof e.object.setPointerCapture === 'function') {
          e.object.setPointerCapture(e.pointerId)
        }
        const startCharIndex = uvToCharIndex(flexState, e.uv, instancedTextRef.current, 'between')
        dragState = {
          pointerId: e.pointerId,
          startCharIndex,
        }
        setTimeout(() => focus(startCharIndex, startCharIndex))
      },
      onDoubleClick: (e) => {
        if (segmenter == null || e.uv == null || instancedTextRef.current == null) {
          return
        }
        e.stopImmediatePropagation?.()
        if (type.peek() === 'password') {
          setTimeout(() => focus(0, text.peek().length, 'none'))
          return
        }
        const charIndex = uvToCharIndex(flexState, e.uv, instancedTextRef.current, 'on')
        const segments = segmenter.segment(text.peek())
        let segmentLengthSum = 0
        for (const { segment } of segments) {
          const segmentLength = segment.length
          if (charIndex < segmentLengthSum + segmentLength) {
            setTimeout(() => focus(segmentLengthSum, segmentLengthSum + segmentLength, 'none'))
            break
          }
          segmentLengthSum += segmentLength
        }
      },
      onPointerUp: onPointerFinish,
      onPointerLeave: onPointerFinish,
      onPointerCancel: onPointerFinish,
      onPointerMove: (e) => {
        if (dragState?.pointerId != e.pointerId || e.uv == null || instancedTextRef.current == null) {
          return
        }
        e.stopImmediatePropagation?.()
        const charIndex = uvToCharIndex(flexState, e.uv, instancedTextRef.current, 'between')

        const start = Math.min(dragState.startCharIndex, charIndex)
        const end = Math.max(dragState.startCharIndex, charIndex)
        const direction = dragState.startCharIndex < charIndex ? 'forward' : 'backward'

        setTimeout(() => focus(start, end, direction))
      },
    }
  })
}

export function createHtmlInputElement(
  selectionRange: Signal<Vector2Tuple | undefined>,
  onChange: (value: string) => void,
  multiline: boolean,
) {
  const element = document.createElement(multiline ? 'textarea' : 'input')
  const style = element.style
  style.setProperty('position', 'absolute')
  style.setProperty('left', '-1000vw')
  style.setProperty('top', '0')
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
  return element
}

function setupHtmlInputElement(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: Signal<string>,
  type: Signal<InputType>,
  disabled: Signal<boolean>,
  tabIndex: Signal<number>,
  abortSignal: AbortSignal,
) {
  document.body.appendChild(element)

  abortSignal.addEventListener('abort', () => element.remove())
  abortableEffect(() => void (element.value = value.value), abortSignal)
  abortableEffect(() => void (element.disabled = disabled.value), abortSignal)
  abortableEffect(() => void (element.tabIndex = tabIndex.value), abortSignal)
  abortableEffect(() => element.setAttribute('type', type.value), abortSignal)
}

function setupUpdateHasFocus(
  element: HTMLElement,
  hasFocusSignal: Signal<boolean>,
  onFocusChange: (focus: boolean) => void,
  abortSignal: AbortSignal,
) {
  if (abortSignal.aborted) {
    return
  }
  hasFocusSignal.value = document.activeElement === element
  const listener = () => {
    const hasFocus = document.activeElement === element
    if (hasFocus == hasFocusSignal.value) {
      return
    }
    hasFocusSignal.value = hasFocus
    onFocusChange(hasFocus)
  }
  element.addEventListener('focus', listener)
  element.addEventListener('blur', listener)
  abortSignal.addEventListener('abort', () => {
    element.removeEventListener('focus', listener)
    element.removeEventListener('blur', listener)
  })
}

function uvToCharIndex(
  { size: s, borderInset: b, paddingInset: p }: FlexNodeState,
  uv: Vector2,
  instancedText: InstancedText,
  position: 'between' | 'on',
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
  const y = (uv.y - 1) * height + bTop + pTop
  return instancedText.getCharIndex(x, y, position)
}
