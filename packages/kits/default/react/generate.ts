import { existsSync } from 'fs'
import { mkdir, readdir, writeFile, access } from 'fs/promises'

const baseDir = '../core/src/'

const componentsWithoutChildren = [
  'AccordionTriggerIcon',
  'Avatar',
  'Checkbox',
  'Input',
  'Textarea',
  'Slider',
  'Switch',
  'Progress',
  'Video',
  'VideoControls',
  'PaginationPrevious',
  'PaginationNext',
  'PaginationEllipsis',
]

async function main() {
  const componentFolderNames = await readdir(baseDir)
  for (const componentFolderName of componentFolderNames) {
    if (componentFolderName.endsWith('.ts')) {
      continue
    }
    const componentFileNames = await readdir(baseDir + componentFolderName + '/')
    if (!existsSync(`src/${componentFolderName}`)) {
      await mkdir(`src/${componentFolderName}`)
    }
    for (const componentFileName of componentFileNames) {
      const name = `${getName(componentFileName === 'index.ts' ? `${componentFolderName}.ts` : `${componentFolderName}-${componentFileName}`)}`
      const canHaveChildren = !componentsWithoutChildren.includes(name)
      let code = `
import { ForwardRefExoticComponent, PropsWithoutRef, ReactNode, RefAttributes } from 'react'
import { ${name} as Vanilla${name}, ${name}Properties as Vanilla${name}Properties } from '@pmndrs/uikit-default'
import { build } from '@react-three/uikit'

export { ${name} as Vanilla${name} } from '@pmndrs/uikit-default'

export type ${name}Properties = Vanilla${name}Properties${canHaveChildren ? '& { children?: ReactNode }' : ''} 

export const ${name}: ForwardRefExoticComponent<
  PropsWithoutRef<${name}Properties> & RefAttributes<Vanilla${name}>
> = /*@__PURE__*/ build<Vanilla${name}, ${name}Properties>(Vanilla${name}, "VanillaDefault${name}")
    `
      if (componentFileName === 'index.ts') {
        code += '\n'
        for (const componentFileName of componentFileNames) {
          if (componentFileName === 'index.ts') {
            continue
          }
          code += `export * from "./${componentFileName.slice(0, -3)}.js";`
        }
      }
      writeFile(`src/${componentFolderName}/${componentFileName}`, code)
    }
  }
  writeFile(
    'src/index.ts',
    componentFolderNames
      .filter((componentFolderName) => !componentFolderName.endsWith('.ts'))
      .map((componentFolderName) => `export * from "./${componentFolderName}/index.js";`)
      .join('\n') +
      `\n\nexport { theme, setTheme, defaults, colors, defaultThemes, borderRadius } from '@pmndrs/uikit-default'`,
  )
}

function getName(fileName: string): string {
  const name = fileName.slice(0, -3)
  return name[0]!.toUpperCase() + name.slice(1).replace(/-./g, (x) => x[1]!.toUpperCase())
}

main()
