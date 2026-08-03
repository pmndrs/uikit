import { copyFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'

const require = createRequire(import.meta.url)

await build({
  entryPoints: [require.resolve('@zappar/msdf-generator/worker.js')],
  outfile: fileURLToPath(new URL('../msdf-worker.js', import.meta.url)),
  bundle: true,
  format: 'esm',
})

await copyFile(
  require.resolve('@zappar/msdf-generator/msdfgen_wasm.wasm'),
  new URL('../msdfgen_wasm.wasm', import.meta.url),
)
