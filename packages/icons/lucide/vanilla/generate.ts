import { readdir, readFile, writeFile } from 'fs/promises'

const baseDir = '../icons/'

async function main() {
  const icons = await readdir(baseDir)
  for (const icon of icons) {
    if (icon === '.gitkeep') {
      continue
    }
    const name = getName(icon)
    const raw = await readFile(`${baseDir}${icon}`)
    const svg = raw.toString()
    const code = `
      /* eslint-disable no-shadow-restricted-names */
      import { AllOptionalProperties, Icon, Parent } from '@vanilla-three/uikit'
      import { IconProperties } from '@vanilla-three/uikit/internals'
      const text = \`${svg}\`;
      export class ${name} extends Icon {
        constructor(parent: Parent, properties: IconProperties, defaultProperties?: AllOptionalProperties,) {
          super(parent, text, 24, 24, properties, defaultProperties)
        }
      }
    `
    writeFile(`src/${name}.ts`, code)
  }
  writeFile(
    'src/index.ts',
    icons
      .filter((icon) => icon != '.gitkeep')
      .map((icon) => `export * from "./${getName(icon)}.js";`)
      .join('\n'),
  )
}

function getName(file: string): string {
  const name = file.slice(0, -4)
  return name[0].toUpperCase() + name.slice(1).replace(/-./g, (x) => x[1].toUpperCase())
}

main()
