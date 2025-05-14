import { computed, Signal, signal } from '@preact/signals-core'
import { EventHandlers, ThreeEventMap } from '../events.js'
import { BufferGeometry, Matrix4, Mesh, MeshBasicMaterial, Object3DEventMap, Sphere, Vector2Tuple } from 'three'
import { abortableEffect } from '../utils.js'
import { computedPanelMatrix, panelGeometry, setupBoundingSphere } from '../panel/index.js'
import {
  buildRaycasting,
  computedAncestorsHaveListeners,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  buildRootMatrix,
  RootContext,
  setupMatrixWorldUpdate,
  setupPointerEvents,
  RenderContext,
  buildRootContext,
} from '../components/index.js'
import { Overflow } from 'yoga-layout'
import { computedIsClipped } from '../clipping.js'
import { FlexNode, Inset } from '../flex/node.js'
import { OrderInfo } from '../order.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { AllProperties, Properties } from '../properties/index.js'
import { computedTransformMatrix } from '../transform.js'
import { setupCursorCleanup } from '../hover.js'
import { Container } from './container.js'
import { Layers } from '../properties/layers.js'

export abstract class Component<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  AdditionalProperties extends {} = {},
  AdditionalDefaults extends {} = {},
> extends Mesh<BufferGeometry, MeshBasicMaterial, EventMap & { childadded: {}; childremoved: {} } & T> {
  readonly isVisible: Signal<boolean>
  readonly orderInfo: Signal<OrderInfo | undefined>
  readonly isClipped: Signal<boolean>
  readonly boundingSphere = new Sphere()
  readonly properties: Properties<EM>
  readonly node: FlexNode
  readonly size = signal<Vector2Tuple | undefined>(undefined)
  readonly relativeCenter = signal<Vector2Tuple | undefined>(undefined)
  readonly borderInset = signal<Inset | undefined>(undefined)
  readonly overflow = signal<Overflow>(Overflow.Visible)
  readonly displayed = signal<boolean>(false)
  readonly scrollable = signal<[boolean, boolean]>([false, false])
  readonly paddingInset = signal<Inset | undefined>(undefined)
  readonly maxScrollPosition = signal<Partial<Vector2Tuple>>([undefined, undefined])
  readonly root: Signal<RootContext>
  readonly parentContainer = signal<Container | undefined>(undefined)
  readonly hoveredList = signal<Array<number>>([])
  readonly activeList = signal<Array<number>>([])
  readonly ancestorsHaveListenersSignal: Signal<boolean>
  readonly globalMatrix: Signal<Matrix4 | undefined>
  readonly globalPanelMatrix: Signal<Matrix4 | undefined>

  private abortController = new AbortController()

  readonly abortSignal = this.abortController.signal

  constructor(
    updateMatrixWorld: 'recursive' | boolean,
    canHaveNonUikitChildren: boolean,
    elementDefaults: AdditionalDefaults,
    private readonly imperativeProperties: AllProperties<EM, AdditionalProperties> | undefined,
    material: MeshBasicMaterial | undefined,
    renderContext: RenderContext | undefined,
  ) {
    super(panelGeometry, material)
    this.matrixAutoUpdate = false

    //setting up the parent signal
    const updateParentSignal = () =>
      (this.parentContainer.value = this.parent instanceof Container ? this.parent : undefined)
    this.addEventListener('added', updateParentSignal)
    this.removeEventListener('removed', updateParentSignal)

    this.root = buildRootContext(this, renderContext)

    //properties
    this.properties = new Properties<EM>(
      allAliases,
      createConditionals(this.root, this.hoveredList, this.activeList),
      computed(() => this.parentContainer.value?.properties),
      elementDefaults,
    )
    this.properties.setLayer(Layers.Imperative, this.imperativeProperties)

    this.node = new FlexNode(this)

    this.globalMatrix = computedGlobalMatrix(
      computed(() => this.parentContainer.value?.childrenMatrix.value ?? buildRootMatrix(this.properties, this.size)),
      computedTransformMatrix(this),
    )

    this.isClipped = computedIsClipped(
      this.parentContainer,
      this.globalMatrix,
      this.size,
      this.properties.getSignal('pixelSize'),
    )
    this.isVisible = computedIsVisible(this, this.isClipped, this.properties)

    this.orderInfo = this.computedOrderInfo()

    const handlers = computedHandlers(this.properties, this.hoveredList, this.activeList)
    this.ancestorsHaveListenersSignal = computedAncestorsHaveListeners(this.parentContainer, handlers)

    this.globalPanelMatrix = computedPanelMatrix(this.properties, this.globalMatrix, this.size, undefined)

    buildRaycasting(this, this.root, this.globalPanelMatrix, this.parentContainer, this.orderInfo)
    setupCursorCleanup(this.hoveredList, this.abortSignal)

    setupBoundingSphere(
      this.boundingSphere,
      this.properties.getSignal('pixelSize'),
      this.globalMatrix,
      this.size,
      this.abortSignal,
    )
    setupPointerEvents(this, canHaveNonUikitChildren)

    setupMatrixWorldUpdate(
      updateMatrixWorld === false ? this.properties.getSignal('updateMatrixWorld') : updateMatrixWorld,
      this,
      this.root,
      this.globalMatrix,
      this.abortSignal,
    )

    abortableEffect(() => {
      const { value } = handlers
      for (const key in value) {
        this.addEventListener(keyToEventName(key as keyof EventHandlers), value[key as keyof EventHandlers] as any)
      }
      return () => {
        for (const key in value) {
          this.removeEventListener(keyToEventName(key as keyof EventHandlers), value[key as keyof EventHandlers] as any)
        }
      }
    }, this.abortSignal)
  }

  protected abstract computedOrderInfo(): Signal<OrderInfo | undefined>

  setClasses(): void {
    //TODO
  }

  addClass(): void {
    //TODO
  }

  removeClass(): void {
    //TODO
  }

  setProperties(properties: AllProperties<EM, AdditionalProperties>) {
    this.properties.setLayer(Layers.Imperative, {
      ...this.imperativeProperties,
      ...properties,
    })
  }

  resetProperties(properties?: AllProperties<EM, AdditionalProperties>) {
    this.properties.setLayer(Layers.Imperative, properties)
  }

  update(delta: number) {
    if (this.root.peek().component != this) {
      //we only call .update on the root component => if not the root component return
      return
    }
    for (const onFrame of this.root.peek().onFrameSet) {
      onFrame(delta)
    }
  }

  dispose(): void {
    this.abortController.abort()
  }
}

function keyToEventName(key: keyof EventHandlers) {
  return key.slice(2).toLowerCase() as keyof EventMap
}

export type EventMap = Object3DEventMap & {
  [Key in keyof EventHandlers as Lowercase<Key extends `on${infer K}` ? K : never>]-?: Parameters<
    Exclude<EventHandlers[Key], undefined>
  >[0]
}
