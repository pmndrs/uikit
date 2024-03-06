<h1>@react-three/uikit</h1>

Build performant 3D user interfaces for Three.js using @react-three/fiber and yoga

# Changes over Koestlich

- higher performance (GPU + CPU)
- no suspense (similarly to html/css images and texts don't suspend)
- objects are nested for correct event propagation
- no default animations
- complete freedom to use R3F inside of UI => <Content>...</Content>
- better scroll experiences (scrollbar + overscroll)
- overall DX improvements (hover, responsive, ...)

TODO Release

- fix: responsiveness incorrect - https://pmndrs.github.io/uikit/examples/apfel/?component=button
- fix: zoom with ortho camera
- fix: scroll jumps after scrolling once
- feat: nesting inside non root/container components (e.g. image)
- feat: drag/click threshold
- feat: input
- fix: decrease clipping rect when scrollbar present

Roadmap

- on demand rendering to save battery for UI only apps / rendering to render targets
- virtual lists (support thousands of elements in a list by using fixed sizes and not using yoga)
- option to render to seperate render targets depending on element type (e.g. render text to high quality quad layer for WebXR)
- scrollIntoView
- Instancing for icons
- Support more characters for different languages
- Support for visibility="hidden" & display="none"

Limitations

- nested clipping with rotation in z-axis (the clipping area can become more complex than a rectangle)

## Development

`pnpm install`  
`pnpm -r convert`  
`pnpm -r generate`  
`pnpm -F "./packages/**/*" build`

go to `examples/market` and run `pnpm dev` to view the example dashboard
