import { custom, enum as enumSchema, literal, number, object, string, union } from 'zod'
import type { z } from 'zod'
import {
  isPercentageString,
  isViewportLengthString,
  type Percentage,
  type ViewportLength,
} from '../properties/values.js'

function defineSchema<T>(create: () => T): T {
  return create()
}

const percentageSchema = /* @__PURE__ */ defineSchema(() =>
  custom<Percentage>(isPercentageString, 'Expected a percentage string'),
)
const viewportLengthSchema = /* @__PURE__ */ defineSchema(() =>
  custom<ViewportLength>(isViewportLengthString, 'Expected a viewport length string'),
)

export const pointSchema = /* @__PURE__ */ defineSchema(() => union([number(), percentageSchema, viewportLengthSchema]))
export const pointOrAutoSchema = /* @__PURE__ */ defineSchema(() => union([pointSchema, literal('auto')]))

export const yogaPropertyShape = /* @__PURE__ */ defineSchema(
  () =>
    ({
      positionType: enumSchema(['static', 'relative', 'absolute']).optional(),
      positionTop: pointOrAutoSchema.optional(),
      positionLeft: pointOrAutoSchema.optional(),
      positionRight: pointOrAutoSchema.optional(),
      positionBottom: pointOrAutoSchema.optional(),
      alignContent: enumSchema([
        'auto',
        'flex-start',
        'center',
        'flex-end',
        'stretch',
        'baseline',
        'space-between',
        'space-around',
        'space-evenly',
      ]).optional(),
      alignItems: enumSchema([
        'auto',
        'flex-start',
        'center',
        'flex-end',
        'stretch',
        'baseline',
        'space-between',
        'space-around',
        'space-evenly',
      ]).optional(),
      alignSelf: enumSchema([
        'auto',
        'flex-start',
        'center',
        'flex-end',
        'stretch',
        'baseline',
        'space-between',
        'space-around',
        'space-evenly',
      ]).optional(),
      flexDirection: enumSchema(['column', 'column-reverse', 'row', 'row-reverse']).optional(),
      flexWrap: enumSchema(['no-wrap', 'wrap', 'wrap-reverse']).optional(),
      justifyContent: enumSchema([
        'flex-start',
        'center',
        'flex-end',
        'space-between',
        'space-around',
        'space-evenly',
      ]).optional(),
      marginTop: pointOrAutoSchema.optional(),
      marginLeft: pointOrAutoSchema.optional(),
      marginRight: pointOrAutoSchema.optional(),
      marginBottom: pointOrAutoSchema.optional(),
      flexBasis: pointOrAutoSchema.optional(),
      flexGrow: number().optional(),
      flexShrink: number().optional(),
      width: pointOrAutoSchema.optional(),
      height: pointOrAutoSchema.optional(),
      minWidth: pointSchema.optional(),
      minHeight: pointSchema.optional(),
      maxWidth: pointSchema.optional(),
      maxHeight: pointSchema.optional(),
      boxSizing: number().optional(),
      aspectRatio: number().optional(),
      borderTopWidth: number().optional(),
      borderLeftWidth: number().optional(),
      borderRightWidth: number().optional(),
      borderBottomWidth: number().optional(),
      overflow: enumSchema(['visible', 'hidden', 'scroll']).optional(),
      display: enumSchema(['flex', 'none', 'contents']).optional(),
      paddingTop: pointSchema.optional(),
      paddingLeft: pointSchema.optional(),
      paddingRight: pointSchema.optional(),
      paddingBottom: pointSchema.optional(),
      gapRow: pointSchema.optional(),
      gapColumn: pointSchema.optional(),
      direction: number().optional(),
    }) as const,
)

export const yogaOutPropertiesSchema = /* @__PURE__ */ defineSchema(() => object(yogaPropertyShape).strict())

export type YogaProperties = z.output<typeof yogaOutPropertiesSchema>
