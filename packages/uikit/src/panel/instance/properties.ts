import { computed } from '@preact/signals-core'
import { Properties } from '../../properties/index.js'
import type { MaterialClass } from '../material/create.js'
import { materialClasses, resolvePanelMaterialClassProperty } from '../material/presets.js'
import { parseNumberValue, type NumberValue } from '../../properties/values.js'

export type ShadowProperties = {
  receiveShadow?: boolean
  castShadow?: boolean
}

export type RenderProperties = {
  depthWrite?: boolean
  depthTest?: boolean
  renderOrder?: NumberValue
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
      renderOrder: parseNumberValue(properties.value.renderOrder ?? 0),
    }
  })
}
