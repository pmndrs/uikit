import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Matrix4, Vector3Tuple } from 'three'
import { ClippingRect } from './clipping.js'
import { ElementType, OrderInfo, useOrderInfo } from './order.js'
import { GetInstancedPanelGroup, useGetInstancedPanelGroup, usePanelGroupDependencies } from './panel/react.js'
import { useEffect, useMemo } from 'react'
import { InstancedPanel } from './panel/instanced-panel.js'
import { Inset } from './flex/index.js'
import { ManagerCollection, PropertyTransformation } from './properties/utils.js'
import { useImmediateProperties } from './properties/immediate.js'
import { useBatchedProperties } from './properties/batched.js'

const noBorder = signal<Inset>([0, 0, 0, 0])

const CARET_WIDTH = 1.5

const caretPropertyTransformation: PropertyTransformation = (key, value, hasProperty, setProperty) => {
  if (key != 'color') {
    return
  }
  setProperty('backgroundColor', value)
}

export function useCaret(
  collection: ManagerCollection,
  matrix: Signal<Matrix4 | undefined>,
  caretPosition: Signal<Vector3Tuple | undefined>,
  isHidden: Signal<boolean> | undefined,
  parentOrderInfo: OrderInfo,
  parentClippingRect: Signal<ClippingRect | undefined> | undefined,
  providedGetGroup?: GetInstancedPanelGroup,
) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const getGroup = providedGetGroup ?? useGetInstancedPanelGroup()
  const groupDeps = usePanelGroupDependencies(undefined, { castShadow: false, receiveShadow: false })
  const orderInfo = useOrderInfo(ElementType.Panel, undefined, groupDeps, parentOrderInfo)
  const blinkingCaretPosition = useMemo(() => signal<Vector3Tuple | undefined>(undefined), [])
  const unsubscribeBlink = useMemo(
    () =>
      effect(() => {
        const pos = caretPosition.value
        if (pos == null) {
          blinkingCaretPosition.value = undefined
        }
        blinkingCaretPosition.value = pos
        const ref = setInterval(
          () => (blinkingCaretPosition.value = blinkingCaretPosition.peek() == null ? pos : undefined),
          500,
        )
        return () => clearInterval(ref)
      }),
    [blinkingCaretPosition, caretPosition],
  )
  useEffect(() => unsubscribeBlink, [unsubscribeBlink])
  const panel = useMemo(
    () =>
      new InstancedPanel(
        getGroup(orderInfo.majorIndex, groupDeps),
        matrix,
        computed(() => {
          const size = blinkingCaretPosition.value
          if (size == null) {
            return [0, 0]
          }
          return [CARET_WIDTH, size[2]]
        }),
        computed(() => {
          const position = blinkingCaretPosition.value
          if (position == null) {
            return [0, 0]
          }
          return [position[0] - CARET_WIDTH / 2, position[1]]
        }),
        noBorder,
        parentClippingRect,
        isHidden,
        orderInfo.minorIndex,
      ),
    [getGroup, orderInfo, groupDeps, matrix, parentClippingRect, isHidden, blinkingCaretPosition],
  )
  const startIndex = collection.length
  useImmediateProperties(collection, panel, caretPropertyTransformation)
  useBatchedProperties(collection, panel, caretPropertyTransformation)
  //setting default color to text default color (0xffffff)
  const collectionLength = collection.length
  for (let i = startIndex; i < collectionLength; i++) {
    collection[i].add('color', 0xffffff)
  }
  useEffect(() => () => panel.destroy(), [panel])
}
