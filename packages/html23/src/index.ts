#!/usr/bin/env node
import { Command } from 'commander'
import { add } from './add.js'
import { ZodError } from 'zod'
import chalk from 'chalk'

process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

export function getErrorString(error: any): string {
  if (typeof error === 'string') {
    return error
  } else if (error instanceof ZodError) {
    return error.format()._errors.join('\n')
  } else if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}

async function main() {
  const program = new Command()
    .name('html23')
    .description('CLI for installing pmndrs/uikit user interfaces build with html23')
  program.addCommand(add)
  program.parse()
}

main().catch((e) => {
  console.log(chalk.red(getErrorString(e)))
  process.exit(1)
})
