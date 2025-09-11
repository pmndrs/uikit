import { computed, ReadonlySignal, Signal, signal } from '@preact/signals-core'
import { EventHandlers, ThreeEventMap } from '../events.js'
import {
  BufferGeometry,
  Intersection,
  Material,
  Matrix4,
  Mesh,
  Object3D,
  Object3DEventMap,
  Raycaster,
  Sphere,
  Vector2Tuple,
} from 'three'
import {
  abortableEffect,
  computedAncestorsHaveListeners,
  computedGlobalMatrix,
  computedHandlers,
  computedIsVisible,
  computeMatrixWorld,
  setupPointerEvents,
} from '../utils.js'
import {
  computedPanelMatrix,
  InstancedPanelMesh,
  makeClippedCast,
  makePanelSpherecast,
  panelGeometry,
  setupBoundingSphere,
} from '../panel/index.js'
import { Overflow } from 'yoga-layout/load'
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
import { Container } from './index.js'
import { componentDefaults } from '../properties/defaults.js'
import { getLayerIndex } from '../properties/layer.js'

const IdentityMatrix = new Matrix4()
const sphereHelper = new Sphere()

export class Component<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  OutProperties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
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
  readonly properties: Properties<OutProperties>
  readonly starProperties: Properties<OutProperties>
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
    private inputProperties?: InProperties<OutProperties>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: {
      material?: Material
      renderContext?: RenderContext
      dynamicHandlers?: Signal<EventHandlers | undefined>
      hasFocus?: Signal<boolean>
      defaultOverrides?: InProperties<OutProperties>
      hasNonUikitChildren?: boolean
      defaults?: OutProperties
    },
  ) {
    super(panelGeometry, config?.material)
    this.matrixAutoUpdate = false

    //setting up the parent signal
    const updateParentState = () => {
      this.parentContainer.value = this.parent instanceof Container ? (this.parent as Container) : undefined
      ;(this.properties as PropertiesImplementation<OutProperties>).setEnabled(this.parent != null)
      ;(this.starProperties as PropertiesImplementation<OutProperties>).setEnabled(this.parent != null)
    }
    this.addEventListener('added', updateParentState)
    this.addEventListener('removed', updateParentState)

    this.root = buildRootContext(this, config?.renderContext)

    //properties
    const conditionals = createConditionals(this.root, this.hoveredList, this.activeList, config?.hasFocus)
    this.properties = new PropertiesImplementation<OutProperties>(
      allAliases,
      conditionals,
      config?.defaults ?? (componentDefaults as OutProperties),
    )
    this.properties.setLayersWithConditionals({ type: 'default-overrides' }, {
      width: computed(() => {
        const sizeX = this.properties.value.sizeX
        if (sizeX == null) {
          return undefined
        }
        return sizeX / this.properties.value.pixelSize
      }),
      height: computed(() => {
        const sizeY = this.properties.value.sizeY
        if (sizeY == null) {
          return undefined
        }
        return sizeY / this.properties.value.pixelSize
      }),
      ...config?.defaultOverrides,
    } as InProperties<OutProperties>)
    abortableEffect(() => {
      const parentProprties = this.parentContainer.value?.properties
      const layerIndex = getLayerIndex({ type: 'inheritance' })
      const cleanup = parentProprties?.subscribePropertyKeys((key) => {
        if (!inheritedPropertyKeys.includes(key as any)) {
          return
        }
        this.properties.set(layerIndex, key as any, parentProprties.signal[key as keyof typeof parentProprties.signal])
      })
      return () => {
        cleanup?.()
        this.properties.setLayer(layerIndex, undefined)
      }
    }, this.abortSignal)

    this.starProperties = new PropertiesImplementation<OutProperties>(allAliases, conditionals)
    this.starProperties.setLayersWithConditionals(
      { type: 'default-overrides' },
      getStarProperties(config?.defaultOverrides),
    )

    abortableEffect(() => {
      const parentStarProprties = this.parentContainer.value?.starProperties
      const layerIndex = getLayerIndex({ type: 'star-inheritance' })
      const cleanup = parentStarProprties?.subscribePropertyKeys((key) => {
        const signal = parentStarProprties.signal[key as keyof typeof parentStarProprties.signal]
        this.starProperties.set(layerIndex, key as any, signal)
        this.properties.set(layerIndex, key as any, signal)
      })
      return () => {
        cleanup?.()
        this.properties.setLayer(layerIndex, undefined)
        this.starProperties.setLayer(layerIndex, undefined)
      }
    }, this.abortSignal)

    this.resetProperties(inputProperties)

    this.classList = new ClassList(this.properties, this.starProperties)
    if (initialClasses != null) {
      this.classList.add(...initialClasses)
    }

    // Reactively apply ID-based classes when id property changes
    let currentIdClass: string | undefined
    abortableEffect(() => {
      const elementId = this.properties.value.id

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

    this.handlers = computedHandlers(this.properties, this.hoveredList, this.activeList, config?.dynamicHandlers)
    this.ancestorsHaveListenersSignal = computedAncestorsHaveListeners(this.parentContainer, this.handlers)

    this.globalPanelMatrix = computedPanelMatrix(this.properties, this.globalMatrix, this.size, undefined)

    this.raycast = makeClippedCast(this, this.raycast.bind(this), this.root, this.parentContainer, this.orderInfo)
    this.spherecast = makeClippedCast(
      this,
      makePanelSpherecast(this.root, this.boundingSphere, this.globalPanelMatrix, this),
      this.root,
      this.parentContainer,
      this.orderInfo,
    )
    setupCursorCleanup(this.hoveredList, this.abortSignal)

    setupBoundingSphere(
      this.boundingSphere,
      this.properties.signal.pixelSize,
      this.globalMatrix,
      this.size,
      this.abortSignal,
    )
    const hasNonUikitChildren = config?.hasNonUikitChildren ?? true
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

  raycast(raycaster: Raycaster, intersects: Intersection[]): unknown {
    //TODO: enable configuring the return value
    const rootParentMatrixWorld = this.root.peek().component.parent?.matrixWorld ?? IdentityMatrix
    sphereHelper.copy(this.boundingSphere).applyMatrix4(rootParentMatrixWorld)
    if (
      !raycaster.ray.intersectsSphere(sphereHelper) ||
      !computeMatrixWorld(this.matrixWorld, rootParentMatrixWorld, this.globalPanelMatrix.peek())
    ) {
      return false
    }

    super.raycast(raycaster, intersects)
    return false
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

  setProperties(inputProperties: InProperties<OutProperties>) {
    this.resetProperties({
      ...this.inputProperties,
      ...inputProperties,
    })
  }

  resetProperties(inputProperties?: InProperties<OutProperties>) {
    this.inputProperties = inputProperties
    this.properties.setLayersWithConditionals({ type: 'base' }, inputProperties)
    this.starProperties.setLayersWithConditionals({ type: 'base' }, getStarProperties(inputProperties))
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

export class Parent<
  T = {},
  EM extends ThreeEventMap = ThreeEventMap,
  Properties extends BaseOutProperties<EM> = BaseOutProperties<EM>,
> extends Component<T, EM, Properties> {}
