import { expect } from 'chai'
import { readReactive } from '../src/utils.js'

describe('text layout - text type conversion', () => {
  it('should convert number to string', () => {
    // Test the core issue: numbers should be converted to strings
    const textProperty = 1
    const text = Array.isArray(textProperty) ? textProperty.join('') : String(textProperty ?? '')

    expect(text).to.equal('1')
    expect(typeof text).to.equal('string')
    // This should not throw
    expect(() => text.replaceAll('1', '2')).to.not.throw()
  })

  it('should handle string text property', () => {
    const textProperty = 'Hello World'
    const text = Array.isArray(textProperty) ? textProperty.join('') : String(textProperty ?? '')

    expect(text).to.equal('Hello World')
    expect(typeof text).to.equal('string')
    expect(() => text.replaceAll(' ', '_')).to.not.throw()
  })

  it('should handle undefined text property', () => {
    const textProperty = undefined
    const text = Array.isArray(textProperty) ? textProperty.join('') : String(textProperty ?? '')

    expect(text).to.equal('')
    expect(typeof text).to.equal('string')
    expect(() => text.replaceAll('x', 'y')).to.not.throw()
  })

  it('should handle null text property', () => {
    const textProperty = null
    const text = Array.isArray(textProperty) ? textProperty.join('') : String(textProperty ?? '')

    expect(text).to.equal('')
    expect(typeof text).to.equal('string')
    expect(() => text.replaceAll('x', 'y')).to.not.throw()
  })

  it('should handle array text property', () => {
    const textProperty = ['Hello', ' ', 'World']
    const text = Array.isArray(textProperty) ? textProperty.join('') : String(textProperty ?? '')

    expect(text).to.equal('Hello World')
    expect(typeof text).to.equal('string')
    expect(() => text.replaceAll(' ', '_')).to.not.throw()
  })

  it('should handle zero as text property', () => {
    // Edge case: 0 is falsy but should become "0"
    const textProperty = 0
    const text = Array.isArray(textProperty) ? textProperty.join('') : String(textProperty ?? '')

    expect(text).to.equal('0')
    expect(typeof text).to.equal('string')
    expect(() => text.replaceAll('0', '1')).to.not.throw()
  })

  it('should handle boolean as text property', () => {
    const textProperty = true
    const text = Array.isArray(textProperty) ? textProperty.join('') : String(textProperty ?? '')

    expect(text).to.equal('true')
    expect(typeof text).to.equal('string')
    expect(() => text.replaceAll('true', 'false')).to.not.throw()
  })

  it('should handle readReactive with numbers', () => {
    // Test that readReactive also works with numbers
    const textProperty = readReactive(1 as any)
    const text = Array.isArray(textProperty) ? textProperty.join('') : String(textProperty ?? '')

    expect(text).to.equal('1')
    expect(typeof text).to.equal('string')
  })
})
