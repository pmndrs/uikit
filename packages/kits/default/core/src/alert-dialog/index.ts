import type { z } from 'zod'
import { Dialog, DialogProperties, DialogPropertiesSchema } from '../dialog/index.js'
export const AlertDialogPropertiesSchema = DialogPropertiesSchema

export type AlertDialogProperties = z.input<typeof AlertDialogPropertiesSchema>

export class AlertDialog extends Dialog {}

export * from './trigger.js'
export * from './content.js'
export * from './header.js'
export * from './footer.js'
export * from './title.js'
export * from './description.js'
export * from './action.js'
export * from './cancel.js'
