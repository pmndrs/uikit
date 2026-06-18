import { expect } from 'chai'
import { signal } from '@preact/signals-core'
import { MeshPhongMaterial, MeshPhysicalMaterial } from 'three'
import { Video } from '../src/video/index.js'

describe('default Video', () => {
  it('forwards panelMaterialClass to the inner video surface', () => {
    const panelMaterialClass = signal<any>(MeshPhongMaterial)
    const video = new Video({ panelMaterialClass })

    video.properties.setEnabled(true)
    video.video.properties.setEnabled(true)

    expect(video.video.properties.value.panelMaterialClass).to.equal(MeshPhongMaterial)

    panelMaterialClass.value = MeshPhysicalMaterial
    expect(video.video.properties.value.panelMaterialClass).to.equal(MeshPhysicalMaterial)

    video.resetProperties({ panelMaterialClass: MeshPhongMaterial })
    expect(video.video.properties.value.panelMaterialClass).to.equal(MeshPhongMaterial)

    video.dispose()
  })

  it('forwards image surface properties to the inner video surface', () => {
    const borderRadius = signal(12)
    const borderWidth = signal(2)
    const backgroundColor = signal('red')
    const castShadow = signal(false)
    const video = new Video({
      borderRadius,
      borderWidth,
      backgroundColor,
      castShadow,
      receiveShadow: true,
    })

    video.properties.setEnabled(true)
    video.video.properties.setEnabled(true)

    expect(video.video.properties.value.borderTopLeftRadius).to.equal(12)
    expect(video.video.properties.value.borderTopRightRadius).to.equal(12)
    expect(video.video.properties.value.borderBottomLeftRadius).to.equal(12)
    expect(video.video.properties.value.borderBottomRightRadius).to.equal(12)
    expect(video.video.properties.value.borderTopWidth).to.equal(2)
    expect(video.video.properties.value.borderRightWidth).to.equal(2)
    expect(video.video.properties.value.borderBottomWidth).to.equal(2)
    expect(video.video.properties.value.borderLeftWidth).to.equal(2)
    expect(video.video.properties.value.backgroundColor).to.equal('red')
    expect(video.video.properties.value.castShadow).to.equal(false)
    expect(video.video.properties.value.receiveShadow).to.equal(true)

    borderRadius.value = 16
    borderWidth.value = 4
    backgroundColor.value = 'blue'
    castShadow.value = true

    expect(video.video.properties.value.borderTopLeftRadius).to.equal(16)
    expect(video.video.properties.value.borderTopWidth).to.equal(4)
    expect(video.video.properties.value.backgroundColor).to.equal('blue')
    expect(video.video.properties.value.castShadow).to.equal(true)

    video.resetProperties({
      borderRadius: 20,
      borderWidth: 6,
      backgroundColor: 'green',
      castShadow: false,
    })

    expect(video.video.properties.value.borderTopLeftRadius).to.equal(20)
    expect(video.video.properties.value.borderTopWidth).to.equal(6)
    expect(video.video.properties.value.backgroundColor).to.equal('green')
    expect(video.video.properties.value.castShadow).to.equal(false)

    video.dispose()
  })
})
