//layer structure description

//one layer section consists of (1004 layers)
//0. component base properties
//...1-MaxClassAmount component classes
//MaxClassAmount + 1 component default overrides

const MaxClassAmount = 1000
export const LayersSectionSize = MaxClassAmount + 2

//layer sections
//0. important
//1. placeholderStyle
//2. focus
//3. active
//4. hover
//5. dark
//6. 2xl
//7. xl
//8. lg
//9. md
//10. sm
//11. base
//- star inheritance
//- inheritance

const SectionStartIndexMap = {
  important: LayersSectionSize * 0,
  placeholderStyle: LayersSectionSize * 1,
  focus: LayersSectionSize * 2,
  active: LayersSectionSize * 3,
  hover: LayersSectionSize * 4,
  dark: LayersSectionSize * 5,
  '2xl': LayersSectionSize * 6,
  xl: LayersSectionSize * 7,
  lg: LayersSectionSize * 8,
  md: LayersSectionSize * 9,
  sm: LayersSectionSize * 10,
  base: LayersSectionSize * 11,
}

export const SpecialLayerSections = Object.keys(SectionStartIndexMap).filter((layer) => layer != 'base') as Array<
  Exclude<keyof typeof SectionStartIndexMap, 'base'>
>

export function getLayerIndex(identifier: LayerIdentifier) {
  if (identifier.type != 'class' && identifier.type != 'default-overrides' && identifier.type != 'base') {
    if (identifier.type === 'star-inheritance') {
      return LayersSectionSize * 12
    }
    return LayersSectionSize * 12 + 1
  }
  const sectionStartIndex = SectionStartIndexMap[identifier.section]
  if (identifier.type != 'class') {
    if (identifier.type === 'default-overrides') {
      return sectionStartIndex + MaxClassAmount + 1
    }
    return sectionStartIndex
  }
  const classIndex = identifier.classIndex
  if (classIndex >= MaxClassAmount) {
    throw new Error(`class index "${classIndex}" exceeds the maximum number of classes (${MaxClassAmount})`)
  }
  const maxClassIndex = MaxClassAmount - 1
  //we are inverting the class index, since class priority goes from high to low index (which is inverted to the layer indices, which is low to high)
  return sectionStartIndex + maxClassIndex - classIndex + 1
}

export type LayerSection = keyof typeof SectionStartIndexMap

export type LayerIdentifier =
  | {
      type: 'inheritance' | 'star-inheritance'
    }
  | (LayerInSectionIdentifier & {
      section: LayerSection
    })

export type LayerInSectionIdentifier =
  | {
      type: 'class'
      classIndex: number
    }
  | {
      type: 'base' | 'default-overrides'
    }
