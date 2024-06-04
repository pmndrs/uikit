import { writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { Converter, filterMapByKeys, mapToRecord, mergeMaps } from '../../../scripts/shared.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const converter = new Converter(resolve(__dirname, '../src/components/index.ts'))

const allOptionalProperties = converter.extractPropertyTypes(converter.getSchema('AllOptionalProperties'))

const containerProperties = converter.extractPropertyTypes(converter.getSchema('ContainerProperties'))

const removeConditionalsAndClasses = new Set([
  'classes',
  'hover',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'dark',
  'active',
  'focus',
])

const inheritableProperties = mergeMaps(
  converter.extractPropertyTypes(converter.getSchema('TextProperties'), containerProperties),
  filterMapByKeys(
    allOptionalProperties,
    (key) => key.startsWith('caret') || key.startsWith('selection') || key.startsWith('scrollbar'),
  ),
)

const result = {
  Inheriting: mapToRecord(inheritableProperties),
  Shared: mapToRecord(
    converter.extractPropertyTypes(
      converter.getSchema('ContainerProperties'),
      inheritableProperties,
      removeConditionalsAndClasses,
    ),
  ),
  Container: {},
  Image: mapToRecord(
    converter.extractPropertyTypes(
      converter.getSchema('ImageProperties'),
      containerProperties,
      inheritableProperties,
      removeConditionalsAndClasses,
    ),
  ),
  Svg: mapToRecord(
    converter.extractPropertyTypes(
      converter.getSchema('_SvgProperties'),
      containerProperties,
      inheritableProperties,
      removeConditionalsAndClasses,
    ),
  ),
  Icon: mapToRecord(
    converter.extractPropertyTypes(
      converter.getSchema('IconProperties'),
      containerProperties,
      inheritableProperties,
      removeConditionalsAndClasses,
    ),
  ),
  Input: mapToRecord(
    converter.extractPropertyTypes(
      converter.getSchema('InputProperties'),
      containerProperties,
      inheritableProperties,
      removeConditionalsAndClasses,
    ),
  ),
  Text: {},
  Video: mapToRecord(
    converter.extractPropertyTypes(
      converter.getSchema('VideoProperties'),
      containerProperties,
      inheritableProperties,
      removeConditionalsAndClasses,
    ),
  ),
}
writeFileSync(
  resolve(__dirname, '../src/convert/html/generated-property-types.ts'),
  `export const generatedPropertyTypes = ${JSON.stringify(result)}`,
)
