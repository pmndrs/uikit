import { Command } from 'commander'
import { add } from './add.js'

export const component = new Command('component').description(`add components to your project`).addCommand(add)
