import { readFileSync, writeFileSync, readdirSync } from 'fs'

function generateMarkdown(nav, kit, component) {
  const content = readFileSync(`../examples/${kit}/src/components/${component}.tsx`)
    .toString()
    .replace(/export (default )?/, '')
    .replace(/from \'\@\/.*\'/g, `from "@react-three/uikit-${kit}"`)
  const componentNameRegexResult = /function (.*)\(/.exec(content)
  if (componentNameRegexResult == null) {
    console.error(content)
    throw new Error()
  }
  const componentName = componentNameRegexResult[1]

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
      '@react-three/uikit': 'latest',
      '@react-three/uikit-${kit}': 'latest',
      '@react-three/drei': '<10',
    },
  }}
  files={{
    '/App.tsx': \`import { Canvas } from "@react-three/fiber";
import { Fullscreen } from "@react-three/uikit";
${content}
export default function App() {
  return (
    <Canvas style={{ position: "absolute", inset: "0", touchAction: "none" }} gl={{ localClippingEnabled: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[-5, 5, 10]} />
      <Fullscreen
        overflow="scroll"
        flexDirection="column"
        alignItems="center"
        padding={32}
      >
        <${componentName} />
      </Fullscreen>
    </Canvas>
  )
}\`}}
/>

\`\`\`bash
import { ${capitalize(component)} } from "@react-three/uikit-${kit}";
\`\`\``
}

let i = 17
const defaultComponentFiles = readdirSync('../examples/default/src/components', { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
  .map((entry) => entry.name.replace(/\.tsx$/, ''))

for (const component of defaultComponentFiles) {
  writeFileSync(`default-kit/${component}.mdx`, generateMarkdown(i++, 'default', component))
}


const horizonComponentFiles = readdirSync('../examples/horizon/src/components', { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith('.tsx'))
  .map((entry) => entry.name.replace(/\.tsx$/, ''))

for (const component of horizonComponentFiles) {
  writeFileSync(`horizon-kit/${component}.mdx`, generateMarkdown(i++, 'horizon', component))
}

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1)
}
