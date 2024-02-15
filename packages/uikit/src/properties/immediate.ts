import { Signal, effect } from "@preact/signals-core";
import { useCallback, useMemo, useRef } from "react";
import { useSignalEffect } from "../utils.js";
import {
  PropertyTransformation,
  PropertyManager,
  usePropertyManager,
  Properties,
  equalReactiveProperty,
  readReactiveProperty,
  ManagerCollection,
} from "./utils.js";

export type WithImmediateProperties = {
  active: Signal<boolean>;
  hasImmediateProperty: (key: string) => boolean;
  setProperty: (key: string, value: unknown) => void;
};

type PropertySubscriptions = Record<string, () => void>;

const EmptyProperties: Properties = {};

export function useImmediateProperties(
  collection: ManagerCollection,
  object: WithImmediateProperties,
  transformProperty?: PropertyTransformation,
): void {
  const activeRef = useRef(false);
  const propertiesRef = useRef<Properties>({});
  const subscriptions = useRef<PropertySubscriptions>({});

  const hasProperty = useMemo(() => object.hasImmediateProperty.bind(object), [object]);
  const finishProperties = useCallback(
    (properties: Properties) => {
      if (!activeRef.current) {
        propertiesRef.current = properties;
        return;
      }
      applyProperties(properties, propertiesRef.current, subscriptions.current, object);
      propertiesRef.current = properties;
    },
    [object],
  );
  useSignalEffect(() => {
    activeRef.current = object.active.value;
    if (!activeRef.current) {
      unsubscribe(subscriptions.current);
      subscriptions.current = {};
      return;
    }
    applyProperties(propertiesRef.current, EmptyProperties, subscriptions.current, object);
    return () => {
      unsubscribe(subscriptions.current);
      subscriptions.current = {};
    };
  }, [object]);
  usePropertyManager(collection, hasProperty, finishProperties, transformProperty);
}

function applyProperties(
  currentProperties: Properties,
  oldProperties: Properties,
  subscriptions: PropertySubscriptions,
  object: WithImmediateProperties,
) {
  for (const key in currentProperties) {
    const currentProperty = currentProperties[key];
    if (key in oldProperties) {
      const oldProperty = oldProperties[key];
      delete oldProperties[key];
      if (equalReactiveProperty(currentProperty, oldProperty)) {
        //no changes => nothing to do
        continue;
      }
      //property changed => unsubscribe old property
      subscriptions[key]?.();
    }
    //new property => subscribe new property
    subscriptions[key] = effect(() => {
      const currentValue = readReactiveProperty(currentProperty);

      object.setProperty(key, currentValue);
    });
  }
  for (const key in oldProperties) {
    //reset properties
    subscriptions[key]?.();
    delete subscriptions[key];
    if (readReactiveProperty(oldProperties[key]) === undefined) {
      continue;
    }
    object.setProperty(key, undefined);
  }
}

function unsubscribe(subscriptions: PropertySubscriptions): void {
  for (const key in subscriptions) {
    subscriptions[key]();
  }
}
