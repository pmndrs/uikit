import { convertHtml, ConversionColorMap } from '@pmndrs/uikit/internals'
import { format } from 'prettier/standalone'
import babel, * as starBabel from 'prettier/plugins/babel.js'
import estree, * as starEstree from 'prettier/plugins/estree.js'
import { ConversionComponentMap } from './preview.js'

export function htmlToCode(html: string, colorMap?: ConversionColorMap, componentMap?: ConversionComponentMap) {
  return format(
    `export default function Index() { return ${convertHtml(html, elementToCode, colorMap, componentMap) ?? `null`} }`,
    {
      parser: 'babel',
      plugins: [babel ?? starBabel, estree ?? starEstree],
      semi: false,
    },
  )
}

function elementToCode(
  typeName: string,
  custom: boolean,
  props: Record<string, unknown>,
  index: number,
  children?: Array<string> | undefined,
) {
  const propsText = Object.entries(props)
    .filter(([, value]) => typeof value != 'undefined')
    .map(([name, value]) => {
      switch (typeof value) {
        case 'number':
          return `${name}={${value}}`
        case 'string':
          return `${name}="${value}"`
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

export { conversionPropertyTypes, type ConversionColorMap } from '@pmndrs/uikit/internals'
export * from './preview.js'
