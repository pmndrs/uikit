import { ReadonlySignal, Signal, computed, signal } from '@preact/signals-core'
import { InstancedText, TextAlignProperties, TextAppearanceProperties } from './render/instanced-text.js'
import { InstancedGlyphGroup } from './render/instanced-glyph-group.js'
import { MutableRefObject, ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { FlexNode } from '../flex/node.js'
import { Group, Matrix4, Vector2Tuple, Vector3Tuple } from 'three'
import { ClippingRect } from '../clipping.js'
import { ManagerCollection, useGetBatchedProperties } from '../properties/utils.js'
import { readReactive, useSignalEffect } from '../utils.js'
import { loadCachedFont } from './cache.js'
import { MeasureFunction, MeasureMode } from 'yoga-layout/wasm-async'
import { Font } from './font.js'
import { GlyphLayout, GlyphLayoutProperties, buildGlyphLayout, measureGlyphLayout } from './layout.js'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraDistanceRef, ElementType, OrderInfo, useOrderInfo } from '../order.js'
import { SelectionBoxes } from '../selection.js'

export type GetInstancedGlyphGroup = (majorIndex: number, font: Font) => InstancedGlyphGroup

const InstancedGlyphContext = createContext<GetInstancedGlyphGroup | undefined>(undefined)

export const InstancedGlyphProvider = InstancedGlyphContext.Provider

