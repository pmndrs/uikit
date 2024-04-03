import { Signal, computed, effect, signal } from '@preact/signals-core'
import { Matrix4 } from 'three'
import { WithActive } from '../active.js'
import { WithPreferredColorScheme } from '../dark.js'
import { WithHover } from '../hover.js'
import { WithResponsive } from '../responsive.js'
import { Subscriptions } from '../utils.js'

export function computedGlobalMatrix(
  parentMatrix: Signal<Matrix4 | undefined>,
  localMatrix: Signal<Matrix4 | undefined>,
): Signal<Matrix4 | undefined> {
  return computed(() => {
    const local = localMatrix.value
    const parent = parentMatrix.value
    if (local == null || parent == null) {
      return undefined
    }
    return parent.clone().multiply(local)
  })
}

export type WithConditionals<T> = WithHover<T> & WithResponsive<T> & WithPreferredColorScheme<T> & WithActive<T>

export function loadResourceWithParams<P, R, A extends Array<unknown>>(
  target: Signal<R | undefined>,
  fn: (param: P, ...additional: A) => Promise<R>,
  subscriptions: Subscriptions,
  param: Signal<P> | P,
  ...additionals: A
): void {
  if (!(param instanceof Signal)) {
    let canceled = false
    fn(param, ...additionals).then((value) => (canceled ? undefined : (target.value = value)))
    subscriptions.push(() => (canceled = true))
    return
  }
  subscriptions.push(
    effect(() => {
      let canceled = false
      fn(param.value, ...additionals)
        .then((value) => (canceled ? undefined : (target.value = value)))
        .catch(console.error)
      return () => (canceled = true)
    }),
  )
}
