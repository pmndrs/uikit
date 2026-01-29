import ApfelRegistry from '../packages/kits/apfel/src/registry.json' assert { type: 'json' }
import DefaultRegistry from '../packages/kits/default/src/registry.json' assert { type: 'json' }
import { readFileSync, writeFileSync } from 'fs'

function generateMarkdown(nav, kit, component) {
  return `---
title: ${capitalize(component)}
description: How to use the ${capitalize(component)} component from the ${capitalize(kit)} kit.
nav: ${nav}
---

\`\`\`ts
import { ${capitalize(component)} } from "@ni2khanna/uikit-${kit}"
\`\`\`

See the \`examples/\` directory for full vanilla TypeScript usage of kit components.`
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
