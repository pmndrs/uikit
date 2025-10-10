---
title: Components and Properties
description: A list of all components and their properties.
nav: 3
---

## Base Properties

Just like in html/css, all uikit components have a certain properties in common, such as properties to define the position and size inside the layout, as well as, properties that are inherited, such as `color`. An overview of all available base properties can be found below.

<details>
<summary>View all base properties</summary>

| Property                         | Type                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| visibility                       | "visible" , "hidden"                                                                                                  |
| margin                           | number, Percentage, "auto"                                                                                            |
| marginX                          | number, Percentage, "auto"                                                                                            |
| marginY                          | number, Percentage, "auto"                                                                                            |
| marginTop                        | number, Percentage, "auto"                                                                                            |
| marginLeft                       | number, Percentage, "auto"                                                                                            |
| marginRight                      | number, Percentage, "auto"                                                                                            |
| marginBottom                     | number, Percentage, "auto"                                                                                            |
| transformTranslateX              | number                                                                                                                |
| transformTranslateY              | number                                                                                                                |
| transformTranslateZ              | number                                                                                                                |
| transformScaleX                  | number                                                                                                                |
| transformScaleY                  | number                                                                                                                |
| transformScaleZ                  | number                                                                                                                |
| transformOriginX                 | "left", "center", "middle", "right"                                                                                   |
| transformOriginY                 | "top", "center", "middle", "bottom"                                                                                   |
| transformRotateX                 | number                                                                                                                |
| transformRotateY                 | number                                                                                                                |
| transformRotateZ                 | number                                                                                                                |
| positionType                     | "absolute", "relative", "count"                                                                                       |
| inset                            | number, Percentage                                                                                                    |
| positionTop                      | number, Percentage                                                                                                    |
| positionLeft                     | number, Percentage                                                                                                    |
| positionRight                    | number, Percentage                                                                                                    |
| positionBottom                   | number, Percentage                                                                                                    |
| alignContent                     | "space-evenly", "space-around", "space-between", "baseline", "stretch", "flex-end", "center", "flex-start", "auto"    |
| alignItems                       | "space-evenly", "space-around", "space-between", "baseline", "stretch", "flex-end", "center", "flex-start", "auto"    |
| alignSelf                        | "space-evenly", "space-around", "space-between", "baseline", "stretch", "flex-end", "center", "flex-start", "auto"    |
| flexDirection                    | "row-reverse", "row", "column-reverse", "column"                                                                      |
| flexWrap                         | "wrap-reverse", "wrap", "no-wrap"                                                                                     |
| justifyContent                   | "space-around", "space-between", "flex-end", "center", "flex-start", "space-evenly"                                   |
| flexBasis                        | number, Percentage                                                                                                    |
| flexGrow                         | number                                                                                                                |
| flexShrink                       | number                                                                                                                |
| width                            | number, Percentage, "auto"                                                                                            |
| height                           | number, Percentage, "auto"                                                                                            |
| minWidth                         | number, Percentage                                                                                                    |
| minHeight                        | number, Percentage                                                                                                    |
| maxWidth                         | number, Percentage                                                                                                    |
| maxHeight                        | number, Percentage                                                                                                    |
| aspectRatio                      | number                                                                                                                |
| borderWidth                      | number                                                                                                                |
| borderXWidth                     | number                                                                                                                |
| borderYWidth                     | number                                                                                                                |
| borderTopWidth                   | number                                                                                                                |
| borderLeftWidth                  | number                                                                                                                |
| borderRightWidth                 | number                                                                                                                |
| borderBottomWidth                | number                                                                                                                |
| overflow                         | "visible", "scroll", "hidden"                                                                                         |
| padding                          | number, Percentage                                                                                                    |
| paddingX                         | number, Percentage                                                                                                    |
| paddingY                         | number, Percentage                                                                                                    |
| paddingTop                       | number, Percentage                                                                                                    |
| paddingLeft                      | number, Percentage                                                                                                    |
| paddingRight                     | number, Percentage                                                                                                    |
| paddingBottom                    | number, Percentage                                                                                                    |
| gap                              | number                                                                                                                |
| gapRow                           | number                                                                                                                |
| gapColumn                        | number                                                                                                                |
| receiveShadow                    | boolean                                                                                                               |
| castShadow                       | boolean                                                                                                               |
| depthTest                        | boolean                                                                                                               |
| depthWrite                       | boolean                                                                                                               |
| renderOrder                      | number                                                                                                                |
| backgroundColor                  | ColorRepresentation                                                                                                   |
| panelMaterialClass               | Material class                                                                                                        |
| borderColor                      | ColorRepresentation                                                                                                   |
| borderRadius                     | number                                                                                                                |
| borderLeftRadius                 | number                                                                                                                |
| borderRightRadius                | number                                                                                                                |
| borderTopRadius                  | number                                                                                                                |
| borderBottomRadius               | number                                                                                                                |
| borderTopLeftRadius              | number                                                                                                                |
| borderTopRightRadius             | number                                                                                                                |
| borderBottomRightRadius          | number                                                                                                                |
| borderBottomLeftRadius           | number                                                                                                                |
| borderBend                       | number                                                                                                                |
| scrollbarPanelMaterialClass      | Material class                                                                                                        |
| scrollbarColor                   | ColorRepresentation                                                                                                   |
| scrollbarWidth                   | number                                                                                                                |
| scrollbarBorderRadius            | number                                                                                                                |
| scrollbarBorderLeftRadius        | number                                                                                                                |
| scrollbarBorderRightRadius       | number                                                                                                                |
| scrollbarBorderTopRadius         | number                                                                                                                |
| scrollbarBorderBottomRadius      | number                                                                                                                |
| scrollbarBorderTopLeftRadius     | number                                                                                                                |
| scrollbarBorderTopRightRadius    | number                                                                                                                |
| scrollbarBorderBottomRightRadius | number                                                                                                                |
| scrollbarBorderBottomLeftRadius  | number                                                                                                                |
| scrollbarBorderColor             | ColorRepresentation                                                                                                   |
| scrollbarBorderBend              | number                                                                                                                |
| scrollbarBorderRightWidth        | number                                                                                                                |
| scrollbarBorderTopWidth          | number                                                                                                                |
| scrollbarBorderLeftWidth         | number                                                                                                                |
| scrollbarBorderBottomWidth       | number                                                                                                                |
| scrollbarZIndex                  | number                                                                                                                |
| zIndex                           | number                                                                                                                |
| zIndexOffset                     | number                                                                                                                |
| color                            | ColorRepresentation                                                                                                   |
| fill                             | ColorRepresentation                                                                                                   |
| opacity                          | number                                                                                                                |
| textAlign                        | "left", "center", "right", "justify"                                                                                  |
| verticalAlign                    | "top", "center", "bottom"                                                                                             |
| letterSpacing                    | number                                                                                                                |
| lineHeight                       | number                                                                                                                |
| fontSize                         | number                                                                                                                |
| wordBreak                        | "keep-all", "break-all", "break-word"                                                                                 |
| fontFamily                       | string                                                                                                                |
| fontWeight                       | number, "bold", "thin", "extra-light", "light", "normal", "medium", "semi-bold", "extra-bold", "black", "extra-black" |
| whiteSpace                       | "normal", "collapse", "pre", "pre-line"                                                                               |
| pixelSize                        | number                                                                                                                |
| sizeX                            | number                                                                                                                |
| sizeY                            | number                                                                                                                |
| caretColor                       | ColorRepresentation                                                                                                   |
| caretWidth                       | number                                                                                                                |
| caretBorderColor                 | ColorRepresentation                                                                                                   |
| caretBorderBend                  | number                                                                                                                |
| caretBorderTopLeftRadius         | number                                                                                                                |
| caretBorderTopRightRadius        | number                                                                                                                |
| caretBorderBottomLeftRadius      | number                                                                                                                |
| caretBorderBottomRightRadius     | number                                                                                                                |
| caretBorderRightWidth            | number                                                                                                                |
| caretBorderTopWidth              | number                                                                                                                |
| caretBorderLeftWidth             | number                                                                                                                |
| caretBorderBottomWidth           | number                                                                                                                |
| selectionColor                   | ColorRepresentation                                                                                                   |
| selectionWidth                   | number                                                                                                                |
| selectionBorderColor             | ColorRepresentation                                                                                                   |
| selectionBorderBend              | number                                                                                                                |
| selectionBorderTopLeftRadius     | number                                                                                                                |
| selectionBorderTopRightRadius    | number                                                                                                                |
| selectionBorderBottomLeftRadius  | number                                                                                                                |
| selectionBorderBottomRightRadius | number                                                                                                                |
| selectionBorderRightWidth        | number                                                                                                                |
| selectionBorderTopWidth          | number                                                                                                                |
| selectionBorderLeftWidth         | number                                                                                                                |
| selectionBorderBottomWidth       | number                                                                                                                |
| pointerEvents                    | "none", "auto", "listener"                                                                                            |
| pointerEventsType                | "all" \| { allow: string \| string[] } \| { deny: string \| string[] } \| (fn)                                        |
| pointerEventsOrder               | number                                                                                                                |
| anchorX                          | "left", "center", "middle", "right"                                                                                   |
| anchorY                          | "top", "center", "middle", "bottom"                                                                                   |
| id                               | string                                                                                                                |
| cursor                           | string                                                                                                                |
| fontFamilies                     | Record<string, Partial<Record<FontWeight, string \| FontInfo>>>                                                       |

