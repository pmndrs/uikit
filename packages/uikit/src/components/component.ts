import { computed, ReadonlySignal, Signal, signal } from '@preact/signals-core'
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
import { BaseOutProperties, InProperties, Properties, PropertiesImplementation } from '../properties/index.js'
import { computedTransformMatrix } from '../transform.js'
import { setupCursorCleanup } from '../hover.js'
import { ClassList, getStarProperties, StyleSheet } from './classes.js'
import { InstancedGlyphMesh } from '../text/index.js'
import { buildRootContext, buildRootMatrix, RenderContext, RootContext } from '../context.js'
import { inheritedPropertyKeys } from '../properties/inheritance.js'
import { LayerIndexInheritance, LayerIndexStarInheritance } from '../properties/layers.js'
import type { Container } from './index.js'

export class Component<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutputProperties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
  NonReactiveProperties = {},
> extends Mesh<
  BufferGeometry,
  Material,
  EventMap & { childadded: { child: Object3D }; childremoved: { child: Object3D } } & T
> {
  private abortController = new AbortController()

  readonly handlers: ReadonlySignal<EventHandlers>
  readonly orderInfo = signal<OrderInfo | undefined>(undefined)
  readonly isVisible: Signal<boolean>
  readonly isClipped: Signal<boolean>
  readonly boundingSphere = new Sphere()
  readonly properties: Properties<OutputProperties>
  readonly starProperties: Properties<OutputProperties>
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
    private inputProperties: InProperties<OutputProperties, NonReactiveProperties> | undefined,
    initialClasses: Array<InProperties<BaseOutProperties<EM>> | string> | undefined,
    material: Material | undefined,
    renderContext: RenderContext | undefined,
    defaults: { [Key in keyof OutputProperties]: OutputProperties[Key] | Signal<OutputProperties[Key]> },
    dynamicHandlers?: Signal<EventHandlers | undefined>,
    hasFocus?: Signal<boolean>,
  ) {
    super(panelGeometry, material)
    this.matrixAutoUpdate = false

    //setting up the parent signal
    const updateParentSignal = () =>
      (this.parentContainer.value = this.parent instanceof Parent ? (this.parent as any) : undefined)
    this.addEventListener('added', updateParentSignal)
    this.addEventListener('removed', updateParentSignal)

    this.root = buildRootContext(this, renderContext)

    //properties
    const conditionals = createConditionals(this.root, this.hoveredList, this.activeList, hasFocus)
    this.properties = new PropertiesImplementation<OutputProperties>(allAliases, conditionals, defaults)
    abortableEffect(() => {
      const parentProprties = this.parentContainer.value?.properties
      const cleanup = parentProprties?.subscribePropertyKeys((key) => {
        if (!inheritedPropertyKeys.includes(key as any)) {
          return
        }
        this.properties.set(
          LayerIndexInheritance,
          key as any,
          parentProprties.signal[key as keyof typeof parentProprties.signal],
        )
      })
      return () => {
        cleanup?.()
        this.properties.setLayer(LayerIndexInheritance, undefined)
      }
    }, this.abortSignal)

    this.starProperties = new PropertiesImplementation<OutputProperties>(allAliases, conditionals)

    abortableEffect(() => {
      const parentStarProprties = this.parentContainer.value?.starProperties
      const cleanup = parentStarProprties?.subscribePropertyKeys((key) => {
        const signal = parentStarProprties.signal[key as keyof typeof parentStarProprties.signal]
        this.starProperties.set(LayerIndexStarInheritance, key as any, signal)
        this.properties.set(LayerIndexStarInheritance, key as any, signal)
      })
      return () => {
        cleanup?.()
        this.properties.setLayer(LayerIndexStarInheritance, undefined)
        this.starProperties.setLayer(LayerIndexStarInheritance, undefined)
      }
    }, this.abortSignal)

    this.internalResetProperties(inputProperties)

    this.classList = new ClassList(this.properties, this.starProperties)
    if (initialClasses != null) {
      this.classList.add(...initialClasses)
    }

    // Reactively apply ID-based classes when id property changes
    let currentIdClass: string | undefined
    abortableEffect(() => {
      const elementId = this.properties.signal.id?.value

      // Remove old ID class if it exists
      if (currentIdClass) {
        this.classList.remove(currentIdClass)
        currentIdClass = undefined
      }

      // Add new ID class if id exists and corresponding style exists
      if (elementId && typeof elementId === 'string') {
        const idClassName = `__id__${elementId}`
        if (idClassName in StyleSheet) {
          this.classList.add(idClassName)
          currentIdClass = idClassName
        }
      }
    }, this.abortSignal)

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

    this.handlers = computedHandlers(this.properties, this.hoveredList, this.activeList, dynamicHandlers)
    this.ancestorsHaveListenersSignal = computedAncestorsHaveListeners(this.parentContainer, this.handlers)

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
      const { value } = this.handlers
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

  updateMatrixWorld() {
    for (const update of this.root.value.onUpdateMatrixWorldSet) {
      update()
    }
  }

  updateWorldMatrix(updateParents: boolean, updateChildren: boolean): void {
    if (updateParents) {
      this.parent?.updateWorldMatrix(true, false)
    }
    this.updateMatrixWorld()
    if (updateChildren) {
      for (const child of this.children) {
        child.updateWorldMatrix(false, true)
      }
    }
  }

  setProperties(inputProperties: InProperties<OutputProperties, NonReactiveProperties>) {
    this.internalResetProperties({
      ...this.inputProperties,
      ...inputProperties,
    })
  }

  resetProperties(inputProperties?: InProperties<OutputProperties, NonReactiveProperties>) {
    this.inputProperties = inputProperties
    this.internalResetProperties(inputProperties)
  }

  protected internalResetProperties(inputProperties?: InProperties<OutputProperties, NonReactiveProperties>) {
    this.properties.setLayersWithConditionals(0, inputProperties)
    this.starProperties.setLayersWithConditionals(0, getStarProperties(inputProperties))
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
    console.log('dispose')
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

export class Parent<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  Properties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
  NonReactiveProperties = {},
> extends Component<T, EM, Properties, NonReactiveProperties> {}
