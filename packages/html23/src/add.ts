import { Command } from 'commander'
import { ZodError, z } from 'zod'
import prompts from 'prompts'
import chalk from 'chalk'
import { resolve } from 'path'
import { existsSync } from 'fs'
import ora from 'ora'
import { cwd } from 'process'
import { mkdir, writeFile } from 'fs/promises'
import { htmlToCode, installComponents } from '@react-three/uikit'
import brotli from 'brotli-compress'
import { initializeApp } from 'firebase/app'
import { getFirestore, getDoc, doc } from 'firebase/firestore'
import { componentMap as defaultComponentMap } from '@react-three/uikit-default'
import { componentMap as lucideComponentMap } from '@react-three/uikit-lucide'
import { getErrorString } from './index.js'

const commandOptionsSchema = z.object({
  path: z.string().optional(),
  overwrite: z.boolean(),
  cwd: z.string(),
})

const firebaseConfig = {
  apiKey: 'AIzaSyCaBoJlRYNt3hSE4HeGE0quMKduBpSOYxQ',
  authDomain: 'html23-9ca77.firebaseapp.com',
  projectId: 'html23-9ca77',
  storageBucket: 'html23-9ca77.appspot.com',
  messagingSenderId: '993913345021',
  appId: '1:993913345021:web:f9c1bf07af8a8fc1197f94',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

const textDecoder = new TextDecoder()

const customColors = {
  background: 1,
  foreground: 1,
  card: 1,
  cardForeground: 1,
  popover: 1,
  popoverForeground: 1,
  primary: 1,
  primaryForeground: 1,
  secondary: 1,
  secondaryForeground: 1,
  muted: 1,
  mutedForeground: 1,
  accent: 1,
  accentForeground: 1,
  destructive: 1,
  destructiveForeground: 1,
  border: 1,
  input: 1,
  ring: 1,
}

const customComponentMap = { ...defaultComponentMap, ...lucideComponentMap }

const BASE_URL = 'https://raw.githubusercontent.com/pmndrs/uikit/main/packages/kits/'

export const add = new Command('add')
  .description('add a user interface build with html23 to your project')
  .argument('<projectId>', 'project id from html23')
  .option('-p, --path <path>', 'the path to add the component to.')
  .option('-o, --overwrite', 'overwrite existing files.', false)
  .option('-c, --cwd <cwd>', 'the working directory. defaults to the current directory.', cwd())
  .action(async (projectId: string, opts) => {
    try {
      let { overwrite, path, cwd } = commandOptionsSchema.parse(opts)

      if (path == null) {
        path = (
          await prompts({
            type: 'text',
            name: 'path',
            message: `Configure the path for the ${chalk.cyan('components')}:`,
            initial: 'src/components',
          })
        ).path as string
      }

      const spinner = ora(`Installing html23 user interface...`).start()
      const data = await (await getDoc(doc(db, 'links', projectId))).get('data')
      if (data == null) {
        throw new Error(`unknow project "${projectId}"`)
      }
      const array = new Uint8Array([...atob(data)].map((cp) => cp.codePointAt(0)!))
      const { code: html } = JSON.parse(textDecoder.decode(await brotli.decompress(array)))
      const { code, componentNames, customComponentNamesMap } = await htmlToCode(html, customColors, customComponentMap)

      //install dependencies
      const componentsToInstall = Array.from(customComponentNamesMap.keys()).filter((key) => key != 'lucide')
      if (componentsToInstall.length > 0) {
        installComponents('default', cwd, path, componentsToInstall, 'skip', spinner)
      }

      const imports: Array<string> = [`import { ${Array.from(componentNames).join(', ')} } from "@react-three/uikit"`]
      for (const [componentName, componentNames] of customComponentNamesMap) {
        const importFrom = componentName === 'lucide' ? '@react-three/lucide' : `../default/${componentName}.js`
        imports.push(`import { ${Array.from(componentNames).join(', ')} } from "${importFrom}"`)
      }

      spinner.stop()
      const name = (
        await prompts({
          type: 'text',
          name: 'name',
          message: `What should we name the component?`,
          initial: 'Component',
        })
      ).name as string

      const absPath = resolve(cwd, path, 'html23')
      if (!existsSync(absPath)) {
        await mkdir(absPath, { recursive: true })
      }
      const filePath = resolve(absPath, `${name.toLowerCase()}.tsx`)

      if (!overwrite && existsSync(filePath)) {
        spinner.stop()
        const { overwrite } = await prompts({
          type: 'confirm',
          name: 'overwrite',
          message: `Component ${name} already exists. Would you like to overwrite?`,
          initial: false,
        })
        if (!overwrite) {
          console.log(chalk.cyan(`Installing ${name} was skipped to prevent overwriting.`))
          return
        }
      }

      await writeFile(filePath, `${imports.join('\n')}\n\n${code}`)

      spinner.succeed(`Done.`)
    } catch (e) {
      console.log(chalk.red(getErrorString(e)))
      process.exit(1)
    }
  })
