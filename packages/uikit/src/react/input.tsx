import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { YogaProperties } from '../flex/node.js'
import { applyHoverProperties } from '../hover.js'
import { PanelProperties } from '../panel/instanced-panel.js'
import { InteractionGroup, MaterialClass, useInstancedPanel, useInteractionPanel } from '../panel/react.js'
import {
  WithAllAliases,
  flexAliasPropertyTransformation,
  panelAliasPropertyTransformation,
} from '../properties/alias.js'
import { WithClasses, addToMerged } from '../properties/default.js'
import { WithReactive, createCollection, finalizeCollection, writeCollection } from '../properties/utils.js'
import { ScrollListeners } from '../scroll.js'
import { TransformProperties, useTransformMatrix } from '../transform.js'
import {
  ComponentInternals,
  LayoutListeners,
  ViewportListeners,
  WithConditionals,
  useComponentInternals,
  useGlobalMatrix,
  useLayoutListeners,
  useViewportListeners,
} from './utils.js'
import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react'
import { useParentClippingRect, useIsClipped } from '../clipping.js'
import { useFlexNode } from './react.js'
import { useImmediateProperties } from '../properties/immediate.js'
import { InstancedTextProperties, useInstancedText } from '../text/react.js'
import { Signal, signal } from '@preact/signals-core'
import { useRootGroupRef, useSignalEffect } from '../utils.js'
import { useApplyResponsiveProperties } from '../responsive.js'
import { Group } from 'three'
import { ElementType, ZIndexOffset, useOrderInfo } from '../order.js'
/*
export type TextProperties = WithConditionals<
  WithClasses<
    WithAllAliases<WithReactive<YogaProperties & PanelProperties & TransformProperties & InstancedTextProperties>>
  >
>

export const Text = forwardRef<
  ComponentInternals,
  {
    value?: string | Signal<string>
    defaultValue?: string
    onValueChange?: (value: string) => void
    panelMaterialClass?: MaterialClass
    zIndexOffset?: ZIndexOffset
  } & TextProperties &
    EventHandlers &
    LayoutListeners &
    ViewportListeners &
    ScrollListeners
>((properties, ref) => {
  const collection = createCollection()
  const groupRef = useRef<Group>(null)
  const node = useFlexNode(groupRef)
  useImmediateProperties(collection, node, flexAliasPropertyTransformation)
  const transformMatrix = useTransformMatrix(collection, node)
  const rootGroupRef = useRootGroupRef()
  const globalMatrix = useGlobalMatrix(transformMatrix)
  const parentClippingRect = useParentClippingRect()
  const isClipped = useIsClipped(parentClippingRect, globalMatrix, node.size, node)
  useLayoutListeners(properties, node.size)
  useViewportListeners(properties, isClipped)
  const backgroundOrderInfo = useOrderInfo(ElementType.Panel, properties.zIndexOffset)
  useInstancedPanel(
    collection,
    globalMatrix,
    node.size,
    undefined,
    node.borderInset,
    isClipped,
    backgroundOrderInfo,
    parentClippingRect,
    properties.panelMaterialClass,
    panelAliasPropertyTransformation,
  )
  const orderInfo = useOrderInfo(ElementType.Text, undefined, backgroundOrderInfo)
  const text = useMemo(() => signal(''), [])
  const measureFunc = useInstancedText(collection, text, globalMatrix, node, isClipped, parentClippingRect, orderInfo)

  useApplyProperties(collection, properties)
  useApplyResponsiveProperties(collection, properties)
  const hoverHandlers = useApplyHoverProperties(collection, properties)
  writeCollection(collection, 'measureFunc', measureFunc)
  finalizeCollection(collection)

  const interactionPanel = useInteractionPanel(node.size, node, backgroundOrderInfo, rootGroupRef)

  useComponentInternals(ref, node, interactionPanel)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultValue = useMemo(() => signal(properties.defaultValue ?? ''), [])
  const value = useMemo(() => properties.value ?? defaultValue, [properties.value, defaultValue])

  const { onValueChange } = properties
  const isControlled = properties.value != null

  useSignalEffect(() => {
    el.value = value instanceof Signal ? value.value : value
    text.value = el.value
  }, [value])

  return (
    <InteractionGroup groupRef={groupRef} matrix={transformMatrix} handlers={properties} hoverHandlers={hoverHandlers}>
      <group
        onPointerMove={(e) => {
          if (e.defaultPrevented) {
            return
          }
          const buttons = e.buttons
          const content = this.text
          if (content == null) {
            return
          }

          // left click not held (i.e. not dragging)
          const dragging = buttons === 1 || buttons === 3
          if (!dragging || !content) {
            return
          }

          const idx = getCursorPosition(e)
          let start: number, end: number, dir: 'forward' | 'backward' | 'none'

          const caret = this.dragStartPoint ?? 0
          if (idx < caret) {
            start = idx
            end = caret
            dir = 'backward'
          } else if (idx > caret) {
            start = caret
            end = idx
            dir = 'forward'
          } else {
            start = end = idx
            dir = 'none'
          }
          this.setSelection([start, end])
          el.setSelectionRange(start, end, dir)
        }}
        onPointerDown={(e) => {
          if (e.defaultPrevented) {
            return
          }
          const idx = getCursorPosition(e)
          this.dragStartPoint = idx
          this.setFocus(true)
          this.setSelection([idx, idx])
          el.setSelectionRange(idx, idx, 'none')
        }}
        onDoubleClick={(e) => {
          if (e.defaultPrevented) {
            return
          }
          const text = this.text
          if (text == null) {
            return
          }

          const caret = this.caretPosition ?? 0
          let start = 0,
            end: number = text.length

          for (let i = caret; i < text.length; i++) {
            if (isWhitespace(text[i])) {
              end = i
              break
            }
          }

          for (let i = caret; i > 0; i--) {
            if (isWhitespace(text[i])) {
              start = i > 0 ? i + 1 : i
              break
            }
          }

          this.setSelection([start, end])
          el.setSelectionRange(start, end, 'none')
        }}
      >
        <primitive object={interactionPanel} />
      </group>
    </InteractionGroup>
  )
})

function isWhitespace(str: string): boolean {
  return !!str && str.trim() === ''
}

export function useHtmlInputElement(
  defaultValue: Signal<string>,
  isControlled: boolean,
  onValueChange?: (value: string) => void,
): HTMLInputElement {
  const element = useMemo(() => {
    const result = document.createElement('input')
    result.type = 'text'
    const style = result.style
    style.setProperty('position', 'absolute')
    style.setProperty('left', '-1000vw')
    style.setProperty('transform', 'absolute')
    style.setProperty('touchAction', 'translateX(-50%)')
    style.setProperty('pointerEvents', 'none')
    style.setProperty('opacity', '0')
    const onSelectChange = (e: Event) => {
      if (e.target != result) {
        return
      }
      // setTimeout ensures that we read the selection start/end values
      // once they have been updated.
      // If we were to read the selection on keydown events directly,
      // the value would be before the selection change from the keyboard
      // event happened.
      setTimeout(() => {
        const { selectionStart, selectionEnd } = result
        if (selectionStart == null || selectionEnd == null) {
          return
        }
        this.setSelection([selectionStart, selectionEnd])
      }, 0)
    }
    result.addEventListener('input', (e) => {
      if (e.target != result) {
        return
      }
      if (!isControlled) {
        defaultValue.value = result.value
      }
      onValueChange?.(result.value)
    })
    result.addEventListener('keyup', onSelectChange)
    result.addEventListener('keydown', onSelectChange)
    result.addEventListener('selectionchange', onSelectChange)
    document.body.appendChild(result)
    return result
  }, [defaultValue, isControlled, onValueChange])
  useEffect(() => () => element.remove(), [element])
  return element
}
*/
