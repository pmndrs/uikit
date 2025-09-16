#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

// Utilities
const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v)

const toCamel = (str) => {
  if (!str) return str
  // Normalize spaces and separators
  const cleaned = String(str)
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const parts = cleaned.split(' ')
  const first = parts.shift() ?? ''
  const head = first.toLowerCase().replace(/[^a-z0-9]/gi, '')
  const tail = parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.replace(/[^a-z0-9]/gi, ''))
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1).toLowerCase() : ''))
    .join('')
  return head + tail || cleaned.replace(/\s+/g, '')
}

const isRef = (val) => typeof val === 'string' && /^\{[^}]+\}$/.test(val.trim())
const refPath = (val) => val.trim().slice(1, -1) // remove { }

const rgbaRe = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|0?\.\d+|1(?:\.0+)?)\s*\)$/i
const rgbRe = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i

const clamp255 = (n) => Math.max(0, Math.min(255, Number(n)))
const toHex = (n) => clamp255(n).toString(16).padStart(2, '0')

const parseColor = (val) => {
  if (typeof val !== 'string') return null
  const s = val.trim()
  if (s.startsWith('#')) {
    if (/^#([0-9a-f]{6})$/i.test(s)) return { hex: s.toLowerCase(), alpha: 1 }
    if (/^#([0-9a-f]{3})$/i.test(s)) {
      const r = s[1]
      const g = s[2]
      const b = s[3]
      return { hex: `#${r}${r}${g}${g}${b}${b}`.toLowerCase(), alpha: 1 }
    }
  }
  let m = s.match(rgbaRe)
  if (m) {
    const r = toHex(m[1])
    const g = toHex(m[2])
    const b = toHex(m[3])
    const a = Number(m[4])
    return { hex: `#${r}${g}${b}`.toLowerCase(), alpha: a }
  }
  m = s.match(rgbRe)
  if (m) {
    const r = toHex(m[1])
    const g = toHex(m[2])
    const b = toHex(m[3])
    return { hex: `#${r}${g}${b}`.toLowerCase(), alpha: 1 }
  }
  return null
}

// Build a token index for reference resolution
const buildIndex = (root) => {
  const index = new Map()

  const walk = (node, pathParts) => {
    if (isObject(node) && '$type' in node && '$value' in node) {
      index.set(pathParts.join('.'), node.$value)
      return
    }
    if (isObject(node)) {
      for (const k of Object.keys(node)) {
        walk(node[k], [...pathParts, k])
      }
    }
  }

  walk(root, [])
  return index
}

const tryPaths = (key) => {
  // References commonly omit the top-level like Global.
  // We try several namespaces based on observed data.
  const candidates = [
    key,
    `Global.${key}`,
    key.startsWith('Color.') ? `Global.${key}` : null,
    key.startsWith('Semantic.') ? `Global.${key}` : null,
  ].filter(Boolean)
  return [...new Set(candidates)]
}

const resolveValue = (index, raw, mode, visiting = new Set()) => {
  // raw may be string, number, or object with Light/Dark
  if (raw == null) return null
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') {
    if (isRef(raw)) {
      const rp = refPath(raw)
      // 1) Direct candidates
      for (const cand of tryPaths(rp)) {
        const key = cand
        if (visiting.has(key)) throw new Error(`Circular reference detected: ${key}`)
        const v = index.get(key)
        if (v !== undefined) {
          visiting.add(key)
          const resolved = resolveValue(index, v, mode, visiting)
          visiting.delete(key)
          return resolved
        }
      }
      // 2) Fallback: suffix match within index keys (handles missing prefixes like Global.)
      // This helps for paths like Semantic.* that might be nested under Global.Semantic.*
      for (const [k, v] of index) {
        if (k === rp || k.endsWith(`.${rp}`)) {
          if (visiting.has(k)) throw new Error(`Circular reference detected: ${k}`)
          visiting.add(k)
          const resolved = resolveValue(index, v, mode, visiting)
          visiting.delete(k)
          return resolved
        }
      }
      // Unresolved reference stays as-is
      return raw
    }
    // direct color string or other literal
    return raw
  }
  if (isObject(raw)) {
    // Mode-aware object, e.g., { Light: ..., Dark: ... }
    const sel = raw[mode] ?? raw['Default'] ?? raw['Light'] ?? raw['Dark']
    return resolveValue(index, sel, mode, visiting)
  }
  return raw
}

// Create nested object path
const setDeep = (obj, pathParts, value) => {
  let cur = obj
  for (let i = 0; i < pathParts.length - 1; i++) {
    const k = pathParts[i]
    if (!isObject(cur[k])) cur[k] = {}
    cur = cur[k]
  }
  cur[pathParts[pathParts.length - 1]] = value
}

// Determine if a value is a color and return TS expression or JSON literal
const toTsValue = (value) => {
  if (typeof value === 'string') {
    const color = parseColor(value)
    if (color) return { kind: 'expr', code: `withOpacity('${color.hex}', ${Number(color.alpha)})` }
    // Unresolved ref might resolve to color at runtime, but we keep it as string
    return { kind: 'json', value }
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return { kind: 'json', value }
  }
  return { kind: 'json', value: null }
}

