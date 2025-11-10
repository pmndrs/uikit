---
title: Custom Fonts
description: How to build, set up, and use custom fonts.
nav: 10
---

The `Text` component enables rendering text using multi-channel signed distance functions (MSDF). By default, uikit provides the Inter font. A custom font can be converted from a `.ttf` file to an MSDF representation as a JSON and a corresponding texture.

## How to set up custom fonts?

There are two ways to generate MSDF fonts: using a web-based tool or using local tooling. The web-based option is recommended for most users as it's simpler and doesn't require installing any software.

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

> This is necessary because msdf-bmfont has a problem with overlapping paths, creating weird artificats.

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
 !\"#$%&'()*+,-./0123456789:;<=>?@ÄÖÜABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`äöüabcdefghijklmnopqrstuvwxyz{|}~ß§
```

> [!IMPORTANT]
> Only a single texture file is supported by uikit, so make sure the generated texture is a single file. Otherwise adjust the texture by increasing the resolution or by decreasing the font size.

#### Inlining the texture

If you are using some kind of hashes in your filenames, you won't be able to use the separate texture. In that case you need to inline the texture in the `.json` file. Here's a sample script to do it:

```ts showLineNumbers
import { writeFile } from 'fs/promises'
import generateBMFont from 'msdf-bmfont-xml'

const charset = '’|Wj@$()[]{}/\\w%MQm0fgipqy!#&123456789?ABCDEFGHIJKLNOPRSTUVXYZbdhkl;t<>aceos:nruvxz~+=_^*-"\',`. €£'

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

#### Implementing the generated font

Once you have generated the JSON file (using either method), you can add the font family via the `fontFamilies` property.

For web-generated fonts (Option 1), the texture is already inlined in the JSON file. For locally-generated fonts (Option 2), it's necessary to host the `.json` file and the texture on the same URL and provide the URL to the `.json` file to the `fontFamilies` property.

Repeat the previous process for other weights, such as bold, to support different weights.

```tsx showLineNumbers
<Container fontFamilies={{
  roboto: {
    medium: "url-to-medium.json",
    bold: "url-to-bold.json",
  }
}}
>
  <Text fontFamily="roboto">Test123</Text>
</Container>
```
