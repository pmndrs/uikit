import { BufferAttribute, PlaneGeometry } from 'three'

export function createPanelGeometry() {
  const geometry = new PlaneGeometry()
  const position = geometry.getAttribute('position')
  const array = new Float32Array(4 * position.count)
  const tangent = [1, 0, 0, 1]
  for (let i = 0; i < array.length; i++) {
    array[i] = tangent[i % 4]!
  }
  geometry.setAttribute('tangent', new BufferAttribute(array, 4))
  return geometry
}

export const panelGeometry = createPanelGeometry()
