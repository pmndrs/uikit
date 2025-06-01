export function getProperty<T>(from: {}, key: string, computeDefault: () => T): T {
  if (!(key in from)) {
    from[key as never] = computeDefault() as never
  }
  return from[key as never]
}
