import { InProperties, BaseOutProperties, RenderContext, ThreeEventMap } from '@pmndrs/uikit'
import { ChevronRight } from '@pmndrs/uikit-lucide'
import { Text } from '@pmndrs/uikit'
import { PaginationLink, PaginationLinkOutProperties } from './link.js'

export type PaginationNextProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<
  InProperties<PaginationLinkOutProperties<EM>>,
  'children'
>

export class PaginationNext<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends PaginationLink<T, EM> {
  constructor(
    inputProperties?: InProperties<PaginationLinkOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<PaginationLinkOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        size: 'default',
        flexDirection: 'row',
        gap: 4,
        paddingRight: 10,
        ...config?.defaultOverrides,
      },
    })

    const textElement = new Text(undefined, undefined, { defaultOverrides: { text: 'Next' } })
    super.add(textElement)

    const chevronIcon = new ChevronRight(undefined, undefined, {
      defaultOverrides: {
        width: 16,
        height: 16,
      },
    })
    super.add(chevronIcon)
  }
  add(): never {
    throw new Error('PaginationNext does not support adding children. The component has predefined content.')
  }
}
