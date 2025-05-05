import { Object3D, Vector2Tuple } from 'three'
import { Signal, batch, effect, signal, untracked } from '@preact/signals-core'
import { Display, Edge, FlexDirection, MeasureFunction, Node, Overflow } from 'yoga-layout/load'
import { setter } from './setter.js'
import { setupImmediateProperties } from '../properties/immediate.js'
import { MergedProperties } from '../properties/merged.js'
import { PointScaleFactor, createYogaNode } from './yoga.js'
import { abortableEffect } from '../utils.js'

export type YogaProperties = {
  [Key in keyof typeof setter]?: Parameters<(typeof setter)[Key]>[1]
}

export type Inset = [top: number, right: number, bottom: number, left: number]

export type CustomLayouting = {
  minWidth: number
  minHeight: number
  measure: MeasureFunction
}

function hasImmediateProperty(key: string): boolean {
  if (key === 'measureFunc') {
    return true
  }
  return key in setter
}

export type FlexNodeState = ReturnType<typeof createFlexNodeState>

export function createFlexNodeState() {
  return {
    node: signal<FlexNode | undefined>(),
    size: signal<Vector2Tuple | undefined>(undefined),
    relativeCenter: signal<Vector2Tuple | undefined>(undefined),
    borderInset: signal<Inset | undefined>(undefined),
    overflow: signal<Overflow>(Overflow.Visible),
    displayed: signal<boolean>(false),
    scrollable: signal<[boolean, boolean]>([false, false]),
    paddingInset: signal<Inset | undefined>(undefined),
    maxScrollPosition: signal<Partial<Vector2Tuple>>([undefined, undefined]),
  }
}

export class FlexNode {
  private children: Array<FlexNode> = []
  private yogaNode: Node | undefined

  private layoutChangeListeners = new Set<() => void>()
  private customLayouting?: CustomLayouting

  private active = signal(false)
  private objectVisible = false

  constructor(
    private state: FlexNodeState & { root: { requestCalculateLayout(): void } },
    private readonly propertiesSignal: Signal<MergedProperties>,
    private object: Object3D,
    private objectVisibileDefault: boolean,
    abortSignal: AbortSignal,
  ) {
    abortableEffect(() => {
      const yogaNode = createYogaNode()
      if (yogaNode == null) {
        return
      }
      this.yogaNode = yogaNode
      this.active.value = true
      this.updateMeasureFunction()
      return () => {
        this.yogaNode?.getParent()?.removeChild(this.yogaNode)
        this.yogaNode?.free()
      }
    }, abortSignal)
    setupImmediateProperties(
      propertiesSignal,
      this.active,
      hasImmediateProperty,
      (key: string, value: unknown) => {
        setter[key as keyof typeof setter](this.yogaNode!, value as any)
        this.state.root.requestCalculateLayout()
      },
      abortSignal,
    )
  }

  setCustomLayouting(layouting: CustomLayouting | undefined) {
    this.customLayouting = layouting
    this.updateMeasureFunction()
  }

  private updateMeasureFunction() {
    if (this.customLayouting == null || !this.active.value) {
      return
    }
    setMeasureFunc(this.yogaNode!, this.customLayouting.measure)
    this.state.root.requestCalculateLayout()
  }

  /**
   * use requestCalculateLayout instead
   */
  calculateLayout(): void {
    if (this.yogaNode == null) {
      return
    }
    this.commit(this.yogaNode.getFlexDirection())
    this.yogaNode.calculateLayout(undefined, undefined)
    batch(() => this.updateMeasurements(true, undefined, undefined))
  }

  addChild(node: FlexNode): void {
    this.children.push(node)
    this.state.root.requestCalculateLayout()
  }

  removeChild(node: FlexNode): void {
    const i = this.children.indexOf(node)
    if (i === -1) {
      return
    }
    this.children.splice(i, 1)
    this.state.root.requestCalculateLayout()
  }

  commit(parentDirection: FlexDirection): void {
    if (this.yogaNode == null) {
      throw new Error(`commit cannot be called without a yoga node`)
    }

    /** ---- START : adaptation of yoga's behavior to align more to the web behavior ---- */
    const parentDirectionVertical =
      parentDirection === FlexDirection.Column || parentDirection === FlexDirection.ColumnReverse
    const properties = this.propertiesSignal.peek()
    if (
      this.customLayouting != null &&
      untracked(() =>
        properties.read<YogaProperties['minWidth']>(parentDirectionVertical ? 'minHeight' : 'minWidth', undefined),
      ) === undefined
    ) {
      this.yogaNode[parentDirectionVertical ? 'setMinHeight' : 'setMinWidth'](
        parentDirectionVertical ? this.customLayouting.minHeight : this.customLayouting.minWidth,
      )
    }

    //see: https://codepen.io/Gettinqdown-Dev/pen/wvZLKBm
    //-> on the web if the parent has flexdireciton column, elements dont shrink below flexBasis
    if (untracked(() => properties.read<YogaProperties['flexShrink']>('flexShrink', undefined)) == null) {
      const hasHeight = untracked(() => properties.read<YogaProperties['height']>('height', undefined)) != null
      this.yogaNode.setFlexShrink(hasHeight && parentDirectionVertical ? 0 : undefined)
    }
    /** ---- END ---- */

    //commiting the children
    let groupChildren: Array<Object3D> | undefined
    this.children.sort((child1, child2) => {
      groupChildren ??= child1.object.parent?.children
      if (groupChildren == null) {
        return 0
      }
      const group1 = child1.object
      const group2 = child2.object
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
      this.children[i].commit(this.yogaNode.getFlexDirection())
    }

    this.objectVisible = this.objectVisibileDefault || this.children.some((child) => child.objectVisible)
    this.object.visible = this.objectVisible
  }

  updateMeasurements(
    displayed: boolean,
    parentWidth: number | undefined,
    parentHeight: number | undefined,
  ): Vector2Tuple {
    if (this.yogaNode == null) {
      throw new Error(`update measurements cannot be called without a yoga node`)
    }

    this.state.overflow.value = this.yogaNode.getOverflow()
    displayed &&= this.yogaNode.getDisplay() === Display.Flex
    this.state.displayed.value = displayed

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
      const [contentWidth, contentHeight] = this.children[i].updateMeasurements(displayed, width, height)
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

export function setMeasureFunc(node: Node, func: MeasureFunction | undefined) {
  if (func == null) {
    node.setMeasureFunc(null)
    return
  }
  node.setMeasureFunc((width, wMode, height, hMode) => {
    const result = func(width, wMode, height, hMode)
    return {
      //why + 2? we use a offset of + 1 to prevent precision errors but + 1 causes the following issue in yoga with the default pixelSize of 0.01 therefore +2
      //https://github.com/facebook/yoga/issues/1651
      width: Math.ceil(result.width * PointScaleFactor + 2) / PointScaleFactor,
      height: Math.ceil(result.height * PointScaleFactor + 2) / PointScaleFactor,
    }
  })
  node.markDirty()
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
