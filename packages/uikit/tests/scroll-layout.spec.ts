import { expect } from 'chai'
import { Object3D } from 'three'
import { loadYoga } from 'yoga-layout/load'
import { Container } from '../src/index.js'

describe('scroll layout', () => {
  before(async () => {
    await loadYoga()
  })

  it('uses bottom padding for the vertical scroll extent', () => {
    const scene = new Object3D()
    const root = new Container({
      width: 100,
      height: 100,
      overflow: 'scroll',
      paddingLeft: 10,
      paddingBottom: 20,
    })
    const child = new Container({ width: 50, height: 200 })

    root.add(child)
    scene.add(root)
    root.node.calculateLayout()

    expect(root.maxScrollPosition.value[1]).to.equal(120)

    child.dispose()
    root.dispose()
  })
})
