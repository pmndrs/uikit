import { computed } from '@preact/signals-core'
import { Properties } from '../../properties/index.js'
import type { MaterialClass } from '../material/create.js'
import { materialClasses, resolvePanelMaterialClassProperty } from '../material/presets.js'
import { parseNumberLike, type NumberLike } from '../../properties/values.js'

export type ShadowProperties = {
  receiveShadow?: boolean
  castShadow?: boolean
}

export type RenderProperties = {
  depthWrite?: boolean
  depthTest?: boolean
  renderOrder?: NumberLike
}

export type PanelGroupProperties = {
  panelMaterialClass?: MaterialClass | keyof typeof materialClasses
} & ShadowProperties &
  RenderProperties

export function computedPanelGroupDependencies(properties: Properties) {
  return computed<Required<PanelGroupProperties>>(() => {
    return {
      panelMaterialClass: resolvePanelMaterialClassProperty(properties.value.panelMaterialClass),
      castShadow: properties.value.castShadow,
      receiveShadow: properties.value.receiveShadow,
      depthWrite: properties.value.depthWrite ?? false,
      depthTest: properties.value.depthTest,
      renderOrder: parseNumberLike(properties.value.renderOrder ?? 0),
    }
  })
}
