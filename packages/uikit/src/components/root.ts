import { Signal, computed } from '@preact/signals-core'
import { FlexNode, createFlexNodeState } from '../flex/index.js'
import { PanelGroupManager } from '../panel/instanced-panel-group.js'
import { alignmentXMap, alignmentYMap } from '../utils.js'
import { WithReversePainterSortStableCache } from '../order.js'
import { Matrix4, Object3D, Vector2Tuple } from 'three'
import { GlyphGroupManager } from '../text/render/instanced-glyph-group.js'
import { Properties } from '../properties/index.js'
import { ParentContext } from '../context.js'

export type RenderContext = {
  requestRender: () => void
  requestFrame: () => void
}

export type RootContext = WithReversePainterSortStableCache & {
  requestCalculateLayout: () => void
  object: Object3D
  gylphGroupManager: GlyphGroupManager
  panelGroupManager: PanelGroupManager
  onFrameSet: Set<(delta: number) => void>
  onUpdateMatrixWorldSet: Set<() => void>
  interactableDescendants: Array<Object3D>
  size: Signal<Vector2Tuple | undefined>
} & Partial<RenderContext>

export function createRootContext(
  parentContext: ParentContext | undefined,
  object: Object3D,
  size: Signal<Vector2Tuple | undefined>,
  renderContext: RenderContext | undefined,
): { isRoot: boolean; root: RootContext } {
  if (parentContext != null) {
    return {
      isRoot: false,
      root: parentContext.root,
    }
  }

  const interactableDescendants: Array<Object3D> = []

  const ctx: Partial<RenderContext> & Pick<RootContext, 'onFrameSet'> = {
    onFrameSet: new Set<(delta: number) => void>(),
    ...renderContext,
  }

  return {
    isRoot: true,
    root: Object.assign(ctx, {
      objectInvertedWorldMatrix: new Matrix4(),
      rayInGlobalSpaceMap: new Map(),
      interactableDescendants,
      onUpdateMatrixWorldSet: new Set<() => void>(),
      requestCalculateLayout: () => {},
      object,
      gylphGroupManager: new GlyphGroupManager(ctx, object),
      panelGroupManager: new PanelGroupManager(ctx, object),
      size,
    }) satisfies RootContext,
  }
}

export function setupRootContext(
  { isRoot, node, root }: { isRoot: boolean; node: Signal<FlexNode | undefined>; root: RootContext },
  object: Object3D,
  abortSignal: AbortSignal,
) {
  if (!isRoot) {
    return
  }
  root.gylphGroupManager.init(abortSignal)
  root.panelGroupManager.init(abortSignal)

  object.interactableDescendants = root.interactableDescendants

  root.requestCalculateLayout = createDeferredRequestLayoutCalculation(root, node, abortSignal)

  const onFrame = () => void (root.reversePainterSortStableCache = undefined)

  root.onFrameSet.add(onFrame)
  abortSignal.addEventListener('abort', () => root.onFrameSet.delete(onFrame))

  object.updateMatrixWorld = function () {
    if (this.parent == null) {
      this.matrixWorld.copy(this.matrix)
    } else {
      this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)
    }
    for (const update of root.onUpdateMatrixWorldSet) {
      update()
    }
  }
}

function createDeferredRequestLayoutCalculation(
  root: Pick<RootContext, 'requestFrame' | 'onFrameSet'>,
  node: Signal<FlexNode | undefined>,
  abortSignal: AbortSignal,
) {
  let requested: boolean = true
  const onFrame = () => {
    if (!requested) {
      return
    }
    requested = false
    console.log('recalculate')
    node.peek()?.calculateLayout()
  }
  root.onFrameSet.add(onFrame)
  abortSignal.addEventListener('abort', () => root.onFrameSet.delete(onFrame))
  return () => {
    requested = true
    root.requestFrame?.()
  }
}

export function computedRootMatrix(properties: Properties, size: Signal<Vector2Tuple | undefined>) {
  return computed(() => {
    if (size.value == null) {
      return undefined
    }
    const [width, height] = size.value
    const pixelSize = properties.get('pixelSize')
    return new Matrix4().makeTranslation(
      alignmentXMap[properties.get('anchorX')] * width * pixelSize,
      alignmentYMap[properties.get('anchorY')] * height * pixelSize,
      0,
    )
  })
}
