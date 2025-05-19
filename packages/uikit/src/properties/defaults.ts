import { MeshBasicMaterial } from 'three'

export const defaults = {
  scrollbarWidth: 10,
  visibility: 'visible',
  updateMatrixWorld: false,
  opacity: 1,
  depthTest: true,
  renderOrder: 0,
  fontSize: 16,
  letterSpacing: 0,
  lineHeight: '120%',
  wordBreak: 'break-word',
  verticalAlign: 'middle',
  textAlign: 'left',
  fontWeight: 'normal',
  caretWidth: 1.5,
  receiveShadow: false,
  castShadow: false,
  panelMaterialClass: MeshBasicMaterial,
  pixelSize: 0.01,
  anchorX: 'center',
  anchorY: 'center',
} as const

export type Defaults = typeof defaults
