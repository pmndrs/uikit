import { expect, test } from 'vitest'
import { Container } from '../src/index.js'
import ReactThreeTestRenderer from '@react-three/test-renderer'

test('Container onClick fires', async () => {
  let clicked = false
  const renderer = await ReactThreeTestRenderer.create(
    <Container
      onClick={() => {
        clicked = true
      }}
    />,
  )

  const button = renderer.scene.children[0]!
  await renderer.fireEvent(button, 'click')
  expect(clicked).toBe(true)
})

test('Container object3DName sets underlying Object3D name', async () => {
  const renderer = await ReactThreeTestRenderer.create(
    <Container object3DName="my-container" />,
  )

  const container = renderer.scene.children[0]!
  expect((container as any).instance.name).toBe('my-container')
})

test('Container userData sets underlying Object3D userData', async () => {
  const renderer = await ReactThreeTestRenderer.create(
    <Container userData={{ testId: 'container-1', custom: { nested: true } }} />,
  )

  const container = renderer.scene.children[0]!
  expect((container as any).instance.userData).toEqual({ testId: 'container-1', custom: { nested: true } })
})
