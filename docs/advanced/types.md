---
title: Types
description: How to configure the types to align with the event system you are using.
nav: 14
---

Since the uikit project is event-system-agnostic, you might use uikit with a different event system than everyone else. Therefore, it is important to be able to specify the shape of your event types so they align with the types of your event handlers.

You can customize events by extending the `Object3DEventMap` interface as shown below. Add this to `types/three.d.ts`, or another location where TypeScript looks for your custom types. Also ensure you include your imports inside the module declaration, as this can influence type-evaluation order, making your type extension not visible to TypeScript in time.


```ts
declare module 'three' {
  import type { PointerEvent, WheelEvent } from '@pmndrs/pointer-events'
  interface Object3DEventMap {
    pointermove: PointerEvent
    pointercancel: PointerEvent
    pointerdown: PointerEvent
    pointerup: PointerEvent
    pointerenter: PointerEvent
    pointerleave: PointerEvent
    pointerover: PointerEvent
    pointerout: PointerEvent
    click: PointerEvent
    dblclick: PointerEvent
    contextmenu: PointerEvent
    wheel: WheelEvent
  }
}

```

This modification is also demonstrated in the dashboard example. You can find its source code [here](https://github.com/pmndrs/uikit/tree/main/examples/dashboard).