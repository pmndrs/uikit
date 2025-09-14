import { RenderContext } from '../context.js'
import { ThreeEventMap } from '../events.js'
import { InProperties, BaseOutProperties, WithSignal } from '../properties/index.js'
import { Input, InputOutProperties } from './input.js'

export type TextareaProperties<EM extends ThreeEventMap> = InProperties<InputOutProperties<EM>>

export type TextareaOutProperties<EM extends ThreeEventMap> = InputOutProperties<EM>

export class Textarea<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends InputOutProperties<EM> = InputOutProperties<EM>,
> extends Input<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: (string | InProperties<BaseOutProperties<EM>>)[],
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
      defaults?: WithSignal<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, { multiline: true, ...config })
  }
}
