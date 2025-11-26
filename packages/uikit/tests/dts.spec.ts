import { expect } from 'chai'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function collectDtsFiles(dir: string, out: string[] = []) {
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const fullPath = path.join(dir, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      collectDtsFiles(fullPath, out)
    } else if (stats.isFile() && entry.endsWith('.d.ts')) {
      out.push(fullPath)
    }
  }
  return out
}

describe('dist .d.ts content', () => {
  it('must not contain "Float32Array<"', () => {
    const distDir = path.resolve(__dirname, '../dist')
    const dtsFiles = collectDtsFiles(distDir)
    const offenders: string[] = []
    for (const file of dtsFiles) {
      const content = readFileSync(file, 'utf8')
      if (content.includes('Float32Array<')) {
        offenders.push(file)
      }
    }
    expect(offenders.length, `Forbidden token "Float32Array<" found in:\n${offenders.join('\n')}`).to.equal(0)
  })
})
