import {
  Image,
  ImageOutProperties,
  InProperties,
  RenderContext,
  BaseOutProperties,
  Container,
  abortableEffect,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { Texture } from 'three'
import { theme } from '../theme.js'
import { computed } from '@preact/signals-core'

const _avatarSizes = {
  xl: { attributionActiveMargin: 4, attributionActiveWidth: 24, attributionSrcWidth: 44, borderWidth: 3, height: 120 },
  lg: { attributionActiveMargin: 2, attributionActiveWidth: 16, attributionSrcWidth: 32, borderWidth: 3, height: 72 },
  md: { attributionActiveMargin: 0, attributionActiveWidth: 12, attributionSrcWidth: 16, borderWidth: 2, height: 44 },
  sm: { borderWidth: 2, height: 24 },
  xs: { borderWidth: 2, height: 16 },
}
const avatarSizes = _avatarSizes as UnionizeVariants<typeof _avatarSizes>

export type AvatarProperties = InProperties<AvatarOutProperties>

export type AvatarOutProperties = BaseOutProperties & {
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

export class Avatar extends Container<AvatarOutProperties> {
  public readonly focusRing: Container
  public readonly image: Image<ImageOutProperties<string | Texture>>
  public readonly activeBadge: Container
  public attributionImage?: Image<ImageOutProperties<string | Texture>>
  constructor(
    inputProperties?: InProperties<AvatarOutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<AvatarOutProperties>
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
              this.properties.value.selected === true ? theme.component.avatar.focusRing.selected.value : undefined,
            ),
          },
          active: {
            borderColor: theme.component.avatar.focusRing.pressed,
          },
          hover: {
            borderColor: theme.component.avatar.focusRing.hovered,
          },
          borderColor: theme.component.avatar.focusRing.default,
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
      (this.image = new Image<ImageOutProperties<string | Texture>>(undefined, undefined, {
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
          backgroundColor: theme.component.avatar.badge.active,
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
      const attributionImage = new Image<ImageOutProperties<string | Texture>>(undefined, undefined, {
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

  dispose(): void {
    this.attributionImage?.dispose()
    this.activeBadge.dispose()
    this.image.dispose()
    this.focusRing.dispose()
    super.dispose()
  }

  add(): this {
    throw new Error(`the Avatar component can not have any children`)
  }
}
