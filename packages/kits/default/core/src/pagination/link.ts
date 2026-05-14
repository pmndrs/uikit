import { boolean, enum as enumSchema, object } from 'zod'
import type { z } from 'zod'
import { baseOutPropertyShape, createInPropertiesSchema, defineSchema } from '@pmndrs/uikit'
import {
  Container,
  ContainerProperties,
  InProperties,
  BaseOutProperties,
  RenderContext,
  UnionizeVariants,
} from '@pmndrs/uikit'
import { computed } from '@preact/signals-core'
import { borderRadius, colors, componentDefaults } from '../theme.js'
type PaginationSizeProps = Pick<ContainerProperties, 'height' | 'width' | 'paddingX' | 'paddingY'>

const _paginationSizes = {
  default: { height: 40, paddingX: 16, paddingY: 8 },
  sm: { height: 36, paddingX: 12 },
  lg: { height: 42, paddingX: 32 },
  icon: { height: 40, width: 40 },
} satisfies Record<string, PaginationSizeProps>
const paginationSizes = _paginationSizes as UnionizeVariants<typeof _paginationSizes>

export const PaginationLinkOutPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  object({
    ...baseOutPropertyShape,
    size: enumSchema(
      Object.keys(paginationSizes) as [keyof typeof paginationSizes, ...(keyof typeof paginationSizes)[]],
    ).optional(),
    isActive: boolean().optional(),
  }).strict(),
)

export const PaginationLinkPropertiesSchema = /* @__PURE__ */ defineSchema(() =>
  createInPropertiesSchema(PaginationLinkOutPropertiesSchema),
)

export type PaginationLinkOutProperties = BaseOutProperties & z.output<typeof PaginationLinkOutPropertiesSchema>

export type PaginationLinkProperties = z.input<typeof PaginationLinkPropertiesSchema>

export class PaginationLink extends Container<PaginationLinkOutProperties> {
  constructor(
    inputProperties?: PaginationLinkProperties,
    initialClasses?: Array<InProperties<BaseOutProperties> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<PaginationLinkOutProperties>
    },
  ) {
    const sizeProps = computed(() => paginationSizes[this.properties.value.size ?? 'default'])
    const paddingX = computed(() => sizeProps.value?.paddingX)
    const paddingY = computed(() => sizeProps.value?.paddingY)
    const isActive = computed(() => this.properties.value.isActive ?? false)
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        cursor: 'pointer',
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        hover: { backgroundColor: colors.accent },
        backgroundColor: computed(() => (isActive.value ? colors.background.value : undefined)),
        color: computed(() => (isActive.value ? colors.foreground.value : undefined)),
        borderWidth: computed(() => (isActive.value ? 1 : undefined)),
        borderColor: computed(() => (isActive.value ? colors.input.value : undefined)),
        height: computed(() => sizeProps.value?.height),
        width: computed(() => sizeProps.value?.width),
        paddingLeft: paddingX,
        paddingRight: paddingX,
        paddingTop: paddingY,
        paddingBottom: paddingY,
        ...config?.defaultOverrides,
      },
    })
  }
}
