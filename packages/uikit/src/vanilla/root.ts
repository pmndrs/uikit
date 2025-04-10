import { Camera, Object3D, WebGLRenderer } from 'three'
import { Signal, effect } from '@preact/signals-core'
import { Parent, bindHandlers } from './utils.js'
import { readReactive } from '../utils.js'
import { ThreeEventMap } from '../events.js'
import { createRootState, RootProperties, setupRoot } from '../components/root.js'
import { Layers } from '../properties/layers.js'
import { UikitPropertyKeys } from '../properties/index.js'

export class Root<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Parent<T> {
  private readonly unsubscribe: () => void
  private readonly onFrameSet = new Set<(delta: number) => void>()
  public internals!: ReturnType<typeof createRootState>

  constructor(
    camera: Signal<Camera | undefined> | (() => Camera) | Camera,
    renderer: WebGLRenderer,
    private properties?: RootProperties<EM>,
    requestRender?: () => void,
    requestFrame?: () => void,
  ) {
    super()
    this.matrixAutoUpdate = false
    this.unsubscribe = effect(() => {
      let getCamera: () => Camera
      if (typeof camera === 'function') {
        getCamera = camera
      } else {
        const cam = readReactive(camera)
        if (cam == null) {
          this.contextSignal.value = undefined
          return
        }
        getCamera = () => cam
      }
      const abortController = new AbortController()
      const objectRef = { current: this as Object3D }
      this.internals = createRootState(
        objectRef,
        getCamera,
        renderer,
        this.onFrameSet,
        requestRender ?? (() => {}),
        requestFrame ?? (() => {}),
      )
      this.internals.properties.setLayer(Layers.Imperative, this.properties)
      this.contextSignal.value = this.internals
      super.add(this.internals.interactionPanel)

      setupRoot(this.internals, this, this.childrenContainer, abortController.signal)

      bindHandlers(this.internals.handlers, this, abortController.signal)
      return () => {
        this.onFrameSet.clear()
        this.remove(this.internals.interactionPanel)
        abortController.abort()
      }
    })
  }

  update(delta: number) {
    for (const onFrame of this.onFrameSet) {
      onFrame(delta)
    }
  }

  getComputedProperty<K extends UikitPropertyKeys>(key: K) {
    return this.internals.properties.peek(key)
  }

  setProperties(properties?: RootProperties<EM>) {
    this.properties = properties
    this.internals.properties.setLayer(Layers.Imperative, properties)
  }

  destroy() {
    this.internals.properties.destroy()
    this.parent?.remove(this)
    this.unsubscribe()
  }
}
