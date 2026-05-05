# Install

Use the package manager already used by the project.

Check first:

```sh
pnpm why vitexec
```

If missing, install `vitexec` and Playwright, then install Chromium:

```sh
pnpm add -D vitexec playwright
pnpm exec playwright install chromium
```

For npm or yarn, use the equivalent project-local commands.

Verify from the Vite app root:

```sh
pnpm exec vitexec 'console.log("ready")'
```

Expected output includes:

```txt
logs:
[log] ready
```
