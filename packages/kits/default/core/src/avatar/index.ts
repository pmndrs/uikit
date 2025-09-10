import { Image, ImageOutProperties, InProperties, ThreeEventMap, RenderContext, BaseOutProperties } from '@pmndrs/uikit'
import { Texture } from 'three'

export type AvatarProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  ImageOutProperties<EM, string | Texture>
>

export type AvatarOutProperties<EM extends ThreeEventMap = ThreeEventMap> = ImageOutProperties<EM, string | Texture>

export class Avatar<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends AvatarOutProperties<EM> = AvatarOutProperties<EM>,
> extends Image<T, EM, OutProperties> {
  constructor(
    inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        width: 40,
        height: 40,
        flexShrink: 0,
        aspectRatio: 1,
        objectFit: 'cover',
        borderRadius: 20,
        ...config?.defaultOverrides,
      } as InProperties<OutProperties>,
    })
  }
}
