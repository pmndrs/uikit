import { InProperties, BaseOutProperties, RenderContext, ThreeEventMap, Text } from '@pmndrs/uikit'
import { ChevronLeft } from '@pmndrs/uikit-lucide'
import { PaginationLink, PaginationLinkOutProperties } from './link.js'

export type PaginationPreviousProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<
  InProperties<PaginationLinkOutProperties<EM>>,
  'children'
>

export class PaginationPrevious<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends PaginationLink<T, EM> {
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
        paddingLeft: 10,
        ...config?.defaultOverrides,
      },
    })

    const chevronIcon = new ChevronLeft(undefined, undefined, {
      defaultOverrides: {
        width: 16,
        height: 16,
      },
    })
    super.add(chevronIcon)

    const textElement = new Text(undefined, undefined, { defaultOverrides: { text: 'Previous' } })
    super.add(textElement)
  }

  add(): never {
    throw new Error('PaginationPrevious does not support adding children. The component has predefined content.')
  }
}
