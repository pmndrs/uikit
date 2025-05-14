import { expect } from 'chai'
import { PropertiesPubSub } from '../src/index.js'
import { effect, Signal } from '@preact/signals-core'

interface TestProps {
  color?: string | Signal<string | undefined>
  size?: number | Signal<number | undefined>
  visible?: boolean | Signal<boolean | undefined>
}

describe('PropertiesPubSub', () => {
  let pubSub: PropertiesPubSub<TestProps, TestProps, {}>

  beforeEach(() => {
    pubSub = new PropertiesPubSub<TestProps, TestProps, {}>((key, value, set) => set(key, value), {})
  })

  describe('normal set/get operations', () => {
    it('should set and get a value', () => {
      pubSub.set(0, 'color', 'red')
      expect(pubSub.get('color')).to.equal('red')
    })

    it('should return undefined for unset properties', () => {
      expect(pubSub.get('size')).to.be.undefined
    })

    it('should get the most recently set value', () => {
      pubSub.set(0, 'color', 'red')
      pubSub.set(0, 'color', 'blue')
      expect(pubSub.get('color')).to.equal('blue')
    })

    it('should handle different property types', () => {
      pubSub.set(0, 'color', 'red')
      pubSub.set(0, 'size', 10)
      pubSub.set(0, 'visible', true)

      expect(pubSub.get('color')).to.equal('red')
      expect(pubSub.get('size')).to.equal(10)
      expect(pubSub.get('visible')).to.equal(true)
    })
  })

  describe('layer precedence', () => {
    it('should prioritize values from lower layer indices', () => {
      pubSub.set(2, 'color', 'red')
      pubSub.set(1, 'color', 'green')
      pubSub.set(0, 'color', 'blue')

      expect(pubSub.get('color')).to.equal('blue')
    })

    it("should fall back to higher layers when lower layers don't have a value", () => {
      pubSub.set(2, 'color', 'red')
      pubSub.set(1, 'size', 10)
      pubSub.set(0, 'visible', true)

      expect(pubSub.get('color')).to.equal('red')
      expect(pubSub.get('size')).to.equal(10)
      expect(pubSub.get('visible')).to.equal(true)
    })

    it('should update property when a higher priority layer sets a value', () => {
      pubSub.set(2, 'color', 'red')
      expect(pubSub.get('color')).to.equal('red')

      pubSub.set(1, 'color', 'green')
      expect(pubSub.get('color')).to.equal('green')

      pubSub.set(0, 'color', 'blue')
      expect(pubSub.get('color')).to.equal('blue')
    })

    it('should not update when a lower priority layer sets a value', () => {
      pubSub.set(0, 'color', 'blue')
      expect(pubSub.get('color')).to.equal('blue')

      pubSub.set(1, 'color', 'green')
      expect(pubSub.get('color')).to.equal('blue')

      pubSub.set(2, 'color', 'red')
      expect(pubSub.get('color')).to.equal('blue')
    })
  })

  describe('unchanged values', () => {
    it('should not trigger updates when setting the same value', () => {
      let updateCalled = 0
      effect(() => {
        updateCalled++
        pubSub.get('color')
      })
      expect(updateCalled).to.equal(1)

      pubSub.set(0, 'color', 'red')
      // No update as no one is listening yet
      expect(updateCalled).to.equal(2)

      // Get the value to establish a listener
      pubSub.get('color')

      // Set the same value again
      pubSub.set(0, 'color', 'red')
      expect(updateCalled).to.equal(2)

      // Set a different value
      pubSub.set(0, 'color', 'blue')
      expect(updateCalled).to.be.equal(3)
    })
  })

  describe('clear layer', () => {
    it('should clear all values in a specific layer', () => {
      pubSub.set(0, 'color', 'blue')
      pubSub.set(0, 'size', 10)
      pubSub.set(1, 'color', 'green')
      pubSub.set(2, 'color', 'red')

      pubSub.clearLayer(0)

      // Should fall back to higher layers
      expect(pubSub.get('color')).to.equal('green')
      expect(pubSub.get('size')).to.be.undefined
    })

    it('should do nothing when clearing a non-existent layer', () => {
      pubSub.set(0, 'color', 'blue')
      pubSub.clearLayer(5)
      expect(pubSub.get('color')).to.equal('blue')
    })

    it('should handle clearing an empty layer', () => {
      pubSub.clearLayer(0)
      expect(pubSub.get('color')).to.be.undefined
    })
  })

  describe('signal integration', () => {
    it('should accept and read signals as values', () => {
      const colorSignal = new Signal('red')
      pubSub.set(0, 'color', colorSignal)

      expect(pubSub.get('color')).to.equal('red')

      colorSignal.value = 'blue'
      expect(pubSub.get('color')).to.equal('blue')
    })

    it('should update when signal values change', () => {
      const colorSignal = new Signal('red')
      pubSub.set(0, 'color', colorSignal)

      // First get to establish a subscription
      expect(pubSub.get('color')).to.equal('red')

      // Change the signal
      colorSignal.value = 'blue'
      expect(pubSub.get('color')).to.equal('blue')
    })

    it('should fall back when signal becomes undefined', () => {
      const colorSignal = new Signal('red')
      pubSub.set(0, 'color', colorSignal)
      pubSub.set(1, 'color', 'green')

      expect(pubSub.get('color')).to.equal('red')

      colorSignal.value = undefined as any
      expect(pubSub.get('color')).to.equal('green')
    })

    it('should fall back through multiple layers with signals to a static value', () => {
      const signalLayer0 = new Signal('blue')
      const signalLayer1 = new Signal('green')

      pubSub.set(0, 'color', signalLayer0)
      pubSub.set(1, 'color', signalLayer1)
      pubSub.set(2, 'color', 'red')

      expect(pubSub.get('color')).to.equal('blue')

      signalLayer0.value = undefined as any
      expect(pubSub.get('color')).to.equal('green')

      signalLayer1.value = undefined as any
      expect(pubSub.get('color')).to.equal('red')
    })
  })

  describe('nesting of two PropertiesPubSub', () => {
    it('should allow one PubSub to be a consumer of another', () => {
      const parentPubSub = new PropertiesPubSub<TestProps, TestProps, {}>((key, value, set) => set(key, value), {})
      const childPubSub = new PropertiesPubSub<TestProps, TestProps, {}>((key, value, set) => set(key, value), {})

      // Set up parent with a value
      parentPubSub.set(0, 'color', 'red')

      // Child gets value from parent and sets its own
      childPubSub.set(0, 'color', parentPubSub.getSignal('color'))

      expect(childPubSub.get('color')).to.equal('red')

      // Update parent should not automatically update child
      parentPubSub.set(0, 'color', 'blue')
      expect(childPubSub.get('color')).to.equal('blue')
    })

    it('should allow nesting two PubSubs with multiple layers', () => {
      const parentPubSub = new PropertiesPubSub<TestProps, TestProps, {}>((key, value, set) => set(key, value), {})
      const childPubSub = new PropertiesPubSub<TestProps, TestProps, {}>((key, value, set) => set(key, value), {})

      // Set up parent with a value
      parentPubSub.set(1, 'color', 'red')
      parentPubSub.set(0, 'color', 'orange')

      // Child gets value from parent and sets its own
      childPubSub.set(1, 'color', parentPubSub.getSignal('color'))
      childPubSub.set(0, 'color', 'green')

      expect(childPubSub.get('color')).to.equal('green')

      childPubSub.set(0, 'color', undefined)
      expect(childPubSub.get('color')).to.equal('orange')

      parentPubSub.set(0, 'color', undefined)
      expect(childPubSub.get('color')).to.equal('red')
    })
  })

  describe('apply function property aliasing', () => {
    interface BorderProps {
      borderWidth?: number | Signal<number | undefined>
      borderWidthTop?: number | Signal<number | undefined>
      borderWidthRight?: number | Signal<number | undefined>
      borderWidthBottom?: number | Signal<number | undefined>
      borderWidthLeft?: number | Signal<number | undefined>
    }

    let pubSub: PropertiesPubSub<BorderProps, BorderProps, {}>

    beforeEach(() => {
      pubSub = new PropertiesPubSub<BorderProps, BorderProps, {}>((key, value, set) => {
        if (key === 'borderWidth') {
          // Alias borderWidth to all sides
          set('borderWidthTop', value)
          set('borderWidthRight', value)
          set('borderWidthBottom', value)
          set('borderWidthLeft', value)
        } else {
          // For all other properties, just set them directly
          set(key, value)
        }
      }, {})
    })

    it('should alias borderWidth to all sides', () => {
      pubSub.set(0, 'borderWidth', 5)

      expect(pubSub.get('borderWidthTop')).to.equal(5)
      expect(pubSub.get('borderWidthRight')).to.equal(5)
      expect(pubSub.get('borderWidthBottom')).to.equal(5)
      expect(pubSub.get('borderWidthLeft')).to.equal(5)
    })

    it('should handle signals for borderWidth aliasing', () => {
      const borderWidthSignal = new Signal(5)
      pubSub.set(0, 'borderWidth', borderWidthSignal)

      expect(pubSub.get('borderWidthTop')).to.equal(5)
      expect(pubSub.get('borderWidthRight')).to.equal(5)
      expect(pubSub.get('borderWidthBottom')).to.equal(5)
      expect(pubSub.get('borderWidthLeft')).to.equal(5)

      borderWidthSignal.value = 10
      expect(pubSub.get('borderWidthTop')).to.equal(10)
      expect(pubSub.get('borderWidthRight')).to.equal(10)
      expect(pubSub.get('borderWidthBottom')).to.equal(10)
      expect(pubSub.get('borderWidthLeft')).to.equal(10)
    })

    it('should allow individual sides to override the aliased borderWidth', () => {
      pubSub.set(0, 'borderWidth', 5)
      pubSub.set(0, 'borderWidthTop', 10)

      expect(pubSub.get('borderWidthTop')).to.equal(10)
      expect(pubSub.get('borderWidthRight')).to.equal(5)
      expect(pubSub.get('borderWidthBottom')).to.equal(5)
      expect(pubSub.get('borderWidthLeft')).to.equal(5)
    })

    it('should respect layer precedence with aliased properties', () => {
      pubSub.set(1, 'borderWidth', 5)
      pubSub.set(0, 'borderWidthTop', 10)

      expect(pubSub.get('borderWidthTop')).to.equal(10)
      expect(pubSub.get('borderWidthRight')).to.equal(5)
      expect(pubSub.get('borderWidthBottom')).to.equal(5)
      expect(pubSub.get('borderWidthLeft')).to.equal(5)

      pubSub.set(0, 'borderWidth', 15)
      expect(pubSub.get('borderWidthTop')).to.equal(15)
      expect(pubSub.get('borderWidthRight')).to.equal(15)
      expect(pubSub.get('borderWidthBottom')).to.equal(15)
      expect(pubSub.get('borderWidthLeft')).to.equal(15)
    })

    it('should handle undefined values in aliased properties', () => {
      pubSub.set(0, 'borderWidth', 5)
      pubSub.set(0, 'borderWidth', undefined)

      expect(pubSub.get('borderWidthTop')).to.be.undefined
      expect(pubSub.get('borderWidthRight')).to.be.undefined
      expect(pubSub.get('borderWidthBottom')).to.be.undefined
      expect(pubSub.get('borderWidthLeft')).to.be.undefined
    })
  })

  describe('subscribePropertyKeys', () => {
    it('should notify subscriber about existing property keys immediately', () => {
      const receivedKeys = new Set<keyof TestProps>()

      // Set up some initial properties
      pubSub.set(0, 'color', 'red')
      pubSub.set(0, 'size', 10)

      // Subscribe and collect keys
      pubSub.subscribePropertyKeys((key) => {
        receivedKeys.add(key as any)
      })

      // Should have received both existing keys
      expect(receivedKeys.has('color')).to.be.true
      expect(receivedKeys.has('size')).to.be.true
      expect(receivedKeys.size).to.equal(2)
    })

    it('should notify subscriber about new property keys', () => {
      const receivedKeys = new Set<keyof TestProps>()

      // Set up initial property
      pubSub.set(0, 'color', 'red')

      // Subscribe and collect keys
      pubSub.subscribePropertyKeys((key) => {
        receivedKeys.add(key as any)
      })

      // Add new property after subscription
      pubSub.set(0, 'size', 10)

      // Should have received both the existing and new key
      expect(receivedKeys.has('color')).to.be.true
      expect(receivedKeys.has('size')).to.be.true
      expect(receivedKeys.size).to.equal(2)
    })

    it('should stop notifying after abort signal', () => {
      const receivedKeys = new Set<keyof TestProps>()

      // Subscribe and collect keys
      const unsubscribe = pubSub.subscribePropertyKeys((key) => {
        receivedKeys.add(key as any)
      })

      // Set initial property
      pubSub.set(0, 'color', 'red')
      expect(receivedKeys.has('color')).to.be.true

      // Abort the subscription
      unsubscribe()

      // Add new property after abort
      pubSub.set(0, 'size', 10)

      // Should not have received the new key
      expect(receivedKeys.has('size')).to.be.false
      expect(receivedKeys.size).to.equal(1)
    })
  })

  describe('defaults', () => {
    interface DefaultTestProps {
      color?: string | Signal<string | undefined>
      size?: number | Signal<number | undefined>
      visible?: boolean | Signal<boolean | undefined>
    }

    it('should use default value when no layers provide a value', () => {
      const pubSub = new PropertiesPubSub<DefaultTestProps, DefaultTestProps, { color: string; size: number }>(
        (key, value, set) => set(key, value),
        { color: 'default-red', size: 100 },
      )

      expect(pubSub.get('color')).to.equal('default-red')
      expect(pubSub.get('size')).to.equal(100)
      expect(pubSub.get('visible')).to.be.undefined
    })

    it('should override default value when a layer provides a value', () => {
      const pubSub = new PropertiesPubSub<DefaultTestProps, DefaultTestProps, { color: string; size: number }>(
        (key, value, set) => set(key, value),
        { color: 'default-red', size: 100 },
      )

      pubSub.set(0, 'color', 'blue')
      expect(pubSub.get('color')).to.equal('blue')
      expect(pubSub.get('size')).to.equal(100)
    })

    it('should fall back to default value when layer value becomes undefined', () => {
      const pubSub = new PropertiesPubSub<DefaultTestProps, DefaultTestProps, { color: string; size: number }>(
        (key, value, set) => set(key, value),
        { color: 'default-red', size: 100 },
      )

      pubSub.set(0, 'color', 'blue')
      expect(pubSub.get('color')).to.equal('blue')

      pubSub.set(0, 'color', undefined)
      expect(pubSub.get('color')).to.equal('default-red')
    })

    it('should handle signal default values', () => {
      const defaultColorSignal = new Signal('default-red')
      const pubSub = new PropertiesPubSub<DefaultTestProps, DefaultTestProps, { color: Signal<string> }>(
        (key, value, set) => set(key, value),
        { color: defaultColorSignal },
      )

      expect(pubSub.get('color')).to.equal('default-red')

      defaultColorSignal.value = 'default-blue'
      expect(pubSub.get('color')).to.equal('default-blue')
    })

    it('should handle multiple layers falling back to default', () => {
      const pubSub = new PropertiesPubSub<DefaultTestProps, DefaultTestProps, { color: string }>(
        (key, value, set) => set(key, value),
        { color: 'default-red' },
      )

      pubSub.set(2, 'color', 'red')
      pubSub.set(1, 'color', 'green')
      pubSub.set(0, 'color', 'blue')
      expect(pubSub.get('color')).to.equal('blue')

      pubSub.clearLayer(0)
      expect(pubSub.get('color')).to.equal('green')

      pubSub.clearLayer(1)
      expect(pubSub.get('color')).to.equal('red')

      pubSub.clearLayer(2)
      expect(pubSub.get('color')).to.equal('default-red')
    })

    it('should handle getSignal with default values', () => {
      const pubSub = new PropertiesPubSub<DefaultTestProps, DefaultTestProps, { color: string }>(
        (key, value, set) => set(key, value),
        { color: 'default-red' },
      )

      const colorSignal = pubSub.getSignal('color')
      expect(colorSignal.value).to.equal('default-red')

      pubSub.set(0, 'color', 'blue')
      expect(colorSignal.value).to.equal('blue')

      pubSub.set(0, 'color', undefined)
      expect(colorSignal.value).to.equal('default-red')
    })
  })

  describe('peek', () => {
    it('should return current value without subscribing', () => {
      pubSub.set(0, 'color', 'red')

      let updateCount = 0
      effect(() => {
        updateCount++
        pubSub.peek('color')
      })

      expect(updateCount).to.equal(1)

      // Change value - should not trigger effect since peek doesn't subscribe
      pubSub.set(0, 'color', 'blue')
      expect(updateCount).to.equal(1)
      expect(pubSub.get('color')).to.equal('blue')
      expect(pubSub.peek('color')).to.equal('blue')
    })

    it('should work for keys that were never accessed via get()', () => {
      pubSub.set(0, 'color', 'red')
      expect(pubSub.peek('color')).to.equal('red')
    })

    it('should respect layer precedence', () => {
      pubSub.set(2, 'color', 'red')
      pubSub.set(1, 'color', 'green')
      pubSub.set(0, 'color', 'blue')

      expect(pubSub.peek('color')).to.equal('blue')
    })

    it('should handle signals without subscribing', () => {
      const colorSignal = new Signal('red')
      pubSub.set(0, 'color', colorSignal)

      let updateCount = 0
      effect(() => {
        updateCount++
        pubSub.peek('color')
      })

      expect(updateCount).to.equal(1)
      expect(pubSub.peek('color')).to.equal('red')

      colorSignal.value = 'blue'
      expect(updateCount).to.equal(1)
      expect(pubSub.peek('color')).to.equal('blue')
    })

    it('should return default value when no layers provide a value', () => {
      const pubSubWithDefaults = new PropertiesPubSub<TestProps, TestProps, { color: string }>(
        (key, value, set) => set(key, value),
        { color: 'default-red' },
      )

      expect(pubSubWithDefaults.peek('color')).to.equal('default-red')
    })
  })

  //TODO: add tests for handling sparse layer distribution, meaning layers e.g. at index: 0, 10, 20
})
