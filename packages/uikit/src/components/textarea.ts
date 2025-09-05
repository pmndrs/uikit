import { RenderContext } from '../context.js'
import { ThreeEventMap } from '../events.js'
import { InProperties, BaseOutProperties, WithSignal } from '../properties/index.js'
import { Input, inputDefaults, InputOutProperties } from './input.js'

export type TextareaProperties<EM extends ThreeEventMap> = InProperties<InputOutProperties<EM>>

export type TextareaOutProperties<EM extends ThreeEventMap> = InputOutProperties<EM>

export const textAreaDefaults = inputDefaults

export class Textarea<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends InputOutProperties<EM> = InputOutProperties<EM>,
  NonReactiveProperties = {},
> extends Input<T, EM, OutProperties, NonReactiveProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties, NonReactiveProperties> | undefined,
    initialClasses?: (string | InProperties<BaseOutProperties<EM>>)[] | undefined,
    renderContext?: RenderContext,
    overrideDefaults = textAreaDefaults as WithSignal<OutProperties>,
  ) {
    super(inputProperties, initialClasses, renderContext, overrideDefaults, true)
  }
}
