# @pmndrs/uikit-ttf

TTF to MSDF font loader for @pmndrs/uikit

`npm i @pmndrs/uikit-ttf`

## Usage

```jsx
import { TTFLoader } from '@pmndrs/uikit-ttf'
import { Container, Text } from '@pmndrs/uikit'

const loader = new TTFLoader()
const fontFamilies = await loader.loadAsync('/fonts/Roboto.ttf')

const root = new Container({ fontFamilies })

const text = new Text({ text: 'Hello World' })
root.add(text)
```

## Options

```jsx
loader.setOptions({
  charset: 'ABC123...',
  fontSize: 48,
  textureSize: [512, 512],
  fieldRange: 4,
  fixOverlaps: true,
  onProgress: (progress, completed, total) => console.log(`${progress}%`),
})
```

| Option        | Default                   | Description                                              |
| ------------- | ------------------------- | -------------------------------------------------------- |
| `charset`     | `A-Za-z0-9` + punctuation | Characters to include in the atlas                       |
| `fontSize`    | `48`                      | Glyph rasterization resolution (higher = more detail)    |
| `textureSize` | `[512, 512]`              | Atlas dimensions `[width, height]` for packing glyphs    |
| `fieldRange`  | `4`                       | Max encoded distance in pixels (higher = smoother edges) |
| `fixOverlaps` | `true`                    | Fix overlapping contours in glyphs (B, P, R, etc.)       |
| `onProgress`  | -                         | Callback for generation progress                         |

## Multiple Fonts

Load multiple TTF files at once:

```jsx
const fontFamilies = await loader.loadMultipleAsync(['/fonts/Roboto.ttf', '/fonts/NotoSansJP.ttf'])
```
