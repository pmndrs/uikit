# msdfonts

base64 msdf fonts distributed as npm packages

# usage with R3/uikit

```jsx
import { inter } from '@pmndrs/msdfonts'

;<FontFamilyProvider inter={inter}>{...children}</FontFamilyProvider>
```

# How to build

## First Step

`cd docker-volume`
`docker build . -t msdfonts`  
`docker run -v ./docker-volume:/data/:rw -e GOOGLE_FONTS_API_KEY='<insert-api-key>' msdfonts`

for users on ARM architecture (e.g. Apple M-chips)

`cd docker-volume`
`docker build . --platform linux/x86_64 -t msdfonts`  
`docker run -v ./docker-volume:/data/:rw -e GOOGLE_FONTS_API_KEY='<insert-api-key>'  --platform linux/x86_64 msdfonts`

## Final Step

Now delete the file in `src/index.ts` and copy the file `docker-volume/index.ts` into `src/index.ts`
