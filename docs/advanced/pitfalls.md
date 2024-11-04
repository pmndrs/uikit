---
title: Pitfalls
description: Pitfalls to avoid when building userinterfaces with uikit
nav: 11
---

## Asynchronous Objects inside `Content`

The `Content` component measures its content when the component is created. If the content is loaded asynchronous, this measurement will be incorrect. To prevent this behavior, suspense boundaries must be placed correctly.

<table>
<tr><td>❌ incorrect</td><td>✅ correct</td></tr>
<tr>
<td>

```jsx {2,4} showLineNumbers
<Content>
    <Suspense>
        <Gltf src="...">
    </Suspense>
</Content>
```

</td>
<td>

```jsx {1,5} showLineNumbers
<Suspense>
    <Content>
        <Gltf src="...">
    </Content>
</Suspense>
```

</td>
</tr>
</table>

## Non-Transparent Objects inside `Content`

To render objects in the correct order, we are using a custom transparent object sorter. Therefore, all objects inside uikit must either be transparent or must write to the depth buffer and should have a small offset in the z-axis towards its parent.