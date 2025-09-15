import {
  BaseOutProperties,
  Container,
  InProperties,
  RenderContext,
  Svg,
  SvgProperties,
  ThreeEventMap,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { lightTheme } from '../theme.js'

type IconIndicatorVariantProps = Pick<SvgProperties, 'content' | 'color'>
const _iconIndicatorVariants = {
  none: {
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 20" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0.339844 10.0002C0.339844 4.48624 4.82584 0.000244141 10.3398 0.000244141C15.8538 0.000244141 20.3398 4.48624 20.3398 10.0002C20.3398 15.5142 15.8538 20.0002 10.3398 20.0002C4.82584 20.0002 0.339844 15.5142 0.339844 10.0002ZM15.3398 9.00024H5.33984V11.0002H15.3398V9.00024Z" fill="#272727"/>
</svg>`,
    color: lightTheme.component.iconIndicator.background.fill.none,
  },
  good: {
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 20" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.3398 20.0002C15.8627 20.0002 20.3398 15.523 20.3398 10.0002C20.3398 4.47734 15.8627 0.000183105 10.3398 0.000183105C4.817 0.000183105 0.339844 4.47734 0.339844 10.0002C0.339844 15.523 4.817 20.0002 10.3398 20.0002ZM9.21517 12.1258L5.75061 8.59331L4.33984 10.0131L9.21517 15.0002L16.8398 7.41999L15.3398 6.00018L9.21517 12.1258Z" fill="#0B8A1B"/>
</svg>`,
    color: lightTheme.component.iconIndicator.background.fill.good,
  },
  poor: {
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 20" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M10.3398 20.0002C15.8627 20.0002 20.3398 15.523 20.3398 10.0002C20.3398 4.47734 15.8627 0.000183105 10.3398 0.000183105C4.817 0.000183105 0.339844 4.47734 0.339844 10.0002C0.339844 15.523 4.817 20.0002 10.3398 20.0002ZM9.21517 12.1258L5.75061 8.59331L4.33984 10.0131L9.21517 15.0002L16.8398 7.41999L15.3398 6.00018L9.21517 12.1258Z" fill="#0B8A1B"/>
</svg>`,
    color: lightTheme.component.iconIndicator.background.fill.poor,
  },
  bad: {
    content: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 20" fill="none">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0.339844 10.0002C0.339844 4.48618 4.82584 0.000183105 10.3398 0.000183105C15.8538 0.000183105 20.3398 4.48618 20.3398 10.0002C20.3398 15.5142 15.8538 20.0002 10.3398 20.0002C4.82584 20.0002 0.339844 15.5142 0.339844 10.0002ZM13.1675 5.75732L14.5818 7.17153L11.7533 9.99996L14.5818 12.8284L13.1675 14.2426L10.3391 11.4142L7.51068 14.2426L6.09647 12.8284L8.9249 9.99996L6.09647 7.17153L7.51068 5.75732L10.3391 8.58575L13.1675 5.75732Z" fill="#DD1535"/>
</svg>`,
    color: lightTheme.component.iconIndicator.background.fill.bad,
  },
} satisfies Record<string, IconIndicatorVariantProps>
const iconIndicatorVariants = _iconIndicatorVariants as UnionizeVariants<typeof _iconIndicatorVariants>

export type IconIndicatorOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  /**
   * @default none
   */
  variant?: keyof typeof iconIndicatorVariants
}

export class IconIndicator<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  IconIndicatorOutProperties<EM>
> {
  constructor(
    inputProperties?: InProperties<IconIndicatorOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<IconIndicatorOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        width: 24,
        height: 24,
        padding: 2,
        ...config?.defaultOverrides,
      },
    })
    super.add(
      new Svg(undefined, undefined, {
        defaultOverrides: {
          width: 20,
          height: 20,
          content: computed(() => iconIndicatorVariants[this.properties.value.variant ?? 'none'].content),
          color: computed(() => iconIndicatorVariants[this.properties.value.variant ?? 'none'].color?.value),
        },
      }),
    )
  }

  add(): this {
    throw new Error(`the IconIndicator component can not have any children`)
  }
}
