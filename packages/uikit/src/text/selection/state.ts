import type { Signal } from '@preact/signals-core'
import type { Vector2Tuple } from 'three'

export function updateHtmlSelectionRange(
  target: Signal<Vector2Tuple | undefined>,
  element: HTMLInputElement | HTMLTextAreaElement | undefined,
) {
  const selectionStart = element?.selectionStart
  const selectionEnd = element?.selectionEnd
  const next =
    selectionStart == null || selectionEnd == null ? undefined : ([selectionStart, selectionEnd] as Vector2Tuple)
  const current = target.peek()
  if (current?.[0] === next?.[0] && current?.[1] === next?.[1]) {
    return
  }
  target.value = next
}
