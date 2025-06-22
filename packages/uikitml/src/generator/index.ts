import { ElementJson } from '../parser/index.js'

function generateStyleString(style: Record<string, any>): string {
  return Object.entries(style)
    .map(([key, value]) => {
      if (conditionals.includes(key)) {
        return undefined
      }
      // Convert camelCase to kebab-case for CSS properties
      const kebabKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
      return `${kebabKey}: ${value}`
    })
    .filter(Boolean)
    .join('; ')
}

function generateProperties(properties: Record<string, any>): string {
  return Object.entries(properties)
    .map(([key, value]) => {
      if (key === 'style') {
        return `style="${generateStyleString(value)}"`
      }
      // Skip dataUid attributes as they're for internal tracking only
      if (key === 'dataUid') {
        return undefined
      }
      // Convert camelCase back to kebab-case for HTML attributes
      const kebabKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
      return `${kebabKey}="${value}"`
    })
    .filter(Boolean)
    .join(' ')
}

function generateClassStyles(
  classes: Record<
    string,
    {
      origin?: string
      content: Record<string, any>
    }
  >,
): string {
  const styleRules: string[] = []

  for (const [className, { content }] of Object.entries(classes)) {
    styleRules.push(`.${className} { ${generateStyleString(content)} }`)
    for (const conditional of conditionals) {
      if (conditional in content) {
        styleRules.push(`.${className}:${conditional} { ${generateStyleString(content[conditional])} }`)
      }
    }
  }

  return styleRules.length > 0 ? `<style>${styleRules.join(' ')}</style>` : ''
}

const conditionals = ['hover', 'active', 'focus', 'sm', 'md', 'lg', 'xl', '2xl']

export function generate(
  json: ElementJson | string | undefined,
  classes?: Record<
    string,
    {
      origin?: string
      content: Record<string, any>
    }
  >,
  outputFiles?: Record<string, string>,
): string {
  const classStyles = classes == null ? '' : generateClassStyles(classes)
  if (json == null) {
    return classStyles
  }
  if (typeof json === 'string') {
    return `${classStyles}${json}`
  }
  if (json.type === 'inline-svg') {
    // Remove data-uid attributes from SVG text for clean output
    return json.text.replace(/\s*data-uid="[^"]*"/g, '')
  }
  const properties = generateProperties(json.properties)

  if (!('children' in json)) {
    return `${classStyles}<${json.sourceTag} ${properties} />`
  }

  const children = 'children' in json ? json.children.map((child) => generate(child)).join('') : ''
  return `${classStyles}<${json.sourceTag} ${properties}>${children}</${json.sourceTag}>`
}
