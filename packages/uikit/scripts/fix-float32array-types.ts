import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

/**
 * Strips Float32Array generics from .d.ts files.
 * TypeScript 5.7+ emits Float32Array<ArrayBuffer | ArrayBufferLike> which breaks compatibility with TS < 5.7.
 * This script removes the generic parameters.
 *
 * It should be removed once definitely typed drops support for TS < 5.7.
 *
 * "Definitely Typed only tests packages on versions of TypeScript that are less than 2 years old." https://github.com/DefinitelyTyped/DefinitelyTyped
 *
 * TS 5.7 stable was released in 5.7.2 on Friday, 22 November 2024
 */

// Check if this script is still needed
const TS_5_7_RELEASE = new Date('2024-11-22')
const DT_DROP_SUPPORT_DATE = new Date(TS_5_7_RELEASE)
DT_DROP_SUPPORT_DATE.setFullYear(DT_DROP_SUPPORT_DATE.getFullYear() + 2)

if (Date.now() > DT_DROP_SUPPORT_DATE.getTime()) {
  throw new Error(
    `This script is no longer needed! Definitely Typed dropped support for TS < 5.7 on ${DT_DROP_SUPPORT_DATE.toDateString()}. Please remove this script.`,
  )
}

async function fixFloat32ArrayTypes(dir: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)

    if (entry.isDirectory()) {
      await fixFloat32ArrayTypes(fullPath)
    } else if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      let content = await readFile(fullPath, 'utf-8')
      const originalContent = content

      content = content.replace(/Float32Array<[^>]+>/g, 'Float32Array')

      if (content !== originalContent) await writeFile(fullPath, content, 'utf-8')
    }
  }
}

const distDir = join(process.cwd(), 'dist')
fixFloat32ArrayTypes(distDir)
  .then(() => {
    console.log('\x1b[32m✓ Float32Array type fixing complete\x1b[0m')
    const daysUntilExpiry = Math.ceil((DT_DROP_SUPPORT_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    console.log(
      `\x1b[31mℹ Float32Array compatibility workaround will expire in ${daysUntilExpiry} days (${DT_DROP_SUPPORT_DATE.toDateString()})\x1b[0m`,
    )
  })
  .catch((err) => {
    console.error('Error fixing Float32Array types:', err)
    process.exit(1)
  })
