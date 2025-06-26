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

    it('should parse ID styles as classes with special prefix', () => {
      const result = parse(`
        <style>
          #myButton {
            background-color: blue;
            padding: 10px;
          }
          #myButton:hover {
            background-color: red;
          }
        </style>
        <div id="myButton">Click me</div>
      `)

      expect(result.element).to.deep.include({
        type: 'container',
        sourceTag: 'div',
        children: ['Click me'],
        properties: {
          id: 'myButton',
          // ID class will be auto-applied by UIKit core when element is created
        },
      })

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: ['Click me'],
          properties: {
            id: 'myButton',
          },
          defaultProperties: {},
        },
        classes: {
          __id__myButton: {
            content: {
              backgroundColor: 'blue',
              padding: '10px',
              hover: {
                backgroundColor: 'red',
              },
            },
          },
        },
      })

      // Verify ranges include the ID-based class
      expect(result.ranges).to.have.property('__id__myButton')
      expect(result.ranges['__id__myButton']).to.have.property('start')
      expect(result.ranges['__id__myButton']).to.have.property('end')
    })
  })

  describe('conditional attributes', () => {
    it('should parse hoverStyle attribute', () => {
      const result = parse('<div hover:style="background-color: red; font-size: 18px;">Content</div>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: ['Content'],
          properties: {
            hoverStyle: {
              backgroundColor: 'red',
              fontSize: '18px',
            },
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse activeStyle attribute', () => {
      const result = parse('<button active:style="transform: scale(0.95); background-color: blue;">Click me</button>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'button',
          children: ['Click me'],
          properties: {
            activeStyle: {
              transform: 'scale(0.95)',
              backgroundColor: 'blue',
            },
          },
          defaultProperties: {
            verticalAlign: 'middle',
            textAlign: 'center',
            cursor: 'pointer',
          },
        },
        classes: {},
      })
    })

    it('should parse focusStyle attribute', () => {
      const result = parse('<input focus:style="border-color: blue; outline: 2px solid blue;" type="text"  />')

      expectParseResult(result, {
        element: {
          type: 'input',
          sourceTag: 'input',
          properties: {
            focusStyle: {
              borderColor: 'blue',
              outline: '2px solid blue',
            },
            type: 'text',
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse responsive conditional attributes', () => {
      const result = parse('<div sm:style="width: 50%;" md:style="width: 75%;" lg:style="width: 80%;">Responsive</div>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: ['Responsive'],
          properties: {
            smStyle: {
              width: '50%',
            },
            mdStyle: {
              width: '75%',
            },
            lgStyle: {
              width: '80%',
            },
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse xl and 2xl responsive conditional attributes', () => {
      const result = parse('<div xl:style="padding: 2rem;" 2xl:style="padding: 3rem;">Large screens</div>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: ['Large screens'],
          properties: {
            xlStyle: {
              padding: '2rem',
            },
            '2xlStyle': {
              padding: '3rem',
            },
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse multiple conditional attributes on same element', () => {
      const result = parse(
        '<div style="color: black;" hover:style="color: red;" active:style="color: blue;" focus:style="outline: 2px solid green;">Multi-state</div>',
      )

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: ['Multi-state'],
          properties: {
            style: {
              color: 'black',
            },
            hoverStyle: {
              color: 'red',
            },
            activeStyle: {
              color: 'blue',
            },
            focusStyle: {
              outline: '2px solid green',
            },
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse conditional attributes with yoga property renamings', () => {
      const result = parse('<div hover:style="row-gap: 10px; position: absolute; top: 5px;">With renamings</div>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: ['With renamings'],
          properties: {
            hoverStyle: {
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

    it('should handle empty conditional style attributes', () => {
      const result = parse('<div hover:style="">Empty hover</div>')

      expectParseResult(result, {
        element: {
          type: 'container',
          sourceTag: 'div',
          children: ['Empty hover'],
          properties: {
            hoverStyle: {},
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })

    it('should parse conditional attributes on custom elements', () => {
      const result = parse(
        '<mykit-button hover:style="background-color: #007bff; transform: translateY(-2px);">Custom with hover</mykit-button>',
      )

      expectParseResult(result, {
        element: {
          type: 'custom',
          sourceTag: 'mykit-button',
          children: ['Custom with hover'],
          properties: {
            hoverStyle: {
              backgroundColor: '#007bff',
              transform: 'translateY(-2px)',
            },
          },
          defaultProperties: {},
        },
        classes: {},
      })
    })
  })
})
