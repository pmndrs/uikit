import { expect } from 'chai'
import { PropertiesImplementation } from '../src/index.js'
import { effect, Signal } from '@preact/signals-core'

type OutTestProps = {
  color?: string
  size?: number
  visible?: boolean
}

type InTestProps = { [Key in keyof OutTestProps]?: OutTestProps[Key] | Signal<OutTestProps[Key] | undefined> }

describe('PropertiesPubSub', () => {
  let pubSub: PropertiesImplementation<InTestProps, OutTestProps>

  beforeEach(() => {
    pubSub = new PropertiesImplementation<InTestProps, OutTestProps>((key, value, set) => set(key, value), {})
    pubSub.setEnabled(true)
  })

  describe('normal set/get operations', () => {
    it('should set and get a value', () => {
      pubSub.set(0, 'color', 'red')
      expect(pubSub.value.color).to.equal('red')
    })

    it('should return undefined for unset properties', () => {
      expect(pubSub.value.size).to.be.undefined
    })

    it('should get the most recently set value', () => {
      pubSub.set(0, 'color', 'red')
      pubSub.set(0, 'color', 'blue')
      expect(pubSub.value.color).to.equal('blue')
    })

    it('should handle different property types', () => {
      pubSub.set(0, 'color', 'red')
      pubSub.set(0, 'size', 10)
      pubSub.set(0, 'visible', true)

      expect(pubSub.value.color).to.equal('red')
      expect(pubSub.value.size).to.equal(10)
      expect(pubSub.value.visible).to.equal(true)
    })
  })

  describe('layer precedence', () => {
    it('should prioritize values from lower layer indices', () => {
      pubSub.set(2, 'color', 'red')
      pubSub.set(1, 'color', 'green')
      pubSub.set(0, 'color', 'blue')

      expect(pubSub.value.color).to.equal('blue')
    })

    it("should fall back to higher layers when lower layers don't have a value", () => {
      pubSub.set(2, 'color', 'red')
      pubSub.set(1, 'size', 10)
      pubSub.set(0, 'visible', true)

      expect(pubSub.value.color).to.equal('red')
      expect(pubSub.value.size).to.equal(10)
      expect(pubSub.value.visible).to.equal(true)
    })

    it('should update property when a higher priority layer sets a value', () => {
      pubSub.set(2, 'color', 'red')
      expect(pubSub.value.color).to.equal('red')

      pubSub.set(1, 'color', 'green')
      expect(pubSub.value.color).to.equal('green')

      pubSub.set(0, 'color', 'blue')
      expect(pubSub.value.color).to.equal('blue')
    })

    it('should not update when a lower priority layer sets a value', () => {
      pubSub.set(0, 'color', 'blue')
      expect(pubSub.value.color).to.equal('blue')

      pubSub.set(1, 'color', 'green')
      expect(pubSub.value.color).to.equal('blue')

      pubSub.set(2, 'color', 'red')
      expect(pubSub.value.color).to.equal('blue')
    })
  })

  describe('unchanged values', () => {
    it('should not trigger updates when setting the same value', () => {
      let updateCalled = 0
      effect(() => {
        updateCalled++
        pubSub.value.color
      })
      expect(updateCalled).to.equal(1)

      pubSub.set(0, 'color', 'red')
      // No update as no one is listening yet
      expect(updateCalled).to.equal(2)

      // Get the value to establish a listener
      pubSub.value.color

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

      pubSub.setLayer(0, undefined)

      // Should fall back to higher layers
      expect(pubSub.value.color).to.equal('green')
      expect(pubSub.value.size).to.be.undefined
    })

    it('should do nothing when clearing a non-existent layer', () => {
      pubSub.set(0, 'color', 'blue')
      pubSub.setLayer(5, undefined)
      expect(pubSub.value.color).to.equal('blue')
    })

    it('should handle clearing an empty layer', () => {
      pubSub.setLayer(0, undefined)
      expect(pubSub.value.color).to.be.undefined
    })
  })

  describe('signal integration', () => {
    it('should accept and read signals as values', () => {
      const colorSignal = new Signal('red')
      pubSub.set(0, 'color', colorSignal)

      expect(pubSub.value.color).to.equal('red')

      colorSignal.value = 'blue'
      expect(pubSub.value.color).to.equal('blue')
    })

    it('should update when signal values change', () => {
      const colorSignal = new Signal('red')
      pubSub.set(0, 'color', colorSignal)

      // First get to establish a subscription
      expect(pubSub.value.color).to.equal('red')

      // Change the signal
      colorSignal.value = 'blue'
      expect(pubSub.value.color).to.equal('blue')
    })

    it('should fall back when signal becomes undefined', () => {
      const colorSignal = new Signal('red')
      pubSub.set(0, 'color', colorSignal)
      pubSub.set(1, 'color', 'green')

      expect(pubSub.value.color).to.equal('red')

      colorSignal.value = undefined as any
      expect(pubSub.value.color).to.equal('green')
    })

    it('should fall back through multiple layers with signals to a static value', () => {
      const signalLayer0 = new Signal('blue')
      const signalLayer1 = new Signal('green')

      pubSub.set(0, 'color', signalLayer0)
      pubSub.set(1, 'color', signalLayer1)
      pubSub.set(2, 'color', 'red')

      expect(pubSub.value.color).to.equal('blue')

      signalLayer0.value = undefined as any
      expect(pubSub.value.color).to.equal('green')

      signalLayer1.value = undefined as any
      expect(pubSub.value.color).to.equal('red')
    })
  })

  describe('nesting of two PropertiesPubSub', () => {
    it('should allow one PubSub to be a consumer of another', () => {
      const parentPubSub = new PropertiesImplementation<InTestProps, OutTestProps>(
        (key, value, set) => set(key, value),
        {},
      )
      const childPubSub = new PropertiesImplementation<InTestProps, OutTestProps>(
        (key, value, set) => set(key, value),
        {},
      )

      parentPubSub.setEnabled(true)
      childPubSub.setEnabled(true)

      // Set up parent with a value
      parentPubSub.set(0, 'color', 'red')

      // Child gets value from parent and sets its own
      childPubSub.set(0, 'color', parentPubSub.signal.color)

      expect(childPubSub.value.color).to.equal('red')

      // Update parent should not automatically update child
      parentPubSub.set(0, 'color', 'blue')
      expect(childPubSub.value.color).to.equal('blue')
    })

    it('should allow nesting two PubSubs with multiple layers', () => {
      const parentPubSub = new PropertiesImplementation<InTestProps, OutTestProps>(
        (key, value, set) => set(key, value),
        {},
      )
      const childPubSub = new PropertiesImplementation<InTestProps, OutTestProps>(
        (key, value, set) => set(key, value),
        {},
      )

      parentPubSub.setEnabled(true)
      childPubSub.setEnabled(true)

      // Set up parent with a value
      parentPubSub.set(1, 'color', 'red')
      parentPubSub.set(0, 'color', 'orange')

      // Child gets value from parent and sets its own
      childPubSub.set(1, 'color', parentPubSub.signal.color)
      childPubSub.set(0, 'color', 'green')

      expect(childPubSub.value.color).to.equal('green')

      childPubSub.set(0, 'color', undefined)
      expect(childPubSub.value.color).to.equal('orange')

      parentPubSub.set(0, 'color', undefined)
      expect(childPubSub.value.color).to.equal('red')
    })
  })

  describe('apply function property aliasing', () => {
    type OutBorderProps = {
      borderWidth?: number
      borderWidthTop?: number
      borderWidthRight?: number
      borderWidthBottom?: number
      borderWidthLeft?: number
    }

    type InBorderProps = {
      [Key in keyof OutBorderProps]?: OutBorderProps[Key] | Signal<OutBorderProps[Key] | undefined>
    }

    let pubSub: PropertiesImplementation<InBorderProps, OutBorderProps>

    beforeEach(() => {
      pubSub = new PropertiesImplementation<InBorderProps, OutBorderProps>((key, value, set) => {
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
      pubSub.setEnabled(true)
    })

    it('should alias borderWidth to all sides', () => {
      pubSub.set(0, 'borderWidth', 5)

      expect(pubSub.value.borderWidthTop).to.equal(5)
      expect(pubSub.value.borderWidthRight).to.equal(5)
      expect(pubSub.value.borderWidthBottom).to.equal(5)
      expect(pubSub.value.borderWidthLeft).to.equal(5)
    })

    it('should handle signals for borderWidth aliasing', () => {
      const borderWidthSignal = new Signal(5)
      pubSub.set(0, 'borderWidth', borderWidthSignal)

      expect(pubSub.value.borderWidthTop).to.equal(5)
      expect(pubSub.value.borderWidthRight).to.equal(5)
      expect(pubSub.value.borderWidthBottom).to.equal(5)
      expect(pubSub.value.borderWidthLeft).to.equal(5)

      borderWidthSignal.value = 10
      expect(pubSub.value.borderWidthTop).to.equal(10)
      expect(pubSub.value.borderWidthRight).to.equal(10)
      expect(pubSub.value.borderWidthBottom).to.equal(10)
      expect(pubSub.value.borderWidthLeft).to.equal(10)
    })

    it('should allow individual sides to override the aliased borderWidth', () => {
      pubSub.set(0, 'borderWidth', 5)
      pubSub.set(0, 'borderWidthTop', 10)

      expect(pubSub.value.borderWidthTop).to.equal(10)
      expect(pubSub.value.borderWidthRight).to.equal(5)
      expect(pubSub.value.borderWidthBottom).to.equal(5)
      expect(pubSub.value.borderWidthLeft).to.equal(5)
    })

    it('should respect layer precedence with aliased properties', () => {
      pubSub.set(1, 'borderWidth', 5)
      pubSub.set(0, 'borderWidthTop', 10)

      expect(pubSub.value.borderWidthTop).to.equal(10)
      expect(pubSub.value.borderWidthRight).to.equal(5)
      expect(pubSub.value.borderWidthBottom).to.equal(5)
      expect(pubSub.value.borderWidthLeft).to.equal(5)

      pubSub.set(0, 'borderWidth', 15)
      expect(pubSub.value.borderWidthTop).to.equal(15)
      expect(pubSub.value.borderWidthRight).to.equal(15)
      expect(pubSub.value.borderWidthBottom).to.equal(15)
      expect(pubSub.value.borderWidthLeft).to.equal(15)
    })

    it('should handle undefined values in aliased properties', () => {
      pubSub.set(0, 'borderWidth', 5)
      pubSub.set(0, 'borderWidth', undefined)

      expect(pubSub.value.borderWidthTop).to.be.undefined
      expect(pubSub.value.borderWidthRight).to.be.undefined
      expect(pubSub.value.borderWidthBottom).to.be.undefined
      expect(pubSub.value.borderWidthLeft).to.be.undefined
    })
  })

  describe('subscribePropertyKeys', () => {
    it('should notify subscriber about existing property keys immediately', () => {
      const receivedKeys = new Set<keyof OutTestProps>()

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
      const receivedKeys = new Set<keyof OutTestProps>()

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
      const receivedKeys = new Set<keyof OutTestProps>()

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
    type OutDefaultTestProps = { color: string; size: number; visible?: boolean }

    type InDefaultTestProps = {
      [Key in keyof OutDefaultTestProps]?: OutDefaultTestProps[Key] | Signal<OutDefaultTestProps[Key] | undefined>
    }

    it('should use default value when no layers provide a value', () => {
      const pubSub = new PropertiesImplementation<InDefaultTestProps, OutDefaultTestProps>(
        (key, value, set) => set(key, value as any),
        {
          color: 'default-red',
          size: 100,
        },
      )
      pubSub.setEnabled(true)

      expect(pubSub.value.color).to.equal('default-red')
      expect(pubSub.value.size).to.equal(100)
      expect(pubSub.value.visible).to.be.undefined
    })

    it('should override default value when a layer provides a value', () => {
      const pubSub = new PropertiesImplementation<InDefaultTestProps, OutDefaultTestProps>(
        (key, value, set) => set(key, value as any),
        {
          color: 'default-red',
          size: 100,
        },
      )
      pubSub.setEnabled(true)

      pubSub.set(0, 'color', 'blue')
      expect(pubSub.value.color).to.equal('blue')
      expect(pubSub.value.size).to.equal(100)
    })

    it('should fall back to default value when layer value becomes undefined', () => {
      const pubSub = new PropertiesImplementation<InDefaultTestProps, OutDefaultTestProps>(
        (key, value, set) => set(key, value as any),
        {
          color: 'default-red',
          size: 100,
        },
      )
      pubSub.setEnabled(true)

      pubSub.set(0, 'color', 'blue')
      expect(pubSub.value.color).to.equal('blue')

      pubSub.set(0, 'color', undefined)
      expect(pubSub.value.color).to.equal('default-red')
    })

    it('should handle multiple layers falling back to default', () => {
      const pubSub = new PropertiesImplementation<InDefaultTestProps, OutDefaultTestProps>(
        (key, value, set) => set(key, value as any),
        { color: 'default-red', size: 100 },
      )
      pubSub.setEnabled(true)

      pubSub.set(2, 'color', 'red')
      pubSub.set(1, 'color', 'green')
      pubSub.set(0, 'color', 'blue')
      expect(pubSub.value.color).to.equal('blue')

      pubSub.setLayer(0, undefined)
      expect(pubSub.value.color).to.equal('green')

      pubSub.setLayer(1, undefined)
      expect(pubSub.value.color).to.equal('red')

      pubSub.setLayer(2, undefined)
      expect(pubSub.value.color).to.equal('default-red')
    })

    it('should handle getSignal with default values', () => {
      const pubSub = new PropertiesImplementation<InDefaultTestProps, OutDefaultTestProps>(
        (key, value, set) => set(key, value as any),
        {
          color: 'default-red',
          size: 100,
        },
      )
      pubSub.setEnabled(true)

      const colorSignal = pubSub.signal.color
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
        pubSub.peek().color
      })

      expect(updateCount).to.equal(1)

      // Change value - should not trigger effect since peek doesn't subscribe
      pubSub.set(0, 'color', 'blue')
      expect(updateCount).to.equal(1)
      expect(pubSub.value.color).to.equal('blue')
      expect(pubSub.peek().color).to.equal('blue')
    })

    it('should work for keys that were never accessed via get()', () => {
      pubSub.set(0, 'color', 'red')
      expect(pubSub.peek().color).to.equal('red')
    })

    it('should respect layer precedence', () => {
      pubSub.set(2, 'color', 'red')
      pubSub.set(1, 'color', 'green')
      pubSub.set(0, 'color', 'blue')

      expect(pubSub.peek().color).to.equal('blue')
    })

    it('should handle signals without subscribing', () => {
      const colorSignal = new Signal('red')
      pubSub.set(0, 'color', colorSignal)

      let updateCount = 0
      effect(() => {
        updateCount++
        pubSub.peek().color
      })

      expect(updateCount).to.equal(1)
      expect(pubSub.peek().color).to.equal('red')

      colorSignal.value = 'blue'
      expect(updateCount).to.equal(1)
      expect(pubSub.peek().color).to.equal('blue')
    })

    it('should return default value when no layers provide a value', () => {
      const pubSubWithDefaults = new PropertiesImplementation<InTestProps, OutTestProps>(
        (key, value, set) => set(key, value),
        {
          color: 'default-red',
        },
      )

      expect(pubSubWithDefaults.peek().color).to.equal('default-red')
    })
  })

  describe('enable/disable', () => {
    it('should return defaults while disabled and apply values after enable', () => {
      type Out = { color?: string; size?: number }
      type In = { [K in keyof Out]?: Out[K] | Signal<Out[K] | undefined> }

      const ps = new PropertiesImplementation<In, Out>((key, value, set) => set(key, value as any), {
        color: 'default-red',
        size: 42,
      })

      // Initially disabled → defaults
      expect(ps.value.color).to.equal('default-red')
      expect(ps.value.size).to.equal(42)

      ps.set(0, 'color', 'blue')
      ps.set(0, 'size', 7)

      // Still disabled → still defaults
      expect(ps.value.color).to.equal('default-red')
      expect(ps.value.size).to.equal(42)

      ps.setEnabled(true)

      // After enable → applied values
      expect(ps.value.color).to.equal('blue')
      expect(ps.value.size).to.equal(7)
    })

    it('should revert to defaults when disabled and persist mutations for next enable', () => {
      type Out = { color?: string; size?: number }
      type In = { [K in keyof Out]?: Out[K] | Signal<Out[K] | undefined> }

      const ps = new PropertiesImplementation<In, Out>((key, value, set) => set(key, value as any), {
        color: 'default-red',
        size: 1,
      })

      ps.setEnabled(true)
      ps.set(0, 'color', 'red')
      ps.set(0, 'size', 2)
      expect(ps.value.color).to.equal('red')
      expect(ps.value.size).to.equal(2)

      ps.setEnabled(false)
      // While disabled → defaults visible
      expect(ps.value.color).to.equal('default-red')
      expect(ps.value.size).to.equal(1)

      // Mutate while disabled
      ps.set(0, 'color', 'green')
      ps.set(0, 'size', 3)
      // Still disabled → still defaults
      expect(ps.value.color).to.equal('default-red')
      expect(ps.value.size).to.equal(1)

      ps.setEnabled(true)
      // After re-enable → latest mutations applied
      expect(ps.value.color).to.equal('green')
      expect(ps.value.size).to.equal(3)
    })
  })

  //TODO: add tests for handling sparse layer distribution, meaning layers e.g. at index: 0, 10, 20
})
