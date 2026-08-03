import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

import { build } from 'esbuild'

const require = createRequire(import.meta.url)
const wasm = await readFile(require.resolve('@zappar/msdf-generator/msdfgen_wasm.wasm'), 'base64')
const wasmUrl = `data:application/octet-stream;base64,${wasm}`

const { outputFiles } = await build({
  entryPoints: [require.resolve('@zappar/msdf-generator/worker.js')],
  bundle: true,
  format: 'esm',
  write: false,
})

await writeFile(
  new URL('../src/loaders/msdf-worker.ts', import.meta.url),
  `// prettier-ignore\nexport const workerSource = ${JSON.stringify(outputFiles[0].text)}\n// prettier-ignore\nexport const wasmUrl = ${JSON.stringify(wasmUrl)}\n`,
)
