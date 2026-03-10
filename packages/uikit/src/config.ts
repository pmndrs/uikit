import { componentDefaults } from './properties/defaults.js'
import { imageDefaults } from './components/image.js'
import { contentDefaults } from './components/content.js'
import { textDefaults } from './components/text.js'

export function setDefaultRenderOrder(order: number): void {
  componentDefaults.renderOrder = order
  imageDefaults.renderOrder = order
  contentDefaults.renderOrder = order
  textDefaults.renderOrder = order
}
