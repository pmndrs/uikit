import {
  Image,
  ImageOutProperties,
  InProperties,
  ThreeEventMap,
  RenderContext,
  BaseOutProperties,
  imageDefaults,
} from '@pmndrs/uikit'
import { Texture } from 'three'

export type AvatarProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  ImageOutProperties<EM, string | Texture>
>

export type AvatarOutProperties<EM extends ThreeEventMap = ThreeEventMap> = ImageOutProperties<EM, string | Texture>

export class Avatar<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Image<T, EM, AvatarOutProperties<EM>> {
  constructor(
    inputProperties?: InProperties<AvatarOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AvatarOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: imageDefaults,
      ...config,
      defaultOverrides: {
        width: 40,
        height: 40,
        flexShrink: 0,
        aspectRatio: 1,
        objectFit: 'cover',
        borderRadius: 20,
        ...config?.defaultOverrides,
      },
    })
  }
}
