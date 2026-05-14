import { Signal } from '@preact/signals-core'
import { ReadonlyProperties } from '@pmndrs/uikit-pub-sub'
import { abortableEffect } from '../../utils.js'

type HiddenInputProperties = {
  disabled: boolean
  tabIndex: number
  autocomplete: string
  type: string
}

export function createHtmlInputElement(
  onChange: (value: string) => void,
  multiline: boolean,
  onSelectionChange: () => void,
) {
  const element = document.createElement(multiline ? 'textarea' : 'input')
  const style = element.style
  style.setProperty('position', 'absolute')
  style.setProperty('left', '-1000vw')
  style.setProperty('top', '0')
  style.setProperty('pointerEvents', 'none')
  style.setProperty('opacity', '0')
  element.addEventListener('input', () => {
    onChange?.(element.value)
    onSelectionChange()
  })
  element.addEventListener('focus', onSelectionChange)
  element.addEventListener('keydown', onSelectionChange)
  element.addEventListener('keyup', onSelectionChange)
  element.addEventListener('blur', onSelectionChange)
  return element
}

export function setupHtmlInputElement(
  properties: ReadonlyProperties<HiddenInputProperties>,
  element: HTMLInputElement | HTMLTextAreaElement,
  value: Signal<string>,
  abortSignal: AbortSignal,
) {
  document.body.appendChild(element)
  abortSignal.addEventListener('abort', () => element.remove())
  abortableEffect(() => {
    element.value = value.value
  }, abortSignal)
  abortableEffect(() => {
    element.disabled = properties.value.disabled
  }, abortSignal)
  abortableEffect(() => {
    element.tabIndex = properties.value.tabIndex
  }, abortSignal)
  abortableEffect(() => {
    element.autocomplete = properties.value.autocomplete as AutoFill
  }, abortSignal)
  abortableEffect(() => element.setAttribute('type', properties.value.type), abortSignal)
}

export function setupUpdateHasFocus(
  element: HTMLElement,
  hasFocusSignal: Signal<boolean>,
  onFocusChange: (focus: boolean) => void,
  abortSignal: AbortSignal,
) {
  if (abortSignal.aborted) {
    return
  }
  hasFocusSignal.value = document.activeElement === element
  const listener = () => {
    const hasFocus = document.activeElement === element
    if (hasFocus == hasFocusSignal.value) {
      return
    }
    hasFocusSignal.value = hasFocus
    onFocusChange(hasFocus)
  }
  element.addEventListener('focus', listener)
  element.addEventListener('blur', listener)
  abortSignal.addEventListener('abort', () => {
    element.removeEventListener('focus', listener)
    element.removeEventListener('blur', listener)
  })
}