const validIdent = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const serializeObject = (obj, indent = 2, level = 0) => {
  const pad = ' '.repeat(indent * level)
  const padIn = ' '.repeat(indent * (level + 1))
  if (!isObject(obj)) return 'null'
  const entries = Object.entries(obj)
  if (entries.length === 0) return '{}'
  const lines = ['{']
  for (const [k, v] of entries) {
    const key = validIdent.test(k) ? k : JSON.stringify(k)
    if (isObject(v) && 'kind' in v) {
      if (v.kind === 'expr') {
        lines.push(`${padIn}${key}: ${v.code},`)
        continue
      }
      if (v.kind === 'json') {
        lines.push(`${padIn}${key}: ${JSON.stringify(v.value)},`)
        continue
      }
    }
    if (isObject(v)) {
      lines.push(`${padIn}${key}: ${serializeObject(v, indent, level + 1)},`)
    } else {
      lines.push(`${padIn}${key}: ${JSON.stringify(v)},`)
    }
  }
  lines.push(`${pad}}`)
  return lines.join('\n')
}

const buildThemes = (root) => {
  // Index all tokens for reference resolution
  const index = buildIndex(root)

  const rlThemes = ((root || {}).Global || {})['RL Themes'] || (root || {})['RL Themes']
  if (!rlThemes || !isObject(rlThemes)) {
    throw new Error('Could not find RL Themes in theme.json')
  }

  const light = { component: {} }
  const dark = { component: {} }

  const processLeaf = (value, outPath) => {
    const lightResolved = resolveValue(index, value, 'Light')
    const darkResolved = resolveValue(index, value, 'Dark')
    setDeep(light, outPath, toTsValue(lightResolved))
    setDeep(dark, outPath, toTsValue(darkResolved))
  }

  const visit = (node, outPath) => {
    if (isObject(node) && '$type' in node && '$value' in node) {
      processLeaf(node.$value, outPath)
      return
    }
    if (!isObject(node)) return
    for (const [k, v] of Object.entries(node)) {
      if (k === '$type' || k === '$value') continue
      visit(v, [...outPath, toCamel(k)])
    }
  }

  for (const [categoryName, categoryObj] of Object.entries(rlThemes)) {
    if (!isObject(categoryObj)) continue
    if (categoryName === 'Component') {
      // Flatten components under component.*
      for (const [compName, compObj] of Object.entries(categoryObj)) {
        visit(compObj, ['component', toCamel(compName)])
      }
    } else {
      visit(categoryObj, ['component', toCamel(categoryName)])
    }
  }

  return { light, dark }
}

const generateTs = ({ light, dark }) => {
  const header = [
    "import { isDarkMode, withOpacity } from '@pmndrs/uikit'",
    "import { computed, Signal } from '@preact/signals-core'",
    '',
  ].join('\n')

  const lightStr = `const lightTheme = ${serializeObject(light, 2)} as const`
  const darkStr = `const darkTheme = ${serializeObject(dark, 2)} as const`

  const mergeFn = `function merge(light: any, dark: any) {\n  const isSignal = (v: any): v is Signal => v instanceof Signal\n  const isPlainObject = (v: any) => v != null && typeof v === 'object' && !isSignal(v)\n\n  // Leaf nodes or mismatched structures: return a reactive chooser\n  if (!isPlainObject(light) || !isPlainObject(dark)) {\n    return computed(() => {\n      const l = isSignal(light) ? light.value : light\n      const d = isSignal(dark) ? (dark as Signal).value : dark\n      return isDarkMode.value ? d : l\n    })\n  }\n\n  const result: any = {}\n  const keys = new Set([...Object.keys(light || {}), ...Object.keys(dark || {})])\n  for (const key of keys) {\n    result[key] = merge(light[key], dark?.[key])\n  }\n  return result\n}`

  const exportStr = `export const theme = merge(lightTheme, darkTheme) as unknown as typeof lightTheme`

  return [header, lightStr, '', darkStr, '', mergeFn, '', exportStr, ''].join('\n')
}

// CLI
const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const i = args.findIndex((a) => a === name || a.startsWith(`${name}=`))
  if (i === -1) return fallback
  const a = args[i]
  if (a.includes('=')) return a.slice(a.indexOf('=') + 1)
  return args[i + 1] || fallback
}

const inPath = path.resolve(getArg('--in', path.resolve(process.cwd(), './src/theme.json')))
const outFile = path.resolve(getArg('--out', path.resolve(process.cwd(), './src/theme.ts')))
const dryRun = ['1', 'true', 'yes'].includes(String(getArg('--dry', 'false')).toLowerCase())

const main = () => {
  const raw = fs.readFileSync(inPath, 'utf8')
  const json = JSON.parse(raw)
  const themes = buildThemes(json)
  const ts = generateTs(themes)
  if (dryRun) {
    process.stdout.write(ts)
    return
  }
  fs.writeFileSync(outFile, ts, 'utf8')
  // eslint-disable-next-line no-console
  console.log(`Generated ${path.relative(process.cwd(), outFile)} from ${path.relative(process.cwd(), inPath)}`)
}

main()
