import type { z } from 'zod'
import { baseOutPropertiesSchema, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { DarkBackgroundMaterial, panelMaterialClass } from '../background-material.js'
import { MeshBasicMaterial } from 'three'
export const PanelOutPropertiesSchema = baseOutPropertiesSchema

export const PanelPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(PanelOutPropertiesSchema),
)

export type PanelOutProperties = BaseOutProperties & z.output<typeof PanelOutPropertiesSchema>

export type PanelProperties = z.input<typeof PanelPropertiesSchema>

export class Panel extends Container<BaseOutProperties> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        borderRadius: 24,
        backgroundColor: 'black',
        borderColor: 'black',
        panelMaterialClass,
        ...config?.defaultOverrides,
      },
    })
  }
}
