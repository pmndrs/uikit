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

  describe('conditional attributes', () => {
    it('should generate hover:style attribute', () => {
      const input = '<div hover:style="background-color: red; font-size: 18px">Content</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate active:style attribute', () => {
      const input = '<button active:style="transform: scale(0.95); background-color: blue">Click me</button>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate focus:style attribute', () => {
      const input = '<input type="text" focus:style="border-color: blue; outline: 2px solid blue" />'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate responsive conditional attributes', () => {
      const input = '<div sm:style="width: 50%" md:style="width: 75%" lg:style="width: 80%">Responsive</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate xl and 2xl responsive conditional attributes', () => {
      const input = '<div xl:style="padding: 2rem" 2xl:style="padding: 3rem">Large screens</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate multiple conditional attributes on same element', () => {
      const input =
        '<div hover:style="color: red" active:style="color: blue" focus:style="outline: 2px solid green" style="color: black">Multi-state</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate conditional attributes with yoga property renamings', () => {
      const input = '<div hover:style="gap-row: 10px; position-type: absolute; position-top: 5px">With renamings</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should handle empty conditional style attributes', () => {
      const input = '<div hover:style="">Empty hover</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate conditional attributes on custom elements', () => {
      const input =
        '<mykit-button hover:style="background-color: #007bff; transform: translateY(-2px)">Custom with hover</mykit-button>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate conditional attributes combined with regular style', () => {
      const input =
        '<div hover:style="color: red; background-color: yellow" style="color: black; padding: 1rem">Combined styles</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate all responsive breakpoints', () => {
      const input =
        '<div sm:style="width: 25%" md:style="width: 50%" lg:style="width: 75%" xl:style="width: 85%" 2xl:style="width: 95%">All breakpoints</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate hover and active states together', () => {
      const input =
        '<button hover:style="background-color: #0056b3; transform: translateY(-1px)" active:style="background-color: #004085; transform: translateY(0)">Interactive button</button>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate conditional attributes on self-closing elements', () => {
      const input =
        '<input type="text" hover:style="border-color: blue" focus:style="outline: 2px solid blue; border-color: blue" />'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should generate conditional attributes with complex CSS values', () => {
      const input =
        '<div hover:style="box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); transform: scale(1.05)">Complex hover</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })

    it('should handle conditional attributes with special characters in values', () => {
      const input =
        '<div hover:style="background-image: url(\'data:image/svg+xml;utf8,<svg>...</svg>\')">SVG background</div>'
      const parsed = parse(input, {})
      const generated = generate(parsed.element, parsed.classes)
      expect(generated).to.equal(input)
    })
  })
})
