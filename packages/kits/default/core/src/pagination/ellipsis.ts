import { InProperties, BaseOutProperties, RenderContext, Container } from '@pmndrs/uikit'
import { Ellipsis } from '@pmndrs/uikit-lucide'
import { Object3D } from 'three/src/Three.Core.js'
import { colors, componentDefaults, contentDefaults } from '../theme.js'

export type PaginationEllipsisProperties = Omit<InProperties<BaseOutProperties>, 'children'>

export class PaginationEllipsis extends Container {
  public readonly icon: InstanceType<typeof Ellipsis>
  constructor(
    inputProperties?: InProperties<BaseOutProperties>,
    initialClasses?: Array<BaseOutProperties | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'row',
        height: 36,
        width: 36,
        alignItems: 'center',
        justifyContent: 'center',
        ...config?.defaultOverrides,
      },
    })

    super.add(
      (this.icon = new Ellipsis(undefined, undefined, {
        defaults: contentDefaults,
        defaultOverrides: {
          '*': {
            borderColor: colors.border,
          },
          width: 16,
          height: 16,
        },
      })),
    )
  }

  dispose(): void {
    this.icon.dispose()
    super.dispose()
  }

  add(...object: Object3D[]): this {
    throw new Error(`the ellipsis component can not have any children`)
  }
}
