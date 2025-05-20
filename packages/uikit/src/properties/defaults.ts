import { Material, MeshBasicMaterial } from 'three'
import { FontWeight, GlyphLayoutProperties, WordBreak } from '../text/index.js'
import { alignmentXMap, alignmentYMap, VisibilityProperties } from '../utils.js'

export const defaults = {
  scrollbarWidth: 10,
  visibility: 'visible' as Required<VisibilityProperties>['visibility'],
  updateMatrixWorld: false,
  opacity: 1,
  depthTest: true,
  renderOrder: 0,
  fontSize: 16,
  letterSpacing: 0,
  lineHeight: '120%' as GlyphLayoutProperties['lineHeight'],
  wordBreak: 'break-word' as WordBreak,
  verticalAlign: 'middle' as keyof typeof alignmentYMap,
  textAlign: 'left' as keyof typeof alignmentXMap | 'block',
  fontWeight: 'normal' as FontWeight,
  caretWidth: 1.5,
  receiveShadow: false,
  castShadow: false,
  panelMaterialClass: MeshBasicMaterial as typeof Material,
  pixelSize: 0.01,
  anchorX: 'center' as keyof typeof alignmentXMap,
  anchorY: 'center' as keyof typeof alignmentYMap,
}

export type Defaults = typeof defaults
