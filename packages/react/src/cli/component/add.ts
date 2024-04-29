import { Command } from 'commander'
import { ZodError, z } from 'zod'
import prompts from 'prompts'
import chalk from 'chalk'
import { resolve } from 'path'
import { createWriteStream, existsSync } from 'fs'
import ora from 'ora'
import { Readable } from 'stream'
import { finished } from 'stream/promises'
import { cwd } from 'process'
import { mkdir } from 'fs/promises'

const commandOptionsSchema = z.object({
  path: z.string().optional(),
  overwrite: z.boolean(),
  cwd: z.string(),
})

const kitAndComponentsSchema = z.array(z.string()).min(2)

const BASE_URL = 'https://raw.githubusercontent.com/pmndrs/uikit/main/packages/kits/'

export const add = new Command('add')
  .description('add a component to your project')
  .argument('<kit> <components...>', 'components from kit to add')
  .option('-p, --path <path>', 'the path to add the component to.')
  .option('-o, --overwrite', 'overwrite existing files.', false)
  .option('-c, --cwd <cwd>', 'the working directory. defaults to the current directory.', cwd())
  .action(async (c, opts) => {
    try {
      let [kit, ...components] = kitAndComponentsSchema
        .parse(c, {
          errorMap: (issue) => {
            if (issue.code === 'too_small') {
              return {
                message: 'Command requires <kit> and <components...>',
              }
            }
            return { message: issue.message ?? '' }
          },
        })
        .map((s) => s.toLowerCase())
      let { overwrite, path, cwd } = commandOptionsSchema.parse(opts)

      let registry: Awaited<ReturnType<typeof getRegistry>>
      try {
        registry = await getRegistry(kit)
      } catch (e) {
        throw `Unable to fetch registry for ${kit} kit: ${getErrorString(e)}`
      }

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

      const absPath = resolve(cwd, path, kit)

      if (!existsSync(absPath)) {
        await mkdir(absPath, { recursive: true })
      }

      const absThemePath = resolve(absPath, 'theme.tsx')
      if (!existsSync(absThemePath)) {
        await download(kit, 'base-theme.tsx', absThemePath)
      }

      const componentsToInstall = new Set<string>()

      for (const component of components) {
        componentsToInstall.add(component)
        const registryEntry = registry[component]
        if (registryEntry == null) {
          throw `component ${kit} ${component} is not in the registry`
        }
        if (registryEntry.registryDependencies == null) {
          continue
        }
        for (const dependency of registryEntry.registryDependencies) {
          componentsToInstall.add(dependency)
        }
      }

      const spinner = ora(`Installing ${kit} components...`).start()
      component: for (const component of componentsToInstall) {
        try {
          spinner.text = `Installing ${kit} ${component}...`
          const registryEntry = registry[component]
          if (registryEntry == null) {
            throw `component not in registry`
          }
          const files = registryEntry.files

          if (!overwrite) {
            for (const file of files) {
              const absFilePath = resolve(absPath, file)
              if (existsSync(absFilePath)) {
                spinner.stop()
                const { overwrite } = await prompts({
                  type: 'confirm',
                  name: 'overwrite',
                  message: `Component ${component} already exists. Would you like to overwrite?`,
                  initial: false,
                })

                if (overwrite === false) {
                  console.log(chalk.cyan(`Installing ${kit} ${component} was skipped to prevent overwriting ${file}.`))
                  continue component
                }

                spinner.start(`Installing ${kit} ${component}...`)
              }
            }
          }
          for (const file of files) {
            const absFilePath = resolve(absPath, file)
            download(kit, file, absFilePath)
          }
        } catch (e) {
          throw `Unable to install ${kit} ${component}: ${getErrorString(e)}`
        }
      }
      spinner.succeed(`Done.`)
    } catch (e) {
      console.log(chalk.red(getErrorString(e)))
      process.exit(1)
    }
  })

async function download(kit: string, file: string, targetAbsolutePath: string) {
  const response = await fetch(`${BASE_URL}${kit}/src/${file}`)
  if (response.body == null) {
    throw new Error(`Invalid response when downloading ${file} from registry: ${response.statusText}`)
  }
  const stream = createWriteStream(targetAbsolutePath)
  await finished(Readable.fromWeb(response.body as any).pipe(stream))
}

function getErrorString(error: any): string {
  if (typeof error === 'string') {
    return error
  } else if (error instanceof ZodError) {
    return error.format()._errors.join('\n')
  } else if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

const registrySchema = z.record(
  z.string(),
  z.object({
    files: z.array(z.string()),
    registryDependencies: z.array(z.string()).optional(),
  }),
)

async function getRegistry(kit: string) {
  const data = await (await fetch(`${BASE_URL}${kit}/src/registry.json`)).json()
  return registrySchema.parse(data)
}
