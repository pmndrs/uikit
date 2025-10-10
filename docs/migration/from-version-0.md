---
title: Migrating from 0.* to 1.*
description: How to migrate a from react-three/uikit 0.* to react-three/uikit 1.*
nav: 16
---

## Why this release
- More alignment with html/css
- `pmndrs/uikit` is now the stable core for vanilla three.js. `react-three/uikit` is a thin layer on top.
  - The core can be used across three.js-based frameworks (IWSDK, vanilla three.js, react-three/fiber).
  - Component and icon kits are available across vanilla and other frameworks.
- Simpler code for better maintainability.

## What’s new (Added)
- `zIndex` to control render order (like html/css).
- `display: contents` (Yoga 3.2).
- `white-space` to control whitespace in text, inputs, …
- Global classes via `StyleSheet`.
- `*` property to set default properties for all descendants.
- Input `placeholder` support.
- `important` to raise style precedence (works with `*`).

## What changed
- Properties that inherit in html/css now inherit in uikit as well.
- `pixelSize` can be set anywhere and inherits to descendants.
- `textAlign: block` → `textAlign: justify`.
- `Image` can no longer have children. Wrap the image in a relatively positioned container; put children inside with `position: absolute` and a higher `zIndex`.
- `ref` is now a proper uikit three.js component with typings and full internal access.
- `setStyle` → `setProperties` (more robust and performant; can update all properties).
- `border`/`borderX`/… → `borderWidth`/`borderXWidth`/… (matches html/css).
- `lineHeight` without a unit is a multiplier; with `px` it’s absolute (matches html/css).
- `scrollbarBackgroundColor` → `scrollbarColor`.

## Deprecated (React)
- `Root`: use `Container` or remove if unnecessary.
- `DefaultProperties`: use `<Container display="contents" {...{ '*': defaultProps }}>` or write defaults using `'*'` on any component.
- `FontFamilyProvider`: provide `fontFamilies` on a `Container` with `display="contents"` or on existing components.
- `Icon` → `Svg`; property `text` → `content`.

## Removed
- `backgroundOpacity` and `borderOpacity`. Opacity is part of the color now (background/border), like html/css. Use `withOpacity` or the `useWithOpacity` React hook.
- `useRootSize`. Access the root via any element ref: `anyComponent.root.value.component.size.value`.
- `isInteractionPanel`. All uikit elements are interaction panels now.
- `apfel-kit` (low usage).

## Quick migration checklist
- Replace `Root` with `Container` (or remove if not necassary).
- Replace `DefaultProperties` with a `Container display="contents"` and `'*'` defaults.
- Move `FontFamilyProvider` to `fontFamilies` on a `Container` or any other component.
- Replace `Icon` with `Svg` and rename the `text` property → `content`.
- Rename `setStyle` → `setProperties`.
- Rename `border*` → `border*Width` variants.
- Update `textAlign: block` → `justify`.
- Remove `backgroundOpacity`/`borderOpacity`; use color with alpha or `withOpacity`/`useWithOpacity`.
- Remove `isInteractionPanel` usage
- Remove `useRootSize`; use refs to access root size.
- Ensure `Image` has no children; wrap with a relative container and place children absolutely with higher `zIndex`.