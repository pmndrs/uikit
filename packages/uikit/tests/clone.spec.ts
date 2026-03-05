import { expect } from 'chai'
import { Container, Image, Text, Content, Custom } from '../src/index.js'
import { InstancedPanelMesh } from '../src/panel/instanced-panel-mesh.js'
import { InstancedGlyphMesh } from '../src/text/render/instanced-glyph-mesh.js'
import { InstancedBufferAttribute, Object3D, Group, MeshBasicMaterial } from 'three'
import { Component } from '../src/components/component.js'
import { RootContext } from '../src/context.js'

function createMockRootContext(): Omit<RootContext, 'glyphGroupManager' | 'panelGroupManager'> {
  return {
    isUpdateRunning: false,
    onFrameSet: new Set(),
    onUpdateMatrixWorldSet: new Set(),
    requestCalculateLayout: () => {},
    requestRender: () => {},
    component: new Container(),
  }
}

describe('Component.clone()', () => {
  it('should clone a Container without throwing', () => {
    const container = new Container({ backgroundColor: 'red', width: 100, height: 50 })
    const cloned = container.clone()
    expect(cloned).to.be.instanceOf(Container)
    expect(cloned).to.not.equal(container)
  })

  it('should clone a Text without throwing', () => {
    const text = new Text({ color: 'white' })
    const cloned = text.clone()
    expect(cloned).to.be.instanceOf(Text)
    expect(cloned).to.not.equal(text)
  })

  it('should clone an Image without throwing', () => {
    const image = new Image({ width: 200, height: 200 })
    const cloned = image.clone()
    expect(cloned).to.be.instanceOf(Image)
    expect(cloned).to.not.equal(image)
  })

  it('should clone a Content without throwing', () => {
    const content = new Content()
    const cloned = content.clone()
    expect(cloned).to.be.instanceOf(Content)
    expect(cloned).to.not.equal(content)
  })

  it('should clone a Custom without throwing', () => {
    const custom = new Custom()
    const cloned = custom.clone()
    expect(cloned).to.be.instanceOf(Custom)
    expect(cloned).to.not.equal(custom)
  })

  it('should copy Three.js Object3D properties', () => {
    const container = new Container({ backgroundColor: 'blue' })
    container.name = 'test-container'
    container.userData = { custom: 'data' }
    container.visible = false
    container.renderOrder = 5

    const cloned = container.clone()
    expect(cloned.name).to.equal('test-container')
    expect(cloned.userData).to.deep.equal({ custom: 'data' })
    expect(cloned.userData).to.not.equal(container.userData)
    expect(cloned.visible).to.equal(false)
    expect(cloned.renderOrder).to.equal(5)
  })

  it('should recursively clone Component children', () => {
    const parent = new Container()
    const child1 = new Container({ backgroundColor: 'red' })
    const child2 = new Container({ backgroundColor: 'blue' })
    child1.name = 'child1'
    child2.name = 'child2'
    parent.add(child1, child2)

    const cloned = parent.clone()
    const clonedComponents = cloned.children.filter((c) => c instanceof Component)
    expect(clonedComponents).to.have.length(2)
    expect(clonedComponents[0]!.name).to.equal('child1')
    expect(clonedComponents[1]!.name).to.equal('child2')
    expect(clonedComponents[0]).to.not.equal(child1)
    expect(clonedComponents[1]).to.not.equal(child2)
  })

  it('should not clone InstancedPanelMesh or InstancedGlyphMesh children', () => {
    const container = new Container()
    const cloned = container.clone()

    for (const child of cloned.children) {
      expect(child).to.not.be.instanceOf(InstancedPanelMesh)
      expect(child).to.not.be.instanceOf(InstancedGlyphMesh)
    }
  })

  it('should not clone children when recursive is false', () => {
    const parent = new Container()
    const child = new Container()
    parent.add(child)

    const cloned = parent.clone(false)
    const clonedComponents = cloned.children.filter((c) => c instanceof Component)
    expect(clonedComponents).to.have.length(0)
  })

  it('should throw on copy()', () => {
    const container = new Container()
    expect(() => container.copy(new Object3D())).to.throw(/not supported/)
  })

  it('should not crash when a parent Group is cloned recursively', () => {
    const group = new Group()
    const container = new Container({ width: 100, height: 100 })
    container.name = 'uikit-container'
    group.add(container)

    const clonedGroup = group.clone(true)
    const clonedContainer = clonedGroup.children.find((c) => c.name === 'uikit-container')
    expect(clonedContainer).to.be.instanceOf(Container)
  })
})

describe('InstancedPanelMesh.clone()', () => {
  it('should clone with shared root and buffer attributes', () => {
    const root = createMockRootContext()
    const instanceMatrix = new InstancedBufferAttribute(new Float32Array(16), 16)
    const instanceData = new InstancedBufferAttribute(new Float32Array(16), 16)
    const instanceClipping = new InstancedBufferAttribute(new Float32Array(16), 16)

    const mesh = new InstancedPanelMesh(root, instanceMatrix, instanceData, instanceClipping)
    mesh.count = 5

    const cloned = mesh.clone()
    expect(cloned).to.be.instanceOf(InstancedPanelMesh)
    expect(cloned).to.not.equal(mesh)
    expect(cloned.count).to.equal(5)
    expect(cloned.instanceMatrix).to.equal(instanceMatrix)
  })

  it('should throw on copy()', () => {
    const root = createMockRootContext()
    const buf = new InstancedBufferAttribute(new Float32Array(16), 16)
    const mesh = new InstancedPanelMesh(root, buf, buf, buf)
    expect(() => mesh.copy()).to.throw(/not supported/)
  })
})

describe('InstancedGlyphMesh.clone()', () => {
  it('should clone with shared root and buffer attributes', () => {
    const root = createMockRootContext()
    const buf = new InstancedBufferAttribute(new Float32Array(16), 16)
    const material = new MeshBasicMaterial()

    const mesh = new InstancedGlyphMesh(root, buf, buf, buf, buf, buf, material)
    mesh.count = 3

    const cloned = mesh.clone()
    expect(cloned).to.be.instanceOf(InstancedGlyphMesh)
    expect(cloned).to.not.equal(mesh)
    expect(cloned.count).to.equal(3)
    expect(cloned.material).to.equal(material)
  })

  it('should throw on copy()', () => {
    const root = createMockRootContext()
    const buf = new InstancedBufferAttribute(new Float32Array(16), 16)
    const mesh = new InstancedGlyphMesh(root, buf, buf, buf, buf, buf, new MeshBasicMaterial())
    expect(() => mesh.copy()).to.throw(/not supported/)
  })
})
