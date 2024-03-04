import { initStreaming } from 'yoga-wasm-web'
import { Yoga } from 'yoga-layout/wasm-async'

export async function loadYogaFromGH() {
  const response = await fetch('https://pmndrs.github.io/uikit/yoga/yoga.wasm')
  return initStreaming(response) as unknown as Promise<Yoga>
}
