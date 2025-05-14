import { additionalTextDefaults } from '../text/render/instanced-text.js'

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

export type InputProperties<EM extends ThreeEventMap> = AllProperties<EM, AdditionalInputProperties>

export type InputType = 'text' | 'password'

export type AdditionalInputProperties = {
  html?: Omit<HTMLInputElement, 'value' | 'disabled' | 'type'>
  defaultValue?: string
  value?: string
  disabled?: boolean
  type: InputType
  onValueChange?: (value: string) => void
  onFocusChange?: (focus: boolean) => void
} & AdditionalTextProperties

const additionalInputDefaults = {
  type: 'text',
  disabled: false,
  ...additionalTextDefaults,
}

export type AdditionalInputDefaults = typeof additionalInputDefaults & {
  wordBreak: WordBreak
  caretOpacity: Signal<number>
  caretColor: Signal<ColorRepresentation>
}

export function createInputState<EM extends ThreeEventMap = ThreeEventMap>(
  object: Component,
  multiline: boolean,
  parentCtx?: ParentContext,
  renderContext?: RenderContext,
) {
  const flexState = createFlexNodeState()
  const rootContext = setupRootContext(parentCtx, object, flexState.size, renderContext)
  const hoveredSignal = signal<Array<number>>([])
  const activeSignal = signal<Array<number>>([])
  const hasFocusSignal = signal<boolean>(false)

  const properties: Properties<EM, AdditionalInputProperties, AdditionalInputDefaults> = new Properties<
    EM,
    AdditionalInputProperties,
    AdditionalInputDefaults
  >(
    allAliases,
    createConditionals(rootContext.root.size, hoveredSignal, activeSignal, hasFocusSignal),
    parentCtx?.properties,
    {
      wordBreak: multiline ? 'break-word' : 'keep-all',
      caretOpacity: computed(() => properties.get('opacity')),
      caretColor: computed(() => properties.get('color') ?? 0),
      ...additionalInputDefaults,
    },
  )

  const transformMatrix = computedTransformMatrix(properties, flexState)
  const globalMatrix = computedGlobalMatrix(
    parentCtx?.childrenMatrix ?? buildRootMatrix(properties, rootContext.root.size),
    transformMatrix,
  )

  const isClipped = computedIsClipped(
    parentCtx?.clippingRect,
    globalMatrix,
    flexState.size,
    properties.getSignal('pixelSize'),
  )
  const isVisible = computedIsVisible(flexState, isClipped, properties)

  const backgroundGroupDeps = computedPanelGroupDependencies(properties)
  const backgroundOrderInfo = computedOrderInfo(
    properties,
    'zIndexOffset',
    ElementType.Panel,
    backgroundGroupDeps,
    parentCtx?.orderInfo,
  )

  const selectionTransformations = signal<Array<SelectionTransformation>>([])
  const caretTransformation = signal<CaretTransformation | undefined>(undefined)
  const selectionRange = signal<Vector2Tuple | undefined>(undefined)

  const fontFamilies = computedFontFamilies(properties, parentCtx)
  const fontSignal = computedFont(properties, fontFamilies)
  const orderInfo = computedOrderInfo(
    undefined,
    'zIndexOffset',
    ElementType.Text,
    computedGylphGroupDependencies(fontSignal),
    backgroundOrderInfo,
  )

  const writeValue = signal<string | undefined>(undefined)

  const valueSignal = computed(
    () => properties.get('value') ?? writeValue.value ?? properties.get('defaultValue') ?? '',
  )

  const displayValueSignal = computed(() =>
    properties.get('type') === 'password' ? '*'.repeat(valueSignal.value.length ?? 0) : valueSignal.value,
  )

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

  const selectionHandlers = computedSelectionHandlers(properties, valueSignal, flexState, instancedTextRef, focus)

  const element = createHtmlInputElement(
    selectionRange,
    (newValue) => {
      if (properties.peek('value') == null) {
        writeValue.value = newValue
      }
      properties.peek('onValueChange')?.(newValue)
    },
    multiline,
  )

  buildRaycasting(object, rootContext.root, globalMatrix, parentCtx?.clippingRect, orderInfo, flexState)

  return Object.assign(flexState, rootContext, {
    panelMatrix: computedPanelMatrix(properties, globalMatrix, flexState.size, undefined),
    element,
    instancedTextRef,
    hoveredSignal,
    activeSignal,
    hasFocusSignal,
    properties,
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
    displayValueSignal,
    object,
    handlers: computedHandlers(properties, hoveredSignal, activeSignal, selectionHandlers, 'text'),
    focus,
    blur() {
      element.blur()
      selectionRange.value = undefined
    },
  })
}

