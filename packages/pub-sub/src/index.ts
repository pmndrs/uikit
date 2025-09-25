import { batch, effect, Signal, untracked } from '@preact/signals-core'

type PropertyState = { layerIndex: number; cleanup?: () => void; signal: Signal<any> }

export type GetSignal<T> = T extends Signal<infer K> ? K : T

export type NotUndefined<T> = T extends undefined ? never : T

export type ReadonlyProperties<Out> = {
  get value(): Out
  peek(): Out
  get signal(): { [Key in keyof Out]-?: Signal<Out[Key]> }
  /**
   * allows to subcribe to all the current and new property keys
   * @param callback is called immediately for all the current property keys
   */
  subscribePropertyKeys(callback: (key: string | symbol | number) => void): () => void
}

export type Properties<In, Out extends object> = ReadonlyProperties<Out> & {
  destroy(): void
  set<K extends keyof In>(layerIndex: number, key: K, value: In[K]): void
  setLayer(index: number, value: Partial<In> | undefined): void
}

export class PropertiesImplementation<In, Out extends object> implements Properties<In, Out> {
  private enabled = false

  readonly value = new Proxy<Out>({} as any, { get: (_target, key) => this.getSignal(key as keyof Out).value })
  readonly signal = new Proxy<{ [Key in keyof Out]-?: Signal<Out[Key]> }>({} as any, {
    get: (_target, key) => this.getSignal(key as keyof Out),
  })
  readonly peekProxy = new Proxy<Out>({} as any, { get: (_target, key) => this.peekValue(key as keyof Out) })

  private propertyStateMap = {} as Record<keyof Out, PropertyState>
  protected propertiesLayers = new Map<number, Record<keyof Out, any>>()
  private propertyKeys: Array<keyof Out>

  private propertyKeySubscriptions = new Set<(key: keyof Out) => void>()

  constructor(
    private readonly apply: <K1 extends keyof In>(
      key: K1,
      value: In[K1],
      set: <K2 extends keyof Out>(key: K2, value: Out[K2] | Signal<Out[K2]>) => void,
      layerIndex: number,
    ) => void,
    private readonly defaults?: { [Key in keyof Out]: Out[Key] | Signal<Out[Key]> },
    private readonly onLayerIndicesChanged?: () => void,
  ) {
    this.propertyKeys = defaults == null ? [] : (Array.from(Object.keys(defaults)) as Array<keyof Out>)
  }

  peek() {
    return this.peekProxy
  }

  subscribePropertyKeys(callback: (key: string | symbol | number) => void): () => void {
    for (const key of this.propertyKeys) {
      callback(key)
    }
    this.propertyKeySubscriptions.add(callback)
    return () => this.propertyKeySubscriptions.delete(callback)
  }

  private clearProvidedLayer(layer: Record<keyof Out, any>, index: number) {
    this.propertiesLayers.delete(index)
    for (const key in layer) {
      const value = layer[key]
      if (value === undefined) {
        continue
      }
      const propertyState = this.propertyStateMap[key]
      if (propertyState == null) {
        //no one is reading
        continue
      }
      propertyState.cleanup?.()
      propertyState.cleanup = undefined
      if (propertyState.layerIndex != index) {
        //we have not published the value from this layer
        continue
      }
      //no need to check if we are enabled, because if we are not enabled, the layerIndex is Number.MAX_SAFE_INTEGER, which makes the previous "if" already continue
      this.update(key, propertyState)
    }
  }

  setLayer(index: number, value: Partial<In> | undefined) {
    let layer = this.propertiesLayers.get(index)
    const isNewLayer = layer == null
    batch(() => {
      if (layer != null) {
        this.clearProvidedLayer(layer, index)
      }
      if (value === undefined) {
        return
      }
      this.propertiesLayers.set(index, (layer = {} as Record<keyof Out, any>))
      const entries = Object.entries(value as any)
      for (const [key, value] of entries) {
        this.apply(key as keyof In, value as In[keyof In], this.setProperty.bind(this, layer, index), index)
      }
    })
    if (isNewLayer) {
      this.onLayerIndicesChanged?.()
    }
  }

  private getSignal<K extends keyof Out>(key: K): Signal<Out[K]> {
    let propertyState = this.propertyStateMap[key]
    if (propertyState == null) {
      this.propertyStateMap[key] = propertyState = {
        signal: new Signal(),
        layerIndex: null as any, //will be set by update immediately
      }
      this.update(key, propertyState)
    }
    return propertyState.signal
  }

