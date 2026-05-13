import { ReadonlySignal, Signal } from '@preact/signals-core'
import { ReadonlyProperties } from '@pmndrs/uikit-pub-sub'
import { Vector2 } from 'three'
import { Component } from '../../components/component.js'
import { EventHandlersProperties, ThreePointerEvent } from '../../events.js'
import { abortableEffect } from '../../utils.js'
import { getCharIndex, type PositionedGlyphLayout } from '../layout/index.js'

type TextSelectionPointerProperties = {
  disabled: boolean
  type: string
}

const cancelSet = new Set<unknown>()

function cancelBlur(event: unknown) {
  cancelSet.add(event)
}

export const canvasInputProps = {
  onPointerDown: (e: { nativeEvent: any; preventDefault: () => void }) => {
    if (!(document.activeElement instanceof HTMLElement)) {
      return
    }
    if (!cancelSet.has(e.nativeEvent)) {
      return
    }
    cancelSet.delete(e.nativeEvent)
    e.preventDefault()
  },
}

const segmenter = typeof Intl === 'undefined' ? undefined : new Intl.Segmenter(undefined, { granularity: 'word' })

export function setupSelectionHandlers(
  target: Signal<EventHandlersProperties | undefined>,
  properties: ReadonlyProperties<TextSelectionPointerProperties>,
  text: ReadonlySignal<string>,
  component: Component,
  textLayout: ReadonlySignal<PositionedGlyphLayout | undefined>,
  focus: (start?: number, end?: number, direction?: 'forward' | 'backward' | 'none') => void,
  abortSignal: AbortSignal,
) {
  abortableEffect(() => {
    if (properties.value.disabled) {
      target.value = undefined
      return
    }
    let dragState: { startCharIndex: number; pointerId?: number } | undefined
    const onPointerFinish = (e: ThreePointerEvent) => {
      if (dragState == null || dragState.pointerId != e.pointerId) {
        return
      }
      e.stopImmediatePropagation?.()
      dragState = undefined
    }
    target.value = {
      onPointerDown: (e) => {
        const layout = textLayout.peek()
        if (dragState != null || e.uv == null || layout == null) {
          return
        }
        cancelBlur(e.nativeEvent)
        e.stopImmediatePropagation?.()
        if (
          'setPointerCapture' in e.object &&
          typeof e.object.setPointerCapture === 'function' &&
          e.pointerId != null
        ) {
          e.object.setPointerCapture(e.pointerId)
        }
        const startCharIndex = uvToCharIndex(component, e.uv, layout, 'between')
        dragState = {
          pointerId: e.pointerId,
          startCharIndex,
        }
        setTimeout(() => focus(startCharIndex, startCharIndex))
      },
      onDblClick: (e) => {
        const layout = textLayout.peek()
        if (segmenter == null || e.uv == null || layout == null) {
          return
        }
        e.stopImmediatePropagation?.()
        if (properties.peek().type === 'password') {
          setTimeout(() => focus(0, text.peek().length, 'none'))
          return
        }
        const charIndex = uvToCharIndex(component, e.uv, layout, 'on')
        const segments = segmenter.segment(text.peek())
        let segmentLengthSum = 0
        for (const { segment } of segments) {
          const segmentLength = segment.length
          if (charIndex < segmentLengthSum + segmentLength) {
            setTimeout(() => focus(segmentLengthSum, segmentLengthSum + segmentLength, 'none'))
            break
          }
          segmentLengthSum += segmentLength
        }
      },
      onPointerUp: onPointerFinish,
      onPointerLeave: onPointerFinish,
      onPointerCancel: onPointerFinish,
      onPointerMove: (e) => {
        const layout = textLayout.peek()
        if (dragState == null || dragState?.pointerId != e.pointerId || e.uv == null || layout == null) {
          return
        }
        e.stopImmediatePropagation?.()
        const charIndex = uvToCharIndex(component, e.uv, layout, 'between')

        const start = Math.min(dragState.startCharIndex, charIndex)
        const end = Math.max(dragState.startCharIndex, charIndex)
        const direction = dragState.startCharIndex < charIndex ? 'forward' : 'backward'

        setTimeout(() => focus(start, end, direction))
      },
    }
  }, abortSignal)
}

function uvToCharIndex(
  { size: s, borderInset: b, paddingInset: p }: Component,
  uv: Vector2,
  layout: PositionedGlyphLayout,
  position: 'between' | 'on',
): number {
  const size = s.peek()
  const borderInset = b.peek()
  const paddingInset = p.peek()
  if (size == null || borderInset == null || paddingInset == null) {
    return 0
  }
  const [width, height] = size
  const [bTop, , , bLeft] = borderInset
  const [pTop, , , pLeft] = paddingInset
  const x = uv.x * width - bLeft - pLeft
  const y = (uv.y - 1) * height + bTop + pTop
  return getCharIndex(layout, x, y, position)
}
