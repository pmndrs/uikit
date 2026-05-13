import { expect } from 'chai'
import {
  buildPositionedGlyphLayout,
  getCaretTransformation,
  getCharIndex,
  getGlobalTextMatrix,
  getSelectionTransformations,
  GlyphOutProperties,
} from '../src/text/layout/index.js'
import { GlyphInfo } from '../src/text/font.js'
import { Matrix4 } from 'three'

const glyph = (char: string): GlyphInfo => ({
  id: char.charCodeAt(0),
  index: char.charCodeAt(0),
  char,
  width: 1,
  height: 1,
  x: 0,
  y: 0,
  xoffset: 0,
  yoffset: 0,
  xadvance: 1,
  chnl: 0,
  page: 0,
})

const font = {
  getGlyphInfo: glyph,
  getKerning: () => 0,
} as GlyphOutProperties['font']

function layout(text: string, overrides: Partial<GlyphOutProperties> = {}) {
  return buildPositionedGlyphLayout(
    {
      font,
      text,
      fontSize: 10,
      lineHeight: 12,
      letterSpacing: 0,
      wordBreak: 'break-word',
      ...overrides,
    },
    100,
    40,
    'left',
    'top',
  )
}

describe('positioned text layout', () => {
  it('positions glyphs with the same coordinate space as rendering', () => {
    const result = layout('ab')

    expect(result.lines).to.have.length(1)
    expect(result.lines[0]!.entries).to.deep.include({
      type: 'glyph',
      charIndex: 0,
      char: 'a',
      glyphInfo: glyph('a'),
      x: -50,
      y: 19,
      width: 10,
    })
    expect(result.lines[0]!.entries[1]).to.include({
      type: 'glyph',
      charIndex: 1,
      char: 'b',
      x: -40,
      y: 19,
      width: 10,
    })
  })

  it('answers character hit-testing from the layout result', () => {
    const result = layout('ab')

    expect(getCharIndex(result, 0, 0, 'between')).to.equal(0)
    expect(getCharIndex(result, 6, 0, 'between')).to.equal(1)
    expect(getCharIndex(result, 16, 0, 'between')).to.equal(3)
  })

  it('computes caret geometry from the layout result', () => {
    const result = layout('ab')

    expect(getCaretTransformation(result, 1)).to.deep.equal({
      position: [-40, 14],
      height: 10,
    })
  })

  it('computes selection geometry from the layout result', () => {
    const result = layout('ab')

    expect(getSelectionTransformations(result, [0, 2])).to.deep.equal({
      caret: undefined,
      selections: [
        {
          position: [-40, 14],
          size: [20, 12],
        },
      ],
    })
  })

  it('applies text alignment before geometry queries', () => {
    const result = buildPositionedGlyphLayout(
      {
        font,
        text: 'ab',
        fontSize: 10,
        lineHeight: 12,
        letterSpacing: 0,
        wordBreak: 'break-word',
      },
      100,
      40,
      'center',
      'top',
    )

    expect(result.lines[0]!.entries[0]).to.include({
      x: -10,
    })
    expect(getCaretTransformation(result, 1)).to.deep.equal({
      position: [0, 14],
      height: 10,
    })
  })

  it('positions the text matrix inside padding and border insets', () => {
    const matrix = getGlobalTextMatrix([2, 4, 6, 8], [1, 2, 3, 4], 10, new Matrix4().makeTranslation(1, 2, 0))

    expect(matrix.elements[12]).to.equal(31)
    expect(matrix.elements[13]).to.equal(32)
    expect(matrix.elements[14]).to.equal(0)
  })
})
