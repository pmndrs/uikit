import { signal } from '@preact/signals-core'
import { ExperimentalFeature, Node, Yoga, loadYoga } from 'yoga-layout/load'

export const PointScaleFactor = 100

export function createDefaultConfig(Config: Yoga['Config']) {
  const config = Config.create()
  config.setUseWebDefaults(true)
  config.setPointScaleFactor(PointScaleFactor)
  config.setExperimentalFeatureEnabled(ExperimentalFeature.WebFlexBasis, true)
  return config
}

const create = signal<(() => Node) | undefined>(undefined)
loadYoga()
  .then(({ Node, Config }) => {
    const config = createDefaultConfig(Config)
    create.value = () => Node.create(config)
  })
  .catch(console.error)

export const createYogaNode = () => create.value?.()
