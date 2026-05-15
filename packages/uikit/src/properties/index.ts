import type { z } from 'zod'
import { baseOutPropertiesSchema, type SchemaInProperties, type SchemaLayerProperties } from './schema.js'
import {
  PropertiesImplementation as BasePropertiesImplementation,
  Properties as BaseProperties,
} from '@pmndrs/uikit-pub-sub'
import { Aliases, AddAllAliases } from './alias.js'
import { Conditionals, WithConditionalsAndImportant } from './conditional.js'
import { batch, computed, ReadonlySignal, signal, Signal } from '@preact/signals-core'
import { YogaProperties } from '../flex/index.js'
import { PanelProperties } from '../panel/instance/panel.js'
import { ZIndexProperties } from '../order.js'
import { TransformProperties } from '../transform.js'
import { ScrollbarProperties } from '../scroll.js'
import { PanelGroupProperties } from '../panel/instance/properties.js'
import { PointerEventsProperties } from '../panel/interaction/pointer-events.js'
import { ListenersProperties } from '../listeners.js'
import { EventHandlersProperties } from '../events.js'
import { ComponentDefaultsProperties } from './defaults.js'
import { FontFamilyProperties, GlyphProperties, TextAlignProperties } from '../text/index.js'
import { CaretProperties } from '../text/selection/caret.js'
import { alignmentXMap, alignmentYMap, ColorRepresentation, VisibilityProperties } from '../utils.js'
import { SelectionProperties } from '../text/selection/ranges.js'
import {
  getLayerIndex,
  LayerInSectionIdentifier,
  LayerSection,
  SpecialLayerSections,
  LayersSectionSize,
} from './layer.js'
export type BaseOutProperties = z.output<typeof baseOutPropertiesSchema> & ComponentDefaultsProperties

export type UikitPropertyKeys = keyof BaseOutProperties

export type WithSignal<T> = {
  [K in keyof T]: T[K] | ReadonlySignal<T[K]>
}

export type InProperties<OutProperties extends BaseOutProperties = BaseOutProperties> =
  SchemaInProperties<OutProperties> & {}

export type Properties<OutProperties extends BaseOutProperties = BaseOutProperties> = BaseProperties<
  SchemaLayerProperties<OutProperties>,
  OutProperties
> & {
  get usedConditionals(): {
    hover: Signal<boolean>
    active: Signal<boolean>
  }
  setLayersWithConditionals(
    layerInSectionIdentifier: LayerInSectionIdentifier,
    properties: InProperties<OutProperties> | undefined,
  ): void
}

export class PropertiesImplementation<OutProperties extends BaseOutProperties = BaseOutProperties>
  extends BasePropertiesImplementation<SchemaLayerProperties<OutProperties>, OutProperties>
  implements Properties<OutProperties>
{
  public readonly usedConditionals = {
    hover: signal(false),
    active: signal(false),
  }

  constructor(
    aliases: Aliases,
    private readonly conditionals: Conditionals,
    defaults?: WithSignal<OutProperties>,
  ) {
    super(
      (key, value, set) => {
        if (key in aliases) {
          const aliasList = aliases[key as keyof Aliases]!
          for (const alias of aliasList) {
            set(alias as keyof OutProperties, value as any)
          }
          return
        }
        set(key, value as any)
      },
      defaults,
      () => {
        this.usedConditionals.active.value = hasConditional(this.propertiesLayers, 'active')
        this.usedConditionals.hover.value = hasConditional(this.propertiesLayers, 'hover')
      },
    )
  }

  setLayersWithConditionals(
    layerInSectionIdentifier: LayerInSectionIdentifier,
    properties: InProperties<OutProperties> | undefined,
  ) {
    batch(() => {
      this.setLayer(getLayerIndex({ ...layerInSectionIdentifier, section: 'base' }), properties as any)
      for (const layerSection of SpecialLayerSections) {
        const layerIndex = getLayerIndex({ ...layerInSectionIdentifier, section: layerSection })
        if (properties == null || !(layerSection in properties)) {
          this.setLayer(layerIndex, undefined)
          continue
        }
        const getConditional = layerSection != 'important' ? this.conditionals[layerSection] : undefined
        let conditionalProperties = properties[layerSection]! as SchemaLayerProperties<OutProperties>
        if (getConditional != null) {
          conditionalProperties = Object.fromEntries(
            Object.entries(conditionalProperties).map(([key, value]) => [
              key,
              computed(() => (getConditional() ? (value instanceof Signal ? value.value : value) : undefined)),
            ]),
          ) as SchemaLayerProperties<OutProperties>
        }
        this.setLayer(layerIndex, conditionalProperties)
      }
    })
  }
}

function hasConditional(
  propertiesLayers: PropertiesImplementation['propertiesLayers'],
  layerSection: LayerSection,
): boolean {
  const layerSectionStart = getLayerIndex({ type: 'base', section: layerSection })
  for (const propertyLayerIndex of propertiesLayers.keys()) {
    if (layerSectionStart <= propertyLayerIndex && propertyLayerIndex < layerSectionStart + LayersSectionSize) {
      return true
    }
  }
  return false
}

export { componentDefaults } from './defaults.js'
export type { AddAllAliases, GetAliases, AllAliases } from './alias.js'
export type { SchemaInProperties, SchemaLayerProperties, SchemaPropertyValue } from './schema.js'
export type {
  AbsoluteLengthValue,
  LengthValue,
  NumberOrPercentageValue,
  NumberString,
  NumberValue,
  PercentageString,
  PixelLengthString,
  ViewportLengthString,
} from './values.js'
export {
  baseOutPropertyShape,
  baseOutPropertiesSchema,
  createInPropertiesSchema,
  defineSchema,
  absoluteLengthValueSchema,
  lengthValueSchema,
  numberValueSchema,
  numberOrPercentageValueSchema,
  numberStringSchema,
  percentageStringSchema,
  pixelLengthStringSchema,
  viewportLengthStringSchema,
} from './schema.js'
