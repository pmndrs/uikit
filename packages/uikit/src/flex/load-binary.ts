import { initStreaming } from 'yoga-wasm-web'

export async function loadYogaFromGH() {
  const response = await fetch('https://pmndrs.github.io/uikit/yoga/yoga.wasm')
  return initStreaming(response)
}
