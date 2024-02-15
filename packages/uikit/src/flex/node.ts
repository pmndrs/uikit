import { Vector2Tuple } from "three";
import { ReadonlySignal, Signal, batch, computed, effect, signal } from "@preact/signals-core";
import {
  EDGE_TOP,
  EDGE_LEFT,
  EDGE_RIGHT,
  EDGE_BOTTOM,
  Node,
  Yoga,
  OVERFLOW_VISIBLE,
  Overflow,
  OVERFLOW_SCROLL,
} from "yoga-wasm-web";
import { setter } from "./setter.js";
import { setMeasureFunc, yogaNodeEqual } from "./utils.js";
import { WithImmediateProperties } from "../properties/immediate.js";

export type YogaProperties = {
  [Key in keyof typeof setter]?: Parameters<(typeof setter)[Key]>[2];
};

export type Inset = [top: number, right: number, bottom: number, left: number];

export type MeasuredFlexNode = {
  size: ReadonlySignal<Vector2Tuple>;
  borderInset: ReadonlySignal<Inset>;
  paddingInset: ReadonlySignal<Inset>;
};

export class FlexNode implements WithImmediateProperties, MeasuredFlexNode {
  public index: number = 0;

  public readonly size = signal<Vector2Tuple>([0, 0]);
  public readonly relativeCenter = signal<Vector2Tuple>([0, 0]);
  public readonly borderInset = signal<Inset>([0, 0, 0, 0]);
  public readonly paddingInset = signal<Inset>([0, 0, 0, 0]);
  public readonly overflow = signal<Overflow>(OVERFLOW_VISIBLE);
  public readonly maxScrollPosition = signal<Partial<Vector2Tuple>>([undefined, undefined]);
  public readonly scrollable = signal<[boolean, boolean]>([false, false]);

  private children: Array<FlexNode> = [];
  private yogaNode: Node | undefined;
  private unsubscribeYoga?: () => void;

  private layoutChangeListeners = new Set<() => void>();

  public requestCalculateLayout: () => void;

  active = signal(false);

  constructor(
    public rootIdentifier: unknown,
    public readonly yoga: Signal<Yoga | undefined>,
    private precision: number,
    public readonly pixelSize: number,
    requestCalculateLayout: (node: FlexNode) => void,
    public readonly depth: number,
    public readonly anyAncestorScrollable: Signal<[boolean, boolean]> | undefined,
  ) {
    this.requestCalculateLayout = () => requestCalculateLayout(this);
    this.unsubscribeYoga = effect(() => {
      if (yoga.value == null) {
        return;
      }
      this.unsubscribeYoga?.();
      this.unsubscribeYoga = undefined;
      this.yogaNode = yoga.value.Node.create();
      this.active.value = true;
    });
  }

  setProperty(key: string, value: unknown): void {
    if (key === "measureFunc") {
      setMeasureFunc(this.yogaNode!, this.precision, value as any);
    } else {
      setter[key as keyof typeof setter](this.yogaNode!, this.precision, value as any);
    }
    this.requestCalculateLayout();
  }

  hasImmediateProperty(key: string): boolean {
    if (key === "measureFunc") {
      return true;
    }
    return key in setter;
  }

  destroy() {
    this.unsubscribeYoga?.();
    this.yogaNode?.free();
  }

  /**
   * use requestCalculateLayout instead
   */
  calculateLayout(): void {
    if (this.yogaNode == null) {
      return;
    }
    this.commit();
    this.yogaNode.calculateLayout();
    batch(() => this.updateMeasurements(undefined, undefined));
  }

  createChild(): FlexNode {
    const child = new FlexNode(
      this.rootIdentifier,
      this.yoga,
      this.precision,
      this.pixelSize,
      this.requestCalculateLayout,
      this.depth + 1,
      computed(() => {
        const [ancestorX, ancestorY] = this.anyAncestorScrollable?.value ?? [false, false];
        const [x, y] = this.scrollable.value;
        return [ancestorX || x, ancestorY || y];
      }),
    );
    this.requestCalculateLayout();
    this.children.push(child);
    return child;
  }

  removeChild(node: FlexNode): void {
    const i = this.children.indexOf(node);
    if (i === -1) {
      return;
    }
    this.children.splice(i, 1);
    this.requestCalculateLayout();
  }

  commit(): void {
    if (this.yogaNode == null) {
      throw new Error(`commit cannot be called without a yoga node`);
    }

    //commiting the children
    this.children.sort((child1, child2) => child1.index - child2.index);
    let i = 0;
    let oldChildNode: Node | undefined = this.yogaNode.getChild(i);
    let correctChild: FlexNode | undefined = this.children[i];
    while (correctChild != null || oldChildNode != null) {
      if (
        correctChild != null &&
        oldChildNode != null &&
        yogaNodeEqual(oldChildNode, assertNodeNotNull(correctChild.yogaNode))
      ) {
        correctChild = this.children[++i];
        oldChildNode = this.yogaNode.getChild(i);
        continue;
      }

      //either remove, insert, or replace

      if (oldChildNode != null) {
        //either remove or replace
        this.yogaNode.removeChild(oldChildNode);
      }

      if (correctChild != null) {
        //either insert or replace
        const node = assertNodeNotNull(correctChild.yogaNode);
        node.getParent()?.removeChild(node);
        this.yogaNode.insertChild(node, i);
        correctChild = this.children[++i];
      }

      //the yoga node MUST be updated via getChild even for insert since the returned value is somehow bound to the index
      oldChildNode = this.yogaNode.getChild(i);
    }

    //recursively executing commit in children
    const childrenLength = this.children.length;
    for (let i = 0; i < childrenLength; i++) {
      this.children[i].commit();
    }
  }

