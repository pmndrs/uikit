import { Object3D, Vector2Tuple } from 'three'
import { Signal, batch, computed, effect, signal } from '@preact/signals-core'
import Yoga, { Edge, MeasureFunction, Node, Overflow } from 'yoga-layout'
import { setter } from './setter.js'
import { Subscriptions } from '../utils.js'
import { setupImmediateProperties } from '../properties/immediate.js'
import { MergedProperties } from '../properties/merged.js'
import { Object3DRef } from '../context.js'
import { PointScaleFactor, defaultYogaConfig } from './config.js'

export type YogaProperties = {
  [Key in keyof typeof setter]?: Parameters<(typeof setter)[Key]>[1]
}

export type Inset = [top: number, right: number, bottom: number, left: number]

function hasImmediateProperty(key: string): boolean {
  if (key === 'measureFunc') {
    return true
  }
  return key in setter
}

export type FlexNodeState = ReturnType<typeof createFlexNodeState>

export function createFlexNodeState() {
  const scrollable = signal<[boolean, boolean]>([false, false])
  return {
    size: signal<Vector2Tuple | undefined>(undefined),
    relativeCenter: signal<Vector2Tuple | undefined>(undefined),
    borderInset: signal<Inset | undefined>(undefined),
    overflow: signal<Overflow>(Overflow.Visible),
    scrollable,
    paddingInset: signal<Inset | undefined>(undefined),
    maxScrollPosition: signal<Partial<Vector2Tuple>>([undefined, undefined]),
  }
}

export class FlexNode {
  private children: Array<FlexNode> = []
  private yogaNode: Node | undefined

  private layoutChangeListeners = new Set<() => void>()

  private active = signal(false)

  constructor(
    private state: FlexNodeState,
    propertiesSignal: Signal<MergedProperties>,
    private readonly requestCalculateLayout: () => void,
    private object: Object3DRef,
    subscriptions: Subscriptions,
  ) {
    this.yogaNode = Yoga.Node.create(defaultYogaConfig)
    this.active.value = true
    subscriptions.push(() => {
      this.yogaNode?.getParent()?.removeChild(this.yogaNode)
      this.yogaNode?.free()
    })
    setupImmediateProperties(
      propertiesSignal,
      this.active,
      hasImmediateProperty,
      (key: string, value: unknown) => {
        setter[key as keyof typeof setter](this.yogaNode!, value as any)
        this.requestCalculateLayout()
      },
      subscriptions,
    )
  }

  setMeasureFunc(func: Signal<MeasureFunction | undefined>) {
    if (!this.active.value) {
      return
    }
    if (func.value == null) {
      this.yogaNode!.setMeasureFunc(null)
      return
    }
    const fn = func.value
    this.yogaNode!.setMeasureFunc((width, wMode, height, hMode) => {
      const result = fn(width, wMode, height, hMode)
      return {
        width: Math.ceil(result.width * PointScaleFactor + 1) / PointScaleFactor,
        height: Math.ceil(result.height * PointScaleFactor + 1) / PointScaleFactor,
      }
    })
    this.yogaNode!.markDirty()
    this.requestCalculateLayout()
  }

  /**
   * use requestCalculateLayout instead
   */
  calculateLayout(): void {
    if (this.yogaNode == null) {
      return
    }
    this.commit()
    this.yogaNode.calculateLayout(undefined, undefined)
    batch(() => this.updateMeasurements(undefined, undefined))
  }

  addChild(node: FlexNode): void {
    this.children.push(node)
    this.requestCalculateLayout()
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

    this.state.overflow.value = this.yogaNode.getOverflow()

    const width = this.yogaNode.getComputedWidth()
    const height = this.yogaNode.getComputedHeight()
    updateVector2Signal(this.state.size, width, height)

    parentWidth ??= width
    parentHeight ??= height

    const x = this.yogaNode.getComputedLeft()
    const y = this.yogaNode.getComputedTop()

    const relativeCenterX = x + width * 0.5 - parentWidth * 0.5
    const relativeCenterY = -(y + height * 0.5 - parentHeight * 0.5)
    updateVector2Signal(this.state.relativeCenter, relativeCenterX, relativeCenterY)

    const paddingTop = this.yogaNode.getComputedPadding(Edge.Top)
    const paddingLeft = this.yogaNode.getComputedPadding(Edge.Left)
    const paddingRight = this.yogaNode.getComputedPadding(Edge.Right)
    const paddingBottom = this.yogaNode.getComputedPadding(Edge.Bottom)
    updateInsetSignal(this.state.paddingInset, paddingTop, paddingRight, paddingBottom, paddingLeft)

    const borderTop = this.yogaNode.getComputedBorder(Edge.Top)
    const borderRight = this.yogaNode.getComputedBorder(Edge.Right)
    const borderBottom = this.yogaNode.getComputedBorder(Edge.Bottom)
    const borderLeft = this.yogaNode.getComputedBorder(Edge.Left)
    updateInsetSignal(this.state.borderInset, borderTop, borderRight, borderBottom, borderLeft)

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

    if (this.state.overflow.value === Overflow.Scroll) {
      maxContentWidth += paddingRight
      maxContentHeight += paddingLeft

      const widthWithoutBorder = width - borderLeft - borderRight
      const heightWithoutBorder = height - borderTop - borderBottom

      const maxScrollX = maxContentWidth - widthWithoutBorder
      const maxScrollY = maxContentHeight - heightWithoutBorder

      const xScrollable = maxScrollX > 0.5
      const yScrollable = maxScrollY > 0.5

      updateVector2Signal(
        this.state.maxScrollPosition,
        xScrollable ? maxScrollX : undefined,
        yScrollable ? maxScrollY : undefined,
      )
      updateVector2Signal(this.state.scrollable, xScrollable, yScrollable)
    } else {
      updateVector2Signal(this.state.maxScrollPosition, undefined, undefined)
      updateVector2Signal(this.state.scrollable, false, false)
    }

    const overflowVisible = this.state.overflow.value === Overflow.Visible

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

function updateVector2Signal<T extends Partial<readonly [unknown, unknown]>>(
  signal: Signal<T | undefined>,
  x: T[0],
  y: T[1],
): void {
  if (signal.value != null) {
    const [oldX, oldY] = signal.value
    if (oldX === x && oldY === y) {
      return
    }
  }
  signal.value = [x, y] as any
}

function updateInsetSignal(
  signal: Signal<Inset | undefined>,
  top: number,
  right: number,
  bottom: number,
  left: number,
): void {
  if (signal.value != null) {
    const [oldTop, oldRight, oldBottom, oldLeft] = signal.value
    if (oldTop == top && oldRight == right && oldBottom == bottom && oldLeft == left) {
      return
    }
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
  return (n1 as any)['M']['O'] === (n2 as any)['M']['O']
}
