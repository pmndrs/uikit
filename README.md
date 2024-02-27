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

- drag/click threshold
- add shadcn components
- cli for kits
- add apfel components
- Content "measureContent" flag => allow disabling content measuring and scaling
- support for visibility="hidden"
- input
- decrease clipping rect when scrollbar present

TODO Later

- on demand rendering to save battery for UI only apps / rendering to render targets
- upgrade to yoga2.0
- virtual lists (support thousands of elements in a list by using fixed sizes and not using yoga)
- option to render to seperate render targets depending on element type (e.g. render text to high quality quad layer for WebXR)
- scrollIntoView
- tailwind colors (with option to support dark mode)
- Instancing for icons

Limitations

- nested clipping with rotation in z-axis (the clipping area can become more complex than a rectangle)

## Development

`pnpm install`  
`pnpm -r inline-wasm`
`pnpm -r convert`  
`pnpm -r generate`  
`pnpm -r build`  

go to `examples/dashboard` and run `pnpm dev` to view the example dashboard
