---
title: Migration from Tailwind
description: How to migrate a user interface from tailwind to uikit.
nav: 15
---

uikit is inspired by tailwind. Therefore, many properties are similar with minor syntactical difference. The major differences are **sizing** and **defaults**.

## Sizing

In contrast to tailwind, uikit's core units are pixels. Therefore, sizes such as `p-3`, which translates to `padding: 0.75rem` or `padding: 16px` would be expressed as `padding={16}` in uikit. The rule for sizes is to multiply the tailwind value times 4.

Other sizes such as border radii (e.g. `rounded-md`) must be converted by looking into the [Tailwind Documentation](https://tailwindcss.com/docs). In this case `rounded-md` translates to `borderRadius={6}`.
