---
title: Migration from Tailwind
description: How to migrate a user interface from tailwind to uikit.
nav: 1
---

uikit is inspired by tailwind. Therefore, many properties are similar with minor syntactical difference. The major differences are **sizing** and **defaults**.

## Sizing

In contrast to tailwind, uikit's core units are pixels. Therefore, sizes such as `p-3`, which translates to `padding: 0.75rem` or `padding: 16px` would be expressed as `padding={16}` in uikit. The rule for sizes is to multiply the tailwind value times 4.

Other sizes such as border radii (e.g. `rounded-md`) must be converted by looking into the [Tailwind Documentation](https://tailwindcss.com/docs). In this case `rounded-md` translates to `borderRadius={6}`.

## Defaults

The defaults of the yoga layout engine differs from the defaults on the web. Therefore, some properties turn unnecassary while others need to be added.

- **flexDirection** defaults to `column` instead of `row`
- **alignContent** defaults to `flex-start` instead of `stretch`
- **flexShrink** defaults to `0` instead of `1`

In most cases explicitly specifying the flexDirection is enough.
