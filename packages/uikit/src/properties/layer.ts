//layer structure description

//one layer section consists of (1004 layers)
//0. component base properties
//...1-1000. component classes
//1001. component default overrides

const MaxClassAmount = 1000
export const LayersSectionSize = MaxClassAmount + 2

//layer sections
//0. important
//1. focus
//2. active
//3. hover
//4. dark
//5. 2xl
//6. xl
//7. lg
//8. md
//9. sm
//10. base
//- star inheritance
//- inheritance

const SectionStartIndexMap = {
  important: LayersSectionSize * 0,
  focus: LayersSectionSize * 1,
  active: LayersSectionSize * 2,
  hover: LayersSectionSize * 3,
  dark: LayersSectionSize * 4,
  '2xl': LayersSectionSize * 5,
  xl: LayersSectionSize * 6,
  lg: LayersSectionSize * 7,
  md: LayersSectionSize * 8,
  sm: LayersSectionSize * 9,
  base: LayersSectionSize * 10,
}

export const SpecialLayerSections = Object.keys(SectionStartIndexMap).filter((layer) => layer != 'base') as Array<
  Exclude<keyof typeof SectionStartIndexMap, 'base'>
>

export function getLayerIndex(identifier: LayerIdentifier) {
  if (identifier.type != 'class' && identifier.type != 'default-overrides' && identifier.type != 'base') {
    if (identifier.type === 'star-inheritance') {
      return LayersSectionSize * 11
    }
    return LayersSectionSize * 11 + 1
  }
  const sectionStartIndex = SectionStartIndexMap[identifier.section]
  if (identifier.type != 'class') {
    if (identifier.type === 'default-overrides') {
      return sectionStartIndex + MaxClassAmount
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
