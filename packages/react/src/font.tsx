import {
  Font,
  FontFamilies,
  FontFamilyUrls,
  FontWeight,
  GlyphLayoutProperties,
  Initializers,
  MergedProperties,
  Subscriptions,
  computedFont,
  initialize,
  measureGlyphLayout,
  unsubscribeSubscriptions,
} from '@pmndrs/uikit/internals'
import { signal } from '@preact/signals-core'
import { useThree } from '@react-three/fiber'
import { useContext, createContext, ReactNode, useCallback, useEffect, useMemo } from 'react'

const FontFamiliesContext = createContext<FontFamilies>(null as any)

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

export function useFontFamilies(): FontFamilies | undefined {
  return useContext(FontFamiliesContext)
}

/**
 * @returns a function that measure the text and returns the width and height if the font is already loaded. Else undefined
 */
export function useMeasureFont(fontFamily?: string, fontWeight?: FontWeight) {
  const fontFamilies = useFontFamilies()
  const propertiesSignal = useMemo(() => signal<MergedProperties>(new MergedProperties()), [])
  propertiesSignal.value = new MergedProperties()
  propertiesSignal.value.add('fontFamily', fontFamily)
  propertiesSignal.value.add('fontWeight', fontWeight)
  const initializers = useMemo<Initializers>(() => [], [])
  const renderer = useThree((state) => state.gl)
  const font = useMemo(
    () => computedFont(propertiesSignal, signal(fontFamilies), renderer, initializers),
    [fontFamilies, initializers, propertiesSignal, renderer],
  )
  useEffect(() => {
    const subscriptions: Subscriptions = []
    initialize(initializers, subscriptions)
    return () => unsubscribeSubscriptions(subscriptions)
  }, [initializers])
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