  updateMeasurements(
    parentWidth: number | undefined,
    parentHeight: number | undefined,
  ): Vector2Tuple {
    if (this.yogaNode == null) {
      throw new Error(`update measurements cannot be called without a yoga node`);
    }

    this.overflow.value = this.yogaNode.getOverflow();

    const width = this.yogaNode.getComputedWidth() * this.precision;
    const height = this.yogaNode.getComputedHeight() * this.precision;
    updateVector2Signal(this.size, width, height);

    parentWidth ??= width;
    parentHeight ??= height;

    const x = this.yogaNode.getComputedLeft() * this.precision;
    const y = this.yogaNode.getComputedTop() * this.precision;

    const relativeCenterX = x + width * 0.5 - parentWidth * 0.5;
    const relativeCenterY = -(y + height * 0.5 - parentHeight * 0.5);
    updateVector2Signal(this.relativeCenter, relativeCenterX, relativeCenterY);

    const paddingTop = this.yogaNode.getComputedPadding(EDGE_TOP) * this.precision;
    const paddingLeft = this.yogaNode.getComputedPadding(EDGE_LEFT) * this.precision;
    const paddingRight = this.yogaNode.getComputedPadding(EDGE_RIGHT) * this.precision;
    const paddingBottom = this.yogaNode.getComputedPadding(EDGE_BOTTOM) * this.precision;
    updateInsetSignal(this.paddingInset, paddingTop, paddingRight, paddingBottom, paddingLeft);

    const borderTop = this.yogaNode.getComputedBorder(EDGE_TOP) * this.precision;
    const borderRight = this.yogaNode.getComputedBorder(EDGE_RIGHT) * this.precision;
    const borderBottom = this.yogaNode.getComputedBorder(EDGE_BOTTOM) * this.precision;
    const borderLeft = this.yogaNode.getComputedBorder(EDGE_LEFT) * this.precision;
    updateInsetSignal(this.borderInset, borderTop, borderRight, borderBottom, borderLeft);

    for (const layoutChangeListener of this.layoutChangeListeners) {
      layoutChangeListener();
    }

    const childrenLength = this.children.length;
    let maxContentWidth = 0;
    let maxContentHeight = 0;
    for (let i = 0; i < childrenLength; i++) {
      const [contentWidth, contentHeight] = this.children[i].updateMeasurements(width, height);
      maxContentWidth = Math.max(maxContentWidth, contentWidth);
      maxContentHeight = Math.max(maxContentHeight, contentHeight);
    }

    maxContentWidth -= borderLeft;
    maxContentHeight -= borderTop;

    if (this.overflow.value === OVERFLOW_SCROLL) {
      maxContentWidth += paddingRight;
      maxContentHeight += paddingLeft;

      const widthWithoutBorder = width - borderLeft - borderRight;
      const heightWithoutBorder = height - borderTop - borderBottom;

      const maxScrollX = maxContentWidth - widthWithoutBorder;
      const maxScrollY = maxContentHeight - heightWithoutBorder;

      updateVector2Signal(
        this.maxScrollPosition,
        maxScrollX <= 0 ? undefined : maxScrollX,
        maxScrollY <= 0 ? undefined : maxScrollY,
      );
      updateVector2Signal(this.scrollable, maxScrollX > 0, maxScrollY > 0);
    } else {
      updateVector2Signal(this.maxScrollPosition, undefined, undefined);
      updateVector2Signal(this.scrollable, false, false);
    }

    return [x + Math.max(width, maxContentWidth), y + Math.max(height, maxContentHeight)];
  }

  addLayoutChangeListener(listener: () => void) {
    this.layoutChangeListeners.add(listener);
    return () => void this.layoutChangeListeners.delete(listener);
  }
}

function updateVector2Signal<T extends Partial<[unknown, unknown]>>(
  signal: Signal<T>,
  x: T[0],
  y: T[1],
): void {
  const [oldX, oldY] = signal.value;
  if (oldX === x && oldY === y) {
    return;
  }
  signal.value = [x, y] as any;
}

function updateInsetSignal(
  signal: Signal<Inset>,
  top: number,
  right: number,
  bottom: number,
  left: number,
): void {
  const [oldTop, oldRight, oldBottom, oldLeft] = signal.value;
  if (oldTop == top && oldRight == right && oldBottom == bottom && oldLeft == left) {
    return;
  }
  signal.value = [top, right, bottom, left];
}

export function createDeferredRequestLayoutCalculation(): (node: FlexNode) => void {
  let requested = false;
  return (node) => {
    if (requested || node["yogaNode"] == null) {
      return;
    }
    requested = true;
    setTimeout(() => {
      requested = false;
      node.calculateLayout();
    }, 0);
  };
}

function assertNodeNotNull<T>(val: T | undefined): T {
  if (val == null) {
    throw new Error(`commit cannot be called with a children that miss a yoga node`);
  }
  return val;
}
