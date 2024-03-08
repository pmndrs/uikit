---
title: Migration from HTML/CSS
description: How to migrate a user interface from HTML/CSS to uikit.
nav: 17
---

uikit is inspired by HTML/CSS. Therefore, many properties are similar with minor syntactical difference.

## No more CSS files

In uikit classes can be defined directly in the file. Styles should not be seperated from their usage.
The use of inline styles is recommended and supported through the typescript type system.

## Defaults

The defaults of the yoga layout engine differs from the defaults on the web. Therefore, some properties turn unnecassary while others need to be added.

- **flexDirection** defaults to `column` instead of `row`
- **alignContent** defaults to `flex-start` instead of `stretch`
- **flexShrink** defaults to `0` instead of `1`

In most cases explicitly specifying the flexDirection is enough.
