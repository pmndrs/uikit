---
title: Custom Fonts
description: How to build, set up, and use custom fonts.
nav: 12
---

The `Text` component enables rendering text using multi-channel signed distance functions (MSDF). By default, uikit provides the Inter font. A custom font can be converted from a `.ttf` file to an MSDF representation as a JSON and a corresponding texture using [msdf-bmfont-xml](https://www.npmjs.com/package/msdf-bmfont-xml).

## How to set up custom fonts?

This example shows how to compile the `Roboto` font family with the weight `medium`.

The first step is to download a `.ttf` file for the font family with the correct weights. After downloading the font to `roboto.ttf`, the following command can be used to remove overlaps.

> This is necessary because msdf-bmfont has a problem with overlapping paths, creating weird artificats.

```bash
fontforge -lang=ff -c 'Open($1); SelectAll(); RemoveOverlap(); Generate($2)' roboto.ttf fixed-roboto.ttf 
```

Next, we use `msdf-bmfont` to convert the `.ttf` file to a texture and a `.json` file.

```bash
npx msdf-bmfont -f json roboto.ttf -i charset.txt -m 256,512 -o public/roboto -s 48
```

Lastly, we add the font family via the `FontFamilyProvider`. It's necessary to host the `.json` file and the texture on the same URL and provide the URL to the `.json` file to the  `FontFamilyProvider`.

Repeat the previous process for other weights, such as bold, to support different weights.

```tsx
<FontFamilyProvider
  roboto={{
    medium: "url-to-medium.json",
    bold: "url-to-bold.json",
  }}
>
  <Text fontFamily="roboto">Test123</Text>
</FontFamilyProvider>
```
