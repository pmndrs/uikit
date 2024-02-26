import Image from '@theme/IdealImage';
import { CodesandboxEmbed } from '../CodesandboxEmbed.tsx'

# Text

The Text component enables rendering text using multi-channel signed distance functions (MSDF). A font can be created from a .ttf file to an MSDF representation as a JSON and a corresponding texture using [`msdf-bmfont-xml`](https://www.npmjs.com/package/msdf-bmfont-xml). We provide a set of precompiled MSDF fonts from [here](https://github.com/coconut-xr/msdf-fonts). There you will find a list of fonts you can instantly use in your applications. In the following, a Text is rendered with the Roboto font family.


## Adding other fonts

:::info
Via the `FontFamilyProvider`, additional MSDF fonts can be added.

```tsx
<FontFamilyProvider
  fontFamilies={{
    otherFont: ["https://coconut-xr.github.io/msdf-fonts/", "inter.json"],
  }}
  defaultFontFamily="otherFont"
></FontFamilyProvider>
```

:::

### Generating your own msdf-fonts

:::info
For the precompiled fonts we provide, we have set up GitHub actions [here](https://github.com/coconut-xr/msdf-fonts/blob/main/.github/workflows/deploy.yml).
:::

Here is an example on how we compile the `Robot Medium` :

```bash
fontforge -lang=ff -c 'Open($1); SelectAll(); RemoveOverlap(); Generate($2)' font.ttf roboto.ttf 

npx msdf-bmfont -f json roboto.ttf -i charset.txt -m 256,512 -o public/roboto -s 48
```

The `fontforge` step is necessary because msdf-bmfont has a problem with overlapping paths which is creating weird artificats.
The step merges overlapping paths into one and therefore eliminates the artificats.

Alternatively, use this [online tool](https://msdf-bmfont.donmccurdy.com/) to generate the MSDF for you.

## Code Example

<CodesandboxEmbed path="koestlich-text-b8ymnm"/>

<Image img={require('@site/static/images/text.png')}/>

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { RootContainer, Container, Text } from "@coconut-xr/koestlich";
import { Suspense } from "react";

export default function App() {
  return (
    <Canvas>
      <OrbitControls />
      <RootContainer backgroundColor="red" sizeX={2} sizeY={1} flexDirection="row">
        <Container index={0} flexGrow={1} margin={48} backgroundColor="green" />
        <Suspense>
          <Text fontSize={64} index={1} margin={48} marginLeft={0}>
            Coconut XR
          </Text>
        </Suspense>
      </RootContainer>
    </Canvas>
  );
}
```

## Textfields and Textareas

For text fields and text areas, we provide the [@coconut-xr/input](https://github.com/coconut-xr/input) library.

<CodesandboxEmbed path="koestlich-input-example-4ubrt0"/>

<Image img={require('@site/static/images/text.gif')}/>
