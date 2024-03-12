import { ReadonlySignal, Signal, computed, effect, signal } from '@preact/signals-core'
import { InstancedText, TextAlignProperties, TextAppearanceProperties } from './render/instanced-text.js'
import { InstancedGlyphGroup } from './render/instanced-glyph-group.js'
import { FlexNode } from '../flex/node.js'
import { Group, Matrix4, WebGLRenderer } from 'three'
import { ClippingRect } from '../clipping.js'
import { Subscriptions, readReactive } from '../utils.js'
import { loadCachedFont } from './cache.js'
import { MeasureFunction, MeasureMode } from 'yoga-layout/wasm-async'
import { Font } from './font.js'
import { GlyphLayout, GlyphLayoutProperties, buildGlyphLayout, measureGlyphLayout } from './layout.js'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraDistanceRef, ElementType, OrderInfo } from '../order.js'
import { MergedProperties } from '../properties/merged.js'
import { createGetBatchedProperties } from '../properties/batched.js'

export type GetInstancedGlyphGroup = (majorIndex: number, font: Font) => InstancedGlyphGroup

export function createGetInstancedGlyphGroup(
  pixelSize: number,
  cameraDistance: CameraDistanceRef,
  groupsContainer: Group,
) {
  const map = new Map<Font, Map<number, InstancedGlyphGroup>>()
  const getGroup: GetInstancedGlyphGroup = (majorIndex, font) => {
    let groups = map.get(font)
    if (groups == null) {
      map.set(font, (groups = new Map()))
    }
    let group = groups?.get(majorIndex)
    if (group == null) {
      groups.set(
        majorIndex,
        (group = new InstancedGlyphGroup(font, pixelSize, cameraDistance, {
          majorIndex,
          elementType: ElementType.Text,
          minorIndex: 0,
        })),
      )
      groupsContainer.add(group)
    }
    return group
  }

  useFrame((_, delta) => {
    for (const groups of map.values()) {
      for (const group of groups.values()) {
        group.onFrame(delta)
      }
    }
  })

  return getGroup
}

export type FontFamilyUrls = Partial<Record<FontWeight, string>>

export type FontFamilies = Record<string, FontFamilyUrls>

const fontWeightNames = {
  thin: 100,
  'extra-light': 200,
  light: 300,
  normal: 400,
  medium: 500,
  'semi-bold': 600,
  bold: 700,
  'extra-bold': 800,
  black: 900,
  'extra-black': 950,
}

export type FontWeight = keyof typeof fontWeightNames | number

const alignPropertyKeys = ['horizontalAlign', 'verticalAlign']
const appearancePropertyKeys = ['color', 'opacity']
const glyphPropertyKeys = ['fontSize', 'letterSpacing', 'lineHeight', 'wordBreak']

export type InstancedTextProperties = TextAlignProperties &
  TextAppearanceProperties &
  Omit<GlyphLayoutProperties, 'text'> &
  FontFamilyProperties

