import { MeshBasicMaterial } from 'three'
import type { FontWeight, GlyphProperties, WordBreak } from '../text/index.js'
import { alignmentXMap, alignmentYMap, type VisibilityProperties } from '../utils.js'
import type { PanelGroupProperties } from '../panel/instanced-panel-group.js'

export const defaults = {
  scrollbarWidth: 10,
  visibility: 'visible' as Required<VisibilityProperties>['visibility'],
  updateMatrixWorld: false,
  opacity: 1 as number | `${number}%`,
  depthTest: true,
  renderOrder: 0,
  fontSize: 16 as Required<GlyphProperties>['fontSize'],
  letterSpacing: 0 as Required<GlyphProperties>['letterSpacing'],
  lineHeight: '120%' as Required<GlyphProperties>['lineHeight'],
  wordBreak: 'break-word' as Required<GlyphProperties>['wordBreak'],
  verticalAlign: 'middle' as keyof typeof alignmentYMap,
  textAlign: 'left' as keyof typeof alignmentXMap | 'justify',
  fontWeight: 'normal' as FontWeight,
  caretWidth: 1.5,
  receiveShadow: false,
  castShadow: false,
  panelMaterialClass: MeshBasicMaterial as NonNullable<PanelGroupProperties['panelMaterialClass']>,
  pixelSize: 0.01,
  anchorX: 'center' as keyof typeof alignmentXMap,
  anchorY: 'center' as keyof typeof alignmentYMap,
}

export type Defaults = typeof defaults