  private peekValue<K extends keyof Out>(key: K): Out[K] {
    let propertyState = this.propertyStateMap[key]
    if (propertyState != null) {
      return propertyState.signal.peek()
    }
    const defaultValue = this.defaults?.[key]
    const layerIndices = Array.from(this.propertiesLayers.keys()).sort((a, b) => a - b)
    const [result] = untracked(() => selectLayerValue(0, layerIndices, this.propertiesLayers, key, defaultValue)!)
    return result
  }

  set<K extends keyof In>(layerIndex: number, key: K, value: In[K]): void {
    let propertiesLayer = this.propertiesLayers.get(layerIndex)
    if (propertiesLayer == null) {
      this.propertiesLayers.set(layerIndex, (propertiesLayer = {} as Record<keyof Out, any>))
    }
    this.apply(key, value, this.setProperty.bind(this, propertiesLayer, layerIndex), layerIndex)
  }

  private setProperty(propertiesLayer: Record<keyof Out, any>, layerIndex: number, key: keyof Out, value: any) {
    if (!this.propertyKeys.includes(key)) {
      this.propertyKeys.push(key)
      for (const callback of this.propertyKeySubscriptions) {
        callback(key)
      }
    }
    if (propertiesLayer[key] === value) {
      //unchanged
      return
    }
    propertiesLayer[key] = value
    const propertyState = this.propertyStateMap[key]
    if (propertyState == null) {
      //no one listens
      return
    }
    if (propertyState.layerIndex != null && layerIndex > propertyState.layerIndex) {
      //current value has higher prescedence
      return
    }
    if (!this.enabled) {
      //no need to run update, since the value change has no effect while enabled is `false`
      return
    }
    this.update(key, propertyState)
  }

  private update(key: keyof Out, target: PropertyState): void {
    target.cleanup?.()
    target.cleanup = undefined
    const defaultValue = this.defaults?.[key]
    let result: readonly [any, number] | undefined
    if (this.enabled) {
      result = selectLayerValue(
        0,
        Array.from(this.propertiesLayers.keys()).sort((a, b) => a - b),
        this.propertiesLayers,
        key,
        defaultValue,
        (layerIndex) =>
          (target.cleanup = effect(() => {
            const [value, index] = selectLayerValue(
              layerIndex,
              Array.from(this.propertiesLayers.keys()).sort((a, b) => a - b),
              this.propertiesLayers,
              key,
              defaultValue,
            )!
            target.signal.value = value
            target.layerIndex = index
          })),
      )
    } else if (defaultValue instanceof Signal) {
      result = [defaultValue.peek(), Infinity]
    } else {
      result = [defaultValue, Number.MAX_SAFE_INTEGER]
    }
    if (result == null) {
      return
    }
    const [value, index] = result
    target.signal.value = value
    target.layerIndex = index
  }

  setEnabled(enabled: boolean) {
    if (this.enabled === enabled) {
      return
    }
    this.enabled = enabled
    this.updateAll()
  }

  private updateAll() {
    for (const key in this.propertyStateMap) {
      this.update(key, this.propertyStateMap[key])
    }
  }

  destroy() {
    for (const key in this.propertyStateMap) {
      this.propertyStateMap[key].cleanup?.()
    }
    this.propertyStateMap = {} as Record<keyof Out, PropertyState>
    this.propertyKeySubscriptions.clear()
  }
}

function selectLayerValue(
  startLayerIndex: number,
  sortedLayerIndexArray: Array<number>,
  propertiesLayers: Map<number, Record<string, any>>,
  key: any,
  defaultValue: any,
  onSignal?: (layerIndex: number) => void,
): [value: any, layerIndex: number] | undefined {
  let value: any
  let layerIndex: number
  const layerIndicies = sortedLayerIndexArray[Symbol.iterator]()
  do {
    layerIndex = layerIndicies.next().value ?? Number.MAX_SAFE_INTEGER
    if (layerIndex < startLayerIndex) {
      continue
    }
    value = layerIndex === Number.MAX_SAFE_INTEGER ? defaultValue : propertiesLayers.get(layerIndex)![key]
    if (typeof value === 'object' && value instanceof Signal) {
      if (onSignal != null) {
        onSignal(layerIndex)
        return undefined
      }
      value = value.value
    }
    if (value !== undefined) {
      break
    }
  } while (layerIndex != Number.MAX_SAFE_INTEGER)
  if (value === 'initial') {
    value = defaultValue
  }
  return [value, layerIndex]
}
