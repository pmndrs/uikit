#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Lazy import to avoid requiring deps unless invoked
async function ensureDeps() {
  const missing = []
  try {
    await import('@mdx-js/mdx')
  } catch {
    missing.push('@mdx-js/mdx')
  }
  try {
    await import('typescript')
  } catch {
    missing.push('typescript')
  }
  if (missing.length) {
    console.error(`Missing devDependencies: ${missing.join(', ')}. Install them with: pnpm add -D ${missing.join(' ')}`)
    process.exit(1)
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

function extractSandpackFiles(src) {
  const files = []
  const marker = 'files={{'
  let index = 0

  while ((index = src.indexOf(marker, index)) !== -1) {
    index += marker.length
    while (index < src.length) {
      index = skipWhitespace(src, index)
      if (src.startsWith('}}', index)) {
        index += 2
        break
      }
      const quoted = readQuotedString(src, index)
      if (!quoted) {
        index += 1
        continue
      }
      index = skipWhitespace(src, quoted.endIndex + 1)
      if (src[index] !== ':') {
        index += 1
        continue
      }
      index = skipWhitespace(src, index + 1)
      if (src[index] !== '`') {
        index += 1
        continue
      }
      const template = readTemplateLiteral(src, index)
      files.push({ path: quoted.value, code: template.value })
      index = template.endIndex + 1
    }
  }

  return files
}

function skipWhitespace(src, index) {
  let i = index
  while (i < src.length && /\s/.test(src[i])) {
    i += 1
  }
  return i
}

function readQuotedString(src, startIndex) {
  const quote = src[startIndex]
  if (quote !== '"' && quote !== "'") return null
  let i = startIndex + 1
  while (i < src.length) {
    if (src[i] === quote) {
      return { value: src.slice(startIndex + 1, i), endIndex: i }
    }
    i += 1
  }
  return null
}

function readTemplateLiteral(src, startIndex) {
  let i = startIndex + 1
  while (i < src.length) {
    if (src[i] === '`' && src[i - 1] !== '\\') {
      return { value: src.slice(startIndex + 1, i), endIndex: i }
    }
    i += 1
  }
  return { value: src.slice(startIndex + 1), endIndex: src.length - 1 }
}

function isCodeFile(filePath) {
  return /\.(tsx?|jsx?)$/.test(filePath)
}

function findDuplicateImports(code, ts) {
  const sourceFile = ts.createSourceFile('App.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const seen = new Map()
  const duplicates = []

  const record = (moduleName, importName, node) => {
    const key = `${moduleName}|${importName}`
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    const entry = { line: line + 1, column: character + 1 }
    const existing = seen.get(key)
    if (existing) {
      duplicates.push({
        moduleName,
        importName,
        first: existing,
        second: entry,
      })
    } else {
      seen.set(key, entry)
    }
  }

  sourceFile.forEachChild((node) => {
    if (!ts.isImportDeclaration(node) || !node.importClause || !ts.isStringLiteral(node.moduleSpecifier)) {
      return
    }
    const moduleName = node.moduleSpecifier.text

    if (node.importClause.name) {
      record(moduleName, 'default', node.importClause.name)
    }

    const bindings = node.importClause.namedBindings
    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        const importName = element.propertyName ? element.propertyName.text : element.name.text
        record(moduleName, importName, element.name)
      }
    }
  })

  return duplicates
}

async function main() {
  await ensureDeps()
  const { compile } = await import('@mdx-js/mdx')
  const ts = await import('typescript')

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
    const errors = []
    try {
      // Use MDX v3 compile; we don't care about output, just parsing
      await compile(src, { filepath: url })
    } catch (err) {
      errors.push(String(err && err.message ? err.message : err))
    }

    const sandpackFiles = extractSandpackFiles(src)
    for (const sandpackFile of sandpackFiles) {
      if (!isCodeFile(sandpackFile.path)) {
        continue
      }
      const duplicates = findDuplicateImports(sandpackFile.code, ts)
      for (const duplicate of duplicates) {
        errors.push(
          `duplicate import "${duplicate.importName}" from "${duplicate.moduleName}" in ${sandpackFile.path} (lines ${duplicate.first.line}, ${duplicate.second.line})`,
        )
      }
    }

    if (errors.length > 0) {
      hadError = true
      // eslint-disable-next-line no-console
      console.error(`ERR ${file}`)
      for (const message of errors) {
        // eslint-disable-next-line no-console
        console.error(`  ${message}`)
      }
    } else {
      // eslint-disable-next-line no-console
      console.log(`OK  ${file}`)
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
