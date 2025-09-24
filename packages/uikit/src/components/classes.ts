import { batch } from '@preact/signals-core'
import { BaseOutProperties, InProperties, Properties } from '../properties/index.js'
import { conditionalKeys } from '../properties/conditional.js'
import { LayerInSectionIdentifier } from '../properties/layer.js'

export const StyleSheet: Record<string, InProperties> = {}

export class ClassList {
  private list: Array<InProperties | string | undefined> = []

  constructor(
    private readonly properties: Properties,
    private readonly starProperties: Properties,
  ) {}
  *[Symbol.iterator]() {
    for (const entry in this.list) {
      if (entry != null) {
        yield entry
      }
    }
  }

  add(...classes: typeof this.list): void {
    batch(() => {
      for (const classRef of classes) {
        let classIndex = 0
        while (this.list[classIndex] != null) {
          classIndex++
        }
        this.list[classIndex] = classRef
        const identifier: LayerInSectionIdentifier = { type: 'class', classIndex }
        this.properties.setLayersWithConditionals(identifier, this.resolveClassRef(classRef))
        this.starProperties.setLayersWithConditionals(identifier, getStarProperties(this.resolveClassRef(classRef)))
      }
    })
  }

  remove(...classes: typeof this.list): void {
    batch(() => {
      for (const classRef of classes) {
        const classIndex = this.list.indexOf(classRef)
        if (classIndex === -1) {
          console.warn(`Class '${classRef}' not found in the classList`)
          return
        }
        if (classIndex + 1 === this.list.length) {
          this.list.splice(classIndex, 1)
        } else {
          this.list[classIndex] = undefined
        }
        const identifier: LayerInSectionIdentifier = { type: 'class', classIndex }
        this.properties.setLayersWithConditionals(identifier, undefined)
        this.starProperties.setLayersWithConditionals(identifier, undefined)
      }
    })
  }

  toggle(classRef: (typeof this.list)[number]): void {
    if (this.contains(classRef)) {
      this.remove(classRef)
    } else {
      this.add(classRef)
    }
  }

  contains(classRef: (typeof this.list)[number]): boolean {
    return this.list.includes(classRef)
  }

  replace(oldToken: (typeof this.list)[number], newToken: (typeof this.list)[number]): boolean {
    if (!this.contains(oldToken)) {
      return false
    }
    this.remove(oldToken)
    this.add(newToken)
    return true
  }

  private resolveClassRef(classRef: InProperties | string | undefined): InProperties | undefined {
    if (classRef == null) {
      return undefined
    }
    if (typeof classRef != 'string') {
      return classRef
    }
    if (!(classRef in StyleSheet)) {
      console.warn(`class "${classRef}" not present in the global stylesheet`)
      return undefined
    }
    return StyleSheet[classRef]
  }
}

export function getStarProperties<T extends BaseOutProperties>(properties: InProperties<T> | undefined) {
  if (properties == null) {
    return undefined
  }
  let result: InProperties<T> | undefined
  if ('*' in properties) {
    result = { ...properties['*'] } as any
  }
  for (const conditionalKey in conditionalKeys) {
    const conditionalEntry = properties[conditionalKey as keyof InProperties<T>]?.['*' as never]
    if (conditionalEntry == null) {
      continue
    }
    result ??= {} as InProperties<T>
    result[conditionalKey as keyof InProperties<T>] = conditionalEntry
  }
  return result
}
