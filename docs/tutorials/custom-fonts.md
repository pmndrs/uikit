---
title: Custom Fonts
description: How to build, set up, and use custom fonts.
nav: 10
---

The `Text` component enables rendering text using multi-channel signed distance functions (MSDF). By default, uikit provides the Inter font. A custom font can be converted from a `.ttf` file to an MSDF representation as a JSON and a corresponding texture using [msdf-bmfont-xml](https://www.npmjs.com/package/msdf-bmfont-xml).

## How to set up custom fonts?

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
Next, we use `msdf-bmfont` to convert the `.ttf` file to a texture and a `.json` file. For that we need the *FontForge* generated font and a charset file containing all the characters we want to include in our msdf-font.

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
import { writeFile } from "fs/promises";
import generateBMFont from "msdf-bmfont-xml";

const charset =
  "’|Wj@$()[]{}/\\w%MQm0fgipqy!#&123456789?ABCDEFGHIJKLNOPRSTUVXYZbdhkl;t<>aceos:nruvxz~+=_^*-\"',`. €£";

generateBMFont(
  "src/assets/fonts/Inter-Bold.woff",
  {
    smallSize: true,
    charset,
    outputType: "json",
  },
  async (
    error: Error | undefined,
    textures: { filename: string; texture: Buffer }[],
    font: { filename: string; data: string }
  ) => {
    if (error) {
      throw error;
    }
    const pages = await Promise.all(
      textures.map((texture) => "data:image/png;base64," + texture.texture.toString("base64"))
    );
    const json = JSON.parse(font.data);

    json.pages = pages;
    await writeFile(font.filename, JSON.stringify(json));
  }
);
```


#### Implementing the generated font
Lastly, we add the font family via the `FontFamilyProvider`. It's necessary to host the `.json` file and the texture on the same URL and provide the URL to the `.json` file to the  `FontFamilyProvider`.

Repeat the previous process for other weights, such as bold, to support different weights.

```tsx showLineNumbers
<FontFamilyProvider
  roboto={{
    medium: "url-to-medium.json",
    bold: "url-to-bold.json",
  }}
>
  <Text fontFamily="roboto">Test123</Text>
</FontFamilyProvider>
```
