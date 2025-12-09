# @react-three/uikit-ttf

TTF to MSDF font loader hook for @react-three/uikit

`npm i @react-three/uikit-ttf`

## Usage

```jsx
import { useTTF } from '@react-three/uikit-ttf'
import { Container, Text } from '@react-three/uikit'

function App() {
  const roboto = useTTF('/fonts/Roboto.ttf')

  return (
    <Container fontFamilies={{ roboto }}>
      <Text fontFamily="roboto">Hello World</Text>
    </Container>
  )
}
```

## Options

```jsx
const roboto = useTTF('/fonts/Roboto.ttf', {
  charset: 'ABC123...',
  fontSize: 48,
  textureSize: [512, 512],
  fieldRange: 4,
  fixOverlaps: true,
})
```

| Option        | Default                   | Description                                              |
| ------------- | ------------------------- | -------------------------------------------------------- |
| `charset`     | `A-Za-z0-9` + punctuation | Characters to include in the atlas                       |
| `fontSize`    | `48`                      | Glyph rasterization resolution (higher = more detail)    |
| `textureSize` | `[512, 512]`              | Atlas dimensions `[width, height]` for packing glyphs    |
| `fieldRange`  | `4`                       | Max encoded distance in pixels (higher = smoother edges) |
| `fixOverlaps` | `true`                    | Fix overlapping contours in glyphs (B, P, R, etc.)       |

## Multiple Fonts

Merge multiple TTF files into a single MSDF atlas (useful for fallback fonts):

```jsx
const font = useTTF(['/fonts/Roboto.ttf', '/fonts/NotoSansJP.ttf'], { charset: 'ABCあいう' })
```

### Per-font options (array)

```jsx
const font = useTTF(
  ['/fonts/Roboto.ttf', '/fonts/NotoSansJP.ttf'],
  [
    { fontSize: 48 }, // options for Roboto
    { fontSize: 64 }, // options for NotoSansJP
  ],
)
```

### Per-font options (batch)

Global options with per-font overrides:

```jsx
const font = useTTF(['/fonts/Roboto.ttf', '/fonts/NotoSansJP.ttf'], {
  charset: 'ABCあいう', // global
  fontSize: 48, // global default
  fonts: [
    {}, // Roboto uses global defaults
    { fontSize: 64 }, // NotoSansJP overrides fontSize
  ],
})
```

## Preloading

```jsx
useTTF.preload('/fonts/Roboto.ttf')
useTTF.preload('/fonts/Roboto.ttf', { fontSize: 64 })
```

## Cache Management

Clear a cached font:

```jsx
useTTF.clear('/fonts/Roboto.ttf')
```
