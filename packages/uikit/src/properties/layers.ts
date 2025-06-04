export const MaxClassAmount = 10000
export const LayersSectionSize = MaxClassAmount + 1

export const LayerSectionStart = {
  sm: LayersSectionSize * 0,
  md: LayersSectionSize * 1,
  lg: LayersSectionSize * 2,
  xl: LayersSectionSize * 3,
  '2xl': LayersSectionSize * 4,
  dark: LayersSectionSize * 5,
  hover: LayersSectionSize * 6,
  active: LayersSectionSize * 7,
  focus: LayersSectionSize * 8,
}

export const LayerSectionStartBase = LayersSectionSize * 9

export const LayerSectionStartInherited = LayersSectionSize * 10

export const LayerIndexInheritance = 1000000000
export const LayerIndexStarInheritance = LayerIndexInheritance + 1

export const LayerIndexDefaults = LayerIndexInheritance + 2
