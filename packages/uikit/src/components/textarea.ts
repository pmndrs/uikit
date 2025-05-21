import { RenderContext } from '../context.js'
import { ThreeEventMap } from '../events.js'
import { InProperties, BaseOutProperties } from '../properties/index.js'
import { Input, InputOutProperties, InputProperties } from './input.js'

export type TextareaProperties<EM extends ThreeEventMap> = InProperties<InputOutProperties<EM>>

export class Textarea<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Input<T, EM> {
  constructor(
    inputProperties?: InputProperties<EM> | undefined,
    initialClasses?: (string | InProperties<BaseOutProperties<EM>>)[] | undefined,
    renderContext?: RenderContext,
  ) {
    super(inputProperties, initialClasses, renderContext, true)
  }
}
