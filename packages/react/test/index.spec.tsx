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
