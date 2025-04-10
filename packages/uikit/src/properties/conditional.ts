import { Signal } from '@preact/signals-core'
import { Vector2Tuple } from 'three'
import { isDarkMode } from '../preferred-color-scheme.js'

export type Conditionals = Record<string, () => boolean>

const breakPoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}
const breakPointKeys = Object.keys(breakPoints) as Array<keyof typeof breakPoints>
const breakPointKeysLength = breakPointKeys.length

type WithResponsive<T> = T & {
  [Key in keyof typeof breakPoints]?: T
}

function createResponsiveConditionals(rootSize: Signal<Vector2Tuple | undefined>): Conditionals {
  const conditionals: Conditionals = {}

  for (let i = 0; i < breakPointKeysLength; i++) {
    const key = breakPointKeys[i]!
    conditionals[key] = () => (rootSize.value?.[0] ?? 0) > breakPoints[key]
  }

  return conditionals
}

type WithHover<T> = T & {
  hover?: T
}

function createHoverConditionals(hoveredSignal: Signal<Array<number>>): Conditionals {
  return {
    hover: () => hoveredSignal.value.length > 0,
  }
}

type WithActive<T> = T & {
  active?: T
}

function createActivePropertyTransfomers(activeSignal: Signal<Array<number>>): Conditionals {
  return {
    active: () => activeSignal.value.length > 0,
  }
}

type WithPreferredColorScheme<T> = { dark?: T } & T

const preferredColorSchemeConditionals: Conditionals = {
  dark: () => isDarkMode.value,
}

type WithFocus<T> = T & {
  focus?: T
}

function createFocusPropertyTransformers(hasFocusSignal?: Signal<boolean>): Conditionals {
  if (hasFocusSignal == null) {
    return {}
  }
  return {
    focus: () => hasFocusSignal.value,
  }
}

export type WithConditionals<T> = WithHover<T> &
  WithResponsive<T> &
  WithPreferredColorScheme<T> &
  WithActive<T> &
  WithFocus<T>

export function createConditionals(
  rootSize: Signal<Vector2Tuple | undefined>,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  hasFocusSignal?: Signal<boolean>,
) {
  return {
    ...preferredColorSchemeConditionals,
    ...createResponsiveConditionals(rootSize),
    ...createHoverConditionals(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
    ...createFocusPropertyTransformers(hasFocusSignal),
  }
}
