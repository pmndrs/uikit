---
title: Responsive
description: How to make the ui elements responsive.
nav: 6
---

Building responsive UIs in uikit is inspired by [responsiveness in tailwind](https://tailwindcss.com/docs/responsive-design). Using the concept of breakponts UI elements can be styled based on the size of the root element. These breakpoints are
- `sm` (min root width: 640px)
- `md` (min root width: 768px)
- `lg` (min root width: 1024px)
- `xl` (min root width: 1280px)
- `2xl` (min root width: 1536px)

```jsx showLineNumbers
<Container
    flexDirection="column"
    md={{ flexDirection: "row" }}
>
```

This code defines a container that, by default, puts its positions its children in a vertical column, but puts them in a horizontal row once the width of the root container exceeds 768px.
