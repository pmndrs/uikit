import { boolean, enum as enumSchema, number, string } from 'zod'
import type { z } from 'zod'
import { createInPropertiesSchema, defineSchema, functionSchema } from '../properties/schema.js'
import { computed, ReadonlySignal, Signal, signal } from '@preact/signals-core'
import { EventHandlersProperties } from '../events.js'
import { Vector2Tuple } from 'three'
import { BaseOutProperties, InProperties, WithSignal } from '../properties/index.js'
import { getSelectionTransformations } from '../text/index.js'
import { abortableEffect } from '../utils.js'
import { Text, TextOutProperties, textDefaults, textOutPropertiesSchema } from './text.js'
import { setupCaret } from '../text/selection/caret.js'
import { createSelection } from '../text/selection/ranges.js'
import { setupSelectionHandlers } from '../text/selection/pointer.js'
import { updateHtmlSelectionRange } from '../text/selection/state.js'
import { createHtmlInputElement, setupHtmlInputElement, setupUpdateHasFocus } from '../text/input/hidden-input.js'
import { RenderContext } from '../context.js'
export const inputOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  textOutPropertiesSchema.omit({ text: true }).extend({
    placeholder: string().optional(),
    defaultValue: string().optional(),
    value: string().optional(),
    disabled: boolean().optional(),
    tabIndex: number().optional(),
    autocomplete: string().optional(),
    type: enumSchema(['text', 'password', 'number']).optional(),
    onValueChange: functionSchema.optional(),
    onFocusChange: functionSchema.optional(),
    whiteSpace: enumSchema(['normal', 'collapse', 'pre', 'pre-line']).optional(),
  }),
)
export const InputPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(inputOutPropertiesSchema),
)

export type InputType = 'text' | 'password' | 'number'

export type InputOutProperties = Omit<TextOutProperties, 'text'> & {
  placeholder?: string
  defaultValue?: string
  value?: string
  disabled: boolean
  tabIndex: number
  autocomplete: string
  type: InputType
  onValueChange?: (value: string) => void
  onFocusChange?: (focus: boolean) => void
}
export type InputProperties = z.input<typeof InputPropertiesSchema>

export const inputDefaults: InputOutProperties = {
  ...textDefaults,
  type: 'text',
  disabled: false,
  tabIndex: 0,
  autocomplete: '',
  whiteSpace: 'pre',
}

export class Input<OutProperties extends InputOutProperties = InputOutProperties> extends Text<OutProperties> {
  readonly element: HTMLInputElement | HTMLTextAreaElement

  readonly selectionRange: ReadonlySignal<Vector2Tuple | undefined>
  readonly hasFocus: Signal<boolean>
  private updateSelectionRange = () => {}

  readonly uncontrolledSignal = signal<string | undefined>(undefined)
  readonly currentSignal = computed(
    () => this.properties.value.value ?? this.uncontrolledSignal.value ?? this.properties.value.defaultValue ?? '',
  )

  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    protected inputConfig?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
      multiline?: boolean
      defaults?: WithSignal<OutProperties>
    },
  ) {
    const caretColor = signal<InputOutProperties['caretColor']>(undefined)
    const selectionHandlers = signal<EventHandlersProperties | undefined>(undefined)

    let element: HTMLInputElement | HTMLTextAreaElement | undefined
    const htmlSelectionRange = signal<Vector2Tuple | undefined>(undefined)
    const updateSelectionRange = () => updateHtmlSelectionRange(htmlSelectionRange, element)
    const hasFocus = signal<boolean>(false)
    const selectionRange = computed<Vector2Tuple | undefined>(() => {
      if (!hasFocus.value) {
        return undefined
      }
      return htmlSelectionRange.value
    })

    super(inputProperties, initialClasses, {
      defaults: inputDefaults as WithSignal<OutProperties>,
      dynamicHandlers: selectionHandlers,
      hasFocus,
      isPlaceholder: computed(() => this.currentSignal.value.length === 0),
      ...inputConfig,
      defaultOverrides: {
        cursor: 'text',
        ...({
          text: computed(() =>
            this.currentSignal.value.length === 0
              ? this.properties.value.placeholder
              : this.properties.value.type === 'password'
                ? '*'.repeat(this.currentSignal.value.length ?? 0)
                : this.currentSignal.value,
          ),
        } as any),
        caretColor,
        ...inputConfig?.defaultOverrides,
      } as InProperties<OutProperties>,
    })
    this.selectionRange = selectionRange
    this.hasFocus = hasFocus
    this.updateSelectionRange = updateSelectionRange
    abortableEffect(() => {
      caretColor.value = this.properties.value.color
    }, this.abortSignal)

    setupSelectionHandlers(
      selectionHandlers,
      this.properties,
      this.currentSignal,
      this,
      this.textLayout,
      this.focus.bind(this),
      this.abortSignal,
    )

    const textSelection = computed(() => getSelectionTransformations(this.textLayout.value, selectionRange.value))
    const caretTransformation = computed(() => textSelection.value.caret)
    const selectionTransformations = computed(() => textSelection.value.selections)
    const parentClippingRect = computed(() => this.parentContainer.value?.clippingRect.value)

    this.element = createHtmlInputElement(
      (newValue) => {
        if (this.properties.peek().value == null) {
          this.uncontrolledSignal.value = newValue
        }
        this.properties.peek().onValueChange?.(newValue)
      },
      inputConfig?.multiline ?? false,
      updateSelectionRange,
    )
    element = this.element

    setupCaret(
      this.properties,
      this.globalTextMatrix,
      caretTransformation,
      this.isVisible,
      this.backgroundOrderInfo,
      this.backgroundGroupDeps,
      parentClippingRect,
      this.root,
      this.abortSignal,
    )

    createSelection(
      this.properties,
      this.root,
      this.globalTextMatrix,
      selectionTransformations,
      this.isVisible,
      this.backgroundOrderInfo,
      this.backgroundGroupDeps,
      parentClippingRect,
      this.abortSignal,
    )

    setupHtmlInputElement(this.properties, this.element, this.currentSignal, this.abortSignal)

    setupUpdateHasFocus(
      this.element,
      this.hasFocus,
      (hasFocus) => {
        this.properties.peek().onFocusChange?.(hasFocus)
      },
      this.abortSignal,
    )
  }

  focus(start?: number, end?: number, direction?: 'forward' | 'backward' | 'none'): void {
    if (!this.hasFocus.peek()) {
      this.element.focus()
    }
    if (start != null && end != null) {
      this.element.setSelectionRange(start, end, direction)
    }
    this.updateSelectionRange()
  }

  clone(recursive?: boolean): this {
    const cloned = new Input(this.inputProperties, this.initialClasses, this.inputConfig) as this
    this.copyInto(cloned, recursive)
    return cloned
  }

  blur(): void {
    this.element.blur()
  }
}
