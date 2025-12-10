---
title: Custom Fonts
description: How to build, set up, and use custom fonts.
nav: 10
---

The `Text` component supports custom fonts. By default, uikit provides Inter. There are two ways to add your own:

| Approach                                   | Best for                        | Tradeoff                             |
| ------------------------------------------ | ------------------------------- | ------------------------------------ |
| [Runtime TTF](#runtime-ttf-loading)        | Dynamic fonts, fast iteration   | ~444KB loader, ~100-300ms generation |
| [Pre-generated](#pre-generated-msdf-fonts) | Static fonts, production builds | One-time setup, no runtime cost      |

Under the hood, fonts are rendered using MSDF (multi-channel signed distance fields).

## Runtime TTF Loading

Load TTF files directly at runtime using `@pmndrs/uikit-ttf` (vanilla) or `@react-three/uikit-ttf` (React). These packages convert TTF fonts to MSDF format on-the-fly using WebAssembly.

### React Three Fiber

```bash
npm install @react-three/uikit-ttf
```

```jsx
import { Suspense } from 'react'
import { useTTF } from '@react-three/uikit-ttf'
import { Fullscreen, Text } from '@react-three/uikit'

function UI() {
  const fontFamilies = useTTF('/fonts/Roboto.ttf')

  return (
    <Fullscreen fontFamilies={fontFamilies}>
      <Text fontSize={24}>Hello World</Text>
    </Fullscreen>
  )
}

function App() {
  return (
    <Suspense fallback={null}>
      <UI />
    </Suspense>
  )
}
```

### Vanilla Three.js

```bash
npm install @pmndrs/uikit-ttf
```

```js
import { TTFLoader } from '@pmndrs/uikit-ttf'
import { Container, Text } from '@pmndrs/uikit'

const loader = new TTFLoader()
const fontFamilies = await loader.loadAsync('/fonts/Roboto.ttf')

const root = new Container({ fontFamilies })
const text = new Text({ fontSize: 24, text: 'Hello World' })
root.add(text)
```

### Multiple Fonts

Load multiple TTF files at once:

```jsx
// React
const fontFamilies = useTTF(['/fonts/Roboto.ttf', '/fonts/NotoSansJP.ttf'])

// Vanilla
const fontFamilies = await loader.loadMultipleAsync(['/fonts/Roboto.ttf', '/fonts/NotoSansJP.ttf'])
```

### Options

| Option        | Default                   | Description                                              |
| ------------- | ------------------------- | -------------------------------------------------------- |
| `charset`     | `A-Za-z0-9` + punctuation | Characters to include in the atlas                       |
| `fontSize`    | `48`                      | Glyph rasterization resolution (higher = more detail)    |
| `textureSize` | `[512, 512]`              | Atlas dimensions `[width, height]`                       |
| `fieldRange`  | `4`                       | Max encoded distance in pixels (higher = smoother edges) |
| `fixOverlaps` | `true`                    | Fix overlapping contours in glyphs                       |

---

## Pre-generated MSDF Fonts

There are two ways to generate MSDF fonts ahead of time: using a web-based tool or using local tooling. The web-based option is simpler and doesn't require installing any software.

### Option 1: Web-based Tool

You can use the MSDF Generator at https://msdf.zap.works/ to convert your TTF font to MSDF format.

#### Steps:

1. Download a `.ttf` file for the font family with the correct weights (e.g., `roboto-medium.ttf`).
2. Open [https://msdf.zap.works/](https://msdf.zap.works/) in your browser.
3. Upload your `.ttf` file.
4. Click "Generate".
5. The tool will generate a JSON file with the texture inlined as a base64 data URL.
6. Download the generated JSON file.

The generated JSON file contains the MSDF texture embedded inline, so you don't need to manage separate texture files.

### Option 2: Local Tooling

If you prefer to use local tooling or need more control over the generation process, you can use [msdf-bmfont-xml](https://www.npmjs.com/package/msdf-bmfont-xml).

This example shows how to compile the `Roboto` font family with the weight `medium`.

The first step is to download a `.ttf` file for the font family with the correct weights. After downloading the font to `roboto.ttf`, the overlaps need to be removed.

> This is necessary because msdf-bmfont has a problem with overlapping paths, creating weird artifacts.

##### Linux

```bash
fontforge -lang=ff -c 'Open($1); SelectAll(); RemoveOverlap(); Generate($2)' roboto.ttf fixed-roboto.ttf
```

##### Windows

1. Install [FontForge](https://fontforge.org/en-US/downloads/windows-dl/).
2. Open the `.ttf` font.
3. Select all the characters using `CTRL+A` or navigating to `Edit > Select > Select All`.
4. Remove overlap using `CTRL+Shift+O` or navigating to `Element > Overlap > Remove Overlap`.
5. Generate fonts using `CTRL+Shift+G` or navigating to `File > Generate font(s)` in Truetype (`.ttf`) font.
   > Tip: give a new name to the new generated font.

#### Generating the msdf font

Next, we use `msdf-bmfont` to convert the `.ttf` file to a texture and a `.json` file. For that we need the _FontForge_ generated font and a charset file containing all the characters we want to include in our msdf-font.

```bash
npx msdf-bmfont -f json fixed-roboto.ttf -i charset.txt -m 256,512 -o public/roboto -s 48
```

example charset.txt:

```txt
 ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,;:'"()-[]{}@#$%&*+=/\<>
```

> [!IMPORTANT]
> Only a single texture file is supported by uikit, so make sure the generated texture is a single file. Otherwise adjust the texture by increasing the resolution or by decreasing the font size.

#### Inlining the texture

If you are using some kind of hashes in your filenames, you won't be able to use the separate texture. In that case you need to inline the texture in the `.json` file. Here's a sample script to do it:

```ts showLineNumbers
import { writeFile } from 'fs/promises'
import generateBMFont from 'msdf-bmfont-xml'

const charset = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.,;:\'"()-[]{}@#$%&*+=/\\<>'

generateBMFont(
  'src/assets/fonts/Inter-Bold.woff',
  {
    smallSize: true,
    charset,
    outputType: 'json',
  },
  async (
    error: Error | undefined,
    textures: { filename: string; texture: Buffer }[],
    font: { filename: string; data: string },
  ) => {
    if (error) {
      throw error
    }
    const pages = await Promise.all(
      textures.map((texture) => 'data:image/png;base64,' + texture.texture.toString('base64')),
    )
    const json = JSON.parse(font.data)

    json.pages = pages
    await writeFile(font.filename, JSON.stringify(json))
  },
)
```

### Implementing the generated font

Once you have generated the JSON file (using either method), you can add the font family via the `fontFamilies` property.

For web-generated fonts (Option 1), the texture is already inlined in the JSON file. For locally-generated fonts (Option 2), it's necessary to host the `.json` file and the texture on the same URL and provide the URL to the `.json` file to the `fontFamilies` property.

Repeat the previous process for other weights, such as bold, to support different weights.

```tsx showLineNumbers
<Container
  fontFamilies={{
    roboto: {
      medium: 'url-to-medium.json',
      bold: 'url-to-bold.json',
    },
  }}
>
  <Text fontFamily="roboto">Test123</Text>
</Container>
```
