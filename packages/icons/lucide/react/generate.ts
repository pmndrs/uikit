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
    const name = `${getName(icon)}`
    const raw = await readFile(`${baseDir}${icon}`)
    const svg = raw.toString()
    const code = `
      /* eslint-disable no-shadow-restricted-names */
      import { Icon, IconRef, IconProperties } from "@react-three/uikit";
      import { forwardRef } from "react"; 
      const text = \`${svg}\`;
      export const ${name}Icon = /*@__PURE__*/ forwardRef<IconRef, Omit<IconProperties, "text" | "svgWidth" | "svgHeight">>((props, ref) => {
        return <Icon {...props} ref={ref} text={text} svgWidth={24} svgHeight={24} />
      })
      export const ${name} = ${name}Icon
    `
    convertImports.push(`import { ${name}Icon } from './${name}.js'`)
    convertEntries.push(`${name}Icon: {
      propertyTypes: conversionPropertyTypes.Svg,
      renderAs: '${name}Icon',
      renderAsImpl: ${name}Icon,
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
