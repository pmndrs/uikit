import { expect, test, vi } from 'vitest'

const registered = vi.hoisted(() => [] as Array<string>)

vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>()
  return {
    ...actual,
    extend: (objects: Parameters<typeof actual.extend>[0]) => {
      registered.push(...Object.keys(objects))
      actual.extend(objects)
    },
  }
})

vi.mock('@pmndrs/uikit', () => {
  // a minifier renames every class to a short name that repeats across modules
  const mangled = () => Object.defineProperty(class {}, 'name', { value: 'e' })
  return {
    basedOnPreferredColorScheme: () => undefined,
    setPreferredColorScheme: () => undefined,
    getPreferredColorScheme: () => undefined,
    withOpacity: () => undefined,
    isDarkMode: () => undefined,
    canvasInputProps: {},
    reversePainterSortStable: () => 0,
    updateVideoElementSrc: () => undefined,
    Container: mangled(),
    Content: mangled(),
    Custom: mangled(),
    Fullscreen: mangled(),
    Image: mangled(),
    Input: mangled(),
    Svg: mangled(),
    Text: mangled(),
    Textarea: mangled(),
    Video: mangled(),
  }
})

test('components are registered under distinct names when class names are minified', async () => {
  await import('../src/index.js')
  expect([...registered].sort()).toEqual([
    'VanillaContainer',
    'VanillaContent',
    'VanillaCustom',
    'VanillaFullscreen',
    'VanillaImage',
    'VanillaInput',
    'VanillaSvg',
    'VanillaText',
    'VanillaTextarea',
    'VanillaVideo',
  ])
})
