import {
  PropertiesImplementation as BasePropertiesImplementation,
  Properties as BaseProperties,
} from '@ni2khanna/uikit-pub-sub'
import { Aliases, AddAllAliases } from './alias.js'
import { Conditionals, WithConditionals } from './conditional.js'
import { batch, computed, signal, Signal } from '@preact/signals-core'
import { YogaProperties } from '../flex/index.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { ZIndexProperties } from '../order.js'
import { TransformProperties } from '../transform.js'
import { ScrollbarProperties } from '../scroll.js'
import { PanelGroupProperties, PointerEventsProperties } from '../panel/index.js'
import { Listeners } from '../listeners.js'
import { EventHandlers, ThreeEventMap } from '../events.js'
import { ComponentDefaults } from './defaults.js'
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

type LayerInput<OutProperties extends BaseOutProperties<ThreeEventMap>> = AddAllAliases<WithSignal<Partial<OutProperties>>>

export type BaseOutProperties<EM extends ThreeEventMap> = YogaProperties &
  PanelProperties &
  ZIndexProperties &
  TransformProperties &
  ScrollbarProperties &
  PanelGroupProperties &
  VisibilityProperties &
  PointerEventsProperties &
  Listeners &
  EventHandlers<EM> &
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
  ComponentDefaults

export type CursorProperties = {
  cursor?: string
}

export type IdProperties = {
  id?: string
}

export type UikitPropertyKeys = keyof BaseOutProperties<ThreeEventMap>

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
  [K in keyof T]?: T[K] | Signal<T[K]>
}

export type WithInheritance<T, OutProperties> = T & {
  '*'?: OutProperties extends BaseOutProperties<infer EM>
    ? AddAllAliases<WithSignal<Partial<BaseOutProperties<EM>>>>
    : never
}

export type WithInitial<T> = { [Key in keyof T]: T[Key] | 'initial' }

export type InProperties<OutProperties extends BaseOutProperties<ThreeEventMap> = BaseOutProperties<ThreeEventMap>> =
  WithConditionals<WithInheritance<AddAllAliases<WithSignal<WithInitial<Partial<OutProperties>>>>, OutProperties>> & {}

export type Properties<OutProperties extends BaseOutProperties<ThreeEventMap> = BaseOutProperties<ThreeEventMap>> =
  BaseProperties<LayerInput<OutProperties>, OutProperties> & {
    get usedConditionals(): {
      hover: Signal<boolean>
      active: Signal<boolean>
    }
    setLayersWithConditionals(
      layerInSectionIdentifier: LayerInSectionIdentifier,
      properties: InProperties<OutProperties> | undefined,
    ): void
  }

export class PropertiesImplementation<
    OutProperties extends BaseOutProperties<ThreeEventMap> = BaseOutProperties<ThreeEventMap>,
  >
  extends BasePropertiesImplementation<LayerInput<OutProperties>, OutProperties>
  implements Properties<OutProperties>
{
  public readonly usedConditionals = {
    hover: signal(false),
    active: signal(false),
  }

  constructor(
    aliases: Aliases,
    private readonly conditionals: Conditionals,
    defaults?: OutProperties,
  ) {
    super(
      <K1 extends keyof LayerInput<OutProperties>>(
        key: K1,
        value: LayerInput<OutProperties>[K1],
        set: <K2 extends keyof OutProperties>(key: K2, value: OutProperties[K2] | Signal<OutProperties[K2]>) => void,
      ) => {
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
        this.usedConditionals.active.value = hasConditional(this.getPropertiesLayers(), 'active')
        this.usedConditionals.hover.value = hasConditional(this.getPropertiesLayers(), 'hover')
      },
    )
  }

  setEnabled(enabled: boolean) {
    super.setEnabled(enabled)
  }

  override setLayer(index: number, value: Partial<LayerInput<OutProperties>> | undefined) {
    super.setLayer(index, value)
  }

  private getPropertiesLayers(): Map<number, Record<string, unknown>> {
    return this.propertiesLayers as Map<number, Record<string, unknown>>
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
        const getConditional = this.conditionals[layerSection]!
        const conditionalComputedProperties: Partial<LayerInput<OutProperties>> = {}
        const conditionalProperties = properties[layerSection]!
        for (const [key, value] of Object.entries(conditionalProperties) as Array<
          [keyof LayerInput<OutProperties>, LayerInput<OutProperties>[keyof LayerInput<OutProperties>]]
        >) {
          conditionalComputedProperties[key] = computed(() =>
            getConditional() ? (value instanceof Signal ? value.value : value) : undefined,
          ) as any
        }
        this.setLayer(layerIndex, conditionalComputedProperties)
      }
    })
  }
}

function hasConditional(
  propertiesLayers: Map<number, Record<string, unknown>>,
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
