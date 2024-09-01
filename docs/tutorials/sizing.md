---
title: Sizing
description: How to size elements and use pixelSize, sizeX, and sizeY.
nav: 8
---

**TLDR**: The size of the Root element is defined in three.js units through the optional `sizeX` and `sizeY` parameters. The `pixelSize` parameter allows you to define how big one pixel in the UI is in relation to one three.js unit.


**Important**

The `pixelSize` should be set so that the default font height (`16px`) is reasonably sized. All pre-built components adhere to this sizing concept.

<details>
  <summary>In Depth Explanation</summary>

  The root element size is specified in three.js units using the optional `sizeX` and `sizeY` parameters.
  
  Declaring the size of elements inside the root element using parameters, such as the `width` of an image or the `fontSize` of a text element, is based on `pixel` units, which strongly relate to the `px` unit in CSS. The relation between three.js units and pixel units can be set using the `pixelSize` property. The property expresses the size of one pixel in three.js units and defaults to `0.002`. With this default, `500px` is equal to 1 three.js unit. To make interoperability between code bases and different component libraries easier, we encourage to use the intuition of pixel sizes from the web. For instance, the default text height relates to 16 pixels. If these pixel sizes appear too small or too high in the szene, the `pixelSize` should be increased or decreased respectively.
</details>
