import { Image, ImageOutProperties, InProperties, ThreeEventMap } from '@pmndrs/uikit'
import { Texture } from 'three'

export type AvatarProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<
  ImageOutProperties<EM, string | Texture>
>

export class Avatar<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Image<
  T,
  EM,
  ImageOutProperties<EM, string | Texture>
> {
  protected internalResetProperties(inputProperties?: AvatarProperties<EM>): void {
    super.internalResetProperties({
      width: 40,
      height: 40,
      flexShrink: 0,
      aspectRatio: 1,
      objectFit: 'cover',
      borderRadius: 20,
      ...inputProperties,
    })
  }
}
