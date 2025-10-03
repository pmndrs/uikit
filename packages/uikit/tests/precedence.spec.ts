import { expect } from 'chai'
import { Container, StyleSheet } from '../src/index.js'

describe('properties precedence', () => {
  beforeEach(() => {
    // Clear StyleSheet before each test
    for (const key of Object.keys(StyleSheet)) {
      delete StyleSheet[key]
    }
  })

  it('should merge properties when calling setProperties', () => {
    const root = new Container()
    const container = new Container({ opacity: 0.5, backgroundColor: 'red' })
    root.add(container)

    expect(container.properties.value.opacity).to.equal(0.5)
    expect(container.properties.value.backgroundColor).to.equal('red')

    // Partial update - should merge with existing properties, not replace everything
    container.setProperties({ opacity: 0.8 })

    expect(container.properties.value.opacity).to.equal(0.8)
    expect(container.properties.value.backgroundColor).to.equal('red') // Should still be there!
  })

  it('should allow component properties to override classes', () => {
    StyleSheet['dim'] = { opacity: 0.3 }

    const root = new Container()
    const container = new Container()
    root.add(container)

    // Initially, no property set - uses default
    expect(container.properties.value.opacity).to.equal(1)

    // Add class
    container.classList.add('dim')
    expect(container.properties.value.opacity).to.equal(0.3)

    // Set component property - should override the class
    container.setProperties({ opacity: 0.8 })
    expect(container.properties.value.opacity).to.equal(0.8)

    // Remove component property by setting to undefined doesn't work due to spread
    // Classes have lower precedence than component props in the same section
  })

  it('should apply later classes over earlier classes', () => {
    StyleSheet['dim'] = { opacity: 0.3 }
    StyleSheet['bright'] = { opacity: 0.9 }

    const root = new Container()
    const container = new Container() // No opacity property
    root.add(container)

    // Default opacity
    expect(container.properties.value.opacity).to.equal(1)

    // Add first class
    container.classList.add('dim')
    expect(container.properties.value.opacity).to.equal(0.3)

    // Add second class - should override first class
    container.classList.add('bright')
    expect(container.properties.value.opacity).to.equal(0.9)

    // Remove second class - should fall back to first class
    container.classList.remove('bright')
    expect(container.properties.value.opacity).to.equal(0.3)

    // Remove first class - should fall back to default
    container.classList.remove('dim')
    expect(container.properties.value.opacity).to.equal(1)
  })

  it('should fall back to defaults when no property is set', () => {
    const root = new Container()
    const container = new Container() // No opacity set
    root.add(container)

    // Should use default opacity value (1)
    expect(container.properties.value.opacity).to.equal(1)
  })
})
