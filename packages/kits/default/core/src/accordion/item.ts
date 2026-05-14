import { object, string } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import { BaseOutProperties, Container, InProperties, RenderContext } from '@pmndrs/uikit'
import { Accordion } from './index.js'
import { colors, componentDefaults } from '../theme.js'
export const AccordionItemOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    value: string().optional(),
  }).strict(),
)

export const AccordionItemPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(AccordionItemOutPropertiesSchema),
)

export type AccordionItemOutProperties = BaseOutProperties & z.output<typeof AccordionItemOutPropertiesSchema>

export type AccordionItemProperties = z.input<typeof AccordionItemPropertiesSchema>

export class AccordionItem extends Container<AccordionItemOutProperties> {
  constructor(
    inputProperties?: InProperties<AccordionItemOutProperties>,
    initialClasses?: (string | InProperties<BaseOutProperties>)[],
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AccordionItemOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        cursor: 'pointer',
        flexDirection: 'column',
        onClick: () => {
          const parent = this.parentContainer.peek()
          if (!(parent instanceof Accordion)) {
            return
          }
          const ownValue = this.properties.peek().value
          const currentValue = parent.openItemValue.peek()
          const isSelected = ownValue === currentValue
          parent.openItemValue.value = isSelected ? undefined : ownValue
        },
        borderBottomWidth: 1,
        ...config?.defaultOverrides,
      },
    })
  }
}
