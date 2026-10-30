import { expect } from 'chai'
import { signal } from '@preact/signals-core'
import { Object3D } from 'three'
import { loadYoga } from 'yoga-layout/load'
import { Component, Container, Image } from '../src/index.js'
import { InstancedPanelMesh } from '../src/panel/instance/mesh.js'

function setupRoot(child: Component) {
  let requestedFrames = 0
  const visibility = signal<'hidden' | undefined>(undefined)
  const root = new Container({ width: 200, height: 200, visibility }, undefined, {
    renderContext: { requestFrame: () => void requestedFrames++ },
  })
  root.add(child)
  new Object3D().add(root)
  //the first update calculates the layout, the second one allocates the instanced panels
  root.update(0)
  root.update(0)
  return {
    root,
    setHidden(hidden: boolean) {
      visibility.value = hidden ? 'hidden' : undefined
      root.update(0)
    },
    countRequestedFrames(fn: () => void) {
      const before = requestedFrames
      fn()
      return requestedFrames - before
    },
  }
}

function hideAndShow(setHidden: (hidden: boolean) => void, cycles: number) {
  for (let i = 0; i < cycles; i++) {
    setHidden(true)
    setHidden(false)
  }
}

//reads the background color of the first (and only) panel in the root's instanced panel buffer
function readPanelBackgroundColor(root: Container) {
  const mesh = root.children.find((child) => child instanceof InstancedPanelMesh) as InstancedPanelMesh | undefined
  expect(mesh).to.be.instanceOf(InstancedPanelMesh)
  return Array.from(mesh!.geometry.attributes.aData!.array.slice(4, 8))
}

describe('property effects across visibility changes', () => {
  before(async () => {
    await loadYoga()
  })

  it('should not accumulate instanced panel property effects when hidden and shown again', () => {
    const backgroundColor = signal('red')
    const { root, setHidden, countRequestedFrames } = setupRoot(
      new Container({ width: 100, height: 50, backgroundColor }),
    )
    const expected = countRequestedFrames(() => (backgroundColor.value = 'green'))
    expect(expected).to.equal(1)

    hideAndShow(setHidden, 10)

    expect(countRequestedFrames(() => (backgroundColor.value = 'blue'))).to.equal(expected)
    root.dispose()
  })

  it('should not accumulate instanced panel property effects when the panel size toggles to zero', () => {
    const width = signal(100)
    const borderColor = signal('red')
    const { root, countRequestedFrames } = setupRoot(
      new Container({ width, height: 50, backgroundColor: 'black', borderColor }),
    )
    const expected = countRequestedFrames(() => (borderColor.value = 'green'))

    hideAndShow((hidden) => {
      width.value = hidden ? 0 : 100
      root.update(0)
    }, 10)

    expect(countRequestedFrames(() => (borderColor.value = 'blue'))).to.equal(expected)
    root.dispose()
  })

  it('should write the current property values when an instanced panel is shown again', () => {
    const backgroundColor = signal('red')
    const { root, setHidden } = setupRoot(new Container({ width: 100, height: 50, backgroundColor }))
    expect(readPanelBackgroundColor(root)).to.deep.equal([1, 0, 0, 1])

    setHidden(true)
    backgroundColor.value = 'blue'
    setHidden(false)

    expect(readPanelBackgroundColor(root)).to.deep.equal([0, 0, 1, 1])
    root.dispose()
  })

  it('should not accumulate image property effects when hidden and shown again', () => {
    const borderRadius = signal(5)
    const { root, setHidden, countRequestedFrames } = setupRoot(new Image({ width: 100, height: 50, borderRadius }))
    const expected = countRequestedFrames(() => (borderRadius.value = 6))

    hideAndShow(setHidden, 10)

    expect(countRequestedFrames(() => (borderRadius.value = 7))).to.equal(expected)
    root.dispose()
  })

  it('should not run image property effects while the image is hidden', () => {
    const borderRadius = signal(5)
    const { root, setHidden, countRequestedFrames } = setupRoot(new Image({ width: 100, height: 50, borderRadius }))

    setHidden(true)

    expect(countRequestedFrames(() => (borderRadius.value = 6))).to.equal(0)
    root.dispose()
  })

  it('should stop property effects when the component is disposed', () => {
    const backgroundColor = signal('red')
    const borderRadius = signal(5)
    const container = new Container({ width: 100, height: 50, backgroundColor })
    const image = new Image({ width: 100, height: 50, borderRadius })
    const { root, setHidden, countRequestedFrames } = setupRoot(container)
    root.add(image)
    root.update(0)
    hideAndShow(setHidden, 2)

    container.dispose()
    image.dispose()

    expect(countRequestedFrames(() => (backgroundColor.value = 'blue'))).to.equal(0)
    expect(countRequestedFrames(() => (borderRadius.value = 6))).to.equal(0)
    root.dispose()
  })
})
