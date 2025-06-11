import { expect } from 'chai'
import { generate } from '../src/generator/index.js'
import { parse } from '../src/parser/index.js'

describe('generator', () => {
  it('should generate container elements', () => {
    const input = '<div class="test" style="color: red">Hello</div>'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate custom elements', () => {
    const input = '<mykit-button class="primary">Click me</mykit-button>'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate image elements', () => {
    const input = '<img src="test.jpg" alt="Test image" />'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate inline SVG elements', () => {
    const input = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"></circle></svg>'
    const parsed = parse(input, {})
    console.log(parsed)
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate input elements', () => {
    const input = '<input type="text" placeholder="Enter text" />'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate SVG elements', () => {
    const input = '<svg src="test.svg"></svg>'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate text elements', () => {
    const input = 'Hello World'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate video elements', () => {
    const input = '<video src="test.mp4" controls="" />'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate nested elements', () => {
    const input = '<div class="container"><p class="text">Hello<span class="highlight">World</span></p></div>'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should demonstrate with h1 elements', () => {
    const input = '<h1 class="title">Heading</h1>'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    // This test will fail because h1 is converted to a div during parsing
    expect(generated).to.equal(input)
  })

  it('should handle properties with camelCase', () => {
    const input = '<div data-test-id="123" aria-label="Test">Content</div>'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should handle empty elements', () => {
    const input = '<div ></div>'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should handle elements with multiple properties', () => {
    const input = '<div class="container" id="main" style="color: red; background: blue">Content</div>'
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate elements with CSS classes', () => {
    const input = `<style>.test { color: red; font-size: 16px }</style><div class="test">Content</div>`
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate elements with hover state classes', () => {
    const input = `<style>.btn { color: blue } .btn:hover { color: red; transform: scale(1.1) }</style><button class="btn">Click me</button>`
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate elements with multiple state classes', () => {
    const input = `<style>.btn { color: blue } .btn:hover { color: red } .btn:active { color: green } .btn:focus { outline: 2px solid blue }</style><button class="btn">Click me</button>`
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate elements with responsive classes', () => {
    const input = `<style>.container { width: 100% } .container:sm { width: 50% } .container:md { width: 75% } .container:lg { width: 80% } .container:xl { width: 90% } .container:2xl { width: 95% }</style><div class="container">Content</div>`
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })

  it('should generate elements with multiple classes', () => {
    const input = `<style>.container { padding: 1rem } .primary { background: blue; color: white }</style><div class="container primary">Content</div>`
    const parsed = parse(input, {})
    const generated = generate(parsed.element, parsed.classes)
    expect(generated).to.equal(input)
  })
})
