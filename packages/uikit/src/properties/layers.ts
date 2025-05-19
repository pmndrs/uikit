export const MaxClassAmount = 10000
export const LayersSectionSize = MaxClassAmount + 1

export const LayerSectionStart = {
  responsiveSm: LayersSectionSize * 0,
  responsiveMd: LayersSectionSize * 1,
  responsiveLg: LayersSectionSize * 2,
  responsiveXl: LayersSectionSize * 3,
  responsive2Xl: LayersSectionSize * 4,
  dark: LayersSectionSize * 5,
  hover: LayersSectionSize * 6,
  active: LayersSectionSize * 7,
  focus: LayersSectionSize * 8,
}

export const LayerSectionStartBase = LayersSectionSize * 9

export const LayerIndexInheritance = 1000000000

export const LayerIndexDefaults = LayerIndexInheritance + 1
