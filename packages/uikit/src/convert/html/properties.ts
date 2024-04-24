import { ReadonlySignal, Signal } from '@preact/signals-core'
import { ColorRepresentation } from '../../utils.js'
import { CSSProperties } from 'react'

export type ConversionPropertyType = Array<string | Array<string>> //<- enum

export type ConversionPropertyTypes =
  | Array<Record<string, ConversionPropertyType>>
  | Record<string, ConversionPropertyType>

export type ConversionColorMap = Record<
  string,
  ReadonlySignal<ColorRepresentation> | ColorRepresentation | (() => ColorRepresentation)
>

export function isInheritingProperty(key: string): boolean {
  switch (key) {
    case 'opacity':
    case 'color':
    case 'horizontalAlign':
    case 'verticalAlign':
    case 'fontSize':
    case 'letterSpacing':
    case 'lineHeight':
    case 'wordBreak':
    case 'fontFamily':
    case 'fontWeight':
      return true
    default:
      return key.startsWith('caret') || key.startsWith('scrollbar') || key.startsWith('selection')
  }
}

const percentageRegex = /^(\d+|\d*\.\d+)\%$/

export function convertProperties(
  propertyTypes: ConversionPropertyTypes,
  properties: Record<string, unknown> | CSSProperties,
  colorMap: ConversionColorMap | undefined,
  convertKey?: (key: string) => string,
) {
  let result: Record<string, unknown> | undefined
  for (let key in properties) {
    if (convertKey != null) {
      key = convertKey(key)
    }
    const value: unknown = convertProperty(propertyTypes, key, properties[key as keyof CSSProperties], colorMap)
    if (value == null) {
      continue
    }
    if (result == null) {
      result = {}
    }
    result[key] = value
  }
  return result
}

export function convertProperty(
  propertyTypes: ConversionPropertyTypes,
  key: string,
  value: unknown,
  colorMap?: ConversionColorMap,
): boolean | string | number | ColorRepresentation | undefined {
  if (Array.isArray(propertyTypes)) {
    return firstNotNull(propertyTypes, (type) => convertProperty(type, key, value))
  }
  const types = propertyTypes[key]
  if (types == null) {
    return undefined
  }

  return firstNotNull(types, (type) => {
    if (Array.isArray(type)) {
      return typeof value === 'string' && type.includes(value) ? value : undefined
    }
    if (type === 'boolean') {
      return value != 'false'
    }
    if (type === 'string') {
      return typeof value === 'string' ? applyCustomColor(value, colorMap) ?? value : undefined
    }
    if (type === 'percentage') {
      return typeof value === 'string' && percentageRegex.test(value) ? value : undefined
    }
    //type === "number"
    switch (typeof value) {
      case 'number':
        if (key === 'lineHeight') {
          return `${value * 100}%` as any
        }
        return value
      case 'string':
        return toNumber(value)
      default:
        return undefined
    }
  })
}

function firstNotNull<T, K>(array: Array<T>, fn: (val: T) => K | undefined): K | undefined {
  const length = array.length
  for (let i = 0; i < length; i++) {
    const result = fn(array[i])
    if (result != null) {
      return result
    }
  }
  return undefined
}

const digitsWithUnitRegex = /^(\d+|\d*\.\d+)(\D*)$/

const unitMultiplierMap: Record<string, number> = {
  rem: 16,
  em: 16,
  px: 1,
  '': 1,
}

function toNumber(value: string): number | undefined {
  let result: RegExpExecArray | null
  result = digitsWithUnitRegex.exec(value)
  if (result == null) {
    return undefined
  }
  const [, float, unit] = result
  const multiplier = unitMultiplierMap[unit]
  if (multiplier == null) {
    return undefined
  }
  return Number.parseFloat(float) * multiplier
}

const variableRegex = /^\$(.+)$/

function applyCustomColor(
  value: string,
  customColors: ConversionColorMap | undefined,
): ColorRepresentation | undefined {
  if (customColors == null) {
    return undefined
  }
  const result = variableRegex.exec(value)
  if (result == null) {
    return value
  }
  const entry = customColors[result[1]]
  if (entry == null) {
    throw new Error(`unknown custom color "${result[1]}"`)
  }
  if (typeof entry === 'function') {
    return entry()
  }
  if (entry instanceof Signal) {
    return entry.value
  }
  return entry
}
