import { Signal, computed, signal } from "@preact/signals-core";
import { EventHandlers } from "@react-three/fiber/dist/declarations/src/core/events.js";
import { useEffect, useMemo } from "react";
import { setCursorType, unsetCursorType } from "./cursor.js";
import { ManagerCollection, Properties, PropertyManager } from "./properties/utils.js";
import { readReactive } from "./utils.js";
import { WithClasses, useTraverseProperties } from "./properties/default.js";

export type WithHover<T> = T & {
  cursor?: string;
  hover?: T;
  onHoverChange?: (hover: boolean) => void;
};

export type HoverEventHandlers = Pick<EventHandlers, "onPointerOver" | "onPointerOut">;

export function useApplyHoverProperties(
  collection: ManagerCollection,
  properties: WithClasses<WithHover<Properties>> & EventHandlers,
): HoverEventHandlers | undefined {
  const hoveredSignal = useMemo(() => signal<Array<number>>([]), []);
  const translate = useMemo(() => createPropertyTranslator(hoveredSignal), []);
  let hoverPropertiesExist = false;

  useTraverseProperties(properties, (p) => {
    if (p.hover == null) {
      return;
    }
    hoverPropertiesExist = true;
    translate(collection, p.hover);
  });

  //cleanup cursor effect
  useEffect(() => () => unsetCursorType(hoveredSignal), []);

  if (!hoverPropertiesExist && properties.onHoverChange == null && properties.cursor == null) {
    //no need to listen to hover
    hoveredSignal.value.length = 0;
    return undefined;
  }
  return {
    onPointerOver: (e) => {
      hoveredSignal.value = [e.pointerId, ...hoveredSignal.value];
      if (properties.onHoverChange != null && hoveredSignal.value.length === 1) {
        properties.onHoverChange(true);
      }
      if (properties.cursor != null) {
        setCursorType(hoveredSignal, properties.cursor);
      }
    },
    onPointerOut: (e) => {
      hoveredSignal.value = hoveredSignal.value.filter((id) => id != e.pointerId);
      if (properties.onHoverChange != null && hoveredSignal.value.length === 0) {
        properties.onHoverChange(false);
      }
      unsetCursorType(hoveredSignal);
    },
  };
}

function createPropertyTranslator(
  hovered: Signal<Array<number>>,
): (collection: ManagerCollection, properties: Properties) => void {
  const signalMap = new Map<unknown, Signal<unknown>>();
  return (collection, properties) => {
    const collectionLength = collection.length;
    for (const key in properties) {
      const value = properties[key];
      if (value === undefined) {
        return;
      }
      let result = signalMap.get(value);
      if (result == null) {
        signalMap.set(
          value,
          (result = computed(() => (hovered.value.length > 0 ? readReactive(value) : undefined))),
        );
      }
      for (let i = 0; i < collectionLength; i++) {
        collection[i].add(key, result);
      }
    }
  };
}
