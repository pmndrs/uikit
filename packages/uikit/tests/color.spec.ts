import { expect } from 'chai'
import { writeColor } from '../src/panel/material/color.js'

describe('color parsing', () => {
  it('preserves alpha from CSS hex colors', () => {
    const cases = [
      ['#00000000', [0, 0, 0, 0]],
      ['#000000FF', [0, 0, 0, 1]],
      ['#ff000080', [1, 0, 0, 128 / 255]],
      ['#0000', [0, 0, 0, 0]],
      ['#000f', [0, 0, 0, 1]],
    ] as const

    for (const [color, expected] of cases) {
      const target = [1, 1, 1, 1]
      writeColor(target, 0, color, 1)
      expect(target).to.deep.equal(expected)
    }
  })

  it('multiplies CSS hex alpha by opacity like rgba', () => {
    const hexTarget = [0, 0, 0, 0]
    const rgbaTarget = [0, 0, 0, 0]

    writeColor(hexTarget, 0, '#ff000080', 0.5)
    writeColor(rgbaTarget, 0, 'rgba(255, 0, 0, 0.5019607843137255)', 0.5)

    expect(hexTarget).to.deep.equal(rgbaTarget)
  })
})
