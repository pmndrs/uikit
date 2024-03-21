import { Object3D, Vector2Tuple } from 'three'
import { Signal, batch, computed, effect, signal } from '@preact/signals-core'
import { Edge, Node, Yoga, Overflow, MeasureFunction } from 'yoga-layout/wasm-async'
import { setter } from './setter.js'
import { Subscriptions } from '../utils.js'
import { setupImmediateProperties } from '../properties/immediate.js'
import { MergedProperties } from '../properties/merged.js'
import { Object3DRef } from '../context.js'

export type YogaProperties = {
  [Key in keyof typeof setter]?: Parameters<(typeof setter)[Key]>[2]
}

export type Inset = [top: number, right: number, bottom: number, left: number]

function hasImmediateProperty(key: string): boolean {
  if (key === 'measureFunc') {
    return true
  }
  return key in setter
}

export class FlexNode {
  public readonly relativeCenter = signal<Vector2Tuple>([0, 0])
  public readonly borderInset = signal<Inset>([0, 0, 0, 0])
  public readonly paddingInset = signal<Inset>([0, 0, 0, 0])
  public readonly overflow = signal<Overflow>(Overflow.Visible)
  public readonly maxScrollPosition = signal<Partial<Vector2Tuple>>([undefined, undefined])
  public readonly scrollable = signal<[boolean, boolean]>([false, false])

  private children: Array<FlexNode> = []
  private yogaNode: Node | undefined
  private unsubscribeYoga?: () => void

  private layoutChangeListeners = new Set<() => void>()

  public requestCalculateLayout: () => void

  private active = signal(false)

  constructor(
    propertiesSignal: Signal<MergedProperties>,
    public readonly size = signal<Vector2Tuple>([0, 0]),
    private object: Object3DRef,
    public readonly yoga: Signal<Yoga | undefined>,
    private precision: number,
    requestCalculateLayout: (node: FlexNode) => void,
    public readonly anyAncestorScrollable: Signal<[boolean, boolean]> | undefined,
    subscriptions: Subscriptions,
    renameOutput?: Record<string, string>,
  ) {
    this.requestCalculateLayout = () => requestCalculateLayout(this)
    this.unsubscribeYoga = effect(() => {
      if (yoga.value == null) {
        return
      }
      this.unsubscribeYoga?.()
      this.unsubscribeYoga = undefined
      this.yogaNode = yoga.value.Node.create()
      this.active.value = true
    })
    setupImmediateProperties(
      propertiesSignal,
      this.active,
      hasImmediateProperty,
      (key: string, value: unknown) => {
        if (key === 'measureFunc') {
          setMeasureFunc(this.yogaNode!, this.precision, value as any)
        } else {
          setter[key as keyof typeof setter](this.yogaNode!, this.precision, value as any)
        }
        this.requestCalculateLayout()
      },
      subscriptions,
      renameOutput,
    )
  }

  destroy() {
    this.unsubscribeYoga?.()
    this.yogaNode?.free()
  }

  /**
   * use requestCalculateLayout instead
   */
  calculateLayout(): void {
    if (this.yogaNode == null) {
      return
    }
    this.commit()
    this.yogaNode.calculateLayout()
    batch(() => this.updateMeasurements(undefined, undefined))
  }

  createChild(propertiesSignal: Signal<MergedProperties>, object: Object3DRef, subscriptions: Subscriptions): FlexNode {
    const child = new FlexNode(
      propertiesSignal,
      undefined,
      object,
      this.yoga,
      this.precision,
      this.requestCalculateLayout,
      computed(() => {
        const [ancestorX, ancestorY] = this.anyAncestorScrollable?.value ?? [false, false]
        const [x, y] = this.scrollable.value
        return [ancestorX || x, ancestorY || y]
      }),
      subscriptions,
    )
    return child
  }

  addChild(node: FlexNode): void {
    this.requestCalculateLayout()
    this.children.push(node)
  }

  removeChild(node: FlexNode): void {
    const i = this.children.indexOf(node)
    if (i === -1) {
      return
    }
    this.children.splice(i, 1)
    this.requestCalculateLayout()
  }

  commit(): void {
    if (this.yogaNode == null) {
      throw new Error(`commit cannot be called without a yoga node`)
    }

    //commiting the children
    let groupChildren: Array<Object3D> | undefined
    this.children.sort((child1, child2) => {
      groupChildren ??= child1.object.current?.parent?.children
      if (groupChildren == null) {
        return 0
      }
      const group1 = child1.object.current
      const group2 = child2.object.current
      if (group1 == null || group2 == null) {
        return 0
      }
      const i1 = groupChildren.indexOf(group1)
      if (i1 === -1) {
        throw new Error(`parent mismatch`)
      }
      const i2 = groupChildren.indexOf(group2)
      if (i2 === -1) {
        throw new Error(`parent mismatch`)
      }
      return i1 - i2
    })
    let i = 0
    let oldChildNode: Node | undefined = this.yogaNode.getChild(i)
    let correctChild: FlexNode | undefined = this.children[i]
    while (correctChild != null || oldChildNode != null) {
      if (
        correctChild != null &&
        oldChildNode != null &&
        yogaNodeEqual(oldChildNode, assertNodeNotNull(correctChild.yogaNode))
      ) {
        correctChild = this.children[++i]
        oldChildNode = this.yogaNode.getChild(i)
        continue
      }

      //either remove, insert, or replace

      if (oldChildNode != null) {
        //either remove or replace
        this.yogaNode.removeChild(oldChildNode)
      }

      if (correctChild != null) {
        //either insert or replace
        const node = assertNodeNotNull(correctChild.yogaNode)
        node.getParent()?.removeChild(node)
        this.yogaNode.insertChild(node, i)
        correctChild = this.children[++i]
      }

      //the yoga node MUST be updated via getChild even for insert since the returned value is somehow bound to the index
      oldChildNode = this.yogaNode.getChild(i)
    }

    //recursively executing commit in children
    const childrenLength = this.children.length
    for (let i = 0; i < childrenLength; i++) {
      this.children[i].commit()
    }
  }

