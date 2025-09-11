//layer structure description

//one layer section consists of (1004 layers)
//0. component base properties
//...1-1000. component classes
//1001. component default overrides

const MaxClassAmount = 1000
export const LayersSectionSize = MaxClassAmount + 2

//layer sections
//0. sm
//1. md
//2. lg
//3. xl
//4. 2xl
//5. dark
//6. hover
//7. active
//8. focus
//9. base
//- start inheritance
//- inheritance

const SectionStartIndexMap = {
  sm: LayersSectionSize * 0,
  md: LayersSectionSize * 1,
  lg: LayersSectionSize * 2,
  xl: LayersSectionSize * 3,
  '2xl': LayersSectionSize * 4,
  dark: LayersSectionSize * 5,
  hover: LayersSectionSize * 6,
  active: LayersSectionSize * 7,
  focus: LayersSectionSize * 8,
  base: LayersSectionSize * 9,
}

export const SpecialLayerSections = Object.keys(SectionStartIndexMap).filter((layer) => layer != 'base') as Array<
  Exclude<keyof typeof SectionStartIndexMap, 'base'>
>

export function getLayerIndex(identifier: LayerIdentifier) {
  if (identifier.type != 'class' && identifier.type != 'default-overrides' && identifier.type != 'base') {
    if (identifier.type === 'star-inheritance') {
      return LayersSectionSize * 10
    }
    return LayersSectionSize * 10 + 1
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
