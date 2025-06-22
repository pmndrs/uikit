import { expect } from 'chai'
import { JSDOM } from 'jsdom'
import { Container, Text, Image, Input, StyleSheet } from '@pmndrs/uikit'
import { interpret, Kit, getElementDescription } from '../src/interpreter/index.js'
import { parse } from '../src/parser/index.js'

// Minimal DOM setup for uikit components
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document
global.window = dom.window as any
global.HTMLElement = dom.window.HTMLElement
global.HTMLImageElement = dom.window.HTMLImageElement

class MockCustomComponent extends Container {
  constructor(props: any = {}) {
    super(props)
  }
}

// Helper function to safely interpret parsed elements
function safeInterpret(html: string, kit?: Kit) {
  const parsed = parse(html)
  if (!parsed.element) {
    throw new Error(`Failed to parse: ${html}`)
  }
  return {
    result: interpret(parsed, kit),
    classes: parsed.classes,
    element: parsed.element,
  }
}

describe('interpreter', () => {
  describe('basic element interpretation', () => {
    it('should interpret text strings', () => {
      const result = interpret({ element: 'Hello World', classes: {} })
      expect(result).to.be.instanceOf(Text)
    })

    it('should handle null and undefined input', () => {
      expect(interpret({ element: null as any, classes: {} })).to.be.null
      expect(interpret({ element: undefined as any, classes: {} })).to.be.null
    })

    it('should interpret container elements', () => {
      const { result } = safeInterpret('<div><span>Content</span></div>')
      expect(result).to.be.instanceOf(Container)
      expect(result?.children).to.have.length(1)
      expect(result?.children[0]).to.be.instanceOf(Text)
    })

    it('should optimize single text child containers to Text elements', () => {
      const { result } = safeInterpret('<div>Hello</div>')
      expect(result).to.be.instanceOf(Text)
    })

    it('should interpret image elements', () => {
      const { result } = safeInterpret('<img src="test.jpg" alt="Test" />')
      expect(result).to.be.instanceOf(Image)
    })

    it('should interpret input elements', () => {
      const { result } = safeInterpret('<input type="text" placeholder="Enter text" />')
      expect(result).to.be.instanceOf(Input)
    })

    it('should interpret textarea as input with multiline', () => {
      const { result } = safeInterpret('<textarea>Some text</textarea>')
      expect(result).to.be.instanceOf(Input)
    })
  })

  describe('custom elements', () => {
    it('should interpret custom elements without kit as Container', () => {
      const { result } = safeInterpret('<custom-button>Click me</custom-button>')
      expect(result).to.be.instanceOf(Container)
      expect(result?.userData.customElement).to.deep.equal({
        componentName: 'custom-button',
        sourceTag: 'custom-button',
      })
    })

    it('should interpret custom elements with matching kit component', () => {
      const kit: Kit = {
        'custom-button': MockCustomComponent,
      }
      const { result } = safeInterpret('<custom-button data-test="value">Click me</custom-button>', kit)
      expect(result).to.be.instanceOf(MockCustomComponent)
      expect(result?.userData.customElement).to.deep.equal({
        componentName: 'custom-button',
        sourceTag: 'custom-button',
      })
    })

    it('should fall back to Container when custom component not found in kit', () => {
      const kit: Kit = {
        'other-component': MockCustomComponent,
      }
      const { result } = safeInterpret('<missing-component>Content</missing-component>', kit)
      expect(result).to.be.instanceOf(Container)
      expect(result?.userData.customElement.componentName).to.equal('missing-component')
    })
  })

  describe('CSS class application', () => {
    it('should add CSS classes to global StyleSheet and apply to elements', () => {
      const htmlWithStyles = `
        <style>
          .test-class {
            color: red;
            font-size: 16px;
            background-color: blue;
          }
        </style>
        <div class="test-class"><span>Content</span></div>
      `
      const { result } = safeInterpret(htmlWithStyles)
      expect(result).to.be.instanceOf(Container)

      // Verify class was added to global StyleSheet
      expect(StyleSheet['test-class']).to.deep.include({
        color: 'red',
        fontSize: '16px',
        backgroundColor: 'blue',
      })
    })

    it('should apply multiple CSS classes', () => {
      const htmlWithStyles = `
        <style>
          .class1 { color: red; }
          .class2 { font-size: 16px; }
        </style>
        <div class="class1 class2"><span>Content</span></div>
      `
      const { result } = safeInterpret(htmlWithStyles)
      expect(result).to.be.instanceOf(Container)
    })

    it('should apply CSS classes to optimized Text elements', () => {
      const htmlWithStyles = `
        <style>
          .text-style {
            color: green;
            font-weight: bold;
          }
        </style>
        <div class="text-style">Single text</div>
      `
      const { result } = safeInterpret(htmlWithStyles)
      expect(result).to.be.instanceOf(Text)
    })
  })

  describe('property handling', () => {
    it('should store element id in userData', () => {
      const { result } = safeInterpret('<div id="test-element">Content</div>')
      expect(result?.userData.id).to.equal('test-element')
    })

    it('should store source tag in userData', () => {
      const { result } = safeInterpret('<section>Content</section>')
      expect(result?.userData.sourceTag).to.equal('section')
    })
  })

  describe('children processing', () => {
    it('should process nested elements', () => {
      const { result } = safeInterpret('<div><p>Paragraph</p><span>Span</span></div>')
      expect(result).to.be.instanceOf(Container)
      expect(result?.children).to.have.length(2)
      expect(result?.children[0]).to.be.instanceOf(Text)
      expect(result?.children[1]).to.be.instanceOf(Text)
    })

    it('should not process children for Text elements', () => {
      const { result } = safeInterpret('<div>Single text</div>')
      expect(result).to.be.instanceOf(Text)
    })

    it('should recursively interpret children with kit', () => {
      const kit: Kit = {
        'custom-child': MockCustomComponent,
      }
      const { result } = safeInterpret('<div><custom-child>Content</custom-child></div>', kit)
      expect(result).to.be.instanceOf(Container)
      expect(result?.children).to.have.length(1)
      expect(result?.children[0]).to.be.instanceOf(MockCustomComponent)
    })
  })

  describe('error handling', () => {
    it('should handle unknown element types', () => {
      const unknownElement = {
        type: 'unknown' as any,
        sourceTag: 'unknown',
        properties: {},
        defaultProperties: {},
        children: [],
      }
      const result = interpret({ element: unknownElement, classes: {} })
      expect(result).to.be.instanceOf(Container)
    })

    it('should handle missing src for image elements', () => {
      const { result } = safeInterpret('<img alt="Test" />')
      expect(result).to.be.instanceOf(Image)
    })
  })

  describe('complex scenarios', () => {
    it('should handle nested containers with custom components', () => {
      const kit: Kit = {
        'custom-card': MockCustomComponent,
        'custom-button': MockCustomComponent,
      }
      const { result } = safeInterpret(
        `
        <div class="container">
          <custom-card title="Card Title">
            <p>Card content</p>
            <custom-button>Action</custom-button>
          </custom-card>
        </div>
      `,
        kit,
      )
      expect(result).to.be.instanceOf(Container)
      expect(result?.children).to.have.length(1)
      expect(result?.children[0]).to.be.instanceOf(MockCustomComponent)
    })

    it('should handle mixed content types', () => {
      const { result } = safeInterpret(`
        <div>
          <img src="image.jpg" alt="Image" />
          <p>Text content</p>
          <input type="text" placeholder="Input" />
        </div>
      `)
      expect(result).to.be.instanceOf(Container)
      expect(result?.children).to.have.length(3)
      expect(result?.children[0]).to.be.instanceOf(Image)
      expect(result?.children[1]).to.be.instanceOf(Text)
      expect(result?.children[2]).to.be.instanceOf(Input)
    })
  })

  describe('getElementDescription helper', () => {
    it('should describe text strings', () => {
      const description = getElementDescription('Hello World')
      expect(description).to.equal('Text: "Hello World"')
    })

    it('should describe long text strings with truncation', () => {
      const longText = 'This is a very long text that should be truncated'
      const description = getElementDescription(longText)
      expect(description).to.equal('Text: "This is a very long ..."')
    })

    it('should describe container elements', () => {
      const { element } = safeInterpret('<div>Content</div>')
      const description = getElementDescription(element)
      expect(description).to.equal('Container (div)')
    })

    it('should describe custom elements', () => {
      const { element } = safeInterpret('<custom-button>Click</custom-button>')
      const description = getElementDescription(element)
      expect(description).to.equal('Custom: custom-button')
    })

    it('should describe image elements', () => {
      const { element } = safeInterpret('<img src="test.jpg" alt="Test" />')
      const description = getElementDescription(element)
      expect(description).to.equal('Image: test.jpg')
    })

    it('should describe image elements without src', () => {
      const { element } = safeInterpret('<img alt="Test" />')
      const description = getElementDescription(element)
      expect(description).to.equal('Image: no src')
    })

    it('should describe input elements', () => {
      const { element } = safeInterpret('<input type="text" />')
      const description = getElementDescription(element)
      expect(description).to.equal('Input (input)')
    })

    it('should describe textarea elements', () => {
      const { element } = safeInterpret('<textarea>Content</textarea>')
      const description = getElementDescription(element)
      expect(description).to.equal('Input (textarea, multiline)')
    })

    it('should describe unknown element types', () => {
      const unknownElement = {
        type: 'unknown' as any,
        sourceTag: 'unknown',
        properties: {},
        defaultProperties: {},
      }
      const description = getElementDescription(unknownElement)
      expect(description).to.equal('Unknown: unknown')
    })
  })
})
