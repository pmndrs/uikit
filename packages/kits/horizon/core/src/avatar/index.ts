import {
  Image,
  ImageOutProperties,
  InProperties,
  ThreeEventMap,
  RenderContext,
  BaseOutProperties,
  Container,
  abortableEffect,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { Texture } from 'three'
import { lightTheme } from '../theme.js'
import { computed } from '@preact/signals-core'

const _avatarSizes = {
  xl: { attributionActiveMargin: 4, attributionActiveWidth: 24, attributionSrcWidth: 44, borderWidth: 3, height: 120 },
  lg: { attributionActiveMargin: 2, attributionActiveWidth: 16, attributionSrcWidth: 32, borderWidth: 3, height: 72 },
  md: { attributionActiveMargin: 0, attributionActiveWidth: 12, attributionSrcWidth: 16, borderWidth: 2, height: 44 },
  sm: { borderWidth: 2, height: 24 },
  xs: { borderWidth: 2, height: 16 },
}
const avatarSizes = _avatarSizes as UnionizeVariants<typeof _avatarSizes>

export type AvatarProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<AvatarOutProperties<EM>>

export type AvatarOutProperties<EM extends ThreeEventMap = ThreeEventMap> = BaseOutProperties<EM> & {
  src?: string
  /**
   * @default false
   */
  attributionActive?: boolean
  attributionSrc?: string
  /**
   * @default md
   */
  size?: keyof typeof avatarSizes
  selected?: boolean
}

export class Avatar<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  AvatarOutProperties<EM>
> {
  public readonly focusRing!: Container
  public readonly image!: Image<{}, ThreeEventMap, ImageOutProperties<ThreeEventMap, string | Texture>>
  public readonly activeBadge!: Container
  public attributionImage?: Image<{}, ThreeEventMap, ImageOutProperties<ThreeEventMap, string | Texture>>
  constructor(
    inputProperties?: InProperties<AvatarOutProperties<EM>>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AvatarOutProperties<EM>>
    },
  ) {
    const height = computed(() => avatarSizes[this.properties.value.size ?? 'md'].height)
    super(inputProperties, initialClasses, {
      ...config,
      defaultOverrides: {
        positionType: 'relative',
        width: height,
        height,
        flexShrink: 0,
        '*': {
          important: {
            borderColor: computed(() =>
              this.properties.value.selected === true
                ? lightTheme.component.avatar.focusRing.selected.value
                : undefined,
            ),
          },
          active: {
            borderColor: lightTheme.component.avatar.focusRing.pressed,
          },
          hover: {
            borderColor: lightTheme.component.avatar.focusRing.hovered,
          },
          borderColor: lightTheme.component.avatar.focusRing.default,
        },
        ...config?.defaultOverrides,
      },
    })

    //focus ring
    const focusRingBorderWidth = computed(() => avatarSizes[this.properties.value.size ?? 'md'].borderWidth!)
    super.add(
      (this.focusRing = new Container(undefined, undefined, {
        defaultOverrides: {
          borderWidth: focusRingBorderWidth,
          positionType: 'absolute',
          borderRadius: 1000,
          inset: computed(() => -2 - focusRingBorderWidth.value),
        },
      })),
    )

    //avatar image
    super.add(
      (this.image = new Image<{}, ThreeEventMap, ImageOutProperties<ThreeEventMap, string | Texture>>(undefined, undefined, {
        defaultOverrides: {
          width: '100%',
          height: '100%',
          aspectRatio: 1,
          borderRadius: 1000,
          borderColor: 'initial',
          src: this.properties.signal.src,
        },
      })),
    )

    //active attribution
    const attributionActiveWidth = computed(
      () => avatarSizes[this.properties.value.size ?? 'md'].attributionActiveWidth,
    )
    const cattributionActiveMargin = computed(
      () => avatarSizes[this.properties.value.size ?? 'md'].attributionActiveMargin,
    )
    super.add(
      (this.activeBadge = new Container(undefined, undefined, {
        defaultOverrides: {
          display: computed(() =>
            (this.properties.value.attributionActive ?? false) && this.properties.value.attributionSrc == null
              ? 'flex'
              : 'none',
          ),
          zIndex: 1,
          width: attributionActiveWidth,
          height: attributionActiveWidth,
          flexShrink: 0,
          backgroundColor: lightTheme.component.avatar.badge.active,
          positionType: 'absolute',
          borderColor: 'initial',
          borderRadius: 1000,
          positionBottom: cattributionActiveMargin,
          positionRight: cattributionActiveMargin,
        },
      })),
    )

    //src attribution
    abortableEffect(() => {
      const src = this.properties.value.attributionSrc
      if (src == null) {
        return
      }
      const attributionSrcWidth = computed(() => avatarSizes[this.properties.value.size ?? 'md'].attributionSrcWidth)
      const attributionImage = new Image<{}, ThreeEventMap, ImageOutProperties<ThreeEventMap, string | Texture>>(undefined, undefined, {
        defaultOverrides: {
          src,
          positionType: 'absolute',
          positionBottom: cattributionActiveMargin,
          positionRight: cattributionActiveMargin,
          flexShrink: 0,
          width: attributionSrcWidth,
          height: attributionSrcWidth,
          aspectRatio: 1,
        },
      })
      super.add(attributionImage)
      this.attributionImage = attributionImage
      return () => attributionImage.dispose()
    }, this.abortSignal)
  }

  add(): this {
    throw new Error(`the Avatar component can not have any children`)
  }
}
