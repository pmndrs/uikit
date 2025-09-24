import { RenderContext } from '../context.js'
import { InProperties, BaseOutProperties, WithSignal } from '../properties/index.js'
import { Input, InputOutProperties } from './input.js'

export type TextareaProperties = InProperties<InputOutProperties>

export type TextareaOutProperties = InputOutProperties

export class Textarea<OutProperties extends InputOutProperties = InputOutProperties> extends Input<OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: (string | InProperties<BaseOutProperties>)[],
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
      defaults?: WithSignal<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, { multiline: true, ...config })
  }
}
