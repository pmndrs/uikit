/**
 * Builds the MSDF font-atlas worker and its wasm into this package.
 *
 * `@zappar/msdf-generator` ships its worker as unbundled ESM containing a bare
 * `import { expose, transfer } from 'comlink'`, and builds the worker's URL
 * (`new URL('./worker.js', import.meta.url)`) in its MSDF constructor, separate
 * from the `new Worker(url, { type: 'module' })` that consumes it. Bundlers only
 * bundle a worker when they can see both halves in a single expression, so the
 * file is copied through verbatim instead. A module worker cannot resolve a bare
 * specifier, so it fails to load roughly 3ms after construction — and a worker
 * whose module graph fails to resolve fires an `error` event with an empty
 * message, no filename and no line, so nothing reaches the console. The font
 * atlas never arrives and the caller's promise never settles.
 *
 * The wasm is a second instance of the same problem: Emscripten names it with a
 * runtime string through `locateFile`, so no bundler can see that dependency
 * either and it is never emitted.
 *
 * Bundling the worker here and shipping both files lets ttf.ts point at copies
 * it can address relatively, which every bundler understands.
 *
 * The files are written to `src/loaders` as well as `dist/loaders` because this
 * package resolves to `src/index.ts` inside the monorepo and only to
 * `dist/index.js` once published (see `publishConfig`), so `import.meta.url` in
 * ttf.ts points at whichever of the two is in play.
 */
import { copyFile, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'

const require = createRequire(import.meta.url)
const packageRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const targets = [path.join(packageRoot, 'src', 'loaders'), path.join(packageRoot, 'dist', 'loaders')]

const workerEntry = require.resolve('@zappar/msdf-generator/worker.js')
const wasmSource = require.resolve('@zappar/msdf-generator/msdfgen_wasm.wasm')

for (const outDir of targets) {
  await mkdir(outDir, { recursive: true })
  await build({
    entryPoints: [workerEntry],
    outfile: path.join(outDir, 'msdf-worker.js'),
    bundle: true,
    format: 'esm',
    target: 'esnext',
  })
  await copyFile(wasmSource, path.join(outDir, 'msdfgen_wasm.wasm'))
}
