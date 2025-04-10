import { PropertiesPubSub } from '@pmndrs/uikit-pub-sub'
import { Aliases, AddAllAliases } from './alias.js'
import { Conditionals, WithConditionals } from './conditional.js'
import { computed, signal, Signal } from '@preact/signals-core'
import { YogaProperties } from '../flex/index.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { ZIndexProperties } from '../order.js'
import { TransformProperties } from '../transform.js'
import { ScrollbarProperties } from '../scroll.js'
import { PanelGroupProperties, PointerEventsProperties } from '../panel/index.js'
import { UpdateMatrixWorldProperties, VisibilityProperties } from '../components/utils.js'
import { Listeners } from '../listeners.js'
import { EventHandlers, ThreeEventMap } from '../events.js'
import { defaults, Defaults } from './defaults.js'
import { FontFamilyProperties, GlyphProperties, TextAlignProperties } from '../text/index.js'
import { CaretProperties } from '../caret.js'
import { inheritedPropertyKeys } from './inheritance.js'
import { Layers } from './layers.js'
import { alignmentXMap, alignmentYMap, ColorRepresentation } from '../utils.js'

type UikitProperties<EM extends ThreeEventMap = ThreeEventMap> = YogaProperties &
  PanelProperties &
  ZIndexProperties &
  TransformProperties &
  ScrollbarProperties &
  PanelGroupProperties &
  VisibilityProperties &
  UpdateMatrixWorldProperties &
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
  WithConditionals<AddAllAliases<WithSignal<UikitProperties<EM> & AdditionalProperties>>>,
  UikitProperties<EM> & AdditionalProperties,
  Defaults & AdditionalDefaults
> {
  public readonly conditionals = {
    hover: {
      anyLayers: signal(false),
      layers: new Set<number>(),
    },
    active: {
      anyLayers: signal(false),
      layers: new Set<number>(),
    },
  }

  private cleanupInheritedPropertyKeys?: () => void

  constructor(
    aliases: Aliases,
    conditionals: Conditionals,
    inherited: Properties | undefined,
    elementDefaults: AdditionalDefaults,
  ) {
    super(
      (key, value, set, index) => {
        if (key in this.conditionals) {
          updateLayers(
            this.conditionals[key as keyof typeof this.conditionals],
            value === undefined ? 'delete' : 'add',
            index,
          )
        }
        if (key in aliases) {
          const aliasList = aliases[key as keyof Aliases]!
          for (const alias of aliasList) {
            set(alias as keyof UikitProperties<EM> | keyof AdditionalProperties, value as any)
          }
          return
        }
        if (key in conditionals) {
          const getConditional = conditionals[key as keyof Conditionals]!
          if (typeof value != 'object' || value === null) {
            throw new Error(`Invalid conditional property value "${value}" for key "${String(key)}", expected object`)
          }
          for (const [conditionalKey, conditionalValue] of Object.entries(value)) {
            set(
              conditionalKey as keyof UikitProperties<EM> | keyof AdditionalProperties,
              computed(() =>
                getConditional()
                  ? conditionalValue instanceof Signal
                    ? conditionalValue.value
                    : conditionalValue
                  : undefined,
              ) as any,
            )
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
      (layerIndex) => {
        updateLayers(this.conditionals.active, 'delete', layerIndex)
        updateLayers(this.conditionals.hover, 'delete', layerIndex)
      },
    )
    if (inherited != null) {
      this.cleanupInheritedPropertyKeys = inherited.subscribePropertyKeys((key) => {
        if (!inheritedPropertyKeys.includes(key as any)) {
          return
        }
        this.set(Layers.Inheritance, key as any, inherited.getSignal(key as any))
      })
    }
  }

  destroy(): void {
    this.cleanupInheritedPropertyKeys?.()
    super.destroy()
  }
}

function updateLayers(
  {
    anyLayers,
    layers,
  }: {
    anyLayers: Signal<boolean>
    layers: Set<number>
  },
  type: 'delete' | 'add',
  index: number,
) {
  layers[type](index)
  anyLayers.value = layers.size > 0
}
