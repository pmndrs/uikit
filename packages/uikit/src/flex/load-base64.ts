import createYoga, { Yoga } from "yoga-wasm-web";
import { base64 } from "./wasm.js";
import { toByteArray } from "base64-js";

export function loadYogaBase64(): Promise<Yoga> {
  return createYoga(toByteArray(base64));
}
