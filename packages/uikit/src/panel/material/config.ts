import { Signal, computed } from '@preact/signals-core'
import { TypedArray, Vector2Tuple } from 'three'
import type { ColorRepresentation, Fix_TS_56_Float32Array } from '../../utils.js'
import { Properties } from '../../properties/index.js'
import { Inset } from '../../flex/index.js'
import { toAbsoluteNumber } from '../../text/utils.js'
import { writeColor } from './color.js'
import { materialSetters } from './data.js'
import type { NumberOrPercentageValue } from '../../properties/values.js'

const defaultDefaults = {
  backgroundColor: 'transparent' as ColorRepresentation,
  borderColor: 'transparent' as ColorRepresentation,
  borderBottomLeftRadius: 0 as number | string,
  borderTopLeftRadius: 0 as number | string,
  borderBottomRightRadius: 0 as number | string,
  borderTopRightRadius: 0 as number | string,
  borderBend: 0,
} satisfies { [Key in keyof typeof materialSetters]: unknown }

const defaultOpacity = 1

export type PanelMaterialConfig = ReturnType<typeof createPanelMaterialConfig>

let defaultPanelMaterialConfig: PanelMaterialConfig | undefined

export function getDefaultPanelMaterialConfig() {
  if (defaultPanelMaterialConfig == null) {
    const defaultPanelMaterialKeys = {} as { [Key in keyof typeof defaultDefaults]: string }
    for (const key in defaultDefaults) {
      defaultPanelMaterialKeys[key as keyof typeof defaultDefaults] = key
    }
    defaultPanelMaterialConfig = createPanelMaterialConfig(defaultPanelMaterialKeys)
  }
  return defaultPanelMaterialConfig
}

const colorArrayHelper = [0, 0, 0, 0]

export function createPanelMaterialConfig(
  keys: { [Key in keyof typeof materialSetters]?: string },
  providedDefaults?: {
    [Key in Exclude<
      keyof typeof defaultDefaults,
      'borderBottomLeftRadius' | 'borderTopLeftRadius' | 'borderBottomRightRadius' | 'borderTopRightRadius'
    >]?: (typeof defaultDefaults)[Key]
  },
) {
  const defaults = { ...defaultDefaults, ...providedDefaults }

  const setters: {
    [Key in string]: (
      data: TypedArray,
      offset: number,
      value: unknown,
      size: Signal<Vector2Tuple | undefined>,
      opacity: Signal<NumberOrPercentageValue>,
      onUpdate: ((start: number, count: number) => void) | undefined,
    ) => void
  } = {}
  for (const key in keys) {
    const fn = materialSetters[key as keyof typeof materialSetters]
    const defaultValue = defaults[key as keyof typeof materialSetters]
    setters[keys[key as keyof typeof materialSetters]!] = (data, offset, value, size, opacity, onUpdate) =>
      fn(data, offset, (value ?? defaultValue) as any, size, opacity, onUpdate)
  }

  const defaultData: Fix_TS_56_Float32Array = new Float32Array(16)
  writeColor(defaultData, 4, defaults.backgroundColor, defaultOpacity, undefined)
  writeColor(defaultData, 9, defaults.borderColor, defaultOpacity, undefined)
  defaultData[13] = defaults.borderBend
  return {
    hasProperty: (key: string) => key in setters,
    defaultData,
    setters,
    computedIsVisibile: (
      properties: Properties,
      borderInset: Signal<Inset | undefined>,
      size: Signal<Vector2Tuple | undefined>,
      isVisible: Signal<boolean>,
    ) => {
      return computed(() => {
        const borderInsetValue = borderInset.value
        const sizeValue = size.value
        if (borderInsetValue == null || sizeValue == null) {
          return false
        }
        const backgroundColor =
          keys.backgroundColor == null
            ? defaults.backgroundColor
            : (properties.value[keys.backgroundColor as 'backgroundColor'] ?? defaults.backgroundColor)
        const borderColor =
          keys.borderColor == null
            ? defaults.borderColor
            : (properties.value[keys.borderColor as 'borderColor'] ?? defaults.borderColor)

        const opacity = toAbsoluteNumber(properties.value.opacity ?? defaultOpacity, () => 1)

        writeColor(colorArrayHelper, 0, backgroundColor ?? defaults.backgroundColor, opacity)
        const [width, height] = sizeValue
        const backgroundVisible = width > 0 && height > 0 && colorArrayHelper[3]! > 0

        writeColor(colorArrayHelper, 0, borderColor ?? defaults.borderColor, opacity)
        const borderVisible = borderInsetValue.some((s) => s > 0) && colorArrayHelper[3]! > 0

        if (!backgroundVisible && !borderVisible) {
          return false
        }

        return isVisible.value
      })
    },
  }
}
