---
title: Components and Properties
description: A list of all components and their properties.
nav: 3
---

## Flexbox Properties

All components in uikit use flexbox properties to define the position and size inside the layout. An overview of all available flexbox properties can be found below and [here](https://yogalayout.dev/docs/).

<details>
<summary>View all flexbox properties</summary>

| Property            | Type                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| visibility          | "visible" , "hidden"                                                                                        |
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

The `Container` componet is a basic UI component that allows wrapping children and rendering a Panel into the background. It corresponds to the HTML `div` element.

```jsx showLineNumbers
<Container backgroundColor="red">
  <Text>...</Text>
  <Image src="..." />
</Container>
```

In addition to the flexbox properties, the container has properties for styling its background panel and the scrollbars.

<details>
<summary>View all properties for styling the background panel</summary>

| Property                         | Type                                           |
| -------------------------------- | ---------------------------------------------- |
| receiveShadow                    | boolean                                        |
| castShadow                       | boolean                                        |
| depthTest                        | boolean                                        |
| depthWrite                       | boolean                                        |
| renderOrder                      | number                                         |
| backgroundColor                  | ColorRepresentation                            |
| backgroundOpacity                | number                                         |
| panelMaterialClass               | Material class                                 |
| borderOpacity                    | number                                         |
| borderColor                      | ColorRepresentation                            |
| borderRadius                     | number                                         |
| borderLeftRadius                 | number                                         |
| borderRightRadius                | number                                         |
| borderTopRadius                  | number                                         |
| borderBottomRadius               | number                                         |
| borderTopLeftRadius              | number                                         |
| borderTopRightRadius             | number                                         |
| borderBottomRightRadius          | number                                         |
| borderBottomLeftRadius           | number                                         |
| borderBend                       | number                                         |
| scrollbarPanelMaterialClass      | Material class                                 |
| scrollbarBackgroundOpacity       | number                                         |
| scrollbarBackgroundColor         | ColorRepresentation                            |
| scrollbarWidth                   | number                                         |
| scrollbarBorderRadius            | number                                         |
| scrollbarBorderLeftRadius        | number                                         |
| scrollbarBorderRightRadius       | number                                         |
| scrollbarBorderTopRadius         | number                                         |
| scrollbarBorderBottomRadius      | number                                         |
| scrollbarBorderTopLeftRadius     | number                                         |
| scrollbarBorderTopRightRadius    | number                                         |
| scrollbarBorderBottomRightRadius | number                                         |
| scrollbarBorderBottomLeftRadius  | number                                         |
| zIndexOffset                     | number or `{ minor?: number, major?: number }` |

**`zIndexOffset` Explanation:**  
`zIndexOffset={1}` allows to manipulate the default order deduced from the UI hierachy, giving the developer the option to shift the order of specific elements backwards or forwards making them appear behind or infront of other elements. Note that sibling elements are treated as having the same UI hiearchy and are therefore not explicitly ordered. `zIndexOffset={1}` is the same as `zIndexOffset={{ major: 1 }}`. While giving a major zIndexOffset causes more draw calls, a minor offset with `zIndexOffset={{ minor: 1 }}` causes no direct performance implications and allows to order sibling elements of the same type e.g. with two overlapping panels beeing siblings in the UI hiearchy.

</details>

## Root

Every layout needs to start with a `Root` component. The `Root` component has all the properties of a `Container` component. The `pixelSize` property of the `Root` component allows you to specify the relation of pixels inside the layout with the three.js units in the scene. The `anchorX` and `anchorY` properties allow you to specify where the `Root` component is anchored in relation to its position. The `sizeX` and `sizeY` properties can be used to give the layout a fixed size in three.js units.

```jsx showLineNumbers
<Root sizeX={2} sizeY={1} flexDirection="row">
  <Container flexGrow={1} backgroundColor="red" />
  <Container flexGrow={1} backgroundColor="green" />
</Root>
```

<details>
<summary>View all properties specific to the `Root` component</summary>

| Property | Type                      |
| -------- | ------------------------- |
| anchorX  | "left", "center", "right" |
| anchorY  | "top", "center", "bottom" |
| sizeX    | number                    |
| sizeY    | number                    |

</details>

## Fullscreen

The `Fullscreen` component wraps the `Root` component and binds its content directly to the viewport based on the provided `distanceToCamera`. The `Fullscreen` component automatically sets the correct pixelSize, sizeX, and sizeY properties on the `Root` component so that pixel sizes align with the pixels of the screen. In addition, the `Fullscreen` component has all the properties of the `Container` component.

```jsx showLineNumbers
<Fullscreen flexDirection="row">
  <Container flexGrow={1} backgroundColor="red" />
  <Container flexGrow={1} backgroundColor="green" />
</Fullscreen>
```

<details>
<summary>View all properties specific to the `Fullscreen` component</summary>

| Property         | Type    |
| ---------------- | ------- |
| attachCamera     | boolean |
| distanceToCamera | number  |

</details>

## Image

The `Image` component has the same properties and functionalities as a `Container` component but allows you to render an image inside it. The `Image` component corresponds to the HTML `img` element. The `Image` component has the `src` property, which can take an URL or a three.js texture. The `Image` component automatically sets the `aspectRatio` property based on the `src` property. This behavior can be turned off through `keepAspectRatio={false}`. The `objectFit` property can also be used to `cover` or `fill` the image in case the aspect ratio cannot be preserved by the layout engine or was overwritten by the user.

```jsx showLineNumbers
<Root>
  <Image src="example.jpg" width={100} />
</Root>
```

<details>
<summary>View all properties specific to the `Image` component</summary>

| Property        | Type            |
| --------------- | --------------- |
| src             | string, Texture |
| objectFit       | "fill", "cover" |
| keepAspectRatio | boolean         |

</details>

## SuspendingImage

The default image doesn't use react's suspense but rather loads the image silently. To explicitly control how the image behaves when loaded, use the `SuspendingImage` component. The component can be used to display a fallback component while the image is loading. It has the same properties as the `Image` component.

```jsx showLineNumbers
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

The `Portal` component uses the `Image` component under the hood to render its children into a render target, which is displayed on the surface of the `Portal` component. In contrast to the `Image` component, the `Portal` component doesn't have a default `aspectRatio` or an `src` property. The size of the portal is completly controlled through the flexbox properties, the resolution of the portal is equal to the size multiplied by the `dpr` property, which defaults to the system `dpr`.

```jsx showLineNumbers
<Root>
  <Portal width={200} aspectRatio={1}>
    <mesh>
      <boxGeometry />
      <meshBasicMaterial color="red" />
    </mesh>
  </Portal>
</Root>
```

## Video

The `Video` component has the same properties and functionalities as a `Image` component but allows you to render an video inside it. The `Video` component corresponds to the HTML `video` element. The `Video` component has the `src`, `volume`, `preservesPitch`, `playbackRate`, `muted`, `loop`, and `autoplay` property to setip the video and can even be used to play media streams.

To control playing the video the `Video` provide the html video element through a provide, that can be consumed by its children through `useVideoElement` to create video controls. Additionally, the html video element can be received from the parent of the `Video` using `ref.current.element`.

```jsx showLineNumbers
<Root>
  <Video src="example.mp4" autoplay width={100} />
</Root>
```

<details>
<summary>View all properties specific to the `Video` component</summary>

| Property       | Type                |
| -------------- | ------------------- |
| src            | string, MediaStream |
| volume         | number              |
| preservesPitch | boolean             |
| playbackRate   | number              |
| muted          | boolean             |
| loop           | boolean             |
| autoplay       | boolean             |

</details>

## Text

The `Text` component allows you to render of text and is highly intertwined with the layout engine to allow the layout engine to measure and influence the text layout (e.g., how the text should be broken up). The `Text` component has several properties aligned with the CSS text properties such as `letterSpacing`, `lineHeight`, `fontSize`, `wordBreak`, `fontFamily`, and `fontWeight`. In addition, the `Text` component has all the properties available in the `Container` component.

```jsx showLineNumbers
<Root>
  <Text fontWeight="bold">Hello World!</Text>
</Root>
```

<details>
<summary>View all properties specific to the `Text` component</summary>

| Property      | Type                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| color         | ColorRepresentation                                                                                                   |
| opacity       | number                                                                                                                |
| textAlign     | "left", "center", "right"                                                                                             |
| verticalAlign | "top", "center", "bottom"                                                                                             |
| letterSpacing | number                                                                                                                |
| lineHeight    | number                                                                                                                |
| fontSize      | number                                                                                                                |
| wordBreak     | "keep-all", "break-all", "break-word"                                                                                 |
| fontFamily    | string                                                                                                                |
| fontWeight    | number, "bold", "thin", "extra-light", "light", "normal", "medium", "semi-bold", "extra-bold", "black", "extra-black" |

</details>

## Input

The `Input` component extends the `Text` component and allows the user to change the text through their preferred input device. The `Input` component has all the formatting capabilities as the `Text` element. Additionally, it allows specifying whether the `multiline` texts are allowed (similar to a textarea), whether the input is `disabled,` the current `value,` the `defaultValue,` an `onValueChange` listener, and the `tabIndex` to customize the tab order.

```jsx showLineNumbers
<Root>
  <Input fontWeight="bold" defaultValue="Hello World" />
</Root>
```

The `Input` component also exposes a ref that provides access to various properties and methods for controlling the input programmatically. This ref can be used to focus or blur the input, access the current value, and get information about the selection and caret position.

<details>
<summary>View all properties exposed in the Input ref</summary>

| Property                 | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| current                  | A signal containing the current value of the input               |
| focus                    | Method to programmatically focus the input                       |
| blur                     | Method to programmatically remove focus from the input           |
| element                  | A signal containing the underlying HTML element                  |
| selectionRange           | A signal containing the current selection range [start, end]     |
| caretTransformation      | A signal containing information about the caret's transformation (position and height) |
| selectionTransformations | A signal containing the transformations for all selection (boxes)  |

</details>

<details>
<summary>View all properties specific to the `Input` component</summary>

| Property                         | Type                    |
| -------------------------------- | ----------------------- |
| multiline                        | boolean                 |
| value                            | string                  |
| defaultValue                     | string                  |
| onValueChange                    | (value: string) => void |
| tabIndex                         | number                  |
| disabled                         | boolean                 |
| type                             | "text", "password"      |
| caretColor                       | ColorRepresentation     |
| caretOpacity                     | opacity                 |
| caretWidth                       | number                  |
| caretBorderOpacity               | number                  |
| caretBorderColor                 | ColorRepresentation     |
| caretBorderRadius                | number                  |
| caretBorderLeftRadius            | number                  |
| caretBorderRightRadius           | number                  |
| caretBorderTopRadius             | number                  |
| caretBorderBottomRadius          | number                  |
| caretBorderTopLeftRadius         | number                  |
| caretBorderTopRightRadius        | number                  |
| caretBorderBottomRightRadius     | number                  |
| caretBorderBottomLeftRadius      | number                  |
| caretBorderBend                  | number                  |
| caretBorder                      | number                  |
| caretBorderX                     | number                  |
| caretBorderY                     | number                  |
| caretBorderTop                   | number                  |
| caretBorderLeft                  | number                  |
| caretBorderRight                 | number                  |
| caretBorderBottom                | number                  |
| selectionColor                   | ColorRepresentation     |
| selectionOpacity                 | opacity                 |
| selectionBorderOpacity           | number                  |
| selectionBorderColor             | ColorRepresentation     |
| selectionBorderRadius            | number                  |
| selectionBorderLeftRadius        | number                  |
| selectionBorderRightRadius       | number                  |
| selectionBorderTopRadius         | number                  |
| selectionBorderBottomRadius      | number                  |
| selectionBorderTopLeftRadius     | number                  |
| selectionBorderTopRightRadius    | number                  |
| selectionBorderBottomRightRadius | number                  |
| selectionBorderBottomLeftRadius  | number                  |
| selectionBorderBend              | number                  |
| selectionBorder                  | number                  |
| selectionBorderX                 | number                  |
| selectionBorderY                 | number                  |
| selectionBorderTop               | number                  |
| selectionBorderLeft              | number                  |
| selectionBorderRight             | number                  |
| selectionBorderBottom            | number                  |

</details>

## Svg

The `Svg` component allows rendering an Svg file. The URL of the file is provided in the `src` property. Additionally, the `opacity`, `color`, and `panelMaterialClass` properties can be used to transform the appearance of the Svg, and all the `Container` properties are available for styling the background panel.

```jsx showLineNumbers
<Root>
  <Svg src="..." width={100} />
</Root>
```

<details>
<summary>View all properties specific to the `SVG` component</summary>

| Property           | Type                |
| ------------------ | ------------------- |
| src                | string              |
| color              | ColorRepresentation |
| opacity            | number              |
| panelMaterialClass | MaterialClass       |

</details>

## Icon

The `Icon` component only differs from the `SVG` component in how the SVG content is provided. The `Icon` component takes a `text` property, which must contain the source code of the SVG. This component helps to inline small SVG files in use cases such as icons. For example, this component is used to implement the uikit-lucide icon pack. When creating the component, the `svgWidth` and `svgHeight` properties must be provided since three.js currently doesn't respect the viewport defined in svg files.

```jsx showLineNumbers
<Root>
  <Icon text="..." svgWidth={16} svgHeight={16} width={20} />
</Root>
```

<details>
<summary>View all properties specific to the `SVGIconFromText` component</summary>

| Property           | Type                |
| ------------------ | ------------------- |
| text               | string              |
| svgHeight          | number              |
| svgWidth           | number              |
| color              | ColorRepresentation |
| opacity            | number              |
| panelMaterialClass | MaterialClass       |

</details>

## Content

The `Content` component allows you to include any R3F/Three.js element into the layout. Since the children inside the `Content` component can be 3-dimensional objects, their alignment on the z-axis can be controlled with the `depthAlign` property. By default the content will preserve the aspect ratio of the 3D objects. In case the 3D objects should be sized independent from its aspect ratio, set `keepAspectRatio={false}`.

```jsx showLineNumbers
<Root>
  <Content width={100}>
    <Gltf src="...">
  </Content>
</Root>
```

<details>
<summary>View all properties specific to the `Content` component</summary>

| Property        | Type                      |
| --------------- | ------------------------- |
| depthAlign      | "back", "center", "front" |
| keepAspectRatio | boolean                   |

</details>

## CustomContainer

The `CustomContainer` component integrates a 2D panel with a custom material into the UI. The component is not instanced but provides complete control over the material of the panel.

```jsx showLineNumbers
<Root>
  <CustomContainer width={200} height={200}>
    <shaderMaterial fragmentShader="" vertexShader="" />
  </CustomContainer>
</Root>
```

## DefaultProperties

The `DefaultProperties` component allows you to override the default properties for all children. HTML/CSS uses the concept of inheritance to change properties on all children. In uikit the `DefaultProperties` component can be used to achieve the same goal. In HTML/CSS, property inheritance is implicit; the `DefaultProperties` component allows explicit expression of what properties are inherited by its children.

```jsx showLineNumbers
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

The `FontFamilyProvider` component allows you to use the specified font families in all its children. The fonts must be compiled into an MSDF texture and a JSON containing glyph information, because uikit uses MSDF font rendering. More information on how to do this can be found [here](../tutorials/custom-fonts.md).

```jsx showLineNumbers
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

uikit allows you to declare properties that depend on the element's interaction state, similar to CSS selectors, such as `:hover`. Conditional properties also enable elements in the layout to be responsive based on several breakpoints. uikit supports a range of conditional properties:

| Name   | Explanation                                                                |
| ------ | -------------------------------------------------------------------------- |
| focus  | when the user has focussed the element (currently only available on input) |
| hover  | when the user hovers over the element                                      |
| active | when the users clicks (pointer down) on the element                        |
| sm     | when the width of the root element is bigger than 640                      |
| md     | when the width of the root element is bigger than 768                      |
| lg     | when the width of the root element is bigger than 1024                     |
| xl     | when the width of the root element is bigger than 1280                     |
| 2xl    | when the width of the root element is bigger than 1536                     |
| dark   | when the preferred color scheme is dark                                    |

```jsx showLineNumbers
<Fullscreen flexDirection="column" md={{ flexDirection: 'row' }}>
  <Container flexGrow={1} backgroundColor="red" />
  <Container flexGrow={1} backgroundColor="green" />
</Fullscreen>
```

## Preferred Color Schemes

By default, uikit inherits the preferred color scheme from the browser. Developers and designers can use the preferred color scheme to support users' preference for dark and light modes. The preferred color scheme can be controlled using `setPreferredColorScheme` and `getPreferredColorScheme`. The function `basedOnPreferredColorScheme` lets you create themes containing colors that change depending on the preferred color scheme.

```jsx showLineNumbers
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

All Components support [all R3F event handlers](https://docs.pmnd.rs/react-three-fiber/api/events). Additionally, event handlers for `onSizeChange`, `onIsClippedChange`, and `onScroll` can be added to all components.

<details>
<summary>View all event handlers</summary>

| Property          | Type                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| onWheel           | `(event: ThreeEvent<WheelEvent>) => void`                                                                                                     |
| onPointerUp       | `(event: ThreeEvent<PointerEvent>) => void`                                                                                                   |
| onPointerOver     | `(event: ThreeEvent<PointerEvent>) => void`                                                                                                   |
| onPointerOut      | `(event: ThreeEvent<PointerEvent>) => void`                                                                                                   |
| onPointerMove     | `(event: ThreeEvent<PointerEvent>) => void`                                                                                                   |
| onPointerLeave    | `(event: ThreeEvent<PointerEvent>) => void`                                                                                                   |
| onPointerEnter    | `(event: ThreeEvent<PointerEvent>) => void`                                                                                                   |
| onPointerDown     | `(event: ThreeEvent<PointerEvent>) => void`                                                                                                   |
| onPointerCancel   | `(event: ThreeEvent<PointerEvent>) => void`                                                                                                   |
| onDoubleClick     | `(event: ThreeEvent<MouseEvent>) => void`                                                                                                     |
| onContextMenu     | `(event: ThreeEvent<MouseEvent>) => void`                                                                                                     |
| onClick           | `(event: ThreeEvent<MouseEvent>) => void`                                                                                                     |
| onSizeChange      | `(width: number, height: number) => void`                                                                                                     |
| onIsClippedChange | `(isClipped: boolean) => void`                                                                                                                |
| onScroll          | `(scrollX: number, scrollY: number, scrollPosition: Signal<Vector2Tuple>, event?: ThreeEvent<WheelEvent \| PointerEvent>) => boolean \| void` |

</details>

## Ref

Each component exposes internal information when using a `ref`. For instance, the container component exposes internals of the type `ContainerRef`. The component internals provide you with access to

| Property            | Explanation                                                                                                     |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| borderInset         | a tuple containing the border sizes on all 4 sides `[top, right, bottom, left]`                                 |
| paddingInset        | a tuple containing the padding sizes on all 4 sides `[top, right, bottom, left]`                                |
| center              | the offset between from the element's center to its parent's center                                             |
| size                | the outer width/height of the element                                                                           |
| interactionPanel    | the mesh added to the scene graph to capture events                                                             |
| scrollPosition      | the x/y scroll position of the children when the element is scrollable                                          |
| pixelSize           | the size of one pixel                                                                                           |
| maxScrollPosition   | the maximum x/y scroll position, based on the size of the children                                              |
| isClipped           | exploses whether the element is fully clipped by some ancestor                                                  |
| setStyle            | modifies the styles of the element (the provided styles have a higher precedence then the element's properties) |
| getStyle            | get the current style of the object                                                                             |
| getComputedProperty | read the current value for any property (combines default properties, direct properties, and styles)            |
