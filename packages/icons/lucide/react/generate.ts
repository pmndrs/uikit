import { readdir, readFile, writeFile } from 'fs/promises'

const baseDir = '../icons/'

async function main() {
  const icons = await readdir(baseDir)
  const convertEntries: Array<string> = []
  const convertImports: Array<string> = []
  for (const icon of icons) {
    if (icon === '.gitkeep') {
      continue
    }
    const name = `${getName(icon)}Icon`
    const raw = await readFile(`${baseDir}${icon}`)
    const svg = raw.toString()
    const code = `
      /* eslint-disable no-shadow-restricted-names */
      import { Icon, ComponentInternals, IconProperties } from "@react-three/uikit";
      import { forwardRef } from "react"; 
      export type ${name}Props = Omit<IconProperties, "text" | "svgWidth" | "svgHeight">;
      const text = \`${svg}\`;
      export const ${name} = /*@__PURE__*/ forwardRef<ComponentInternals<IconProperties>, ${name}Props>((props, ref) => {
        return <Icon {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
    `
    convertImports.push(`import { ${name} } from './${name}.js'`)
    convertEntries.push(`${name}: {
      propertyTypes: conversionPropertyTypes.Svg,
      renderAs: '${name}',
      renderAsImpl: ${name},
      children: 'none',
    }`)
    writeFile(`src/${name}.tsx`, code)
  }
  writeFile(
    'src/convert.ts',
    `
    import { ConversionComponentMap, conversionPropertyTypes } from '@react-three/uikit'
    ${convertImports.join('\n')}

    export const componentMap: ConversionComponentMap = {
      ${convertEntries.join(',\n')}
    }`,
  )
  writeFile(
    'src/index.tsx',
    icons
      .filter((icon) => icon != '.gitkeep')
      .map((icon) => `export * from "./${getName(icon)}.js";`)
      .join('\n') + `\nexport * from "./convert.js"`,
  )
}

function getName(file: string): string {
  const name = file.slice(0, -4)
  return name[0].toUpperCase() + name.slice(1).replace(/-./g, (x) => x[1].toUpperCase())
}

main()
