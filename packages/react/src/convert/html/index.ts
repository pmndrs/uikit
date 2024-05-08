import { ConversionNode, ConversionColorMap, convertParsedHtml, parseHtml } from '@pmndrs/uikit/internals'
import { format } from 'prettier/standalone'
import babel, * as starBabel from 'prettier/plugins/babel.js'
import estree, * as starEstree from 'prettier/plugins/estree.js'
import { ConversionComponentMap } from './preview.js'

export { ConversionNode, ConversionHtmlNode } from '@pmndrs/uikit/internals'

export function htmlToCode(html: string, colorMap?: ConversionColorMap, componentMap?: ConversionComponentMap) {
  const { classes, element } = parseHtml(html, colorMap)
  return parsedHtmlToCode(element, classes, colorMap, componentMap)
}

export function parsedHtmlToCode(
  element: ConversionNode,
  classes: Map<string, any>,
  colorMap?: ConversionColorMap,
  componentMap?: ConversionComponentMap,
) {
  return format(
    `export default function Index() { return ${convertParsedHtml(element, classes, elementToCode, colorMap, componentMap) ?? `null`} }`,
    {
      parser: 'babel',
      plugins: [babel ?? starBabel, estree ?? starEstree],
      semi: false,
    },
  )
}

function elementToCode(
  element: ConversionNode | undefined,
  typeName: string,
  custom: boolean,
  props: Record<string, unknown>,
  index: number,
  children?: Array<string> | undefined,
) {
  const propsText = Object.entries(props)
    .filter(([, value]) => typeof value != 'undefined')
    .map(([name, value]) => {
      const firstChar = name[0]
      if ('0' <= firstChar && firstChar <= '9') {
        return `{...${JSON.stringify({ [name]: value })}}`
      }
      if (name === 'panelMaterialClass' && typeof value === 'function') {
        return `${name}={${value.name}}`
      }
      switch (typeof value) {
        case 'number':
          return `${name}={${value}}`
        case 'string':
          if (value.includes('\n')) {
            return `${name}={\`${value.replaceAll('`', '\\`')}\`}`
          }
          return `${name}="${value.replaceAll('"', "'")}"`
        case 'boolean':
          return `${name}={${value ? 'true' : 'false'}}`
        case 'object':
          return `${name}={${JSON.stringify(value)}}`
      }
      throw new Error(`unable to generate property "${name}" with value of type "${typeof value}"`)
    })
    .join(' ')
  if (children == null) {
    return `<${typeName} ${propsText} />`
  }
  if (typeName === 'Fragment') {
    typeName = ''
  }
  return `<${typeName} ${propsText} >${children.join('\n')}</${typeName}>`
}

export {
  conversionPropertyTypes,
  type ConversionColorMap,
  MetalMaterial,
  GlassMaterial,
  PlasticMaterial,
} from '@pmndrs/uikit/internals'
export * from './preview.js'
