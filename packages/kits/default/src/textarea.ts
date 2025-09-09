import {
  InProperties,
  BaseOutProperties,
  Input as InputImpl,
  ThreeEventMap,
  InputOutProperties as BaseInputOutProperties,
  RenderContext,
} from '@pmndrs/uikit'
import type { Object3D } from 'three'

export type TextareaOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  placeholder?: string
} & BaseInputOutProperties<EM>

export type TextareaProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<TextareaOutProperties<EM>>

export class Textarea<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends InputImpl<
  T,
  EM,
  TextareaOutProperties<EM>
> {
  constructor(
    textareaProperties?: InProperties<TextareaOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: RenderContext; defaultOverrides?: InProperties<TextareaOutProperties<EM>> },
  ) {
    super(textareaProperties, initialClasses, {
      multiline: true,
      ...config,
      defaultOverrides: { minHeight: 80, ...config?.defaultOverrides },
    })
  }

  add(...object: Object3D[]): this {
    throw new Error(`the input component can not have any children`)
  }
}
