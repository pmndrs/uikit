# Inputs

Test through the same input path a user would use. Do not prove behavior by calling app internals that skip the interaction.

Pattern:

1. Read state to choose a target or assertion.
2. Send realistic input events.
3. Wait one or two animation frames.
4. Read state again to verify.

State reads are for observation, not cheating. Good: `game.getSnapshot()` to find a canvas target. Bad: `game.setScore(999)`.

## Common Inputs

- Mouse/pointer: dispatch `pointerdown`, `pointerup`, then `click` with real `clientX/clientY`.
- Canvas: convert app coordinates through `canvas.getBoundingClientRect()`.
- Captured mouse: dispatch a pointer capture/start event, then `mousemove` with `movementX/movementY`.
- Keyboard: focus the element, dispatch `keydown`, update the value, dispatch `input`, then `keyup`.
- Gamepad: override `navigator.getGamepads()`, dispatch `gamepadconnected`, and advance frames.
- WebXR: use [webxr.md](webxr.md); drive IWER headset/controllers/hands instead of patching game state.

Minimal pointer shape:

```ts
const rect = target.getBoundingClientRect();
const clientX = rect.left + rect.width / 2;
const clientY = rect.top + rect.height / 2;

target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, button: 0, buttons: 1, clientX, clientY, pointerId: 1, pointerType: "mouse" }));
target.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, button: 0, buttons: 0, clientX, clientY, pointerId: 1, pointerType: "mouse" }));
target.dispatchEvent(new MouseEvent("click", { bubbles: true, button: 0, clientX, clientY }));
```
