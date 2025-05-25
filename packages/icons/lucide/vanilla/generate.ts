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
      import { RenderContext, Svg, SvgProperties, ThreeEventMap, SvgOutProperties, InProperties } from '@pmndrs/uikit'
      const content = \`${svg}\`;
      export class ${name}Icon<T = {}, EM extends ThreeEventMap = ThreeEventMap, OutProperties extends SvgOutProperties<EM> = SvgOutProperties<EM>, NonReactiveProperties = {}> extends Svg<T, EM, OutProperties, NonReactiveProperties> {
        constructor(
          inputProperties?: InProperties<OutProperties, NonReactiveProperties>,
          initialClasses?: Array<SvgProperties<EM> | string>,
          renderContext?: RenderContext,
        ) {
          super(
            {
              content,
              width: 24,
              height: 24,
              aspectRatio: 1,
              keepAspectRatio: false,
              ...inputProperties,
            } as InProperties<OutProperties, NonReactiveProperties>,
            initialClasses,
            renderContext,
          )
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
  return name[0]!.toUpperCase() + name.slice(1).replace(/-./g, (x) => x[1]!.toUpperCase())
}

main()
