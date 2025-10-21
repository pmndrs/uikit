import { Signal } from '@preact/signals-core'
import { isDarkMode } from '../preferred-color-scheme.js'
import { RootContext } from '../context.js'
import type { SpecialLayerSections } from './layer.js'

export type Conditionals = Record<Exclude<(typeof SpecialLayerSections)[number], 'important'>, () => boolean>

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

function createResponsiveConditionals(root: Signal<RootContext>) {
  const conditionals: Pick<Conditionals, (typeof breakPointKeys)[number]> = {} as any

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

function createHoverConditionals(hoveredSignal: Signal<Array<number>>): Pick<Conditionals, 'hover'> {
  return {
    hover: () => hoveredSignal.value.length > 0,
  }
}

type WithActive<T> = T & {
  active?: T
}

function createActivePropertyTransfomers(activeSignal: Signal<Array<number>>): Pick<Conditionals, 'active'> {
  return {
    active: () => activeSignal.value.length > 0,
  }
}

type WithPreferredColorScheme<T> = { dark?: T } & T

const preferredColorSchemeConditionals: Pick<Conditionals, 'dark'> = {
  dark: () => isDarkMode.value,
}

type WithFocus<T> = T & {
  focus?: T
}

function createFocusPropertyTransformers(hasFocusSignal?: Signal<boolean>): Pick<Conditionals, 'focus'> {
  if (hasFocusSignal == null) {
    return {
      focus: () => false,
    }
  }
  return {
    focus: () => hasFocusSignal.value,
  }
}

type WithPlaceholderStyle<T> = T & {
  placeholderStyle?: T
}

function createPlaceholderPropertyTransformers(
  isPlaceholder?: Signal<boolean>,
): Pick<Conditionals, 'placeholderStyle'> {
  if (isPlaceholder == null) {
    return {
      placeholderStyle: () => false,
    }
  }
  return {
    placeholderStyle: () => isPlaceholder.value,
  }
}

export type WithImportant<T> = T & { important?: T }

export type WithConditionalsAndImportant<T> = WithHover<T> &
  WithResponsive<T> &
  WithPreferredColorScheme<T> &
  WithActive<T> &
  WithFocus<T> &
  WithImportant<T> &
  WithPlaceholderStyle<T>

export const conditionalKeys = ['dark', 'hover', 'active', 'focus', ...breakPointKeys]

export function createConditionals(
  root: Signal<RootContext>,
  hoveredSignal: Signal<Array<number>>,
  activeSignal: Signal<Array<number>>,
  hasFocusSignal?: Signal<boolean>,
  isPlaceholderSignal?: Signal<boolean>,
): Conditionals {
  return {
    ...preferredColorSchemeConditionals,
    ...createResponsiveConditionals(root),
    ...createHoverConditionals(hoveredSignal),
    ...createActivePropertyTransfomers(activeSignal),
    ...createFocusPropertyTransformers(hasFocusSignal),
    ...createPlaceholderPropertyTransformers(isPlaceholderSignal),
  }
}
