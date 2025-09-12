import { Component } from '@pmndrs/uikit'

export function searchFor<T>(
  from: Component,
  _class: { new (...args: Array<any>): T },
  maxSteps: number,
): T | undefined {
  if (from instanceof _class) {
    return from
  }
  const parent = from.parentContainer.value
  if (maxSteps === 0 || parent == null) {
    return undefined
  }
  return searchFor(parent, _class, maxSteps - 1)
}
