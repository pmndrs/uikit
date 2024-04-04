import { Signal, effect, untracked } from '@preact/signals-core'
import { MergedProperties } from './merged.js'
import type { Subscriptions } from '../utils.js'

type PropertySubscriptions = Record<string, () => void>

export function setupImmediateProperties(
  propertiesSignal: Signal<MergedProperties>,
  activeSignal: Signal<boolean>,
  objectHasProperty: (key: string) => boolean,
  objectSetProperty: (key: string, value: unknown) => void,
  subscriptions: Subscriptions,
  renameOutput?: Record<string, string>,
): void {
  let active = false
  let currentProperties: MergedProperties | undefined
  let propertySubscriptions: PropertySubscriptions = {}

  const setProperty =
    renameOutput == null
      ? objectSetProperty
      : (key: string, value: unknown) => {
          if (key in renameOutput) {
            key = renameOutput[key]
          }
          objectSetProperty(key, value)
        }
  //the following 2 effects are seperated so that the cleanup call only happens when active changes from true to false
  //or everything is cleaned up because the component is destroyed
  subscriptions.push(
    effect(() => {
      const newProperties = propertiesSignal.value
      if (active) {
        applyProperties(objectHasProperty, newProperties, currentProperties, propertySubscriptions, setProperty)
      }
      currentProperties = newProperties
    }),
    effect(() => {
      active = activeSignal.value
      if (!active) {
        return
      }
      if (currentProperties == null) {
        return
      }
      //(re-)write all current properties since the object is (re-)activiated it might not have its values set
      applyProperties(objectHasProperty, currentProperties, undefined, propertySubscriptions, setProperty)
      return () => {
        unsubscribeProperties(propertySubscriptions)
        propertySubscriptions = {}
      }
    }),
  )
}

function applyProperties(
  hasProperty: (key: string) => boolean,
  currentProperties: MergedProperties,
  oldProperties: MergedProperties | undefined,
  subscriptions: PropertySubscriptions,
  setProperty: (key: string, value: unknown) => void,
) {
  const onNew = (key: string) =>
    //subscribe and write property
    (subscriptions[key] = effect(() => setProperty(key, currentProperties.read(key))))
  const onDelete = (key: string) => {
    //remove subscription
    subscriptions[key]?.()
    delete subscriptions[key]
    //read is fine since we execute the compare in "untracked"
    if (oldProperties!.read(key) === undefined) {
      //no need to set to undefined if already was undefined
      return
    }
    //reset property
    setProperty(key, undefined)
  }
  const onChange = (key: string) => {
    //unsubscribe old property
    subscriptions[key]?.()
    onNew(key)
  }
  untracked(() => currentProperties.filterCompare(hasProperty, oldProperties, onNew, onChange, onDelete))
}

function unsubscribeProperties(subscriptions: PropertySubscriptions): void {
  for (const key in subscriptions) {
    subscriptions[key]()
  }
}
