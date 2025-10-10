#!/usr/bin/env node
import { readdir } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Lazy import to avoid requiring deps unless invoked
async function ensureDeps() {
  try {
    await import('@mdx-js/mdx')
  } catch {
    console.error('Missing devDependency: @mdx-js/mdx. Install it with: pnpm add -D @mdx-js/mdx')
    process.exitCode = 1
    process.exit()
  }
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walk(fullPath)
    } else {
      yield fullPath
    }
  }
}

async function main() {
  await ensureDeps()
  const { compile } = await import('@mdx-js/mdx')

  const root = fileURLToPath(new URL('..', import.meta.url))
  const docsDir = join(root, 'docs')

  const targets = []
  for await (const file of walk(docsDir)) {
    const ext = extname(file)
    if (ext === '.md' || ext === '.mdx') targets.push(file)
  }

  let hadError = false
  for (const file of targets) {
    const url = pathToFileURL(file)
    const src = await readFile(file, 'utf8')
    try {
      // Use MDX v3 compile; we don't care about output, just parsing
      await compile(src, { filepath: url })
      // eslint-disable-next-line no-console
      console.log(`OK  ${file}`)
    } catch (err) {
      hadError = true
      // eslint-disable-next-line no-console
      console.error(`ERR ${file}`)
      // eslint-disable-next-line no-console
      console.error(String(err && err.message ? err.message : err))
    }
  }

  if (hadError) {
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