export function useCreateGetInstancedGlyphGroup(
  pixelSize: number,
  cameraDistance: CameraDistanceRef,
  groupsContainer: Group,
) {
  const map = useMemo(() => new Map<Font, Map<number, InstancedGlyphGroup>>(), [])
  const getGroup = useCallback<GetInstancedGlyphGroup>(
    (majorIndex, font) => {
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pixelSize, cameraDistance, groupsContainer],
  )

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

const FontFamiliesContext = createContext<Record<string, FontFamilyUrls>>(null as any)

const defaultFontFamilyUrls = {
  inter: {
    light: 'https://pmndrs.github.io/uikit/fonts/inter-light.json',
    normal: 'https://pmndrs.github.io/uikit/fonts/inter-normal.json',
    medium: 'https://pmndrs.github.io/uikit/fonts/inter-medium.json',
    'semi-bold': 'https://pmndrs.github.io/uikit/fonts/inter-semi-bold.json',
    bold: 'https://pmndrs.github.io/uikit/fonts/inter-bold.json',
  },
} satisfies Record<string, FontFamilyUrls>

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

export function FontFamilyProvider<T extends string = never>(properties: {
  [Key in T]: Key extends 'children' ? ReactNode : FontFamilyUrls
}) {
  let { children, ...fontFamilies } = properties as any
  const existinFontFamilyUrls = useContext(FontFamiliesContext)
  if (existinFontFamilyUrls != null) {
    fontFamilies = { ...existinFontFamilyUrls, ...fontFamilies }
  }
  return <FontFamiliesContext.Provider value={fontFamilies}>{children}</FontFamiliesContext.Provider>
}

const alignPropertyKeys = ['horizontalAlign', 'verticalAlign'] as const
const appearancePropertyKeys = ['color', 'opacity'] as const
const glyphPropertyKeys = ['fontSize', 'letterSpacing', 'lineHeight', 'wordBreak'] satisfies Array<
  keyof GlyphLayoutProperties
>

export type InstancedTextProperties = TextAlignProperties &
  TextAppearanceProperties &
  Omit<GlyphLayoutProperties, 'text'> &
  FontFamilyProperties

export function useInstancedText(
  collection: ManagerCollection,
  text: string | ReadonlySignal<string> | Array<string | ReadonlySignal<string>>,
  matrix: Signal<Matrix4 | undefined>,
  node: FlexNode,
  isHidden: Signal<boolean> | undefined,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  parentOrderInfo: OrderInfo,
  selectionRange?: Signal<Vector2Tuple | undefined> | undefined,
  selectionBoxes?: Signal<SelectionBoxes> | undefined,
  caretPosition?: Signal<Vector3Tuple | undefined> | undefined,
  ref?: MutableRefObject<InstancedText | undefined> | undefined,
) {
  const orderInfo = useOrderInfo(ElementType.Text, undefined, undefined, parentOrderInfo)
  const getGroup = useContext(InstancedGlyphContext)
  if (getGroup == null) {
    throw new Error(`Can only be used inside a <Root> component.`)
  }
  const fontSignal = useFont(collection)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const textSignal = useMemo(() => signal<string | Signal<string> | Array<string | Signal<string>>>(text), [])
  textSignal.value = text
  const propertiesRef = useRef<GlyphLayoutProperties | undefined>(undefined)

  const measureFunc = useMeasureFunc(collection, fontSignal, textSignal, propertiesRef)

  const alignProperties = useGetBatchedProperties<TextAlignProperties>(collection, alignPropertyKeys)
  const appearanceProperties = useGetBatchedProperties<TextAppearanceProperties>(collection, appearancePropertyKeys)

  const layoutSignal = useMemo(() => signal<GlyphLayout | undefined>(undefined), [])
  useEffect(
    () =>
      node.addLayoutChangeListener(() => {
        const layoutProperties = propertiesRef.current
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [node],
  )

  useSignalEffect(() => {
    const font = fontSignal.value
    if (font == null) {
      return
    }
    const instancedText = new InstancedText(
      getGroup(orderInfo.majorIndex, font),
      alignProperties,
      appearanceProperties,
      layoutSignal,
      matrix,
      isHidden,
      parentClippingRect,
      selectionRange,
      selectionBoxes,
      caretPosition,
    )
    if (ref != null) {
      ref.current = instancedText
    }
    return () => instancedText.destroy()
  }, [getGroup, matrix, node, isHidden, parentClippingRect, orderInfo.majorIndex, selectionBoxes, ref])

  return measureFunc
}

const fontKeys = ['fontFamily', 'fontWeight'] as const

export type FontFamilyProperties = { fontFamily?: string; fontWeight?: FontWeight }

export function useFont(collection: ManagerCollection) {
  const result = useMemo(() => signal<Font | undefined>(undefined), [])
  const fontFamilies = useContext(FontFamiliesContext) ?? defaultFontFamilyUrls
  const getProperties = useGetBatchedProperties<FontFamilyProperties>(collection, fontKeys)
  const renderer = useThree(({ gl }) => gl)
  useSignalEffect(() => {
    const get = getProperties.value
    if (get == null) {
      return
    }
    let fontWeight = get('fontWeight') ?? 'normal'
    if (typeof fontWeight === 'string') {
      fontWeight = fontWeightNames[fontWeight]
    }
    let fontFamily = get('fontFamily')
    if (fontFamily == null) {
      fontFamily = Object.keys(fontFamilies)[0]
    }
    const url = getMatchingFontUrl(fontFamilies[fontFamily], fontWeight)
    let canceled = false
    loadCachedFont(url, renderer, (font) => (canceled ? undefined : (result.value = font)))
    return () => (canceled = true)
  }, [fontFamilies, renderer])
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

export function useMeasureFunc(
  collection: ManagerCollection,
  fontSignal: Signal<Font | undefined>,
  textSignal: Signal<string | Signal<string> | Array<Signal<string> | string>>,
  propertiesRef: MutableRefObject<GlyphLayoutProperties | undefined>,
) {
  const getGlyphProperties = useGetBatchedProperties<GlyphLayoutProperties>(collection, glyphPropertyKeys)
  const measureFunc = useMemo(
    () =>
      computed<MeasureFunction | undefined>(() => {
        const font = fontSignal.value
        const get = getGlyphProperties.value
        if (font == null || get == null) {
          return undefined
        }
        const textSignalValue = textSignal.value
        const layoutProperties: GlyphLayoutProperties = {
          font,
          fontSize: get('fontSize') ?? 16,
          letterSpacing: get('letterSpacing') ?? 0,
          lineHeight: get('lineHeight') ?? 1.2,
          text: Array.isArray(textSignalValue)
            ? textSignalValue.map((t) => readReactive(t)).join('')
            : readReactive(textSignalValue),
          wordBreak: get('wordBreak') ?? 'break-word',
        }
        propertiesRef.current = layoutProperties

        return (width, widthMode) =>
          measureGlyphLayout(layoutProperties, widthMode === MeasureMode.Undefined ? undefined : width)
      }),
    [fontSignal, getGlyphProperties, propertiesRef, textSignal],
  )
  return measureFunc
}