</details>

**`lineHeight` Note:**

Just like in html/css, numeric line heights represent multipliers (e.g. `1.3`) while line heights with a `px` suffix represent absolute pixel values e.g. `20px`.

**`zIndexOffset` Explanation:**  
Generally using `zIndex` is recommended as it behaves just like `zIndex` in the browser. `zIndexOffset` allows to manipulate the internal default order deduced from the UI hierachy, giving the developer the option to shift the order of specific elements backwards or forwards making them appear behind or infront of other elements. Note that sibling elements are treated as having the same UI hiearchy and are therefore not explicitly ordered. Using `zIndexOffset={1}` can be faster then using `zIndex` as it allows to order sibling elements of the same type e.g. with two overlapping panels beeing siblings in the UI hiearchy.

## Container

The `Container` componet is a basic UI component that allows wrapping children and rendering a Panel into the background. It corresponds to the HTML `div` element.

```jsx showLineNumbers
<Container backgroundColor="red">
  <Text>...</Text>
  <Image src="..." />
</Container>
```

The Container has exactly all the base properties and nothing more.

</details>

## Fullscreen

The `Fullscreen` component wraps the `Container` component and binds its content directly to the viewport based on the provided `distanceToCamera`. The `Fullscreen` component automatically sets the correct pixelSize, sizeX, and sizeY properties on the `Container` component so that pixel sizes align with the pixels of the screen. In addition, the `Fullscreen` component has all the properties of the `Container` component.

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
<Image src="example.jpg" width={100} />
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
<Portal width={200} aspectRatio={1}>
  <mesh>
    <boxGeometry />
    <meshBasicMaterial color="red" />
  </mesh>
