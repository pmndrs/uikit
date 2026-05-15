import { MeshBasicMaterial } from 'three'
import type { FontWeight, GlyphProperties, WhiteSpace } from '../text/index.js'
import { alignmentXMap, alignmentYMap, type VisibilityProperties } from '../utils.js'
import type { PanelGroupProperties } from '../panel/instance/properties.js'
import type { NumberValue, AbsoluteLengthValue, NumberOrPercentageValue } from './values.js'

export const componentDefaults = {
  scrollbarWidth: 10 as AbsoluteLengthValue,
  visibility: 'visible' as Required<VisibilityProperties>['visibility'],
  opacity: 1 as NumberOrPercentageValue,
  depthTest: true,
  renderOrder: 0 as NumberValue,
  fontSize: 16 as Required<GlyphProperties>['fontSize'],
  letterSpacing: 0 as Required<GlyphProperties>['letterSpacing'],
  lineHeight: '120%' as Required<GlyphProperties>['lineHeight'],
  wordBreak: 'break-word' as Required<GlyphProperties>['wordBreak'],
  verticalAlign: 'middle' as keyof typeof alignmentYMap,
  textAlign: 'left' as keyof typeof alignmentXMap | 'justify',
  fontWeight: 'normal' as FontWeight,
  caretWidth: 1.5 as AbsoluteLengthValue,
  receiveShadow: false,
  castShadow: false,
  panelMaterialClass: MeshBasicMaterial as NonNullable<PanelGroupProperties['panelMaterialClass']>,
  pixelSize: 0.01 as NumberValue,
  anchorX: 'center' as keyof typeof alignmentXMap,
  anchorY: 'center' as keyof typeof alignmentYMap,
  tabSize: 8 as NumberValue,
  whiteSpace: 'normal' as WhiteSpace,
}

export type ComponentDefaultsProperties = typeof componentDefaults
