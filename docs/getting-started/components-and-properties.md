---
title: Components and Properties
description: A list of all components and their properties.
nav: 3
---

## Flexbox Properties

All components in uikit use the flexbox properties to define the position and size inside the layout. An overview of all available Flexbox properties can be found [here](https://yogalayout.dev/docs/).

<details>
<summary>Table of all flexbox properties.</summary>

| Property            | Type                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| margin              | number, Percentage, "auto"                                                                                  |
| marginX             | number, Percentage, "auto"                                                                                  |
| marginY             | number, Percentage, "auto"                                                                                  |
| marginTop           | number, Percentage, "auto"                                                                                  |
| marginLeft          | number, Percentage, "auto"                                                                                  |
| marginRight         | number, Percentage, "auto"                                                                                  |
| marginBottom        | number, Percentage, "auto"                                                                                  |
| transformTranslateX | number                                                                                                      |
| transformTranslateY | number                                                                                                      |
| transformTranslateZ | number                                                                                                      |
| transformScaleX     | number                                                                                                      |
| transformScaleY     | number                                                                                                      |
| transformScaleZ     | number                                                                                                      |
| transformRotateX    | number                                                                                                      |
| transformRotateY    | number                                                                                                      |
| transformRotateZ    | number                                                                                                      |
| positionType        | "absolute", "relative", "count"                                                                             |
| inset               | number, Percentage                                                                                          |
| positionTop         | number, Percentage                                                                                          |
| positionLeft        | number, Percentage                                                                                          |
| positionRight       | number, Percentage                                                                                          |
| positionBottom      | number, Percentage                                                                                          |
| alignContent        | "count", "space-around", "space-between", "baseline", "stretch", "flex-end", "center", "flex-start", "auto" |
| alignItems          | "count", "space-around", "space-between", "baseline", "stretch", "flex-end", "center", "flex-start", "auto" |
| alignSelf           | "count", "space-around", "space-between", "baseline", "stretch", "flex-end", "center", "flex-start", "auto" |
| flexDirection       | "count", "row-reverse", "row", "column-reverse", "column"                                                   |
| flexWrap            | "count", "wrap-reverse", "wrap", "no-wrap"                                                                  |
| justifyContent      | "count", "space-around", "space-between", "flex-end", "center", "flex-start", "space-evenly"                |
| flexBasis           | number, Percentage                                                                                          |
| flexGrow            | number                                                                                                      |
| flexShrink          | number                                                                                                      |
| width               | number, Percentage, "auto"                                                                                  |
| height              | number, Percentage, "auto"                                                                                  |
| minWidth            | number, Percentage                                                                                          |
| minHeight           | number, Percentage                                                                                          |
| maxWidth            | number, Percentage                                                                                          |
| maxHeight           | number, Percentage                                                                                          |
| aspectRatio         | number                                                                                                      |
| border              | number                                                                                                      |
| borderX             | number                                                                                                      |
| borderY             | number                                                                                                      |
| borderTop           | number                                                                                                      |
| borderLeft          | number                                                                                                      |
| borderRight         | number                                                                                                      |
| borderBottom        | number                                                                                                      |
| overflow            | "visible", "scroll", "hidden"                                                                               |
| padding             | number, Percentage                                                                                          |
| paddingX            | number, Percentage                                                                                          |
| paddingY            | number, Percentage                                                                                          |
| paddingTop          | number, Percentage                                                                                          |
| paddingLeft         | number, Percentage                                                                                          |
| paddingRight        | number, Percentage                                                                                          |
| paddingBottom       | number, Percentage                                                                                          |
| gap                 | number                                                                                                      |
| gapRow              | number                                                                                                      |
| gapColumn           | number                                                                                                      |

</details>

## Container

The `Container` is a basic UI element that allows wrapping children and rendering a Panel into the background. It corresponds to the HTML `div` element.

```jsx
<Container backgroundColor="red">
  <Text>...</Text>
  <Image src="..." />
</Container>
```

In addition to the flexbox properties, the container has properties for styling its background panel and the scrollbars.

<details>
<summary>All properties for styling the background Panel</summary>

| Property                         | Type                |
| -------------------------------- | ------------------- |
| zIndexOffset                     | number              |
| receiveShadow                    | boolean             |
| castShadow                       | boolean             |
| backgroundColor                  | ColorRepresentation |
| backgroundOpacity                | number              |
| panelMaterialClass               | Material class      |
| borderOpacity                    | number              |
| borderColor                      | ColorRepresentation |
| borderRadius                     | number              |
| borderLeftRadius                 | number              |
| borderRightRadius                | number              |
| borderTopRadius                  | number              |
| borderBottomRadius               | number              |
| borderTopLeftRadius              | number              |
| borderTopRightRadius             | number              |
| borderBottomRightRadius          | number              |
| borderBottomLeftRadius           | number              |
| border                           | number              |
| borderX                          | number              |
| borderY                          | number              |
| borderBend                       | number              |
| scrollbarPanelMaterialClass      | Material class      |
| scrollbarBackgroundOpacity       | number              |
| scrollbarBackgroundColor         | ColorRepresentation |
| scrollbarWidth                   | number              |
| scrollbarBorderRadius            | number              |
| scrollbarBorderLeftRadius        | number              |
| scrollbarBorderRightRadius       | number              |
| scrollbarBorderTopRadius         | number              |
| scrollbarBorderBottomRadius      | number              |
| scrollbarBorderTopLeftRadius     | number              |
| scrollbarBorderTopRightRadius    | number              |
| scrollbarBorderBottomRightRadius | number              |
| scrollbarBorderBottomLeftRadius  | number              |

</details>

## Root

Every layout needs to start with a `Root` component. The `Root` component has all the properties of a `Container` component. Additionally, it allows control of the `precision` of the layout engine. A precision of `1` expresses that all values computed by the layout engines are integers, while the default precision of `0.1` allows the layout engine to measure layouts in sub-pixel values such as `10.2`. The `pixelSize` property of the `Root` component allows one to specify the relation of pixels inside the layout with the three.js units in the scene. Setting `pixelSize` to 1 expresses that the `1` pixel in the layout is `1` three.js unit in the scene. The default `pixelSize` is `0.002`, which means that `500` pixels represent `1` three.js unit. The `anchorX` and `anchorY` properties allow to specify where the `Root` component is anchored in relation to its position. This can be useful when the `Root` component has dynamic content and this content should be positioned to the left of an object in the scene. The default for `anchorX` and `anchorY` is `center`, `center`. The `sizeX` and `sizeY` properties can be used to give the layout a fixed size. The values passed to `sizeX` and `sizeY` are in three.js units.

```jsx
<Root sizeX={2} sizeY={1} flexDirection="row">
  <Container flexGrow={1} backgroundColor="red" />
  <Container flexGrow={1} backgroundColor="green" />
</Root>
```

<details>
<summary>All properties specific to the `Root` component</summary>

| Property  | Type                      |
| --------- | ------------------------- |
| precision | number                    |
| anchorX   | "left", "center", "right" |
| anchorY   | "top", "center", "bottom" |
| sizeX     | number                    |
| sizeY     | number                    |

</details>

## Fullscreen

The `Fullscreen` component wraps the `Root` component and binds its content directly to the viewport. The `Fullscreen` automatically sets the correct pixelSize, sizeX, and sizeY properties on the `Root` component so that pixel sizes align with the pixels of the screen. In addition, the `Fullscreen` component has all the properties of the `Container` component.

```jsx
<Fullscreen flexDirection="row">
  <Container flexGrow={1} backgroundColor="red"/>
  <Container flexGrow={1} backgroundColor="green"/>
</Root>
```

<details>
<summary>All properties specific to the `Fullscreen` component</summary>

| Property     | Type                |
| ------------ | ------------------- |
| precision    | number              |
| attachCamera | boolean             |

</details>

## Image

The `Image` component has the same properties and functionalities as a `Container` but allows to render an image inside it. The `Image` component corresponds to the HTML `img` element. The `Image` component has the `src` property, which can take and URL or a three.js texture. The `Image` component automatically sets the `aspectRatio` property based on the `src` property. This behavior can be turned off through `keepAspectRatio={false}`. The `fit` property can also be used to `cover` or `fill` the image in case the aspect ratio cannot be preserved by the layout engine or was overwritten by the user.

```jsx
<Root>
  <Image src="example.jpg" width={100} />
</Root>
```

<details>
<summary>All properties specific to the `Image` component</summary>

| Property        | Type            |
| --------------- | --------------- |
| src             | string, Texture |
| fit             | "fill", "cover" |
| keepAspectRatio | boolean         |

</details>

### SuspendingImage

The default image doesn't use react's suspense but rather loads the image silently. To explicitly control how the image behaves when loaded, use the `SuspendingImage` component. The component can be used to display a fallback component while the image is loading. It has the same properties as the `Image` component.

```jsx
<Suspense fallback={
    <Container width={200} aspectRatio={1} alignItems="center" justifyContent="center">
      <LoadingSpinner/>
    </Container>
  }
>
  <SuspendingImage src="..." width={200}>
</Suspense>
```

## Portal

The `Portal` component uses the `Image` component under the hood to render its children into a render target, which is displayed on the surface of the `Portal` component. In contrast to the `Image` component, the `Portal` component doesn't have a default `aspectRatio` or an `src` property. The size of the portal is completly controlled through the flexbox properties.

```jsx
<Root>
  <Portal width={200} aspectRatio={1}>
    <mesh>
      <boxGeometry />
      <meshBasicMaterial color="red" />
    </mesh>
  </Portal>
</Root>
```

## Text

The `Text` component allows to render of text and is highly intertwined with the layout engine to allow the layout engine to measure and influence the text layout (e.g., how the text should be broken up). The text has several properties aligned with the CSS text properties such as `letterSpacing`, `lineHeight`, `fontSize`, `wordBreak`, `fontFamily`, and `fontWeight`. In addition, text has all the properties available in the `Container` component.

```jsx
<Root>
  <Text fontWeight="bold">Hello World!</Text>
</Root>
```

<details>
<summary>All properties specific to the `Text` component</summary>

| Property        | Type                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| color           | ColorRepresentation                                                                                                   |
| opacity         | number                                                                                                                |
| horizontalAlign | "left", "center", "right"                                                                                             |
| verticalAlign   | "top", "center", "bottom"                                                                                             |
| letterSpacing   | number                                                                                                                |
| lineHeight      | number                                                                                                                |
| fontSize        | number                                                                                                                |
| wordBreak       | "keep-all", "break-all", "break-word"                                                                                 |
| fontFamily      | string                                                                                                                |
| fontWeight      | number, "bold", "thin", "extra-light", "light", "normal", "medium", "semi-bold", "extra-bold", "black", "extra-black" |

</details>

## SVG

The `SVG` component allows rendering an SVG file. The URL of the file is provided in the `src` property. Additionally, the `opacity`, `color`, and `materialClass` properties can be used to transform the appearance of the SVG, and all the `Container` properties are available for styling the background panel.

```jsx
<Root>
  <SVG src="..." width={100} />
</Root>
```

<details>
<summary>All properties specific to the `SVG` component</summary>

| Property      | Type                |
| ------------- | ------------------- |
| src           | string              |
| color         | ColorRepresentation |
| opacity       | number              |
| materialClass | MaterialClass       |

</details>

## SVGIconFromText

The `SVGIconFromText` component only differs from the `SVG` component in how the SVG content is provided. The `SVGIconFromText` component takes a `text` property, which must contain the source code of the SVG. This component helps to inline small SVG files in use cases such as icons. For example, this component is used to implement the uikit-lucide icon pack. When creating the component, the `svgWidth` and `svgHeight` properties must be provided since three.js currently doesn't respect the viewport defined in svg files.

```jsx
<Root>
  <SVGIconFromText text="..." svgWidth={16} svgHeight={16} width={20} />
</Root>
```

| Property      | Type                |
| ------------- | ------------------- |
| text          | string              |
| svgHeight     | number              |
| svgWidth      | number              |
| color         | ColorRepresentation |
| opacity       | number              |
| materialClass | MaterialClass       |

## Content

The `Content` component allows to include any R3F/Three.js element into the layout. Since the children inside the `Content` component can be 3-dimensional objects, their alignment on the z-axis can be controlled via the `depthAlign` property. By default the content will preserve the aspect ratio of the 3D objects. In case the 3D objects should be sized unrelated to its aspect ratio, set `keepAspectRatio={false}`.

```jsx
<Root>
  <Content width={100}>
    <Gltf src="...">
  </Content>
</Root>
```

<details>
<summary>All properties specific to the `Content` component</summary>

| Property        | Type                      |
| --------------- | ------------------------- |
| depthAlign      | "back", "center", "front" |
| keepAspectRatio | boolean                   |

</details>

## CustomContainer

The `CustomContainer` integrates a 2D panel with a custom material into the UI. The component is not instanced but provides complete control over the material of the panel.

```jsx
<Root>
  <CustomContainer width={200} height={200}>
    <shaderMaterial fragmentShader="" vertexShader="" />
  </CustomContainer>
</Root>
```

## DefaultProperties

The `DefaultProperties` allow to override the default properties for all children. HTML/CSS uses the concept of inheritance to change properties on all children. In uikit the `DefaultProperties` component can be used to achieve the same goal. In HTML/CSS, property inheritance is implicit; the `DefaultProperties` component allows explicit expression of what properties are inherited by its children.

```jsx
<Root>
  <DefaultProperties color="red" fontWeight="bold">
    <Text>1</Text>
    <Container>
      <Text>2</Text>
    </Container>
    <Text>3</Text>
  </DefaultProperties>
</Root>
```

## FontFamilyProvider

The `FontFamilyProvider` allows to provide new font families to its children. Because uikit uses MSDF font rendering, fonts must be compiled into an MSDF texture and a JSON containing glyph information. More information on how to do this can be found [here](../tutorials/fonts.md).

```jsx
<FontFamilyProvider
  roboto={{
    light: 'url-to-json',
    medium: 'url-to-json',
    bold: 'url-to-json',
  }}
  otherFont={{...}}
>
  {...children}
</FontFamilyProvider>
```

## Conditional Properties

uikit allows declaring styles that depend on the element's interaction state, similar to CSS selectors, such as `:hover`. Conditional selectors also enable elements in the layout to be responsive based on several breakpoints. uikit supports a range of conditional selectors.

| Selector | Explanation                                            |
| -------- | ------------------------------------------------------ |
| hover    | when the user hovers over the element                  |
| active   | when the users clicks (pointer down) on the element    |
| sm       | when the width of the root element is bigger than 640  |
| md       | when the width of the root element is bigger than 768  |
| lg       | when the width of the root element is bigger than 1024 |
| xl       | when the width of the root element is bigger than 1280 |
| 2xl      | when the width of the root element is bigger than 1536 |
| dark     | when the preferred color scheme is dark                |

```jsx
<Fullscreen flexDirection="column" md={{ flexDirection: "row" }} >
  <Container flexGrow={1} backgroundColor="red" />
  <Container flexGrow={1} backgroundColor="green" />
</Root>
```

## Preferred Color Schemes

By default, uikit inherits the preferred color scheme from the browser. Developers and designers can use the preferred color scheme to support users' preference for dark and light modes. The preferred color scheme can be controlled using `setPreferredColorScheme` and `getPreferredColorScheme`. The function `basedOnPreferredColorScheme` enables the creation of themes containing colors that change depending on the preferred color scheme.

```jsx
setPreferredColorScheme("light")

const theme = basedOnPreferredColorScheme({
  light: {
    primary: "red"
  },
  dark: {
    primary: "green"
  }
})

<Container backgroundColor={theme.primary} width={100} height={100} />
```

## Event Properties

All Components support the R3F event handlers. Additionally, event handlers for `onSizeChange`, `onIsInViewportChange`, and `onScroll` are provided.

<details>
<summary>Table for all event handlers.</summary>

| Property             | Type                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- |
| onWheel              | `(event: ThreeEvent<WheelEvent>) => void`                                                    |
| onPointerUp          | `(event: ThreeEvent<PointerEvent>) => void`                                                  |
| onPointerOver        | `(event: ThreeEvent<PointerEvent>) => void`                                                  |
| onPointerOut         | `(event: ThreeEvent<PointerEvent>) => void`                                                  |
| onPointerMove        | `(event: ThreeEvent<PointerEvent>) => void`                                                  |
| onPointerLeave       | `(event: ThreeEvent<PointerEvent>) => void`                                                  |
| onPointerEnter       | `(event: ThreeEvent<PointerEvent>) => void`                                                  |
| onPointerDown        | `(event: ThreeEvent<PointerEvent>) => void`                                                  |
| onPointerCancel      | `(event: ThreeEvent<PointerEvent>) => void`                                                  |
| onDoubleClick        | `(event: ThreeEvent<MouseEvent>) => void`                                                    |
| onContextMenu        | `(event: ThreeEvent<MouseEvent>) => void`                                                    |
| onClick              | `(event: ThreeEvent<MouseEvent>) => void`                                                    |
| onSizeChange         | `(width: number, height: number) => void`                                                    |
| onIsInViewportChange | `(isInViewport: boolean) => void`                                                            |
| onScroll             | `(scrollX: number, scrollY: number, event?: ThreeEvent<WheelEvent \| PointerEvent>) => void` |

</details>
