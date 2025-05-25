import { RenderContext } from '../context.js'
import { ThreeEventMap } from '../events.js'
import { InProperties, BaseOutProperties } from '../properties/index.js'
import { Input, InputOutProperties } from './input.js'

export type TextareaProperties<EM extends ThreeEventMap> = InProperties<InputOutProperties<EM>>

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
  ) {
    super(inputProperties, initialClasses, renderContext, true)
  }
}
