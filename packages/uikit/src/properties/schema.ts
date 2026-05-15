import { array, boolean, custom, enum as enumSchema, lazy, literal, number, object, string, tuple, union } from 'zod'
import type { z } from 'zod'
import { Signal } from '@preact/signals-core'
import type { ReadonlySignal } from '@preact/signals-core'
import { Color } from 'three'
import { yogaPropertyShape } from '../flex/schema.js'
import { allAliases } from './alias.js'
import type { AddAllAliases } from './alias.js'
import { FontFamiliesSchema, FontWeightSchema } from '../text/font.js'
import type { WhiteSpace, WordBreak } from '../text/index.js'
import type { ColorRepresentation } from '../utils.js'
import type { MaterialClass } from '../panel/index.js'
import type { AllowedPointerEventsType } from '../panel/interaction/pointer-events.js'
import {
  isNumericString,
  isPercentageString,
  isPixelLengthString,
  isViewportLengthString,
  type NumericString,
  type NumberLike,
  type NumberOrPixelLength,
  type Percentage,
  type PixelLength,
  type TransformLength,
  type TransformScale,
  type ViewportLength,
} from './values.js'

type AnyZod = z.ZodType<unknown, unknown>

export function defineSchema<T>(create: () => T): T {
  return create()
}

const conditionals = [
  'dark',
  'hover',
  'active',
  'focus',
  'placeholderStyle',
  'important',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
] as const

const isReadonlySignal = (value: unknown): value is Signal<unknown> =>
  value instanceof Signal ||
  (value != null &&
    typeof value === 'object' &&
    'value' in value &&
    ('peek' in value || 'subscribe' in value || 'notify' in value))

const signalSchema = /* @__PURE__ */ defineSchema(() =>
  custom<Signal<unknown>>(isReadonlySignal, 'Expected a signal-like object'),
)
export const functionSchema = /* @__PURE__ */ defineSchema(() =>
  custom<(...args: Array<any>) => any>((value) => typeof value === 'function', 'Expected a function'),
)
const constructorSchema = /* @__PURE__ */ defineSchema(() =>
  custom<{ new (...args: Array<any>): unknown }>((value) => typeof value === 'function', 'Expected a constructor'),
)
export const instanceSchema = <T>(name: string, ctor: { new (...args: Array<any>): T }) =>
  custom<T>((value) => value instanceof ctor, `Expected ${name}`)

export const numericStringSchema = /* @__PURE__ */ defineSchema(() =>
  custom<NumericString>(isNumericString, 'Expected a numeric string'),
)
const percentageSchema = /* @__PURE__ */ defineSchema(() =>
  custom<Percentage>(isPercentageString, 'Expected a percentage string'),
)
const pixelLengthSchema = /* @__PURE__ */ defineSchema(() =>
  custom<PixelLength>(isPixelLengthString, 'Expected a pixel length string'),
)
const viewportLengthSchema = /* @__PURE__ */ defineSchema(() =>
  custom<ViewportLength>(isViewportLengthString, 'Expected a viewport length string'),
)
export const numberLikeSchema = /* @__PURE__ */ defineSchema(
  () => union([number(), numericStringSchema]) as z.ZodType<NumberLike, NumberLike>,
)
export const numberOrPixelLengthSchema = /* @__PURE__ */ defineSchema(
  () => union([numberLikeSchema, pixelLengthSchema]) as z.ZodType<NumberOrPixelLength, NumberOrPixelLength>,
)
export const lengthSchema = /* @__PURE__ */ defineSchema(
  () =>
    union([numberOrPixelLengthSchema, percentageSchema, viewportLengthSchema]) as z.ZodType<
      TransformLength,
      TransformLength
    >,
)
export const scaleSchema = /* @__PURE__ */ defineSchema(
  () => union([numberLikeSchema, percentageSchema]) as z.ZodType<TransformScale, TransformScale>,
)
export const numberOrPercentageSchema = /* @__PURE__ */ defineSchema(() => union([numberLikeSchema, percentageSchema]))
const colorTupleSchema = /* @__PURE__ */ defineSchema(() =>
  union([tuple([number(), number(), number()]), tuple([number(), number(), number(), number()])]),
)
const colorValueSchema = /* @__PURE__ */ defineSchema(
  () =>
    union([string(), number(), colorTupleSchema, instanceSchema('Color', Color)]) as z.ZodType<
      ColorRepresentation,
      ColorRepresentation
    >,
)
const materialClassSchema = /* @__PURE__ */ defineSchema(() =>
  union([enumSchema(['glass', 'metal', 'plastic']), constructorSchema as z.ZodType<MaterialClass, MaterialClass>]),
)

function propertyValueSchema<T extends AnyZod>(
  schema: T,
): z.ZodType<
  z.output<T> | ReadonlySignal<z.input<T> | undefined | 'initial'> | 'initial',
  z.input<T> | ReadonlySignal<z.input<T> | undefined | 'initial'> | 'initial'
