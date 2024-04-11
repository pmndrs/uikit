import { expect } from 'chai'
import { MergedProperties } from '../src/properties/index.js'
import { Signal, signal } from '@preact/signals-core'
import { createHoverPropertyTransformers } from '../src/hover.js'

describe('properties precedence', () => {
  it('should use undefined as ignore and null as unset (without signals)', () => {
    const merged = new MergedProperties()
    merged.add('x', 1)
    expect(merged.read('x')).to.equal(1)
    merged.add('x', undefined)
    expect(merged.read('x')).to.equal(1)
    merged.add('x', null)
    expect(merged.read('x') == null).to.true
  })

  it('should use undefined as ignore and null as unset (with signals)', () => {
    const merged = new MergedProperties()
    merged.add('x', signal(1))
    expect(merged.read('x')).to.equal(1)
    merged.add('x', signal(undefined))
    expect(merged.read('x')).to.equal(1)
    const f = signal<null | undefined>(null)
    merged.add('x', f)
    expect(merged.read('x') == null).to.true
    f.value = undefined
    expect(merged.read('x')).to.equal(1)
  })

  it('should preserve order default classes (hover/...) -> defaults (hover/...) -> properties classes (hover/...) -> properties (class/hover/...) -> style classes (hover/...) -> styles (class/hover/...)', () => {
    const merged = new MergedProperties()
    merged.addAll(
      {
        classes: [{ height: signal(0), hover: { height: signal(1) } }, { height: signal(2) }],
        height: signal(3),
        hover: { height: signal(4) },
      },
      {
        classes: [{ height: signal(5), hover: { height: signal(6) } }, { height: signal(7) }],
        height: signal(8),
        hover: { height: signal(9) },
      },
      createHoverPropertyTransformers(signal([1])),
    )
    const property = merged['propertyMap'].get('height')!
    expect(property.map((x) => (x instanceof Signal ? x.value : x))).to.deep.equal(
      new Array(10).fill(0).map((_, i) => i),
    )
    expect(merged.read('height')).to.equal(9)
  })
})
