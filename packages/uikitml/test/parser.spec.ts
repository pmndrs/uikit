import { expect } from 'chai'
import { parse } from '../src/index.js'

// Helper to test core functionality while ignoring ranges and dataUid
function expectParseResult(result: any, expected: any) {
  // Handle undefined elements (for style-only parsing)
  if (expected.element === undefined) {
    expect(result.element).to.equal(undefined)
  } else {
    // Deep clone the actual element and remove dataUid properties for comparison
    const cleanActual = JSON.parse(JSON.stringify(result.element))
    const cleanExpected = JSON.parse(JSON.stringify(expected.element))

    // Recursively remove dataUid from actual element
    function removeDataUid(obj: any): any {
      if (obj && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          return obj.map(removeDataUid)
        } else {
          const cleaned = { ...obj }
          delete cleaned.dataUid
          for (const key in cleaned) {
            if (cleaned[key] && typeof cleaned[key] === 'object') {
              cleaned[key] = removeDataUid(cleaned[key])
            }
          }
          return cleaned
        }
      }
      return obj
    }

    const actualCleaned = removeDataUid(cleanActual)
    expect(actualCleaned).to.deep.equal(cleanExpected)
  }

  expect(result.classes).to.deep.equal(expected.classes)

  // Just verify ranges exists (don't test exact values)
  expect(result).to.have.property('ranges')
  expect(result.ranges).to.be.an('object')
}

