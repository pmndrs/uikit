import { BaseOutProperties, Container, InProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { DarkBackgroundMaterial, panelMaterialClass } from '../background-material.js'
import { MeshBasicMaterial } from 'three'

export type PanelOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM>

export type PanelProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<PanelOutProperties<EM>>

export class Panel<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, BaseOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties<EM>>
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
