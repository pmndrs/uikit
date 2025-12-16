import { expect } from 'chai'
import { signal } from '@preact/signals-core'
import { computedCustomLayouting, GlyphOutProperties, Font } from '../src/text/index.js'
import { Texture } from 'three'

// Create a minimal mock Font for testing text conversion
function createMockFont() {
  const mockFontInfo = {
    info: { size: 16 },
    common: { scaleW: 512, scaleH: 512, lineHeight: 16 },
    distanceField: { distanceRange: 4 },
    chars: [
      {
        char: '?',
        x: 0,
        y: 0,
        width: 8,
        height: 8,
        xoffset: 0,
        yoffset: 0,
        xadvance: 8,
        uvX: 0,
        uvY: 0,
        uvWidth: 0,
        uvHeight: 0,
      },
    ],
    kernings: [],
  }

  // Create a minimal texture mock
  const mockTexture = { image: { width: 512, height: 512 } } as Texture

  return new Font(mockFontInfo, mockTexture)
}

describe('text layout - text type conversion', () => {
  function testTextConversion(textValue: any, expectedText: string, description: string) {
    it(`should convert ${description} to string`, () => {
      const font = createMockFont()
      const fontSignal = signal(font)

      // Create properties signal with the text property to test
      const properties = signal({
        text: textValue,
        tabSize: 2,
        whiteSpace: 'normal' as const,
        fontSize: 16,
        letterSpacing: 0,
        lineHeight: 1.2,
        wordBreak: 'break-word' as const,
      })

      const propertiesRef: { current: GlyphOutProperties | undefined } = { current: undefined }

      const layouting = computedCustomLayouting(properties as any, fontSignal, propertiesRef)

      // Access the computed value to trigger the computation
      const result = layouting.value

      // Check that the text was correctly converted in the propertiesRef
      expect(propertiesRef.current?.text).to.equal(expectedText)
      expect(typeof propertiesRef.current?.text).to.equal('string')
    })
  }

  testTextConversion(1, '1', 'number')
  testTextConversion(0, '0', 'zero')
  testTextConversion('Hello World', 'Hello World', 'string')
  testTextConversion(undefined, '', 'undefined')
  testTextConversion(null, '', 'null')
  testTextConversion(true, 'true', 'boolean true')
  testTextConversion(false, 'false', 'boolean false')
  testTextConversion(['Hello', ' ', 'World'], 'Hello World', 'array')
  testTextConversion(['A', 'B', 'C'], 'ABC', 'array without spaces')
  testTextConversion([1, 2, 3], '123', 'array of numbers')

  it('should handle signals in text property', () => {
    const font = createMockFont()
    const fontSignal = signal(font)

    const textSignal = signal(42)

    const properties = signal({
      text: textSignal as any,
      tabSize: 2,
      whiteSpace: 'normal' as const,
      fontSize: 16,
      letterSpacing: 0,
      lineHeight: 1.2,
      wordBreak: 'break-word' as const,
    })

    const propertiesRef: { current: GlyphOutProperties | undefined } = { current: undefined }

    const layouting = computedCustomLayouting(properties as any, fontSignal, propertiesRef)

    // Access the computed value to trigger the computation
    layouting.value

    // Signal values should be read and converted to string
    expect(propertiesRef.current?.text).to.equal('42')
  })
})
