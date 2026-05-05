import { expect } from 'chai'
import { Object3D } from 'three'
import { Container } from '../src/index.js'

describe('root-attached enablement', () => {
  it('should only enable properties once the subtree is attached to a non-uikit root', () => {
    const scene = new Object3D()
    const root = new Container()
    const child = new Container()

    root.add(child)

    expect(root.properties.enabled.value).to.equal(false)
    expect(root.starProperties.enabled.value).to.equal(false)
    expect(child.properties.enabled.value).to.equal(false)
    expect(child.starProperties.enabled.value).to.equal(false)

    scene.add(root)

    expect(root.properties.enabled.value).to.equal(true)
    expect(root.starProperties.enabled.value).to.equal(true)
    expect(child.properties.enabled.value).to.equal(true)
    expect(child.starProperties.enabled.value).to.equal(true)

    scene.remove(root)

    expect(root.properties.enabled.value).to.equal(false)
    expect(root.starProperties.enabled.value).to.equal(false)
    expect(child.properties.enabled.value).to.equal(false)
    expect(child.starProperties.enabled.value).to.equal(false)
  })
})
