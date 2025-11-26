import {
  PropertiesImplementation as BasePropertiesImplementation,
  Properties as BaseProperties,
} from '@pmndrs/uikit-pub-sub'
import { Aliases, AddAllAliases } from './alias.js'
import { Conditionals, WithConditionalsAndImportant } from './conditional.js'
import { batch, computed, ReadonlySignal, signal, Signal } from '@preact/signals-core'
import { YogaProperties } from '../flex/index.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { ZIndexProperties } from '../order.js'
import { TransformProperties } from '../transform.js'
import { ScrollbarProperties } from '../scroll.js'
import { PanelGroupProperties, PointerEventsProperties } from '../panel/index.js'
import { ListenersProperties } from '../listeners.js'
import { EventHandlersProperties } from '../events.js'
import { ComponentDefaultsProperties } from './defaults.js'
import { FontFamilyProperties, GlyphProperties, TextAlignProperties } from '../text/index.js'
import { CaretProperties } from '../caret.js'
import { alignmentXMap, alignmentYMap, ColorRepresentation, VisibilityProperties } from '../utils.js'
import { SelectionProperties } from '../selection.js'
import {
  getLayerIndex,
  LayerInSectionIdentifier,
  LayerSection,
  SpecialLayerSections,
  LayersSectionSize,
} from './layer.js'

export type BaseOutProperties = YogaProperties &
  PanelProperties &
  ZIndexProperties &
  TransformProperties &
  ScrollbarProperties &
  PanelGroupProperties &
  VisibilityProperties &
  PointerEventsProperties &
  ListenersProperties &
  EventHandlersProperties &
  TextAlignProperties &
  AppearanceProperties &
  FontFamilyProperties &
  GlyphProperties &
  CaretProperties &
  SelectionProperties &
  SizeProperties &
  AnchorProperties &
  CursorProperties &
  IdProperties &
  ComponentDefaultsProperties

export type CursorProperties = {
  cursor?: string
}

export type IdProperties = {
  id?: string
}

export type UikitPropertyKeys = keyof BaseOutProperties

export type AppearanceProperties = {
  fill?: ColorRepresentation
  color?: ColorRepresentation
  opacity?: number | `${number}%`
}

export type SizeProperties = {
  pixelSize?: number
  sizeX?: number
  sizeY?: number
}

export type AnchorProperties = {
  anchorX?: keyof typeof alignmentXMap
  anchorY?: keyof typeof alignmentYMap
}

export type WithSignal<T> = {
  [K in keyof T]: T[K] | ReadonlySignal<T[K]>
}

export type WithInheritance<T> = T & {
  '*'?: T
}

export type WithInitial<T> = { [Key in keyof T]: T[Key] | 'initial' }

export type InProperties<OutProperties extends BaseOutProperties = BaseOutProperties> = WithInheritance<
  WithConditionalsAndImportant<AddAllAliases<WithSignal<WithInitial<Partial<OutProperties>>>>>
> & {}

export type Properties<OutProperties extends BaseOutProperties = BaseOutProperties> = BaseProperties<
  AddAllAliases<WithSignal<WithInitial<Partial<OutProperties>>>>,
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
  extends BasePropertiesImplementation<AddAllAliases<WithSignal<WithInitial<Partial<OutProperties>>>>, OutProperties>
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
        let conditionalProperties = properties[layerSection]! as AddAllAliases<
          WithSignal<WithInitial<Partial<OutProperties>>>
        >
        if (getConditional != null) {
          conditionalProperties = Object.fromEntries(
            Object.entries(conditionalProperties).map(([key, value]) => [
              key,
              computed(() => (getConditional() ? (value instanceof Signal ? value.value : value) : undefined)),
            ]),
          ) as AddAllAliases<WithSignal<WithInitial<Partial<OutProperties>>>>
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
export type { WithConditionalsAndImportant } from './conditional.js'
export type { AddAllAliases, GetAliases, AllAliases } from './alias.js'
