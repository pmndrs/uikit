import type { Component } from '../../components/component.js'
import { RootContext } from '../../context.js'
import { ElementType, OrderInfo } from '../../order.js'
import type { MaterialClass } from '../material/create.js'
import { resolvePanelMaterialClassProperty } from '../material/presets.js'
import { InstancedPanelGroup } from './group.js'
import type { PanelGroupProperties } from './properties.js'

export class PanelGroupManager {
  private map = new Map<MaterialClass, Map<string, InstancedPanelGroup>>()

  constructor(
    private readonly root: Omit<RootContext, 'glyphGroupManager' | 'panelGroupManager'>,
    private readonly object: Component,
  ) {}

  init(abortSignal: AbortSignal) {
    const onFrame = () => this.traverse((group) => group.onFrame())
    this.root.onFrameSet.add(onFrame)
    abortSignal.addEventListener('abort', () => {
      this.root.onFrameSet.delete(onFrame)
      this.traverse((group) => group.destroy())
    })
  }

  private traverse(fn: (group: InstancedPanelGroup) => void) {
    for (const groups of this.map.values()) {
      for (const group of groups.values()) {
        fn(group)
      }
    }
  }

  getGroup({ majorIndex, minorIndex }: OrderInfo, properties: Required<PanelGroupProperties>) {
    const materialClass = resolvePanelMaterialClassProperty(properties.panelMaterialClass)
    let groups = this.map.get(materialClass)
    if (groups == null) {
      this.map.set(materialClass, (groups = new Map()))
    }
    const key = [
      majorIndex,
      minorIndex,
      properties.renderOrder,
      properties.depthTest,
      properties.depthWrite,
      properties.receiveShadow,
      properties.castShadow,
    ].join(',')
    let panelGroup = groups.get(key)
    if (panelGroup == null) {
      groups.set(
        key,
        (panelGroup = new InstancedPanelGroup(
          this.object,
          this.root,
          {
            elementType: ElementType.Panel,
            minorIndex,
            majorIndex,
            patchIndex: 0,
          },
          properties,
        )),
      )
    }
    return panelGroup
  }
}
