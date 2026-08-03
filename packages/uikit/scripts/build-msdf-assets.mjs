import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

import { build } from 'esbuild'

const require = createRequire(import.meta.url)
const wasm = await readFile(require.resolve('@zappar/msdf-generator/msdfgen_wasm.wasm'), 'base64')

const { outputFiles } = await build({
  entryPoints: [require.resolve('@zappar/msdf-generator/worker.js')],
  banner: {
    // The upstream worker only fetches its WASM; serve it from the embedded bytes.
    js: `globalThis.fetch=()=>Promise.resolve(new Response(Uint8Array.from(atob(${JSON.stringify(
      wasm,
    )}),c=>c.charCodeAt(0)),{headers:{'Content-Type':'application/wasm'}}))`,
  },
  bundle: true,
  format: 'esm',
  write: false,
})

await writeFile(
  new URL('../src/loaders/msdf-worker.ts', import.meta.url),
  `// prettier-ignore\nexport default ${JSON.stringify(outputFiles[0].text)}\n`,
)
