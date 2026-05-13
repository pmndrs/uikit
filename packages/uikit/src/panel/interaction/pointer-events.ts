import type { Intersection, Object3D, Sphere } from 'three'

export type AllowedPointerEventsType =
  | 'all'
  | ((poinerId: number, pointerType: string, pointerState: unknown) => boolean)
  | { allow: string | Array<string> }
  | { deny: string | Array<string> }

declare module 'three' {
  interface Object3D extends PointerEventsProperties {
    spherecast?(sphere: Sphere, intersects: Array<Intersection>): void
    intersectChildren?: boolean
    interactableDescendants?: Array<Object3D>
    ancestorsHaveListeners?: boolean
    defaultPointerEvents?: PointerEventsProperties['pointerEvents']
  }
}

export type PointerEventsProperties = {
  pointerEvents?: 'none' | 'auto' | 'listener'
  pointerEventsType?: AllowedPointerEventsType
  pointerEventsOrder?: number
}
