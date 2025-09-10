import { Dialog, DialogProperties } from '../dialog/index.js'
import type { ThreeEventMap } from '@pmndrs/uikit'

export type AlertDialogProperties<EM extends ThreeEventMap = ThreeEventMap> = DialogProperties<EM>

export class AlertDialog<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Dialog<T, EM> {}

export * from './trigger.js'
export * from './content.js'
export * from './header.js'
export * from './footer.js'
export * from './title.js'
export * from './description.js'
export * from './action.js'
export * from './cancel.js'