</Portal>
```

## Video

The `Video` component has the same properties and functionalities as a `Image` component but allows you to render an video inside it. The `Video` component corresponds to the HTML `video` element. The `Video` component has the `src`, `volume`, `preservesPitch`, `playbackRate`, `muted`, `loop`, and `autoplay` property to setip the video and can even be used to play media streams.

To control playing the video the `Video` provide the html video element through a provide, that can be consumed by its children through `useVideoElement` to create video controls. Additionally, the html video element can be received from the parent of the `Video` using `ref.current.element`.

```jsx showLineNumbers
<Video src="example.mp4" autoplay width={100} />
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
| playsInline    | boolean             |
| crossOrigin    | string              |

</details>

## Text

The `Text` component allows you to render of text and is highly intertwined with the layout engine to allow the layout engine to measure and influence the text layout (e.g., how the text should be broken up).The `Text` component has exactly the base properties, since properties such as `fontWeight` are inherited and therefor available on all components.

```jsx showLineNumbers
<Text fontWeight="bold">Hello World!</Text>
```

## Input

The `Input` component extends the `Text` component and allows the user to change the text through their preferred input device. The `Input` component has all the formatting capabilities as the `Text` element. Additionally, it allows specifying whether the input is `disabled,` the current `value,` the `defaultValue,` an `onValueChange` listener, and the `tabIndex` to customize the tab order.