  updateMeasurements(parentWidth: number | undefined, parentHeight: number | undefined): Vector2Tuple {
    if (this.yogaNode == null) {
      throw new Error(`update measurements cannot be called without a yoga node`)
    }

    this.overflow.value = this.yogaNode.getOverflow()

    const width = this.yogaNode.getComputedWidth() * this.precision
    const height = this.yogaNode.getComputedHeight() * this.precision
    updateVector2Signal(this.size, width, height)

    parentWidth ??= width
    parentHeight ??= height

    const x = this.yogaNode.getComputedLeft() * this.precision
    const y = this.yogaNode.getComputedTop() * this.precision

    const relativeCenterX = x + width * 0.5 - parentWidth * 0.5
    const relativeCenterY = -(y + height * 0.5 - parentHeight * 0.5)
    updateVector2Signal(this.relativeCenter, relativeCenterX, relativeCenterY)

    const paddingTop = this.yogaNode.getComputedPadding(Edge.Top) * this.precision
    const paddingLeft = this.yogaNode.getComputedPadding(Edge.Left) * this.precision
    const paddingRight = this.yogaNode.getComputedPadding(Edge.Right) * this.precision
    const paddingBottom = this.yogaNode.getComputedPadding(Edge.Bottom) * this.precision
    updateInsetSignal(this.paddingInset, paddingTop, paddingRight, paddingBottom, paddingLeft)

    const borderTop = this.yogaNode.getComputedBorder(Edge.Top) * this.precision
    const borderRight = this.yogaNode.getComputedBorder(Edge.Right) * this.precision
    const borderBottom = this.yogaNode.getComputedBorder(Edge.Bottom) * this.precision
    const borderLeft = this.yogaNode.getComputedBorder(Edge.Left) * this.precision
    updateInsetSignal(this.borderInset, borderTop, borderRight, borderBottom, borderLeft)

    for (const layoutChangeListener of this.layoutChangeListeners) {
      layoutChangeListener()
    }

    const childrenLength = this.children.length
    let maxContentWidth = 0
    let maxContentHeight = 0
    for (let i = 0; i < childrenLength; i++) {
      const [contentWidth, contentHeight] = this.children[i].updateMeasurements(width, height)
      maxContentWidth = Math.max(maxContentWidth, contentWidth)
      maxContentHeight = Math.max(maxContentHeight, contentHeight)
    }

    maxContentWidth -= borderLeft
    maxContentHeight -= borderTop

    if (this.overflow.value === Overflow.Scroll) {
      maxContentWidth += paddingRight
      maxContentHeight += paddingLeft

      const widthWithoutBorder = width - borderLeft - borderRight
      const heightWithoutBorder = height - borderTop - borderBottom

      const maxScrollX = maxContentWidth - widthWithoutBorder
      const maxScrollY = maxContentHeight - heightWithoutBorder

      updateVector2Signal(
        this.maxScrollPosition,
        maxScrollX <= 0 ? undefined : maxScrollX,
        maxScrollY <= 0 ? undefined : maxScrollY,
      )
      updateVector2Signal(this.scrollable, maxScrollX > 0, maxScrollY > 0)
    } else {
      updateVector2Signal(this.maxScrollPosition, undefined, undefined)
      updateVector2Signal(this.scrollable, false, false)
    }

    const overflowVisible = this.overflow.value === Overflow.Visible

    return [
      x + Math.max(width, overflowVisible ? maxContentWidth : 0),
      y + Math.max(height, overflowVisible ? maxContentHeight : 0),
    ]
  }

  addLayoutChangeListener(listener: () => void) {
    this.layoutChangeListeners.add(listener)
    return () => void this.layoutChangeListeners.delete(listener)
  }
}

function updateVector2Signal<T extends Partial<[unknown, unknown]>>(signal: Signal<T>, x: T[0], y: T[1]): void {
  const [oldX, oldY] = signal.value
  if (oldX === x && oldY === y) {
    return
  }
  signal.value = [x, y] as any
}

function updateInsetSignal(signal: Signal<Inset>, top: number, right: number, bottom: number, left: number): void {
  const [oldTop, oldRight, oldBottom, oldLeft] = signal.value
  if (oldTop == top && oldRight == right && oldBottom == bottom && oldLeft == left) {
    return
  }
  signal.value = [top, right, bottom, left]
}

function assertNodeNotNull<T>(val: T | undefined): T {
  if (val == null) {
    throw new Error(`commit cannot be called with a children that miss a yoga node`)
  }
  return val
}

function yogaNodeEqual(n1: Node, n2: Node): boolean {
  return (n1 as any)['L'] === (n2 as any)['L']
}

function setMeasureFunc(node: Node, precision: number, func: MeasureFunction | undefined): void {
  if (func == null) {
    node.setMeasureFunc(null)
    return
  }
  node.setMeasureFunc((width, wMode, height, hMode) => {
    const result = func(width * precision, wMode, height * precision, hMode)
    return {
      width: Math.ceil(Math.ceil(result.width) / precision),
      height: Math.ceil(Math.ceil(result.height) / precision),
    }
  })
  node.markDirty()
}
