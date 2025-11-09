import { expect } from 'chai'
import { Container, StyleSheet } from '../src/index.js'

describe('ID-based class auto-application', () => {
  beforeEach(() => {
    // Clear StyleSheet before each test
    for (const key of Object.keys(StyleSheet)) {
      delete StyleSheet[key]
    }
  })

  it('should auto-apply ID class when element has matching id and style exists', () => {
    // Add ID style to StyleSheet
    StyleSheet['__id__myButton'] = {
      backgroundColor: 'blue',
      padding: 10,
    }

    // Create root and container with id
    const root = new Container()
    const container = new Container({ id: 'myButton' })
    root.add(container)

    // Should automatically have the ID class applied
    expect(container.classList.contains('__id__myButton')).to.be.true
  })

  it('should not apply ID class when no matching style exists', () => {
    // Create root and container with id but no corresponding style
    const root = new Container()
    const container = new Container({ id: 'nonExistentId' })
    root.add(container)

    // Should NOT have any ID class applied
    expect(container.classList.contains('__id__nonExistentId')).to.be.false
  })

  it('should dynamically update ID class when id property changes', () => {
    // Add multiple ID styles to StyleSheet
    StyleSheet['__id__button1'] = { color: 'red' }
    StyleSheet['__id__button2'] = { color: 'blue' }

    // Create root and container with initial id
    const root = new Container()
    const container = new Container({ id: 'button1' })
    root.add(container)
    expect(container.classList.contains('__id__button1')).to.be.true
    expect(container.classList.contains('__id__button2')).to.be.false

    // Change the id property
    container.setProperties({ id: 'button2' })

    // Should remove old class and add new class
    expect(container.classList.contains('__id__button1')).to.be.false
    expect(container.classList.contains('__id__button2')).to.be.true
  })

  it('should remove ID class when id is cleared', () => {
    // Add ID style to StyleSheet
    StyleSheet['__id__myButton'] = { backgroundColor: 'blue' }

    // Create root and container with id
    const root = new Container()
    const container = new Container({ id: 'myButton' })
    root.add(container)
    expect(container.classList.contains('__id__myButton')).to.be.true

    // Clear the id property
    container.setProperties({ id: undefined })

    // Should remove the ID class
    expect(container.classList.contains('__id__myButton')).to.be.false
  })

  it('should handle id changes to non-existent styles gracefully', () => {
    // Add one ID style to StyleSheet
    StyleSheet['__id__existingButton'] = { color: 'green' }

    // Create root and container with existing id
    const root = new Container()
    const container = new Container({ id: 'existingButton' })
    root.add(container)
    expect(container.classList.contains('__id__existingButton')).to.be.true

    // Change to id with no corresponding style
    container.setProperties({ id: 'nonExistentButton' })

    // Should remove old class and not add new one
    expect(container.classList.contains('__id__existingButton')).to.be.false
    expect(container.classList.contains('__id__nonExistentButton')).to.be.false
  })

  it('should work correctly when StyleSheet is updated after element creation', () => {
    // Create root and container with id but no corresponding style yet
    const root = new Container()
    const container = new Container({ id: 'laterButton' })
    root.add(container)
    expect(container.classList.contains('__id__laterButton')).to.be.false

    // Add style to StyleSheet after element creation
    StyleSheet['__id__laterButton'] = { fontWeight: 'bold' }

    // Need to trigger re-evaluation by changing id (we don't watch StyleSheet changes)
    // First change to different id, then back to trigger the effect
    container.setProperties({ id: 'temp' })
    container.setProperties({ id: 'laterButton' })

    // Should now apply the class
    expect(container.classList.contains('__id__laterButton')).to.be.true
  })

  it('should not interfere with manually added classes', () => {
    // Add ID style to StyleSheet
    StyleSheet['__id__mixedButton'] = { color: 'purple' }
    // Add manual classes to StyleSheet
    StyleSheet['manual-class'] = { fontSize: 14 }
    StyleSheet['another-class'] = { fontWeight: 'bold' }

    // Create root and container with both id and manual classes
    const root = new Container()
    const container = new Container({ id: 'mixedButton' })
    root.add(container)
    container.classList.add('manual-class', 'another-class')

    // Should have both auto-applied ID class and manual classes
    expect(container.classList.contains('__id__mixedButton')).to.be.true
    expect(container.classList.contains('manual-class')).to.be.true
    expect(container.classList.contains('another-class')).to.be.true

    // Change id
    container.setProperties({ id: undefined })

    // Should only remove ID class, keep manual classes
    expect(container.classList.contains('__id__mixedButton')).to.be.false
    expect(container.classList.contains('manual-class')).to.be.true
    expect(container.classList.contains('another-class')).to.be.true
  })
})
