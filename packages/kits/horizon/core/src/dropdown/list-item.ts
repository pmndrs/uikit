import { object, string } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties, RenderContext, WithSignal } from '@pmndrs/uikit'
import { Dropdown } from './index.js'
export const DropdownListItemOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    value: string().optional(),
  }).strict(),
)

export const DropdownListItemPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(DropdownListItemOutPropertiesSchema),
)

export type DropdownListItemOutProperties = BaseOutProperties & z.output<typeof DropdownListItemOutPropertiesSchema>

export type DropdownListItemProperties = z.input<typeof DropdownListItemPropertiesSchema>
export class DropdownListItem extends Container<DropdownListItemOutProperties> {
  constructor(
    inputProperties?: InProperties<DropdownListItemOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<DropdownListItemOutProperties>
      defaults?: WithSignal<DropdownListItemOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        paddingY: 8,
        paddingX: 16,
        onClick: (event) => {
          const dropdown = this.parentContainer.value?.parentContainer.value
          if (!(dropdown instanceof Dropdown)) {
            return
          }
          const value = this.properties.peek().value
          dropdown.uncontrolledSignal.value = value
          dropdown.properties.peek().onValueChange?.(value)
        },
        ...config?.defaultOverrides,
      },
    })
  }
}
