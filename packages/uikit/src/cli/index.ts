#!/usr/bin/env node
import { Command } from 'commander'
import { component } from './component/index.js'

process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))

async function main() {
  const program = new Command().name('uikit').description('cli for uikit')
  program.addCommand(component)
  program.parse()
}

main()
