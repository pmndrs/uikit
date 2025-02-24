import ApfelRegistry from '../packages/kits/apfel/src/registry.json' assert { type: 'json' }
import DefaultRegistry from '../packages/kits/default/src/registry.json' assert { type: 'json' }
import { readFileSync, writeFileSync } from 'fs'

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
import { Defaults${kit === 'default' ? ', DialogAnchor' : ''} } from "@react-three/uikit-${kit}";
${content}
export default function App() {
  return (
    <Canvas style={{ position: "absolute", inset: "0", touchAction: "none" }} gl={{ localClippingEnabled: true }}>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1} position={[-5, 5, 10]} />
      <Defaults>
        <Fullscreen
          overflow="scroll"
          scrollbarColor="black"
          backgroundColor="white"
          dark={{ backgroundColor: "black" }}
          flexDirection="column"
          gap={32}
          paddingX={32}
          alignItems="center"
          padding={32}
        >
          ${kit === 'default' ? `<DialogAnchor><${componentName} /></DialogAnchor>` : `<${componentName} />`}
        </Fullscreen>
      </Defaults>
    </Canvas>
  )
}\`}}
/>

\`\`\`bash
npx uikit component add ${kit} ${component}
\`\`\``
}

let i = 17
for (const component of Object.keys(DefaultRegistry)) {
  writeFileSync(`default-kit/${component}.mdx`, generateMarkdown(i++, 'default', component))
}

for (const component of Object.keys(ApfelRegistry)) {
  writeFileSync(`apfel-kit/${component}.mdx`, generateMarkdown(i++, 'apfel', component))
}
function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1)
}
