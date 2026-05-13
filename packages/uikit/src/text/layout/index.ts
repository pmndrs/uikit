import { computed } from '@preact/signals-core'
import type { ReadonlySignal } from '@preact/signals-core'
import { buildPositionedGlyphLayout } from './positioned.js'
import { computedCustomLayouting } from './measure.js'
import { computedGlyphOutProperties } from './normalize.js'
import type { PositionedGlyphLayout, TextLayoutTarget } from './types.js'
import type { CustomLayouting } from '../../flex/index.js'

export * from './matrix.js'
export * from './measure.js'
export * from './normalize.js'
export * from './positioned.js'
export * from './query.js'
export * from './types.js'

export function setupTextLayout(target: TextLayoutTarget): {
  layout: ReadonlySignal<PositionedGlyphLayout | undefined>
  customLayouting: ReadonlySignal<CustomLayouting | undefined>
} {
  const layoutProperties = computedGlyphOutProperties(target.properties, target.fontSignal)
  const customLayouting = computedCustomLayouting(layoutProperties)
  const layout = computed(() => {
    const properties = layoutProperties.value
    const {
      size: { value: size },
      paddingInset: { value: paddingInset },
      borderInset: { value: borderInset },
    } = target
    if (properties == null || size == null || paddingInset == null || borderInset == null) {
      return undefined
    }
    const [width, height] = size
    const [pTop, pRight, pBottom, pLeft] = paddingInset
    const [bTop, bRight, bBottom, bLeft] = borderInset
    const actualWidth = width - pRight - pLeft - bRight - bLeft
    const actualHeight = height - pTop - pBottom - bTop - bBottom
    return buildPositionedGlyphLayout(
      properties,
      actualWidth,
      actualHeight,
      target.properties.value.textAlign,
      target.properties.value.verticalAlign,
    )
  })

  return { layout, customLayouting }
}
