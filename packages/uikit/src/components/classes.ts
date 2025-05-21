import { batch } from '@preact/signals-core'
import { ThreeEventMap } from '../events.js'
import { BaseOutProperties, InProperties, Properties } from '../properties/index.js'

export const StyleSheet: Record<string, InProperties<BaseOutProperties<ThreeEventMap>>> = {}

export class ClassList {
  private list: Array<InProperties | string | undefined> = []

  constructor(private readonly properties: Properties) {}
  [Symbol.iterator]() {
    return this.list[Symbol.iterator]()
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
