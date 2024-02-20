import { MeasureFunction, Node } from 'yoga-wasm-web'

export function yogaNodeEqual(n1: Node, n2: Node): boolean {
  return (n1 as any)['L'] === (n2 as any)['L']
}

export function setMeasureFunc(node: Node, precision: number, func: MeasureFunction | undefined): void {
  if (func == null) {
    node.setMeasureFunc(null)
    return
  }
  node.setMeasureFunc((width, wMode, height, hMode) => {
    const result = func(width * precision, wMode, height * precision, hMode)
    return {
      width: Math.ceil(Math.ceil(result.width) / precision),
      height: Math.ceil(Math.ceil(result.height) / precision),
    }
  })
  node.markDirty()
}
