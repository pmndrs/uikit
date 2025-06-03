import { batch } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { BaseOutProperties, InProperties, Properties } from '../properties/index.js'
import { conditionalKeys } from '../properties/conditional.js'

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
        let index = 0
        while (this.list[index] != null) {
          index++
        }
        this.list[index] = classRef
        this.properties.setLayersWithConditionals(index + 1, this.resolveClassRef(classRef))
        this.starProperties.setLayersWithConditionals(index + 1, getStarProperties(this.resolveClassRef(classRef)))
      }
    })
  }

  remove(...classes: typeof this.list): void {
    batch(() => {
      for (const classRef of classes) {
        const index = this.list.indexOf(classRef)
        if (index === -1) {
          console.warn(`Class '${classRef}' not found in the classList`)
          return
        }
        if (index + 1 === this.list.length) {
          this.list.splice(index, 1)
        } else {
          this.list[index] = undefined
        }
        this.properties.setLayersWithConditionals(index + 1, undefined)
        this.starProperties.setLayersWithConditionals(index + 1, undefined)
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

export function getStarProperties<T extends BaseOutProperties<ThreeEventMap>, K>(
  properties: InProperties<T, K> | undefined,
) {
  if (properties == null) {
    return undefined
  }
  let result: InProperties<T, K> | undefined
  if ('*' in properties) {
    result = { ...properties['*'] } as any
  }
  for (const conditionalKey in conditionalKeys) {
    const conditionalEntry = properties[conditionalKey as keyof InProperties<T, K>]?.['*' as never]
    if (conditionalEntry == null) {
      continue
    }
    result ??= {} as InProperties<T, K>
    result[conditionalKey as keyof InProperties<T, K>] = conditionalEntry
  }
  return result
}