> {
  return union([schema, signalSchema, literal('initial')]) as any
}

export type SchemaPropertyValue<T> = T | undefined | 'initial' | ReadonlySignal<T | undefined | 'initial'>
export type SchemaLayerProperties<OutProperties extends object> = AddAllAliases<{
  [Key in keyof OutProperties]?: SchemaPropertyValue<OutProperties[Key]>
}>
export type SchemaInProperties<OutProperties extends object> = SchemaLayerProperties<OutProperties> & {
  '*'?: SchemaInProperties<OutProperties>
} & {
  [Key in (typeof conditionals)[number]]?: SchemaInProperties<OutProperties>
}

export function createInPropertiesSchema<T extends z.ZodRawShape>(
  outSchema: z.ZodObject<T>,
): z.ZodType<SchemaInProperties<z.output<z.ZodObject<T>>>, SchemaInProperties<z.input<z.ZodObject<T>>>> {
  const outShape = outSchema.shape
  const shape: Record<string, z.ZodTypeAny> = {}
  const valueSchemas = new Map<string, AnyZod>()

  for (const [key, schema] of Object.entries(outShape)) {
    const valueSchema = propertyValueSchema(schema as AnyZod)
    valueSchemas.set(key, valueSchema)
    shape[key] = valueSchema.optional()
  }

  for (const [alias, targets] of Object.entries(allAliases)) {
    const targetSchema = targets
      .map((target) => valueSchemas.get(target))
      .find((schema): schema is AnyZod => schema != null)
    if (targetSchema != null) {
      shape[alias] = targetSchema.optional()
    }
  }

  let result: z.ZodTypeAny
  result = lazy(() => {
    const recursiveShape: Record<string, z.ZodTypeAny> = { ...shape, '*': result.optional() }
    for (const key of conditionals) {
      recursiveShape[key] = result.optional()
    }
    return object(recursiveShape).strict()
  })
  return result as z.ZodType<SchemaInProperties<z.output<z.ZodObject<T>>>, SchemaInProperties<z.input<z.ZodObject<T>>>>
}

const eventHandlerShape = /* @__PURE__ */ defineSchema(() => ({
  onClick: functionSchema.optional(),
  onContextMenu: functionSchema.optional(),
  onDblClick: functionSchema.optional(),
  onWheel: functionSchema.optional(),
  onPointerUp: functionSchema.optional(),
  onPointerDown: functionSchema.optional(),
  onPointerOver: functionSchema.optional(),
  onPointerOut: functionSchema.optional(),
  onPointerEnter: functionSchema.optional(),
  onPointerLeave: functionSchema.optional(),
  onPointerMove: functionSchema.optional(),
  onPointerCancel: functionSchema.optional(),
}))

const panelShape = /* @__PURE__ */ defineSchema(() => ({
  borderTopLeftRadius: lengthSchema.optional(),
  borderTopRightRadius: lengthSchema.optional(),
  borderBottomLeftRadius: lengthSchema.optional(),
  borderBottomRightRadius: lengthSchema.optional(),
  backgroundColor: colorValueSchema.optional(),
  borderColor: colorValueSchema.optional(),
  borderBend: numberOrPercentageSchema.optional(),
}))

const scrollbarPanelShape = /* @__PURE__ */ defineSchema(() => ({
  scrollbarColor: colorValueSchema.optional(),
  scrollbarBorderRightWidth: numberOrPixelLengthSchema.optional(),
  scrollbarBorderTopWidth: numberOrPixelLengthSchema.optional(),
  scrollbarBorderLeftWidth: numberOrPixelLengthSchema.optional(),
  scrollbarBorderBottomWidth: numberOrPixelLengthSchema.optional(),
  scrollbarBorderTopLeftRadius: lengthSchema.optional(),
  scrollbarBorderTopRightRadius: lengthSchema.optional(),
  scrollbarBorderBottomLeftRadius: lengthSchema.optional(),
  scrollbarBorderBottomRightRadius: lengthSchema.optional(),
  scrollbarBorderColor: colorValueSchema.optional(),
  scrollbarBorderBend: numberOrPercentageSchema.optional(),
}))

const caretPanelShape = /* @__PURE__ */ defineSchema(() => ({
  caretColor: colorValueSchema.optional(),
  caretBorderRightWidth: numberOrPixelLengthSchema.optional(),
  caretBorderTopWidth: numberOrPixelLengthSchema.optional(),
  caretBorderLeftWidth: numberOrPixelLengthSchema.optional(),
  caretBorderBottomWidth: numberOrPixelLengthSchema.optional(),
  caretBorderTopLeftRadius: lengthSchema.optional(),
  caretBorderTopRightRadius: lengthSchema.optional(),
  caretBorderBottomLeftRadius: lengthSchema.optional(),
  caretBorderBottomRightRadius: lengthSchema.optional(),
  caretBorderColor: colorValueSchema.optional(),
  caretBorderBend: numberOrPercentageSchema.optional(),
}))

