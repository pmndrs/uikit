import { expect } from 'chai'
import { signal } from '@preact/signals-core'
import { PropertiesImplementation } from '../src/properties/index.js'
import { allAliases } from '../src/properties/alias.js'

function createTestProperties(defaults?: Record<string, unknown>) {
  const hover = signal(false)
  const properties = new PropertiesImplementation<any>(
    allAliases,
    new Proxy({} as any, {
      get: (_target, key) => (key === 'hover' ? () => hover.value : () => false),
    }),
    defaults as any,
  )
  properties.setEnabled(true)
  return { hover, properties }
}

describe('properties precedence', () => {
  it('uses undefined as ignore and initial as default reset', () => {
    const { properties } = createTestProperties({ height: 1 })

    properties.setLayer(10, { height: 2 })
    expect(properties.value.height).to.equal(2)

    properties.setLayer(5, { height: undefined })
    expect(properties.value.height).to.equal(2)

    properties.setLayer(5, { height: 'initial' })
    expect(properties.value.height).to.equal(1)
  })

  it('updates precedence when signal values change', () => {
    const { properties } = createTestProperties({ height: 1 })
    const topLayer = signal<number | null | undefined>(undefined)

    properties.setLayer(10, { height: 2 })
    properties.setLayer(5, { height: topLayer })
    expect(properties.value.height).to.equal(2)

    topLayer.value = null
    expect(properties.value.height).to.equal(null)

    topLayer.value = undefined
    expect(properties.value.height).to.equal(2)
  })

  it('preserves conditional precedence over base properties', () => {
    const { hover, properties } = createTestProperties({ height: 1 })

    properties.setLayersWithConditionals({ type: 'default-overrides' }, { height: 2, hover: { height: 3 } })
    properties.setLayersWithConditionals({ type: 'base' }, { height: 4, hover: { height: 5 } })

    expect(properties.value.height).to.equal(4)

    hover.value = true
    expect(properties.value.height).to.equal(5)
  })
})
