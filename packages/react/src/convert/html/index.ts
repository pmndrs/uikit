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

export async function parsedHtmlToCode(
  element: ConversionNode,
  classes: Map<string, any>,
  colorMap?: ConversionColorMap,
  componentMap?: ConversionComponentMap,
): Promise<{ code: string; componentNames: Set<string>; customComponentNamesMap: Map<string, Set<string>> }> {
  const componentNames = new Set<string>()
  const customComponentNamesMap: Map<string, Set<string>> = new Map()
  const content =
    convertParsedHtml(
      element,
      classes,
      elementToCode.bind(null, componentNames, customComponentNamesMap),
      colorMap,
      componentMap,
    ) ?? `null`
  return {
    code: await format(`export default function Index() { return ${content} }`, {
      parser: 'babel',
      plugins: [babel ?? starBabel, estree ?? starEstree],
      semi: false,
    }),
    componentNames,
    customComponentNamesMap,
  }
}

function elementToCode(
  componentNames: Set<string>,
  customComponentNamesMap: Map<string, Set<string>>,
  componentName: string,
  componentCustomOrigin: undefined | string,
  elementInfo: ConversionNode | undefined,
  elementProperties: Record<string, unknown>,
  elementIndex: number,
  children?: Array<string> | undefined,
) {
  if (componentCustomOrigin != null) {
    let elementTypesNames = customComponentNamesMap.get(componentCustomOrigin)
    if (elementTypesNames == null) {
      customComponentNamesMap.set(componentCustomOrigin, (elementTypesNames = new Set()))
    }
    elementTypesNames.add(componentName)
  } else if (componentName != 'Fragment') {
    componentNames.add(componentName)
  }
  const propsText = Object.entries(elementProperties)
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
    return `<${componentName} ${propsText} />`
  }
  if (componentName === 'Fragment') {
    componentName = ''
  }
  return `<${componentName} ${propsText} >${children.join('\n')}</${componentName}>`
}

export {
  conversionPropertyTypes,
  type ConversionColorMap,
  MetalMaterial,
  GlassMaterial,
  PlasticMaterial,
} from '@pmndrs/uikit/internals'
export * from './preview.js'
