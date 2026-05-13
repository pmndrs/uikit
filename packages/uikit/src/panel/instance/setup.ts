import { Signal } from '@preact/signals-core'
import { Matrix4, Vector2Tuple } from 'three'
import { ClippingRect } from '../../clipping.js'
import { RootContext } from '../../context.js'
import { Inset } from '../../flex/node.js'
import { OrderInfo } from '../../order.js'
import { Properties } from '../../properties/index.js'
import { abortableEffect } from '../../utils.js'
import { PanelMaterialConfig } from '../material/config.js'
import { InstancedPanel } from './panel.js'
import type { PanelGroupProperties } from './properties.js'

export function setupInstancedPanel(
  properties: Properties,
  root: Signal<RootContext>,
  orderInfo: Signal<OrderInfo | undefined>,
  panelGroupDependencies: Signal<Required<PanelGroupProperties>>,
  panelMatrix: Signal<Matrix4 | undefined>,
  size: Signal<Vector2Tuple | undefined>,
  borderInset: Signal<Inset | undefined>,
  clippingRect: Signal<ClippingRect | undefined> | undefined,
  isVisible: Signal<boolean>,
  materialConfig: PanelMaterialConfig,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    const isEnabled = properties.enabled.value
    const currentOrderInfo = orderInfo.value
    if (!isEnabled || currentOrderInfo == null) {
      return
    }
    const innerAbortController = new AbortController()
    const group = root.value.panelGroupManager.getGroup(currentOrderInfo, panelGroupDependencies.value)
    new InstancedPanel(
      properties,
      group,
      currentOrderInfo.patchIndex,
      panelMatrix,
      size,
      borderInset,
      clippingRect,
      isVisible,
      materialConfig,
      innerAbortController.signal,
    )
    return () => innerAbortController.abort()
  }, abortSignal)
}
