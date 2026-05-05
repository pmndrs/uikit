---
name: vitexec
description: Use this skill when an AI agent needs to inspect, verify, debug, or profile a live Vite app by running temporary snippets inside the browser page and reading browser logs or captured artifacts. Use for client state after interactions, imported app modules, DOM state, human-like input, canvas/WebGL/Three.js state, screenshots, videos, CPU/network/performance/heap analysis, WebXR/Three.js XR with IWER, and runtime-only behavior without editing app files.
---

# vitexec

Use `vitexec` when the truth lives in the running browser: client state, imported app modules, DOM, canvas/WebGL, screenshots, recordings, or browser-only errors.

Do not use it for questions static files, unit tests, or TypeScript can answer directly.

## References

- If `vitexec` or Playwright is missing, read [references/install.md](references/install.md).
- For mouse, keyboard, pointer lock, gamepad, or other input, read [references/inputs.md](references/inputs.md).
- For CPU, network, performance timeline, or heap analysis, read [references/performance.md](references/performance.md).
- For WebXR, read [references/webxr.md](references/webxr.md).

## Workflow

1. Identify the page path if it is not `/`.
2. Write the smallest snippet that performs the user-like action or reads the browser-only state.
3. Run `vitexec '<snippet>'`, adding `--path`, `--gpu`, `--screenshot`, `--record`, `--cpu-profile`, `--network-trace`, `--performance-trace`, `--heap-snapshot`, `--timeout`, or `--config` only when needed.
4. Treat stdout as browser logs. It starts with `logs:`.

```sh
vitexec 'console.log("ready")'
```

For structured state, log JSON:

```sh
vitexec --path /cart '
  import { useCartStore } from "/src/store/cart.ts";
  document.querySelector("[data-testid=add-to-cart]")?.click();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  console.log("cart", JSON.stringify(useCartStore.getState()));
'
```

## Guidance

- Prefer importing exported app state over scraping DOM when state is available.
- Use direct state reads for observation and assertions, not to bypass user interaction.
- Use live progress logs and focused assertions to early-exit on failures and see current progress.
- Keep logs concise; overly verbose logs become unreadable and unnecessarily fill the context.
- Prefer browser-root imports such as `/src/store.ts`, not local filesystem paths.
- Use `--gpu` for WebGL, canvas, Three.js, and WebXR behavior.
- Use screenshots or recordings only when visual evidence matters.
- Do not leave temporary code in the app when `vitexec` can inspect it from outside.
