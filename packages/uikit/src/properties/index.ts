import { PropertiesPubSub } from '@pmndrs/uikit-pub-sub'
import { Aliases, AddAllAliases } from './alias.js'
import { Conditionals, WithConditionals } from './conditional.js'
import { computed, effect, ReadonlySignal, signal, Signal } from '@preact/signals-core'
import { YogaProperties } from '../flex/index.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { ZIndexProperties } from '../order.js'
import { TransformProperties } from '../transform.js'
import { ScrollbarProperties } from '../scroll.js'
import { PanelGroupProperties, PointerEventsProperties } from '../panel/index.js'
import { VisibilityProperties } from '../components/utils.js'
import { Listeners } from '../listeners.js'
import { EventHandlers, ThreeEventMap } from '../events.js'
import { defaults, Defaults } from './defaults.js'
import { FontFamilyProperties, GlyphProperties, TextAlignProperties } from '../text/index.js'
import { CaretProperties } from '../caret.js'
import { inheritedPropertyKeys } from './inheritance.js'
import { LayerIndexInheritance, LayerSectionStart, LayerSectionStartBase, LayersSectionSize } from './layers.js'
import { alignmentXMap, alignmentYMap, ColorRepresentation } from '../utils.js'

type UikitProperties<EM extends ThreeEventMap = ThreeEventMap> = YogaProperties &
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
  SizeProperties &
  AnchorProperties &
  CursorProperties

export type CursorProperties = {
  cursor?: string
}

export type UikitPropertyKeys = keyof UikitProperties

export type AppearanceProperties = {
  color?: ColorRepresentation
  opacity?: number
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

export type AllProperties<EM extends ThreeEventMap, AdditionalProperties extends {}> = WithConditionals<
  AddAllAliases<WithSignal<UikitProperties<EM> & AdditionalProperties>>
>

export class Properties<
  EM extends ThreeEventMap = ThreeEventMap,
  AdditionalProperties extends {} = {},
  AdditionalDefaults extends {} = {},
> extends PropertiesPubSub<
  AddAllAliases<WithSignal<UikitProperties<EM> & AdditionalProperties>>,
  UikitProperties<EM> & AdditionalProperties,
  Defaults & AdditionalDefaults
> {
  public readonly usedConditionals = {
    hover: signal(false),
    active: signal(false),
  }

  private cleanupInheritedPropertyKeys: () => void

  constructor(
    aliases: Aliases,
    private readonly conditionals: Conditionals,
    inherited: ReadonlySignal<Properties | undefined>,
    elementDefaults: AdditionalDefaults,
  ) {
    super(
      (key, value, set) => {
        if (key in aliases) {
          const aliasList = aliases[key as keyof Aliases]!
          for (const alias of aliasList) {
            set(alias as keyof UikitProperties<EM> | keyof AdditionalProperties, value as any)
          }
          return
        }
        set(key as keyof UikitProperties<EM>, value as any)
      },
      {
        ...defaults,
        width: computed(() => {
          const sizeX = this.get('sizeX')
          if (sizeX == null) {
            return undefined
          }
          return sizeX / this.get('pixelSize')!
        }),
        height: computed(() => {
          const sizeY = this.get('sizeY')
          if (sizeY == null) {
            return undefined
          }
          return sizeY / this.get('pixelSize')!
        }),
        ...elementDefaults,
      },
      () => {
        this.usedConditionals.active.value = hasConditional(this.propertiesLayers, LayerSectionStart.active)
        this.usedConditionals.hover.value = hasConditional(this.propertiesLayers, LayerSectionStart.hover)
      },
    )
    this.cleanupInheritedPropertyKeys = effect(() => {
      const { value } = inherited
      return value?.subscribePropertyKeys((key) => {
        if (!inheritedPropertyKeys.includes(key as any)) {
          return
        }
        this.set(LayerIndexInheritance, key as any, value.getSignal(key as any))
      })
    })
  }

  setLayersWithConditionals(
    layerIndexInSection: number,
    properties: AllProperties<EM, AdditionalProperties> | undefined,
  ) {
    this.setLayer(layerIndexInSection + LayerSectionStartBase, properties)
    for (const [conditional, sectionStart] of Object.entries(LayerSectionStart)) {
      if (properties == null || !(conditional in properties)) {
        this.setLayer(layerIndexInSection + sectionStart, undefined)
        continue
      }
      const getConditional = this.conditionals[conditional as keyof Conditionals]!
      const conditionalComputedProperties: AddAllAliases<WithSignal<UikitProperties<EM> & AdditionalProperties>> = {}
      const conditionalProperties =
        properties[conditional as keyof AddAllAliases<WithSignal<UikitProperties<EM> & AdditionalProperties>>]!
      for (const [key, value] of Object.entries(conditionalProperties)) {
        conditionalComputedProperties[
          key as keyof AddAllAliases<WithSignal<UikitProperties<EM> & AdditionalProperties>>
        ] = computed(() => (getConditional() ? (value instanceof Signal ? value.value : value) : undefined)) as any
      }
      this.setLayer(layerIndexInSection + sectionStart, conditionalComputedProperties)
    }
  }

  destroy(): void {
    this.cleanupInheritedPropertyKeys()
    super.destroy()
  }
}

function hasConditional(propertiesLayers: Properties['propertiesLayers'], layerSectionStart: number): boolean {
  for (const propertyLayerIndex of propertiesLayers.keys()) {
    if (layerSectionStart <= propertyLayerIndex && propertyLayerIndex < layerSectionStart + LayersSectionSize) {
      return true
    }
  }
  return false
}
