import {
  Font,
  FontFamilies,
  FontFamilyWeightMap,
  FontWeight,
  GlyphLayoutProperties,
  MergedProperties,
  computedFont,
  measureGlyphLayout,
} from '@pmndrs/uikit/internals'
import { signal } from '@preact/signals-core'
import { useThree } from '@react-three/fiber'
import { useContext, createContext, ReactNode, useCallback, useEffect, useMemo } from 'react'

const FontFamiliesContext = createContext<FontFamilies>(null as any)

export function FontFamilyProvider<T extends string = never>(properties: {
  [Key in T]: Key extends 'children' ? ReactNode : FontFamilyWeightMap
}) {
  let { children, ...fontFamilies } = properties as any
  const existinFontFamilyUrls = useContext(FontFamiliesContext)
  if (existinFontFamilyUrls != null) {
    fontFamilies = { ...existinFontFamilyUrls, ...fontFamilies }
  }
  return <FontFamiliesContext.Provider value={fontFamilies}>{children}</FontFamiliesContext.Provider>
}

export function useFontFamilies(): FontFamilies | undefined {
  return useContext(FontFamiliesContext)
}

/**
 * @returns a function that measure the text and returns the width and height if the font is already loaded. Else undefined
 */
export function useMeasureText(fontFamily?: string, fontWeight?: FontWeight) {
  const propertiesSignal = useMemo(() => signal<MergedProperties>(new MergedProperties()), [])
  propertiesSignal.value = new MergedProperties()
  propertiesSignal.value.add('fontFamily', fontFamily)
  propertiesSignal.value.add('fontWeight', fontWeight)
  const renderer = useThree((state) => state.gl)
  const fontFamilies = useMemo(() => signal<FontFamilies | undefined>(undefined as any), [])
  fontFamilies.value = useFontFamilies()
  const font = useMemo(
    () => computedFont(propertiesSignal, fontFamilies, renderer),
    [fontFamilies, propertiesSignal, renderer],
  )
  return useCallback(
    async (properties: Omit<GlyphLayoutProperties, 'font'> & { availableWidth?: number }) => {
      let fontValue = font.peek()
      if (fontValue == null) {
        fontValue = await new Promise<Font>((resolve) => {
          const unsubscribe = font.subscribe((font) => {
            if (font == null) {
              return
            }
            unsubscribe()
            resolve(font)
          })
        })
      }
      return measureGlyphLayout({ ...properties, font: fontValue }, properties.availableWidth)
    },
    [font],
  )
}
