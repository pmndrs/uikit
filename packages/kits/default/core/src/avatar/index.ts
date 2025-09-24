import { Image, ImageOutProperties, InProperties, RenderContext, BaseOutProperties, imageDefaults } from '@pmndrs/uikit'
import { Texture } from 'three'
import { colors } from '../theme.js'

export type AvatarProperties = InProperties<ImageOutProperties<string | Texture>>

export type AvatarOutProperties = ImageOutProperties<string | Texture>

export class Avatar extends Image<AvatarOutProperties> {
  constructor(
    inputProperties?: InProperties<AvatarOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AvatarOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: imageDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
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
