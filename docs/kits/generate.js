import ApfelRegistry from '../../packages/kits/apfel/registry.json' assert { type: 'json' }
import DefaultRegistry from '../../packages/kits/default/registry.json' assert { type: 'json' }
import { readFileSync, writeFileSync } from 'fs'

function generateMarkdown(kit, components) {
  let result = ''
  for (const component of components) {
    result += `## ${capitalize(component)}
![${component} example image](./${kit}/${component}.png)

<details><summary>Code</summary>

\`\`\`tsx
${readFileSync(`../../examples/${kit}/src/components/${component}.tsx`).toString()}
\`\`\`

</details>

[Live View](https://pmndrs.github.io/uikit/examples/${kit}/?component=${component})   
\`\`\`bash
npx uikit component add ${kit} ${component}
\`\`\`

`
  }
  return result
}

writeFileSync('apfel.md', generateMarkdown('apfel', Object.keys(ApfelRegistry)))
writeFileSync('default.md', generateMarkdown('default', Object.keys(DefaultRegistry)))

function capitalize(s) {
  return s[0].toUpperCase() + s.slice(1)
}
