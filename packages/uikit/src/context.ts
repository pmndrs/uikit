import { ReadonlySignal, Signal, computed } from '@preact/signals-core'
import { PanelGroupManager } from './panel/instance/group-manager.js'
import { abortableEffect, alignmentXMap, alignmentYMap } from './utils.js'
import { WithReversePainterSortStableCache } from './order.js'
import { Matrix4, Vector2Tuple } from 'three'
import { GlyphGroupManager } from './text/render/instanced-glyph-group.js'
import { Component } from './components/component.js'
import { Properties } from './properties/index.js'

export type RenderContext = {
  requestFrame: () => void
}

export type RootContext = WithReversePainterSortStableCache & {
  requestCalculateLayout: () => void
  requestRender: () => void
  component: Component
  glyphGroupManager: GlyphGroupManager
  panelGroupManager: PanelGroupManager
  onFrameSet: Set<(delta: number) => void>
  onUpdateMatrixWorldSet: Set<() => void>
  isUpdateRunning: boolean
} & Partial<RenderContext>

export function buildRootContext(
  component: Component,
  renderContext: RenderContext | undefined,
): ReadonlySignal<RootContext> {
  const root = computed<RootContext>(() =>
    component.parentContainer.value == null
      ? createRootContext(component, renderContext)
      : component.parentContainer.value.root.value,
  )

  abortableEffect(() => {
    const rootValue = root.value
    if (rootValue.component != component || !component.isAttached.value) {
      return
    }
    const abortController = new AbortController()
    rootValue.glyphGroupManager.init(abortController.signal)
    rootValue.panelGroupManager.init(abortController.signal)

    rootValue.requestCalculateLayout = createDeferredRequestLayoutCalculation(rootValue, component)

    const onFrame = () => void (rootValue.reversePainterSortStableCache = undefined)

    rootValue.onFrameSet.add(onFrame)
    abortController.signal.addEventListener('abort', () => rootValue.onFrameSet.delete(onFrame))
    return () => abortController.abort()
  }, component.abortSignal)

  return root
}

function createRootContext(component: Component, renderContext: RenderContext | undefined) {
  const ctx: Omit<RootContext, 'glyphGroupManager' | 'panelGroupManager'> = {
    isUpdateRunning: false,
    onFrameSet: new Set<(delta: number) => void>(),
    requestFrame: renderContext?.requestFrame,
    requestRender() {
      if (ctx.isUpdateRunning) {
        //request render unnecassary -> while render after updates ran
        return
      }
      //not updating -> requesting a new frame so we will render after updating
      renderContext?.requestFrame()
    },
    onUpdateMatrixWorldSet: new Set<() => void>(),
    requestCalculateLayout: () => {},
    component,
  }

  return Object.assign(ctx, {
    glyphGroupManager: new GlyphGroupManager(ctx, component),
    panelGroupManager: new PanelGroupManager(ctx, component),
  }) satisfies RootContext
}

function createDeferredRequestLayoutCalculation(
  root: Pick<RootContext, 'requestFrame' | 'onFrameSet'>,
  component: Component,
) {
  let requested: boolean = true
  const onFrame = () => {
    if (!requested) {
      return
    }
    requested = false
    component.node.calculateLayout()
  }
  root.onFrameSet.add(onFrame)
  component.abortSignal.addEventListener('abort', () => root.onFrameSet.delete(onFrame))
  return () => {
    requested = true
    root.requestFrame?.()
  }
}

export function buildRootMatrix(properties: Properties, size: Signal<Vector2Tuple | undefined>) {
  const sizeValue = size.value
  if (sizeValue == null) {
    return undefined
  }
  const [width, height] = sizeValue
  const pixelSize = properties.value.pixelSize
  return new Matrix4().makeTranslation(
    alignmentXMap[properties.value.anchorX] * width * pixelSize,
    alignmentYMap[properties.value.anchorY] * height * pixelSize,
    0,
  )
}