export function createInstancedText(
  properties: Signal<MergedProperties>,
  text: string | ReadonlySignal<string> | Array<string | ReadonlySignal<string>>,
  matrix: Signal<Matrix4 | undefined>,
  node: FlexNode,
  isHidden: Signal<boolean> | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  orderInfo: OrderInfo,
  fontFamilies: FontFamilies | undefined,
  renderer: WebGLRenderer,
  getGroup: GetInstancedGlyphGroup,
  subscriptions: Subscriptions,
) {
  const fontSignal = computeFont(properties, fontFamilies, renderer, subscriptions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const textSignal = signal<string | Signal<string> | Array<string | Signal<string>>>(text)
  let layoutPropertiesRef: { current: GlyphLayoutProperties | undefined } = { current: undefined }

  const measureFunc = computeMeasureFunc(properties, fontSignal, textSignal, layoutPropertiesRef)

  const getAlign = createGetBatchedProperties(properties, alignPropertyKeys)
  const getAppearance = createGetBatchedProperties(properties, appearancePropertyKeys)

  const layoutSignal = signal<GlyphLayout | undefined>(undefined)
  subscriptions.push(
    node.addLayoutChangeListener(() => {
      const layoutProperties = layoutPropertiesRef.current
      if (layoutProperties == null) {
        return
      }
      const { size, paddingInset, borderInset } = node
      const [width, height] = size.value
      const [pTop, pRight, pBottom, pLeft] = paddingInset.value
      const [bTop, bRight, bBottom, bLeft] = borderInset.value
      const actualWidth = width - pRight - pLeft - bRight - bLeft
      const actualheight = height - pTop - pBottom - bTop - bBottom
      layoutSignal.value = buildGlyphLayout(layoutProperties, actualWidth, actualheight)
    }),
  )

  subscriptions.push(
    effect(() => {
      const font = fontSignal.value
      if (font == null) {
        return
      }
      const instancedText = new InstancedText(
        getGroup(orderInfo.majorIndex, font),
        getAlign,
        getAppearance,
        layoutSignal,
        matrix,
        isHidden,
        parentClippingRect,
      )
      return () => instancedText.destroy()
    }),
  )

  return measureFunc
}

const fontKeys = ['fontFamily', 'fontWeight']

export type FontFamilyProperties = { fontFamily?: string; fontWeight?: FontWeight }

const defaultFontFamilyUrls = {
  inter: {
    light: 'https://pmndrs.github.io/uikit/fonts/inter-light.json',
    normal: 'https://pmndrs.github.io/uikit/fonts/inter-normal.json',
    medium: 'https://pmndrs.github.io/uikit/fonts/inter-medium.json',
    'semi-bold': 'https://pmndrs.github.io/uikit/fonts/inter-semi-bold.json',
    bold: 'https://pmndrs.github.io/uikit/fonts/inter-bold.json',
  },
} satisfies FontFamilies

export function computeFont(
  properties: Signal<MergedProperties>,
  fontFamilies: FontFamilies = defaultFontFamilyUrls,
  renderer: WebGLRenderer,
  subscriptions: Subscriptions,
): Signal<Font | undefined> {
  const result = signal<Font | undefined>(undefined)
  const get = createGetBatchedProperties(properties, fontKeys)
  subscriptions.push(
    effect(() => {
      let fontWeight = (get('fontWeight') as FontWeight) ?? 'normal'
      if (typeof fontWeight === 'string') {
        fontWeight = fontWeightNames[fontWeight]
      }
      let fontFamily = get('fontFamily') as string
      if (fontFamily == null) {
        fontFamily = Object.keys(fontFamilies)[0]
      }
      const url = getMatchingFontUrl(fontFamilies[fontFamily], fontWeight)
      let canceled = false
      loadCachedFont(url, renderer, (font) => (canceled ? undefined : (result.value = font)))
      return () => (canceled = true)
    }),
  )
  return result
}

function getMatchingFontUrl(fontFamily: FontFamilyUrls, weight: number): string {
  let distance = Infinity
  let result: string | undefined
  for (const fontWeight in fontFamily) {
    const d = Math.abs(weight - getWeightNumber(fontWeight))
    if (d === 0) {
      return fontFamily[fontWeight]!
    }
    if (d < distance) {
      distance = d
      result = fontFamily[fontWeight]
    }
  }
  if (result == null) {
    throw new Error(`font family has no entries ${fontFamily}`)
  }
  return result
}

function getWeightNumber(value: string): number {
  if (value in fontWeightNames) {
    return fontWeightNames[value as keyof typeof fontWeightNames]
  }
  const number = parseFloat(value)
  if (isNaN(number)) {
    throw new Error(`invalid font weight "${value}"`)
  }
  return number
}

export function computeMeasureFunc(
  properties: Signal<MergedProperties>,
  fontSignal: Signal<Font | undefined>,
  textSignal: Signal<string | Signal<string> | Array<Signal<string> | string>>,
  propertiesRef: { current: GlyphLayoutProperties | undefined },
) {
  const get = createGetBatchedProperties(properties, glyphPropertyKeys)
  return computed<MeasureFunction | undefined>(() => {
    const font = fontSignal.value
    if (font == null) {
      return undefined
    }
    const textSignalValue = textSignal.value
    const text = Array.isArray(textSignalValue)
      ? textSignalValue.map((t) => readReactive(t)).join('')
      : readReactive(textSignalValue)
    const letterSpacing = (get('letterSpacing') as number) ?? 0
    const lineHeight = (get('lineHeight') as number) ?? 1.2
    const fontSize = (get('fontSize') as number) ?? 16
    const wordBreak = (get('wordBreak') as GlyphLayoutProperties['wordBreak']) ?? 'break-word'

    return (width, widthMode) => {
      const availableWidth = widthMode === MeasureMode.Undefined ? undefined : width
      return measureGlyphLayout(
        (propertiesRef.current = {
          font,
          fontSize,
          letterSpacing,
          lineHeight,
          text,
          wordBreak,
        }),
        availableWidth,
      )
    }
  })
}
