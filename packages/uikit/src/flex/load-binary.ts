import { initStreaming } from "yoga-wasm-web";

export async function loadYogaFromGH() {
  const response = await fetch(``);
  return initStreaming(response);
}
