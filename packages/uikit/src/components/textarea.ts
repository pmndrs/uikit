import type { z } from 'zod'
import { RenderContext } from '../context.js'
import { InProperties, BaseOutProperties, WithSignal } from '../properties/index.js'
import { Input, InputOutProperties, InputPropertiesSchema } from './input.js'
export const TextareaPropertiesSchema = InputPropertiesSchema

export type TextareaOutProperties = InputOutProperties
export type TextareaProperties = z.input<typeof TextareaPropertiesSchema>

export class Textarea<
  OutProperties extends TextareaOutProperties = TextareaOutProperties,
> extends Input<OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: (string | InProperties<BaseOutProperties>)[],
    protected inputConfig?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
      defaults?: WithSignal<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, { multiline: true, ...inputConfig })
  }

  clone(recursive?: boolean): this {
    const cloned = new Textarea(this.inputProperties, this.initialClasses, this.inputConfig) as this
    this.copyInto(cloned, recursive)
    return cloned
  }
}