export function setupInput(
  state: ReturnType<typeof createInputState>,
  parentCtx: ParentContext | undefined,
  abortSignal: AbortSignal,
) {
  setupRootContext(state, state.object, abortSignal)
  setupCursorCleanup(state.hoveredSignal, abortSignal)

  createNode(state, parentCtx, state.object, false, abortSignal)

  setupInstancedPanel(
    state.properties,
    state.backgroundOrderInfo,
    state.backgroundGroupDeps,
    state.root.panelGroupManager,
    state.panelMatrix,
    state.size,
    state.borderInset,
    parentCtx?.clippingRect,
    state.isVisible,
    getDefaultPanelMaterialConfig(),
    abortSignal,
  )

  setupCaret(
    state.properties,
    state.globalMatrix,
    state.caretTransformation,
    state.isVisible,
    state.backgroundOrderInfo,
    state.backgroundGroupDeps,
    parentCtx?.clippingRect,
    state.root.panelGroupManager,
    abortSignal,
  )

  createSelection(
    state.properties,
    state.globalMatrix,
    state.selectionTransformations,
    state.isVisible,
    state.backgroundOrderInfo,
    state.backgroundGroupDeps,
    parentCtx?.clippingRect,
    state.root.panelGroupManager,
    abortSignal,
  )

  const customLayouting = createInstancedText(
    state.properties,
    state.displayValueSignal,
    state.globalMatrix,
    state.node,
    state,
    state.isVisible,
    parentCtx?.clippingRect,
    state.orderInfo,
    state.fontSignal,
    state.root.gylphGroupManager,
    state.selectionRange,
    state.selectionTransformations,
    state.caretTransformation,
    state.instancedTextRef,
    abortSignal,
  )

  abortableEffect(() => state.node.value?.setCustomLayouting(customLayouting.value), abortSignal)

  setupBoundingSphere(
    state.object.boundingSphere,
    state.properties.getSignal('pixelSize'),
    state.globalMatrix,
    state.size,
    abortSignal,
  )

  const updateMatrixWorld = state.properties.getSignal('updateMatrixWorld')
  setupMatrixWorldUpdate(
    updateMatrixWorld,
    false,
    state.properties,
    state.size,
    state.object,
    state.root,
    state.globalMatrix,
    abortSignal,
  )

  setupLayoutListeners(state.properties, state.size, abortSignal)
  setupClippedListeners(state.properties, state.isClipped, abortSignal)

  setupHtmlInputElement(state.properties, state.element, state.valueSignal, abortSignal)

  setupUpdateHasFocus(
    state.element,
    state.hasFocusSignal,
    (hasFocus) => {
      state.properties.peek('onFocusChange')?.(hasFocus)
    },
    abortSignal,
  )

  const ancestorsHaveListeners = computedAncestorsHaveListeners(parentCtx, state.handlers)
  setupPointerEvents(state.properties, ancestorsHaveListeners, state.root, state.object, false, abortSignal)
}

const segmenter = typeof Intl === 'undefined' ? undefined : new Intl.Segmenter(undefined, { granularity: 'word' })

export function computedSelectionHandlers(
  properties: Properties<ThreeEventMap, AdditionalInputProperties, AdditionalInputDefaults>,
  text: ReadonlySignal<string>,
  flexState: FlexNodeState,
  instancedTextRef: { current?: InstancedText },
  focus: (start?: number, end?: number, direction?: 'forward' | 'backward' | 'none') => void,
) {
  return computed<EventHandlers | undefined>(() => {
    if (properties.get('disabled')) {
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
        if (properties.peek('type') === 'password') {
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
  properties: Properties<ThreeEventMap, AdditionalInputProperties, AdditionalInputDefaults>,
  element: HTMLInputElement | HTMLTextAreaElement,
  value: Signal<string>,
  abortSignal: AbortSignal,
) {
  document.body.appendChild(element)

  abortSignal.addEventListener('abort', () => element.remove())
  abortableEffect(() => void (element.value = value.value), abortSignal)
  abortableEffect(() => {
    properties.get('html')
    //TODO: apply properties
  }, abortSignal)
  abortableEffect(() => element.setAttribute('type', properties.get('type')), abortSignal)
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
