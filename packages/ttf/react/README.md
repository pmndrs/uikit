# @react-three/uikit-ttf

TTF to MSDF font loader hook for @react-three/uikit

`npm i @react-three/uikit-ttf`

## Usage

```jsx
import { useTTF } from '@react-three/uikit-ttf'
import { Container, Text } from '@react-three/uikit'

function App() {
  const fontFamilies = useTTF('/fonts/Roboto.ttf')

  return (
    <Container fontFamilies={fontFamilies}>
      <Text>Hello World</Text>
    </Container>
  )
}
```

## Multiple Fonts

Load multiple TTF files at once:

```jsx
const font = useTTF(['/fonts/Roboto.ttf', '/fonts/NotoSansJP.ttf'])
```

## Options

Pass an object instead of a string to customize MSDF generation:

```jsx
const roboto = useTTF({ url: '/fonts/Roboto.ttf', fontSize: 64 })
```

| Option        | Default                   | Description                                              |
| ------------- | ------------------------- | -------------------------------------------------------- |
| `charset`     | `A-Za-z0-9` + punctuation | Characters to include in the atlas                       |
| `fontSize`    | `48`                      | Glyph rasterization resolution (higher = more detail)    |
| `textureSize` | `[512, 512]`              | Atlas dimensions `[width, height]`                       |
| `fieldRange`  | `4`                       | Max encoded distance in pixels (higher = smoother edges) |
| `fixOverlaps` | `true`                    | Fix overlapping contours in glyphs                       |

## Preloading

```jsx
useTTF.preload('/fonts/Roboto.ttf')
```

## Cache Management

```jsx
useTTF.clear('/fonts/Roboto.ttf')
```
