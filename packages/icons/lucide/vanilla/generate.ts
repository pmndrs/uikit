import { readdir, readFile, writeFile } from 'fs/promises'

const baseDir = '../icons/'

async function main() {
  const icons = await readdir(baseDir)
  for (const icon of icons) {
    if (icon === '.gitkeep') {
      continue
    }
    const name = `${getName(icon)}`
    const raw = await readFile(`${baseDir}${icon}`)
    const svg = raw.toString()
    const code = `
      /* eslint-disable no-shadow-restricted-names */
      import { AllOptionalProperties, Icon } from '@pmndrs/uikit'
      import { IconProperties } from '@pmndrs/uikit/internals'
      const text = \`${svg}\`;
      export class ${name}Icon extends Icon {
        constructor(properties?: IconProperties, defaultProperties?: AllOptionalProperties,) {
          super(text, 24, 24, properties, defaultProperties)
        }
      }
      export const ${name} = ${name}Icon
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
