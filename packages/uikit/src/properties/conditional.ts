import { Signal } from '@preact/signals-core'
import { isDarkMode } from '../preferred-color-scheme.js'
import { RootContext } from '../context.js'

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

function createResponsiveConditionals(root: Signal<RootContext>): Conditionals {
  const conditionals: Conditionals = {}

  for (let i = 0; i < breakPointKeysLength; i++) {
    const key = breakPointKeys[i]!
    conditionals[key] = () => {
      const rootWidth = root.value.component.size.value?.[0] ?? 0
      return rootWidth > breakPoints[key]
    }
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
    return {
      focus: () => false,
    }
  }
  return {
    focus: () => hasFocusSignal.value,
  }
}

export type WithImportant<T> = T & { important?: T }

export type WithConditionalsAndImportant<T> = WithHover<T> &
  WithResponsive<T> &
  WithPreferredColorScheme<T> &
  WithActive<T> &
  WithFocus<T> &
  WithImportant<T>

export const conditionalKeys = ['dark', 'hover', 'active', 'focus', ...breakPointKeys]

export function createConditionals(
  root: Signal<RootContext>,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  hasFocusSignal?: Signal<boolean>,
) {
  return {
    ...preferredColorSchemeConditionals,
    ...createResponsiveConditionals(root),
    ...createHoverConditionals(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
    ...createFocusPropertyTransformers(hasFocusSignal),
  }
}
