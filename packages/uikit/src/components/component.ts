import { computed, Signal, signal } from '@preact/signals-core'
import { EventHandlers, ThreeEventMap } from '../events.js'
import { BufferGeometry, Material, Matrix4, Mesh, Object3D, Object3DEventMap, Sphere, Vector2Tuple } from 'three'
import {
  abortableEffect,
  buildRaycasting,
  computedAncestorsHaveListeners,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  setupPointerEvents,
} from '../utils.js'
import { computedPanelMatrix, InstancedPanelMesh, panelGeometry, setupBoundingSphere } from '../panel/index.js'
import { Overflow } from 'yoga-layout'
import { computedIsClipped } from '../clipping.js'
import { FlexNode, Inset } from '../flex/node.js'
import { OrderInfo } from '../order.js'
import { allAliases } from '../properties/alias.js'
import { createConditionals } from '../properties/conditional.js'
import { BaseOutputProperties, InputProperties, Properties, PropertiesImplementation } from '../properties/index.js'
import { computedTransformMatrix } from '../transform.js'
import { setupCursorCleanup } from '../hover.js'
import { Container } from './container.js'
import { ClassList } from './classes.js'
import { InstancedGlyphMesh } from '../text/index.js'
import { buildRootContext, buildRootMatrix, RenderContext, RootContext } from '../context.js'

export class Component<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutputProperties extends BaseOutputProperties<EM> = BaseOutputProperties<EM>,
> extends Mesh<
  BufferGeometry,
  Material,
  EventMap & { childadded: { child: Object3D }; childremoved: { child: Object3D } } & T
> {
  private abortController = new AbortController()

  readonly orderInfo = signal<OrderInfo | undefined>(undefined)
  readonly isVisible: Signal<boolean>
  readonly isClipped: Signal<boolean>
  readonly boundingSphere = new Sphere()
  readonly properties: Properties<OutputProperties>
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
  readonly abortSignal = this.abortController.signal
  readonly classList: ClassList

  constructor(
    hasNonUikitChildren: boolean,
    private inputProperties: InputProperties<OutputProperties> | undefined,
    initialClasses: Array<InputProperties<BaseOutputProperties<EM>> | string> | undefined,
    material: Material | undefined,
    renderContext: RenderContext | undefined,
    defaults: { [Key in keyof OutputProperties]: OutputProperties[Key] | Signal<OutputProperties[Key]> },
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
    this.properties = new PropertiesImplementation<OutputProperties>(
      allAliases,
      createConditionals(this.root, this.hoveredList, this.activeList),
      computed(() => this.parentContainer.value?.properties as Properties<OutputProperties> | undefined),
      defaults,
    )
    this.resetProperties(inputProperties)

    this.classList = new ClassList(this.properties)
    if (initialClasses != null) {
      this.classList.add(...initialClasses)
    }

    this.node = new FlexNode(this)

    this.globalMatrix = computedGlobalMatrix(
      computed(() => this.parentContainer.value?.childrenMatrix.value ?? buildRootMatrix(this.properties, this.size)),
      computedTransformMatrix(this),
    )

    this.isClipped = computedIsClipped(
      this.parentContainer,
      this.globalMatrix,
      this.size,
      this.properties.signal.pixelSize,
    )
    this.isVisible = computedIsVisible(this, this.isClipped, this.properties)

    const handlers = computedHandlers(this.properties, this.hoveredList, this.activeList)
    this.ancestorsHaveListenersSignal = computedAncestorsHaveListeners(this.parentContainer, handlers)

    this.globalPanelMatrix = computedPanelMatrix(this.properties, this.globalMatrix, this.size, undefined)

    buildRaycasting(this, this.root, this.globalPanelMatrix, this.parentContainer, this.orderInfo)
    setupCursorCleanup(this.hoveredList, this.abortSignal)

    setupBoundingSphere(
      this.boundingSphere,
      this.properties.signal.pixelSize,
      this.globalMatrix,
      this.size,
      this.abortSignal,
    )
    setupPointerEvents(this, hasNonUikitChildren)

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

    if (!hasNonUikitChildren) {
      //only uikit children allowed - throw when non uikit child is added
      const listener = ({ child }: { child: Object3D }) => {
        if (child instanceof Component || child instanceof InstancedPanelMesh || child instanceof InstancedGlyphMesh) {
          return
        }
        throw new Error(
          `Only pmndrs/uikit components can be added as children to this component. Got ${child.constructor.name} instead.`,
        )
      }
      this.addEventListener('childadded', listener)
      this.abortSignal.addEventListener('abort', () => this.removeEventListener('childadded', listener))
    }
  }

  setProperties(inputProperties: InputProperties<OutputProperties>) {
    this.resetProperties({
      ...this.inputProperties,
      ...inputProperties,
    })
  }

  resetProperties(inputProperties?: InputProperties<OutputProperties>) {
    this.inputProperties = inputProperties
    this.properties.setLayersWithConditionals(0, this.inputProperties)
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
