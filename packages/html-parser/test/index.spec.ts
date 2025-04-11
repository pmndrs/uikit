import { expect } from 'chai'
import { parse } from '../src/index.js'

describe('html parser', () => {
  describe('basic element parsing', () => {
    it('should parse video element', () => {
      const result = parse('<video src="test.mp4" autoplay></video>')
      expect(result).to.deep.equal({
        type: 'video',
        properties: {
          src: 'test.mp4',
          autoplay: '',
        },
      })
    })

    it('should parse input element', () => {
      const result = parse('<input type="text" value="test" />')
      expect(result).to.deep.equal({
        type: 'input',
        properties: {
          type: 'text',
          value: 'test',
        },
      })
    })

    it('should parse image element', () => {
      const result = parse('<img src="test.jpg" alt="test" />')
      expect(result).to.deep.equal({
        type: 'image',
        properties: {
          src: 'test.jpg',
          alt: 'test',
        },
      })
    })

    it('should parse SVG image', () => {
      const result = parse('<img src="test.svg" alt="test" />')
      expect(result).to.deep.equal({
        type: 'svg',
        properties: {
          src: 'test.svg',
          alt: 'test',
        },
      })
    })

    it('should parse inline SVG', () => {
      const svgContent = '<svg><circle cx="50" cy="50" r="40"/></svg>'
      const result = parse(svgContent)
      expect(result).to.deep.equal({
        type: 'inline-svg',
        properties: {},
        text: '<svg><circle cx="50" cy="50" r="40"></circle></svg>',
      })
    })

    it('should parse container element', () => {
      const result = parse('<div><p>Hello</p><p>World</p></div>')
      expect(result).to.deep.equal({
        type: 'container',
        properties: {},
        children: [
          {
            type: 'text',
            properties: {},
            text: 'Hello',
          },
          {
            type: 'text',
            properties: {},
            text: 'World',
          },
        ],
      })
    })
  })

  describe('default html elements', () => {
    it('should parse h1-h6 with correct default properties', () => {
      const h1Result = parse('<h1>Title</h1>')
      expect(h1Result).to.deep.equal({
        type: 'text',
        text: 'Title',
        properties: {
          fontSize: 32,
          fontWeight: 'bold',
        },
      })

      const h6Result = parse('<h6>Small Title</h6>')
      expect(h6Result).to.deep.equal({
        type: 'text',
        text: 'Small Title',
        properties: {
          fontSize: 10.67,
          fontWeight: 'bold',
        },
      })
    })

    it('should parse ol and ul with correct default properties', () => {
      const olResult = parse('<ol><li>Item</li></ol>')
      expect(olResult).to.deep.equal({
        type: 'container',
        children: [
          {
            type: 'text',
            text: 'Item',
            properties: {},
          },
        ],
        properties: {
          flexDirection: 'column',
        },
      })

      const ulResult = parse('<ul><li>Item</li></ul>')
      expect(ulResult).to.deep.equal({
        type: 'container',
        children: [
          {
            type: 'text',

            text: 'Item',
            properties: {},
          },
        ],
        properties: {
          flexDirection: 'column',
        },
      })
    })

    it('should parse anchor with correct default properties', () => {
      const result = parse('<a href="https://example.com">Link</a>')
      expect(result).to.deep.equal({
        type: 'text',
        text: 'Link',
        properties: {
          href: 'https://example.com',
          cursor: 'pointer',
        },
      })
    })

    it('should parse button with correct default properties', () => {
      const result = parse('<button>Click me</button>')
      expect(result).to.deep.equal({
        type: 'text',
        text: 'Click me',
        properties: {
          verticalAlign: 'middle',
          textAlign: 'center',
          cursor: 'pointer',
        },
      })
    })

    it('should convert textarea to input with multiline property', () => {
      const result = parse('<textarea>Some text</textarea>')
      expect(result).to.deep.equal({
        type: 'input',
        properties: {
          multiline: true,
        },
      })
    })
  })

  describe('custom elements', () => {
    it('should parse custom element as type custom', () => {
      const result = parse('<testkit-custom-element data-test="value">Content</custom-element>', {
        availableKits: ['testkit'],
      })
      expect(result).to.deep.equal({
        type: 'custom',
        name: 'customElement',
        kit: 'testkit',
        children: [
          {
            type: 'text',
            properties: {},
            text: 'Content',
          },
        ],
        properties: {
          dataTest: 'value',
        },
      })
    })

    it('should call onError and ignore element when kit is not available', () => {
      const errors: string[] = []
      const result = parse('<unknownkit-custom-element>Content</unknownkit-custom-element>', {
        availableKits: ['testkit'],
        onError: (msg) => errors.push(msg),
      })
      expect(errors).to.deep.equal(['Unknown kit "unknownkit". Available kits: testkit'])
      expect(result).to.deep.equal({
        type: 'container',
        children: [],
        properties: {},
      })
    })

    it('should call onError and ignore element when kit prefix is missing', () => {
      const errors: string[] = []
      const result = parse('<customelement>Content</custom-element>', {
        availableKits: ['testkit'],
        onError: (msg) => errors.push(msg),
      })
      expect(errors).to.deep.equal(['Unknown HTML element: customelement'])
      expect(result).to.deep.equal({
        type: 'container',
        children: [],
        properties: {},
      })
    })
  })

  describe('inline styles', () => {
    it('should parse and flatten inline styles with yoga renamings', () => {
      const result = parse('<div style="row-gap: 10px; position: absolute; top: 5px;"></div>')
      expect(result).to.deep.equal({
        type: 'container',
        children: [],
        properties: {
          gapRow: '10px',
          positionType: 'absolute',
          positionTop: '5px',
        },
      })
    })

    it('should convert kebab-case style properties to camelCase', () => {
      const result = parse('<div style="background-color: red; font-size: 16px;"></div>')
      expect(result).to.deep.equal({
        type: 'container',
        children: [],
        properties: {
          backgroundColor: 'red',
          fontSize: '16px',
        },
      })
    })
  })
})