describe('html parser', () => {
  describe('basic element parsing', () => {
    it('should parse video element', () => {
      const result = parse('<video src="test.mp4" autoplay></video>')

      expectParseResult(result, {
        element: {
          type: 'video',
          sourceTag: 'video',
          properties: {
            src: 'test.mp4',
            autoplay: '',
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse input element', () => {
      const result = parse('<input type="text" value="test" />')

      expectParseResult(result, {
        element: {
          type: 'input',
          sourceTag: 'input',
          properties: {
            type: 'text',
            value: 'test',
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse image element', () => {
      const result = parse('<img src="test.jpg" alt="test" />')

      expectParseResult(result, {
        element: {
          type: 'image',
          sourceTag: 'img',
          properties: {
            src: 'test.jpg',
            alt: 'test',
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse SVG image', () => {
      const result = parse('<img src="test.svg" alt="test" />')

      expectParseResult(result, {
        element: {
          type: 'svg',
          sourceTag: 'img',
          properties: {
            src: 'test.svg',
            alt: 'test',
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse inline SVG', () => {
      const result = parse('<svg><circle cx="50" cy="50" r="40"/></svg>')
      expectParseResult(result, {
        element: {
          type: 'inline-svg',
          sourceTag: 'svg',
          properties: {},
          text: '<svg><circle cx="50" cy="50" r="40"></circle></svg>',
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse container element', () => {
      const result = parse('<div><p>Hello</p><p>World</p></div>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: [
            {
              type: 'container',
              sourceTag: 'p',
              children: ['Hello'],
              properties: {},
              defaultProperties: {},
            },
            {
              type: 'container',
              sourceTag: 'p',
              children: ['World'],
              properties: {},
              defaultProperties: {},
            },
          ],
          properties: {},
          defaultProperties: {},
        },
        classes: {},
      })
    })
  })

  describe('default html elements', () => {
    it('should parse h1-h6 with correct default properties', () => {
      const h1Result = parse('<h1>Title</h1>')

      expectParseResult(h1Result, {
        element: {
          type: 'container',
          sourceTag: 'h1',
          children: ['Title'],
          properties: {},
          defaultProperties: {
            fontSize: 32,
            fontWeight: 'bold',
          },
        },
        classes: {},
      })

      const h6Result = parse('<h6>Small Title</h6>')

      expectParseResult(h6Result, {
        element: {
          type: 'container',
          sourceTag: 'h6',
          children: ['Small Title'],
          properties: {},
          defaultProperties: {
            fontSize: 10.67,
            fontWeight: 'bold',
          },
        },
        classes: {},
      })
    })

    it('should parse ol and ul with correct default properties', () => {
      const olResult = parse('<ol><li>Item</li></ol>')

      expectParseResult(olResult, {
        element: {
          type: 'container',
          sourceTag: 'ol',
          children: [
            {
              type: 'container',
              sourceTag: 'li',
              children: ['Item'],
              properties: {},
              defaultProperties: {},
            },
          ],
          properties: {},
          defaultProperties: {
            flexDirection: 'column',
          },
        },
        classes: {},
      })

      const ulResult = parse('<ul><li>Item</li></ul>')

      expectParseResult(ulResult, {
        element: {
          type: 'container',
          sourceTag: 'ul',
          children: [
            {
              type: 'container',
              sourceTag: 'li',
              children: ['Item'],
              properties: {},
              defaultProperties: {},
            },
          ],
          properties: {},
          defaultProperties: {
            flexDirection: 'column',
          },
        },
        classes: {},
      })
    })

    it('should parse anchor with correct default properties', () => {
      const result = parse('<a href="https://example.com">Link</a>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'a',
          children: ['Link'],
          properties: {
            href: 'https://example.com',
          },
          defaultProperties: {
            cursor: 'pointer',
          },
        },
        classes: {},
      })
    })

    it('should parse button with correct default properties', () => {
      const result = parse('<button>Click me</button>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'button',
          children: ['Click me'],
          properties: {},
          defaultProperties: {
            verticalAlign: 'middle',
            textAlign: 'center',
            cursor: 'pointer',
          },
        },
        classes: {},
      })
    })

    it('should convert textarea to input with multiline property', () => {
      const result = parse('<textarea>Some text</textarea>')

      expectParseResult(result, {
        element: {
          type: 'input',
          sourceTag: 'textarea',
          properties: {},
          defaultProperties: {
            multiline: true,
          },
        },
        classes: {},
      })
    })
  })

  describe('custom elements', () => {
    it('should parse custom element as type custom', () => {
      const result = parse('<testkit-custom-element data-test="value">Content</testkit-custom-element>', {})

      expectParseResult(result, {
        element: {
          type: 'custom',
          sourceTag: 'testkit-custom-element',
          children: ['Content'],
          properties: {
            dataTest: 'value',
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })
  })

  describe('inline styles', () => {
    it('should parse and flatten inline styles with yoga renamings', () => {
      const result = parse('<div style="row-gap: 10px; position: absolute; top: 5px;"></div>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: [],
          properties: {
            style: {
              gapRow: '10px',
              positionType: 'absolute',
              positionTop: '5px',
            },
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should convert kebab-case style properties to camelCase', () => {
      const result = parse('<div style="background-color: red; font-size: 16px;"></div>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: [],
          properties: {
            style: {
              backgroundColor: 'red',
              fontSize: '16px',
            },
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })
  })

  describe('style element parsing', () => {
    it('should parse style element with class definitions', () => {
      const result = parse(`
        <style>
          .my-class {
            color: red;
            font-size: 16px;
          }
          .another-class {
            background-color: blue;
            padding: 10px;
          }
        </style>
      `)

      expect(result.element).to.equal(undefined)
      expectParseResult(result, {
        element: undefined,
        classes: {
          'my-class': {
            content: {
              color: 'red',
              fontSize: '16px',
            },
          },
          'another-class': {
            content: {
              backgroundColor: 'blue',
              padding: '10px',
            },
          },
        },
      })
    })

    it('should parse style element with nested selectors', () => {
      const result = parse(`
        <style>
          .child {
            color: green;
          }
          .parent:hover {
            background-color: yellow;
          }
        </style>
      `)

      expect(result.element).to.equal(undefined)
      expectParseResult(result, {
        element: undefined,
        classes: {
          child: {
            content: {
              color: 'green',
            },
          },
          parent: {
            content: {
              hover: {
                backgroundColor: 'yellow',
              },
            },
          },
        },
      })
    })
  })
})
