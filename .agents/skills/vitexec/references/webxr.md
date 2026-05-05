# WebXR

Use IWER with `vitexec` for WebXR tests.

Docs:

- https://meta-quest.github.io/immersive-web-emulation-runtime/getting-started.html
- https://meta-quest.github.io/immersive-web-emulation-runtime/action.html

Do not fake XR outcomes by mutating app state. Install IWER, enter the XR session through the app's normal path, move the emulated headset/controllers/hands, press/select like a user, then inspect app state.

State access is for understanding and assertions, not bypassing interaction.

## Shape

```sh
vitexec --gpu ./vitexec/webxr-test.ts
```

```ts
import { XRDevice, metaQuest3 } from "iwer";

const xrDevice = new XRDevice(metaQuest3);
xrDevice.installRuntime();

// Trigger the app's normal "Enter VR" path.
await window.xrPrecisionThrow.store.enterVR();
if (xrDevice.sessionOffered) xrDevice.grantOfferedSession();

// Act through IWER.
xrDevice.controllers.right?.position.set(0, 1.25, -0.85);
xrDevice.controllers.right?.updateButtonValue("trigger", 1);
await new Promise((resolve) => requestAnimationFrame(resolve));
xrDevice.controllers.right?.updateButtonValue("trigger", 0);

// Assert through app state.
console.log("xr", JSON.stringify({
  active: Boolean(xrDevice.activeSession),
  status: window.xrPrecisionThrow.getStatus()
}));
```

Useful IWER controls:

- Headset: `xrDevice.position`, `xrDevice.quaternion`, `xrDevice.recenter()`.
- Controllers: `position`, `quaternion`, `updateButtonValue()`, `updateAxes()`.
- Hands/platform: `primaryInputMode`, hand pinch APIs, visibility state.

Use `--record` or `--screenshot` only when visual timing or rendering matters.
