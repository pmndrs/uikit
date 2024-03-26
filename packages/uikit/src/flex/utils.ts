import { Node, MeasureFunction } from 'yoga-layout'
import { PointScaleFactor } from './index.js'

export function yogaNodeEqual(n1: Node, n2: Node): boolean {
  return (n1 as any)['M']['O'] === (n2 as any)['M']['O']
}

export function setMeasureFunc(node: Node, func: MeasureFunction | undefined): void {
  if (func == null) {
    node.setMeasureFunc(null)
    return
  }
  node.setMeasureFunc((width, wMode, height, hMode) => {
    const result = func(width, wMode, height, hMode)
    return {
      width: Math.ceil(result.width * PointScaleFactor + 1) / PointScaleFactor,
      height: Math.ceil(result.height * PointScaleFactor + 1) / PointScaleFactor,
    }
  })
  node.markDirty()
}