const selectionPanelShape = /* @__PURE__ */ defineSchema(() => ({
  selectionColor: colorValueSchema.optional(),
  selectionBorderRightWidth: numberOrPixelLengthSchema.optional(),
  selectionBorderTopWidth: numberOrPixelLengthSchema.optional(),
  selectionBorderLeftWidth: numberOrPixelLengthSchema.optional(),
  selectionBorderBottomWidth: numberOrPixelLengthSchema.optional(),
  selectionBorderTopLeftRadius: lengthSchema.optional(),
  selectionBorderTopRightRadius: lengthSchema.optional(),
  selectionBorderBottomLeftRadius: lengthSchema.optional(),
  selectionBorderBottomRightRadius: lengthSchema.optional(),
  selectionBorderColor: colorValueSchema.optional(),
  selectionBorderBend: numberOrPercentageSchema.optional(),
}))

const pointerEventsTypeFunctionSchema = /* @__PURE__ */ defineSchema(() =>
  custom<Extract<AllowedPointerEventsType, (...args: Array<any>) => boolean>>(
    (value) => typeof value === 'function',
    'Expected a pointer-events filter function',
  ),
)

export const baseOutPropertyShape = /* @__PURE__ */ defineSchema(
  () =>
    ({
      ...yogaPropertyShape,
      ...panelShape,
      zIndex: numberLikeSchema.optional(),
      zIndexOffset: numberLikeSchema.optional(),
      transformTranslateX: lengthSchema.optional(),
      transformTranslateY: lengthSchema.optional(),
      transformTranslateZ: numberOrPixelLengthSchema.optional(),
      transformRotateX: numberLikeSchema.optional(),
      transformRotateY: numberLikeSchema.optional(),
      transformRotateZ: numberLikeSchema.optional(),
      transformScaleX: scaleSchema.optional(),
      transformScaleY: scaleSchema.optional(),
      transformScaleZ: scaleSchema.optional(),
      transformOriginX: enumSchema(['left', 'center', 'middle', 'right']).optional(),
      transformOriginY: enumSchema(['top', 'center', 'middle', 'bottom']).optional(),
      scrollbarWidth: numberOrPixelLengthSchema.optional(),
      scrollbarZIndex: numberLikeSchema.optional(),
      ...scrollbarPanelShape,
      panelMaterialClass: materialClassSchema.optional(),
      receiveShadow: boolean().optional(),
      castShadow: boolean().optional(),
      depthWrite: boolean().optional(),
      depthTest: boolean().optional(),
      renderOrder: numberLikeSchema.optional(),
      visibility: enumSchema(['visible', 'hidden']).optional(),
      pointerEvents: enumSchema(['none', 'auto', 'listener']).optional(),
      pointerEventsType: union([
        literal('all'),
        pointerEventsTypeFunctionSchema,
        object({ allow: union([string(), array(string())]) }).strict(),
        object({ deny: union([string(), array(string())]) }).strict(),
      ]).optional(),
      pointerEventsOrder: numberLikeSchema.optional(),
      ...eventHandlerShape,
      onScroll: functionSchema.optional(),
      onHoverChange: functionSchema.optional(),
      onActiveChange: functionSchema.optional(),
      textAlign: enumSchema(['left', 'center', 'middle', 'right', 'justify']).optional(),
      fill: colorValueSchema.optional(),
      color: colorValueSchema.optional(),
      opacity: numberOrPercentageSchema.optional(),
      fontFamily: string().optional(),
      fontWeight: FontWeightSchema.optional(),
      fontFamilies: FontFamiliesSchema.optional(),
      letterSpacing: lengthSchema.optional(),
      lineHeight: lengthSchema.optional(),
      fontSize: lengthSchema.optional(),
      wordBreak: enumSchema(['keep-all', 'break-all', 'break-word'] satisfies Array<WordBreak>).optional(),
      whiteSpace: enumSchema(['normal', 'collapse', 'pre', 'pre-line'] satisfies Array<WhiteSpace>).optional(),
      tabSize: numberLikeSchema.optional(),
      verticalAlign: enumSchema(['top', 'center', 'middle', 'bottom']).optional(),
      caretWidth: numberOrPixelLengthSchema.optional(),
      ...caretPanelShape,
      ...selectionPanelShape,
      pixelSize: numberLikeSchema.optional(),
      sizeX: numberOrPixelLengthSchema.optional(),
      sizeY: numberOrPixelLengthSchema.optional(),
      anchorX: enumSchema(['left', 'center', 'middle', 'right']).optional(),
      anchorY: enumSchema(['top', 'center', 'middle', 'bottom']).optional(),
      cursor: string().optional(),
      id: string().optional(),
    }) as const,
)

export const baseOutPropertiesSchema = /* @__PURE__ */ defineSchema(() => object(baseOutPropertyShape).strict())
