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
  type Percentage,
  type PixelLength,
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

const numericStringSchema = /* @__PURE__ */ defineSchema(() =>
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
const numericValueSchema = /* @__PURE__ */ defineSchema(() => union([number(), numericStringSchema]))
const lengthSchema = /* @__PURE__ */ defineSchema(() =>
  union([numericValueSchema, pixelLengthSchema, percentageSchema, viewportLengthSchema]),
)
const scaleSchema = /* @__PURE__ */ defineSchema(() => union([number(), percentageSchema]))
const numberOrStringSchema = /* @__PURE__ */ defineSchema(() => union([number(), string()]))
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
  borderTopLeftRadius: numberOrStringSchema.optional(),
  borderTopRightRadius: numberOrStringSchema.optional(),
  borderBottomLeftRadius: numberOrStringSchema.optional(),
  borderBottomRightRadius: numberOrStringSchema.optional(),
  backgroundColor: colorValueSchema.optional(),
  borderColor: colorValueSchema.optional(),
  borderBend: union([number(), percentageSchema]).optional(),
}))

const scrollbarPanelShape = /* @__PURE__ */ defineSchema(() => ({
  scrollbarColor: colorValueSchema.optional(),
  scrollbarBorderRightWidth: number().optional(),
  scrollbarBorderTopWidth: number().optional(),
  scrollbarBorderLeftWidth: number().optional(),
  scrollbarBorderBottomWidth: number().optional(),
  scrollbarBorderTopLeftRadius: numberOrStringSchema.optional(),
  scrollbarBorderTopRightRadius: numberOrStringSchema.optional(),
  scrollbarBorderBottomLeftRadius: numberOrStringSchema.optional(),
  scrollbarBorderBottomRightRadius: numberOrStringSchema.optional(),
  scrollbarBorderColor: colorValueSchema.optional(),
  scrollbarBorderBend: union([number(), percentageSchema]).optional(),
}))

const caretPanelShape = /* @__PURE__ */ defineSchema(() => ({
  caretColor: colorValueSchema.optional(),
  caretBorderRightWidth: number().optional(),
  caretBorderTopWidth: number().optional(),
  caretBorderLeftWidth: number().optional(),
  caretBorderBottomWidth: number().optional(),
  caretBorderTopLeftRadius: numberOrStringSchema.optional(),
  caretBorderTopRightRadius: numberOrStringSchema.optional(),
  caretBorderBottomLeftRadius: numberOrStringSchema.optional(),
  caretBorderBottomRightRadius: numberOrStringSchema.optional(),
  caretBorderColor: colorValueSchema.optional(),
  caretBorderBend: union([number(), percentageSchema]).optional(),
}))

const selectionPanelShape = /* @__PURE__ */ defineSchema(() => ({
  selectionColor: colorValueSchema.optional(),
  selectionBorderRightWidth: number().optional(),
  selectionBorderTopWidth: number().optional(),
  selectionBorderLeftWidth: number().optional(),
  selectionBorderBottomWidth: number().optional(),
  selectionBorderTopLeftRadius: numberOrStringSchema.optional(),
  selectionBorderTopRightRadius: numberOrStringSchema.optional(),
  selectionBorderBottomLeftRadius: numberOrStringSchema.optional(),
  selectionBorderBottomRightRadius: numberOrStringSchema.optional(),
  selectionBorderColor: colorValueSchema.optional(),
  selectionBorderBend: union([number(), percentageSchema]).optional(),
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
      zIndex: number().optional(),
      zIndexOffset: number().optional(),
      transformTranslateX: lengthSchema.optional(),
      transformTranslateY: lengthSchema.optional(),
      transformTranslateZ: number().optional(),
      transformRotateX: number().optional(),
      transformRotateY: number().optional(),
      transformRotateZ: number().optional(),
      transformScaleX: scaleSchema.optional(),
      transformScaleY: scaleSchema.optional(),
      transformScaleZ: scaleSchema.optional(),
      transformOriginX: enumSchema(['left', 'center', 'middle', 'right']).optional(),
      transformOriginY: enumSchema(['top', 'center', 'middle', 'bottom']).optional(),
      scrollbarWidth: number().optional(),
      scrollbarZIndex: number().optional(),
      ...scrollbarPanelShape,
      panelMaterialClass: materialClassSchema.optional(),
      receiveShadow: boolean().optional(),
      castShadow: boolean().optional(),
      depthWrite: boolean().optional(),
      depthTest: boolean().optional(),
      renderOrder: number().optional(),
      visibility: enumSchema(['visible', 'hidden']).optional(),
      pointerEvents: enumSchema(['none', 'auto', 'listener']).optional(),
      pointerEventsType: union([
        literal('all'),
        pointerEventsTypeFunctionSchema,
        object({ allow: union([string(), array(string())]) }).strict(),
        object({ deny: union([string(), array(string())]) }).strict(),
      ]).optional(),
      pointerEventsOrder: number().optional(),
      ...eventHandlerShape,
      onScroll: functionSchema.optional(),
      onHoverChange: functionSchema.optional(),
      onActiveChange: functionSchema.optional(),
      textAlign: enumSchema(['left', 'center', 'middle', 'right', 'justify']).optional(),
      fill: colorValueSchema.optional(),
      color: colorValueSchema.optional(),
      opacity: union([number(), percentageSchema]).optional(),
      fontFamily: string().optional(),
      fontWeight: FontWeightSchema.optional(),
      fontFamilies: FontFamiliesSchema.optional(),
      letterSpacing: numberOrStringSchema.optional(),
      lineHeight: numberOrStringSchema.optional(),
      fontSize: numberOrStringSchema.optional(),
      wordBreak: enumSchema(['keep-all', 'break-all', 'break-word'] satisfies Array<WordBreak>).optional(),
      whiteSpace: enumSchema(['normal', 'collapse', 'pre', 'pre-line'] satisfies Array<WhiteSpace>).optional(),
      tabSize: number().optional(),
      verticalAlign: enumSchema(['top', 'center', 'middle', 'bottom']).optional(),
      caretWidth: number().optional(),
      ...caretPanelShape,
      ...selectionPanelShape,
      pixelSize: number().optional(),
      sizeX: number().optional(),
      sizeY: number().optional(),
      anchorX: enumSchema(['left', 'center', 'middle', 'right']).optional(),
      anchorY: enumSchema(['top', 'center', 'middle', 'bottom']).optional(),
      cursor: string().optional(),
      id: string().optional(),
    }) as const,
)

export const baseOutPropertiesSchema = /* @__PURE__ */ defineSchema(() => object(baseOutPropertyShape).strict())
