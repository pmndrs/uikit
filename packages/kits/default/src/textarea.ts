import {
  InProperties,
  BaseOutProperties,
  Input as InputImpl,
  ThreeEventMap,
  RenderContext,
  InputOutProperties as BaseInputOutProperties,
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
    renderContext?: RenderContext,
  ) {
    super(textareaProperties, initialClasses, renderContext, true) // true for multiline
  }

  protected internalResetProperties({ disabled, ...rest }: TextareaProperties<EM> = {}): void {
    super.internalResetProperties({
      minHeight: 80,
      positionType: 'relative',
      overflow: 'hidden',
      fontSize: 14,
      borderWidth: 1,
      paddingX: 12,
      paddingY: 8,
      lineHeight: '20px',
      opacity: disabled ? 0.5 : undefined,
      backgroundOpacity: disabled ? 0.5 : undefined,
      disabled,
      ...rest,
    })
  }

  add(...object: Object3D[]): this {
    throw new Error(`the input component can not have any children`)
  }
}
