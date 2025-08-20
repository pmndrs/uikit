import {
  InProperties,
  BaseOutProperties,
  Input as InputImpl,
  ThreeEventMap,
  RenderContext,
  InputOutProperties as BaseInputOutProperties,
} from '@pmndrs/uikit'
import type { Object3D } from 'three'

export type InputOutProperties<EM extends ThreeEventMap = ThreeEventMap> = {
  placeholder?: string
} & BaseInputOutProperties<EM>

export type InputProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<InputOutProperties<EM>>

export class Input<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends InputImpl<T, EM, InputOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<InputOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext, false)
  }

  protected internalResetProperties({ disabled, ...rest }: InputProperties<EM> = {}): void {
    super.internalResetProperties({
      height: 40,
      positionType: 'relative',
      overflow: 'hidden',
      fontSize: 14,
      borderWidth: 1,
      paddingX: 12,
      paddingY: 8,
      lineHeight: '20px',
      opacity: disabled ? 0.5 : undefined,
      disabled,
      ...rest,
    })
  }

  add(...object: Object3D[]): this {
    throw new Error(`the input component can not have any children`)
  }
}
