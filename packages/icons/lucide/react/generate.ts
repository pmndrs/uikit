import { readdir, readFile, writeFile } from 'fs/promises'

const baseDir = '../icons/'

async function main() {
  const icons = await readdir(baseDir)
  for (const icon of icons) {
    if (icon === '.gitkeep') {
      continue
    }
    const name = `${getName(icon)}`
    const code = `
import { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react'
import { ${name}Icon as Vanilla${name}Icon } from '@pmndrs/uikit-lucide'
import { SvgProperties, build } from '@react-three/uikit'

export const ${name}Icon: ForwardRefExoticComponent<
  PropsWithoutRef<SvgProperties> & RefAttributes<Vanilla${name}Icon>
> = /*@__PURE__*/ build<Vanilla${name}Icon, SvgProperties>(false, Vanilla${name}Icon)
export const ${name}: ForwardRefExoticComponent<
  PropsWithoutRef<SvgProperties> & RefAttributes<Vanilla${name}Icon>
> = ${name}Icon
    `
    writeFile(`src/${name}.tsx`, code)
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
