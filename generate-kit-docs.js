import { readFileSync, writeFileSync, readdirSync } from 'fs'

function stripExportKeyword(source) {
  return source
    .split('\n')
    .map((line) => {
      const trimmed = line.trimStart()
      const indent = line.slice(0, line.length - trimmed.length)
      if (trimmed.startsWith('export default function ')) {
        return `${indent}${trimmed.replace('export default ', '')}`
      }
      if (trimmed.startsWith('export function ')) {
        return `${indent}${trimmed.replace('export ', '')}`
      }
      return line
    })
    .join('\n')
}

function replaceAliasImports(source, kit) {
  const lines = source.split('\n')
  const replacement = `@react-three/uikit-${kit}`

  return lines
    .map((line) => {
      const singleIndex = line.indexOf("from '")
      const doubleIndex = line.indexOf('from "')
      const fromIndex =
        singleIndex === -1 || (doubleIndex !== -1 && doubleIndex < singleIndex) ? doubleIndex : singleIndex
      if (fromIndex === -1) {
        return line
      }
      const quoteIndex = fromIndex + 5
      const quote = line[quoteIndex]
      const pathStart = quoteIndex + 1
      const pathEnd = line.indexOf(quote, pathStart)
      if (pathEnd === -1) {
        return line
      }
      const path = line.slice(pathStart, pathEnd)
      if (!path.startsWith('@/')) {
        return line
      }
      const rewritten = `from ${quote}${replacement}${quote}`
      return line.slice(0, fromIndex) + rewritten + line.slice(pathEnd + 1)
    })
    .join('\n')
}

function findComponentName(source) {
  const match = source.match(/\bfunction\s+([A-Za-z0-9_$]+)\s*\(/)
  return match ? match[1] : null
}

function getImportStatements(source) {
  const statements = []
  const lines = source.split('\n')
  let current = ''
  let inImport = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!inImport) {
      if (!trimmed.startsWith('import ')) {
        continue
      }
      current = line
      inImport = !trimmed.includes(' from ')
      if (!inImport) {
        statements.push(current)
        current = ''
      }
      continue
    }

    current += `\n${line}`
    if (trimmed.includes(' from ')) {
      statements.push(current)
      current = ''
      inImport = false
    }
  }

  return statements
}

function hasNamedImport(source, moduleName, importName) {
  const statements = getImportStatements(source)
  for (const statement of statements) {
    const matchesModule = statement.includes(`from "${moduleName}"`) || statement.includes(`from '${moduleName}'`)
    if (!matchesModule) {
      continue
    }
    const braceStart = statement.indexOf('{')
    const braceEnd = statement.indexOf('}')
    if (braceStart === -1 || braceEnd === -1 || braceEnd < braceStart) {
      continue
    }
    const names = statement
      .slice(braceStart + 1, braceEnd)
      .split(',')
      .map((name) => name.trim().split(' ')[0])
      .filter(Boolean)
    if (names.includes(importName)) {
      return true
    }
  }
  return false
}

function generateMarkdown(nav, kit, component) {
  let content = readFileSync(`./examples/${kit}/src/components/${component}.tsx`).toString()
  content = stripExportKeyword(content)
  content = replaceAliasImports(content, kit)
  const componentName = findComponentName(content)
  if (componentName == null) {
    console.error(content)
    throw new Error()
  }
  const needsColors = kit === 'default' && !hasNamedImport(content, '@react-three/uikit-default', 'colors')
  const needsPanel = kit === 'horizon' && !hasNamedImport(content, '@react-three/uikit-horizon', 'Panel')
  const kitWrapperImport =
    kit === 'default'
      ? needsColors
        ? `import { colors } from "@react-three/uikit-default";`
        : ''
      : needsPanel
        ? 'import { Panel } from "@react-three/uikit-horizon";'
        : ''

  return `---
title: ${capitalize(component)}
description: How to use the ${capitalize(component)} component from the ${capitalize(kit)} kit.
nav: ${nav}
---

<Sandpack
  template="react-ts"
  customSetup={{
    dependencies: {
      'three': 'latest',
      '@react-three/fiber': '<9',
      '@react-three/uikit': '^1.0.44',
      '@react-three/uikit-${kit}': '^1.0.44',
      '@react-three/uikit-lucide': '^1.0.44',
      '@react-three/drei': '<10',
    },
  }}
  files={{
    '/App.tsx': \`import { Canvas } from "@react-three/fiber";
import { Fullscreen } from "@react-three/uikit";
${kitWrapperImport}
${content}
export default function App() {
  return (
    <Canvas style={{ position: "absolute", inset: "0", touchAction: "none" }} gl={{ localClippingEnabled: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[-5, 5, 10]} />
      ${
        kit === 'default'
          ? `<Fullscreen
        overflow="scroll"
        flexDirection="column"
        alignItems="center"
        padding={32}
        backgroundColor={colors.background}
      >
        <${componentName} />
      </Fullscreen>`
          : `<Fullscreen
        overflow="scroll"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Panel color="black" dark={{ color: "white" }} padding={32}>
          <${componentName} />
        </Panel>
      </Fullscreen>`
      }
    </Canvas>
  )
}\`}}
/>

\`\`\`bash
import { ${capitalize(component)} } from "@react-three/uikit-${kit}";
\`\`\``
}

let i = 17
const defaultComponentFiles = readdirSync('./examples/default/src/components', { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
  .map((entry) => entry.name.slice(0, -4))

for (const component of defaultComponentFiles) {
  writeFileSync(`./docs/default-kit/${component}.mdx`, generateMarkdown(i++, 'default', component))
}

const horizonComponentFiles = readdirSync('./examples/horizon/src/components', { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
  .map((entry) => entry.name.slice(0, -4))

for (const component of horizonComponentFiles) {
  writeFileSync(`./docs/horizon-kit/${component}.mdx`, generateMarkdown(i++, 'horizon', component))
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1)
}
