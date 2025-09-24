import { Dialog, DialogProperties } from '../dialog/index.js'

export type AlertDialogProperties = DialogProperties

export class AlertDialog extends Dialog {}

export * from './trigger.js'
export * from './content.js'
export * from './header.js'
export * from './footer.js'
export * from './title.js'
export * from './description.js'
export * from './action.js'
export * from './cancel.js'
