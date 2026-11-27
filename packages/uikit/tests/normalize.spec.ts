import { expect } from 'chai'
import { signal } from '@preact/signals-core'
import { computedGlyphOutProperties } from '../src/text/layout/normalize.js'
import type { Font } from '../src/text/font.js'

const font = {} as Font

function textProperties(text: unknown) {
  return signal({
    text,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 1.2,
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    tabSize: 8,
  }) as any
}

function normalizedText(text: unknown) {
  return computedGlyphOutProperties(textProperties(text), signal(font)).value?.text
}

describe('text normalization', () => {
  const cases: Array<[string, unknown, string]> = [
    ['string', 'Hello World', 'Hello World'],
    ['number', 1, '1'],
    ['zero', 0, '0'],
    ['negative and fractional number', -1.5, '-1.5'],
    ['undefined', undefined, ''],
    ['null', null, ''],
    ['boolean true', true, 'true'],
    ['boolean false', false, 'false'],
    ['array of strings', ['Hello', ' ', 'World'], 'Hello World'],
    ['array of numbers', [1, 2, 3], '123'],
    ['mixed array with null and undefined', ['a', null, 1, undefined, 'b'], 'a1b'],
    ['numeric signal', signal(42), '42'],
    ['array containing signals', ['count: ', signal(7)], 'count: 7'],
  ]

  for (const [name, input, expected] of cases) {
    it(`converts ${name} to text`, () => {
      expect(normalizedText(input)).to.equal(expected)
    })
  }

  it('updates when a numeric text signal changes', () => {
    const text = signal(1)
    const result = computedGlyphOutProperties(textProperties(text), signal(font))
    expect(result.value?.text).to.equal('1')
    text.value = 2
    expect(result.value?.text).to.equal('2')
  })

  it('returns undefined until a font is available', () => {
    const fontSignal = signal<Font | undefined>(undefined)
    const result = computedGlyphOutProperties(textProperties(5), fontSignal)
    expect(result.value).to.equal(undefined)
    fontSignal.value = font
    expect(result.value?.text).to.equal('5')
  })
})
