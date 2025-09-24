import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { DarkBackgroundMaterial, panelMaterialClass } from '../background-material.js'
import { MeshBasicMaterial } from 'three'

export type PanelOutProperties = BaseOutProperties

export type PanelProperties = InProperties<PanelOutProperties>

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
