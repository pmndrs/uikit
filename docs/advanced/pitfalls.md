---
title: Pitfalls
description: Pitfalls to avoid when building userinterfaces with r3/uikit
nav: 0
---

# Asynchronous Objects inside \<Content/>

The `<Content>` component measures its content when the component is created. If the content is loaded asynchronous, this measurement will be incorrect. To prevent this behavior, suspense boundaries must be placed correctly.

<table>
<tr><td>❌ incorrect</td><td>✅ correct</td></tr>
<tr>
<td>

```jsx
<Content>
    <Suspense>
        <Gltf src="...">
    </Suspense>
</Content>
```

</td>
</pre>
<td>

```jsx
<Suspense>
    <Content>
        <Gltf src="...">
    </Content>
</Suspense>
```

</td>
</tr>
</table>