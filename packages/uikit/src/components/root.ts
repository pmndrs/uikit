import type { ThreeEventMap } from '../events.js'
import type { BaseOutProperties, InProperties } from '../properties/index.js'
import type { RenderContext } from '../context.js'
import type { RendererLike } from '../renderer-types.js'
import { Container } from './container.js'

export class Root<
  T = object,
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
> extends Container<T, EM, OutProperties> {
  constructor(
    renderer: RendererLike,
    properties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      renderContext?: RenderContext
      defaultOverrides?: InProperties<OutProperties>
    },
  ) {
    const useNodeMaterial = 'backend' in renderer
    const renderContext = config?.renderContext
      ? { ...config.renderContext, useNodeMaterial }
      : { requestFrame: () => {}, useNodeMaterial }

    super(properties, initialClasses, {
      ...config,
      renderContext,
    })
  }
}

export default Root
