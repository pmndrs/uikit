import { InProperties, BaseOutProperties, RenderContext, Text } from '@pmndrs/uikit'
import { ChevronRight } from '@pmndrs/uikit-lucide'
import { PaginationLink, PaginationLinkOutProperties } from './link.js'
import { colors, componentDefaults, contentDefaults, textDefaults } from '../theme.js'

export type PaginationNextProperties = Omit<InProperties<PaginationLinkOutProperties>, 'children'>

export class PaginationNext extends PaginationLink {
  public readonly label: Text
  public readonly icon: InstanceType<typeof ChevronRight>
  constructor(
    inputProperties?: InProperties<PaginationLinkOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<PaginationLinkOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        size: 'default',
        flexDirection: 'row',
        gap: 4,
        paddingRight: 10,
        ...config?.defaultOverrides,
      },
    })

    const textElement = new Text(undefined, undefined, {
      defaults: textDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        text: 'Next',
      },
    })
    this.label = textElement
    super.add(this.label)

    const chevronIcon = new ChevronRight(undefined, undefined, {
      defaults: contentDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        width: 16,
        height: 16,
      },
    })
    this.icon = chevronIcon
    super.add(this.icon)
  }
  dispose(): void {
    this.icon.dispose()
    this.label.dispose()
    super.dispose()
  }
  add(): never {
    throw new Error('PaginationNext does not support adding children. The component has predefined content.')
  }
}
