---
title: Migration from Koestlich
description: How to migrate a user interface from koestlich to uikit.
nav: 14
---

This guide is intended for developers migrating their user interface from Koestlich to uikit. The migration involves several changes to properties and components to better align with uikit's design principles. Here's what you need to know:

## General Changes

- **Index Property Removal**: The index property is no longer needed. UI elements will always be in the correct order, regardless of when they are inserted into the UI.
- **Layout Animations Removal**: Layout animations have been removed, making the ID and animation properties unnecessary.
- **Cursor Support**: Like in CSS, the cursor property allows to specify the type of cursor shown when hovering
- **Conditional Properties**: The hover and dark properties allow to specify how properties that are only applied when the component is hovered or active or when dark mode is enabled. 
- **Simpler Responsiveness**: Properties that are only active based on the current screen size can be applied using the lg, md, and sm properties.
- **No Suspense needed**: Similar to react-dom, images, text, svgs, and icons don't suspense anymore. Therefore, uikit doesn't require setting suspense boundaries for their components.
- **Event propagation**: behaves correctly
- **Default Animations**: no default animations
- **Scroll Experience**: Support for scrollbar and support for overscroll rubberbanding.

## Property Renaming

- **Material Property**: The material property has been renamed to panelMaterialClass.
- **Line Height**: The lineHeightMultiplier property has been renamed to lineHeight to better align with CSS naming conventions.
- **Word Break**: The wrapper property was renamed to wordBreak to better align with CSS naming conventions.

## Component Changes

- **Object to Content Component**: The Object component is replaced with the Content component. The depth property has been removed. The Content component now allows any R3F (React Three Fiber) component to be placed inside. To mimic the behavior of the Object component, use
    ```jsx
    <Content>
        <primitive object={'...'}>
    </Content>
    ```
- **SVG Depth Removal**: The SVG component no longer has a depth property, as SVGs are considered 2D planes.
- **Box Component Removal**: The Box component has been removed.
- **DefaultStyleProvider**: DefaultStyleProvider is renamed to DefaultProperties

## Font Families

- Font families are now provided as
    ```jsx
    <FontFamilies roboto={{ normal: "{url}", bold: "{url}" }}>
    ```
    instead of
    ```jsx
    <FontFamilies robotoNormal="url" robotoBold="bold">
    ```
    When using font families, utilize them as
    ```jsx
    <Text fontFamily="roboto" fontWeight="bold">
    ```
    instead of
    ```jsx
    <Text fontFamily="robotoBold">
    ```


## Defaults

The defaults of the yoga layout engine have changed to match the web defaults. Therefore, some properties turn unnecassary while others need to be added.

- **flexDirection** defaults to `row` instead of `column`
- **alignContent** defaults to `stretch` instead of `flex-start`
- **flexShrink** defaults to `1` instead of `0`

In most cases explicitly specifying the flexDirection is enough.

## Migration Steps

- Remove the index property from your UI elements. The order will be automatically managed.
- Remove any ID and animation properties related to layout animations.
- Update the material property to panelMaterialClass as applicable.
- Replace Object components with Content components. Use
    ```jsx
    <Content>
        <primitive object=\{...}>
    <Content>
    ```
    to replicate the previous Object component's behavior.
- Modify your font family declarations to the new format and adjust how you specify font weights in text components.
- Rename lineHeightMultiplier to lineHeight and wrapper to wordBreak in your code to align with CSS naming.
- Rname DefaultStyleProvider to DefaultProperties
- Remove the depth property from all SVG components
- Replace usages of the Box component with a Content component containing an Object3D with a BoxGeomtry.
- Adapt the components to use to the new defaults, which most likely means explicitly setting `flexDirection` to `row` and `flexShrink` to `0`.

By following these steps, you should be able to smoothly transition your user interface from Koestlich to uikit, taking advantage of the latter's streamlined properties and components.