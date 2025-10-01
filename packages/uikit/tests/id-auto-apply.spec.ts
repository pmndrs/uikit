import { expect } from 'chai'
import { Container, StyleSheet } from '../src/index.js'

// Helper to wait for reactive effects to complete
async function waitForEffects() {
  // Let effects run by waiting for next event loop tick
  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('ID-based class auto-application', () => {
  beforeEach(() => {
    // Clear StyleSheet before each test
    for (const key of Object.keys(StyleSheet)) {
      delete StyleSheet[key]
    }
  })

  it('should auto-apply ID class when element has matching id and style exists', async () => {
    // Add ID style to StyleSheet
    StyleSheet['__id__myButton'] = {
      backgroundColor: 'blue',
      padding: 10,
    }

    // Create root and container with id
    const root = new Container()
    const container = new Container({ id: 'myButton' })
    root.add(container)
    await waitForEffects()

    // Should automatically have the ID class applied
    expect(container.classList.contains('__id__myButton')).to.be.true
  })

  it('should not apply ID class when no matching style exists', async () => {
    // Create root and container with id but no corresponding style
    const root = new Container()
    const container = new Container({ id: 'nonExistentId' })
    root.add(container)
    await waitForEffects()

    // Should NOT have any ID class applied
    expect(container.classList.contains('__id__nonExistentId')).to.be.false
  })

  it('should dynamically update ID class when id property changes', async () => {
    // Add multiple ID styles to StyleSheet
    StyleSheet['__id__button1'] = { color: 'red' }
    StyleSheet['__id__button2'] = { color: 'blue' }

    // Create root and container with initial id
    const root = new Container()
    const container = new Container({ id: 'button1' })
    root.add(container)
    await waitForEffects()
    expect(container.classList.contains('__id__button1')).to.be.true
    expect(container.classList.contains('__id__button2')).to.be.false

    // Change the id property
    container.setProperties({ id: 'button2' })
    await waitForEffects()

    // Should remove old class and add new class
    expect(container.classList.contains('__id__button1')).to.be.false
    expect(container.classList.contains('__id__button2')).to.be.true
  })

  it('should remove ID class when id is cleared', async () => {
    // Add ID style to StyleSheet
    StyleSheet['__id__myButton'] = { backgroundColor: 'blue' }

    // Create root and container with id
    const root = new Container()
    const container = new Container({ id: 'myButton' })
    root.add(container)
    await waitForEffects()
    expect(container.classList.contains('__id__myButton')).to.be.true

    // Clear the id property
    container.setProperties({ id: undefined })
    await waitForEffects()

    // Should remove the ID class
    expect(container.classList.contains('__id__myButton')).to.be.false
  })

  it('should handle id changes to non-existent styles gracefully', async () => {
    // Add one ID style to StyleSheet
    StyleSheet['__id__existingButton'] = { color: 'green' }

    // Create root and container with existing id
    const root = new Container()
    const container = new Container({ id: 'existingButton' })
    root.add(container)
    await waitForEffects()
    expect(container.classList.contains('__id__existingButton')).to.be.true

    // Change to id with no corresponding style
    container.setProperties({ id: 'nonExistentButton' })
    await waitForEffects()

    // Should remove old class and not add new one
    expect(container.classList.contains('__id__existingButton')).to.be.false
    expect(container.classList.contains('__id__nonExistentButton')).to.be.false
  })

  it('should work correctly when StyleSheet is updated after element creation', async () => {
    // Create root and container with id but no corresponding style yet
    const root = new Container()
    const container = new Container({ id: 'laterButton' })
    root.add(container)
    await waitForEffects()
    expect(container.classList.contains('__id__laterButton')).to.be.false

    // Add style to StyleSheet after element creation
    StyleSheet['__id__laterButton'] = { fontWeight: 'bold' }

    // Need to trigger re-evaluation by changing id (we don't watch StyleSheet changes)
    // First change to different id, then back to trigger the effect
    container.setProperties({ id: 'temp' })
    await waitForEffects()
    container.setProperties({ id: 'laterButton' })
    await waitForEffects()

    // Should now apply the class
    expect(container.classList.contains('__id__laterButton')).to.be.true
  })

  it('should not interfere with manually added classes', async () => {
    // Add ID style to StyleSheet
    StyleSheet['__id__mixedButton'] = { color: 'purple' }

    // Create root and container with both id and manual classes
    const root = new Container()
    const container = new Container({ id: 'mixedButton' })
    root.add(container)
    await waitForEffects()
    container.classList.add('manual-class', 'another-class')

    // Should have both auto-applied ID class and manual classes
    expect(container.classList.contains('__id__mixedButton')).to.be.true
    expect(container.classList.contains('manual-class')).to.be.true
    expect(container.classList.contains('another-class')).to.be.true

    // Change id
    container.setProperties({ id: undefined })
    await waitForEffects()

    // Should only remove ID class, keep manual classes
    expect(container.classList.contains('__id__mixedButton')).to.be.false
    expect(container.classList.contains('manual-class')).to.be.true
    expect(container.classList.contains('another-class')).to.be.true
  })
})
