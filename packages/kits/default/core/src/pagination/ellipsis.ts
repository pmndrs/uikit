import { ThreeEventMap, InProperties, BaseOutProperties, RenderContext, Container } from '@pmndrs/uikit'
import { Ellipsis } from '@pmndrs/uikit-lucide'
import { Object3D } from 'three/src/Three.Core.js'
import { componentDefaults, contentDefaults } from '../theme.js'

export type PaginationEllipsisProperties<EM extends ThreeEventMap = ThreeEventMap> = Omit<
  InProperties<BaseOutProperties<EM>>,
  'children'
>

export class PaginationEllipsis<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM> {
  public readonly icon: InstanceType<typeof Ellipsis>
  constructor(
    inputProperties?: InProperties<BaseOutProperties<EM>>,
    initialClasses?: Array<BaseOutProperties<EM> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<BaseOutProperties<EM>>
    },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
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