```jsx showLineNumbers
<Input fontWeight="bold" defaultValue="Hello World" />
```

<details>
<summary>View all properties specific to the `Input` component</summary>

| Property      | Description              |
| ------------- | ------------------------ |
| placeholder   | string                   |
| value         | string                   |
| autocomplete  | string                   |
| onFocusChange | (focus: boolean) => void |
| defaultValue  | string                   |
| onValueChange | (value: string) => void  |
| tabIndex      | number                   |
| disabled      | boolean                  |
| type          | "text", "password"       |

|

</details>

## Textarea

The `Textarea` component extends the `Input` component but supports multi-line inputs.

```jsx showLineNumbers
<Textarea fontWeight="bold" defaultValue="Hello World" />
```

## Svg

The `Svg` component allows rendering an Svg file. The URL of the file is provided in the `src` property. Alternatively, the content of the svg file cant directly be provided to the component instead of the url using the `content` property.

```jsx showLineNumbers
<Svg src="..." width={100} />
```

<details>
<summary>View all properties specific to the `SVG` component</summary>

| Property | Type   |
| -------- | ------ |
| src      | string |
| content  | string |

</details>

## Content

The `Content` component allows you to include any R3F/Three.js element into the layout. Since the children inside the `Content` component can be 3-dimensional objects, their alignment on the z-axis can be controlled with the `depthAlign` property. By default the content will preserve the aspect ratio of the 3D objects. In case the 3D objects should be sized independent from its aspect ratio, set `keepAspectRatio={false}`.

```jsx showLineNumbers
<Content width={100}>
  <Gltf src="...">
</Content>
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
<CustomContainer width={200} height={200}>
  <shaderMaterial fragmentShader="" vertexShader="" />
</CustomContainer>
```

## Default and Important Properties

In some cases you might want to overwrite the defaults for all descendants inside a component or need to overwrite set a property with a higher precendence then a property from a `hover` conditional.

Using the `*` property, you can set property that overwrite the default for all descendants.

```jsx showLineNumbers
<Fullscreen flexDirection="column" gap={8} {...{"*": backgroundColor: "red" }}>
  <Container width={64} height={64} />
  <Container width={64} height={64} />
</Fullscreen>
```

In certain cases you want to make sure a property is applied even if there is a `hover` conditional writing the same property. In this case, you can use `important`.

```jsx showLineNumbers
<Container hover={{ backgroundColor: 'green' }} important={{ backgroundColor: 'red' }} />
```

## Conditional Properties

uikit allows you to declare properties that depend on the element's interaction state, similar to CSS selectors, such as `:hover`. Conditional properties also enable elements in the layout to be responsive based on several breakpoints. uikit supports a range of conditional properties:

| Name        | Explanation                                                                |
| ----------- | -------------------------------------------------------------------------- |
| focus       | when the user has focussed the element (currently only available on input) |
| hover       | when the user hovers over the element                                      |
| active      | when the users clicks (pointer down) on the element                        |
| sm          | when the width of the root element is bigger than 640                      |
| md          | when the width of the root element is bigger than 768                      |
| lg          | when the width of the root element is bigger than 1024                     |
| xl          | when the width of the root element is bigger than 1280                     |
| 2xl         | when the width of the root element is bigger than 1536                     |
| dark        | when the preferred color scheme is dark                                    |
| placeholder | when the input component's value is currently empty                        |

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
| onDblClick        | `(event: ThreeEvent<MouseEvent>) => void`                                                                                                     |
| onContextMenu     | `(event: ThreeEvent<MouseEvent>) => void`                                                                                                     |
| onClick           | `(event: ThreeEvent<MouseEvent>) => void`                                                                                                     |
| onSizeChange      | `(width: number, height: number) => void`                                                                                                     |
| onIsClippedChange | `(isClipped: boolean) => void`                                                                                                                |
| onScroll          | `(scrollX: number, scrollY: number, scrollPosition: Signal<Vector2Tuple>, event?: ThreeEvent<WheelEvent \| PointerEvent>) => boolean \| void` |

</details>

## Ref

Using a `ref`, react developers can get access to the uikit component to imperatively change properties or access internal values. A full overview over all methods and properties exposed on all uikit component can be found [here](./vanilla.md#the-uikit-component).
