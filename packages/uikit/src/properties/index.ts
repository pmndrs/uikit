import {
  PropertiesImplementation as BasePropertiesImplementation,
  ReadonlyProperties,
  Properties as BaseProperties,
} from '@pmndrs/uikit-pub-sub'
import { Aliases, AddAllAliases } from './alias.js'
import { Conditionals, WithConditionals } from './conditional.js'
import { batch, computed, effect, ReadonlySignal, signal, Signal } from '@preact/signals-core'
import { YogaProperties } from '../flex/index.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { ZIndexProperties } from '../order.js'
import { TransformProperties } from '../transform.js'
import { ScrollbarProperties } from '../scroll.js'
import { PanelGroupProperties, PointerEventsProperties } from '../panel/index.js'
import { VisibilityProperties } from '../components/utils.js'
import { Listeners } from '../listeners.js'
import { EventHandlers, ThreeEventMap } from '../events.js'
import { Defaults } from './defaults.js'
import { FontFamilyProperties, GlyphProperties, TextAlignProperties } from '../text/index.js'
import { CaretProperties } from '../caret.js'
import { inheritedPropertyKeys } from './inheritance.js'
import {
  LayerIndexDefaults,
  LayerIndexInheritance,
  LayerSectionStart,
  LayerSectionStartBase,
  LayersSectionSize,
} from './layers.js'
import { alignmentXMap, alignmentYMap, ColorRepresentation } from '../utils.js'

export type BaseOutputProperties<EM extends ThreeEventMap> = YogaProperties &
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
  CursorProperties &
  Defaults

export type CursorProperties = {
  cursor?: string
}

export type UikitPropertyKeys = keyof BaseOutputProperties<ThreeEventMap>

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

export type InputProperties<
  OutputProperties extends BaseOutputProperties<ThreeEventMap> = BaseOutputProperties<ThreeEventMap>,
> = WithConditionals<AddAllAliases<WithSignal<Partial<OutputProperties>>>>

export type Properties<
  OutputProperties extends BaseOutputProperties<ThreeEventMap> = BaseOutputProperties<ThreeEventMap>,
> = BaseProperties<AddAllAliases<WithSignal<Partial<OutputProperties>>>, OutputProperties> & {
  get usedConditionals(): {
    hover: Signal<boolean>
    active: Signal<boolean>
  }
  setLayersWithConditionals(
    layerIndexInSection: number,
    properties: InputProperties<OutputProperties> | undefined,
  ): void
}

export class PropertiesImplementation<
    OutputProperties extends BaseOutputProperties<ThreeEventMap> = BaseOutputProperties<ThreeEventMap>,
  >
  extends BasePropertiesImplementation<AddAllAliases<WithSignal<Partial<OutputProperties>>>, OutputProperties>
  implements Properties<OutputProperties>
{
  public readonly usedConditionals = {
    hover: signal(false),
    active: signal(false),
  }

  private cleanupInheritedPropertyKeys: () => void

  constructor(
    aliases: Aliases,
    private readonly conditionals: Conditionals,
    inherited: ReadonlySignal<ReadonlyProperties<OutputProperties> | undefined>,
    defaults: { [Key in keyof OutputProperties]: OutputProperties[Key] | Signal<OutputProperties[Key]> },
  ) {
    super(
      (key, value, set) => {
        if (key in aliases) {
          const aliasList = aliases[key as keyof Aliases]!
          for (const alias of aliasList) {
            set(alias as keyof OutputProperties, value as any)
          }
          return
        }
        set(key, value as any)
      },
      defaults,
      () => {
        this.usedConditionals.active.value = hasConditional(this.propertiesLayers, LayerSectionStart.active)
        this.usedConditionals.hover.value = hasConditional(this.propertiesLayers, LayerSectionStart.hover)
      },
    )

    this.set(
      LayerIndexDefaults,
      'width',
      computed(() => {
        const sizeX = this.value.sizeX
        if (sizeX == null) {
          return undefined
        }
        return sizeX / this.value.pixelSize
      }) as any,
    )
    this.set(
      LayerIndexDefaults,
      'height',
      computed(() => {
        const sizeY = this.value.sizeY
        if (sizeY == null) {
          return undefined
        }
        return sizeY / this.value.pixelSize
      }) as any,
    )

    this.cleanupInheritedPropertyKeys = effect(() => {
      const { value } = inherited
      return value?.subscribePropertyKeys((key) => {
        if (!inheritedPropertyKeys.includes(key as any)) {
          return
        }
        this.set(LayerIndexInheritance, key as any, value.signal[key as keyof typeof value.signal])
      })
    })
  }

  setLayersWithConditionals(layerIndexInSection: number, properties: InputProperties<OutputProperties> | undefined) {
    batch(() => {
      this.setLayer(layerIndexInSection + LayerSectionStartBase, properties)
      for (const [conditional, sectionStart] of Object.entries(LayerSectionStart)) {
        if (properties == null || !(conditional in properties)) {
          this.setLayer(layerIndexInSection + sectionStart, undefined)
          continue
        }
        const getConditional = this.conditionals[conditional as keyof Conditionals]!
        const conditionalComputedProperties: Partial<AddAllAliases<WithSignal<Partial<OutputProperties>>>> = {}
        const conditionalProperties = properties[conditional as keyof AddAllAliases<WithSignal<OutputProperties>>]!
        for (const [key, value] of Object.entries(conditionalProperties)) {
          conditionalComputedProperties[key as keyof AddAllAliases<WithSignal<OutputProperties>>] = computed(() =>
            getConditional() ? (value instanceof Signal ? value.value : value) : undefined,
          ) as any
        }
        this.setLayer(layerIndexInSection + sectionStart, conditionalComputedProperties)
      }
    })
  }

  destroy(): void {
    this.cleanupInheritedPropertyKeys()
    super.destroy()
  }
}

function hasConditional(
  propertiesLayers: PropertiesImplementation['propertiesLayers'],
  layerSectionStart: number,
): boolean {
  for (const propertyLayerIndex of propertiesLayers.keys()) {
    if (layerSectionStart <= propertyLayerIndex && propertyLayerIndex < layerSectionStart + LayersSectionSize) {
      return true
    }
  }
  return false
}
