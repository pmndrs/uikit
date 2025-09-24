import { Container, InProperties, BaseOutProperties } from '@pmndrs/uikit'
import { colors, componentDefaults } from '../theme.js'

export type DialogFooterOutProperties = BaseOutProperties

export type DialogFooterProperties = InProperties<DialogFooterOutProperties>

export class DialogFooter extends Container<DialogFooterOutProperties> {
  constructor(
    inputProperties?: DialogFooterProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<DialogFooterOutProperties> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'column-reverse',
        sm: { flexDirection: 'row', justifyContent: 'flex-end' },
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
  }
}
