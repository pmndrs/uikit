---
title: Types
description: How to configure the types to align with the event system you are using.
nav: 14
---

Since the uikit project is event-system-agnostic, you might use uikit with a different event system than everyone else. Therefore, it is important to be able to specify the shape of your event types so they align with the types of your event handlers.

You can customize events by extending the `Object3DEventMap` interface as shown below through adding the following module declaration before importing anything from uikit.


```ts
declare module 'three' {
  interface Object3DEventMap {
    pointermove: YourEventType
    pointercancel: YourEventType
    pointerdown: YourEventType
    pointerup: YourEventType
    pointerenter: YourEventType
    pointerleave: YourEventType
    pointerover: YourEventType
    pointerout: YourEventType
    click: YourEventType
    dblclick: YourEventType
    contextmenu: YourEventType
    wheel: YourEventType
  }
}

```

This modification is also demonstrated in the dashboard example. You can find its source code [here](https://github.com/pmndrs/uikit/tree/main/examples/dashboard). In the example, we are using the event types from `@pmndrs/pointer-events`, which automatically extends the `Object3DEventMap`, therefore, it is only important to import `@pmndrs/pointer-events` before uikit.