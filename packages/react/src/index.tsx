export {
  basedOnPreferredColorScheme,
  setPreferredColorScheme,
  getPreferredColorScheme,
  withOpacity,
  isDarkMode,
  canvasInputProps,
} from '@pmndrs/uikit'

declare module '@react-three/fiber' {
  interface ThreeElements {
    vanillaFullscreen: ThreeElement<typeof VanillaFullscreen>
  }
}

import { forwardRef, ReactNode, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { build, useSetup } from './build.js'
import {
  Container as VanillaContainer,
  ContainerProperties as VanillaContainerProperties,
  Content as VanillaContent,
  ContentProperties as VanillaContentProperties,
  Custom as VanillaCustom,
  CustomProperties as VanillaCustomProperties,
  Fullscreen as VanillaFullscreen,
  FullscreenProperties as VanillaFullscreenProperties,
  Image as VanillaImage,
  ImageProperties as VanillaImageProperties,
  Video as VanillaVideo,
  VideoProperties as VanillaVideoProperties,
  Input as VanillaInput,
  InputProperties as VanillaInputProperties,
  Svg as VanillaSvg,
  SvgProperties as VanillaSvgProperties,
  Text as VanillaText,
  TextProperties as VanillaTextProperties,
  Textarea as VanillaTextarea,
  TextareaProperties as VanillaTextareaProperties,
  ThreeEventMap,
} from '@pmndrs/uikit'
import { Signal } from '@preact/signals-core'
import { createPortal, extend, ThreeElement, useFrame, useLoader, useStore, useThree } from '@react-three/fiber'
import { SRGBColorSpace, TextureLoader } from 'three'

export type ContainerProperties = VanillaContainerProperties & { children?: ReactNode }
export type ContentProperties = VanillaContentProperties & { children?: ReactNode }
export type CustomProperties = VanillaCustomProperties & { children?: ReactNode }
export type ImageProperties = VanillaImageProperties<ThreeEventMap>
export type VideoProperties = VanillaVideoProperties<ThreeEventMap>
export type InputProperties = VanillaInputProperties<ThreeEventMap>
export type SvgProperties = VanillaSvgProperties
export type TextareaProperties = VanillaTextareaProperties<ThreeEventMap>
export type TextProperties = VanillaTextProperties<ThreeEventMap> & {
  children?: string | string[] | Signal<string | string[] | undefined>
}
export type FullscreenProperties = VanillaFullscreenProperties<ThreeEventMap> & {
  children?: ReactNode
  attachCamera?: boolean
}

export type {
  Container as VanillaContainer,
  Content as VanillaContent,
  Custom as VanillaCustom,
  Image as VanillaImage,
  Video as VanillaVideo,
  Input as VanillaInput,
  Svg as VanillaSvg,
  Textarea as VanillaTextarea,
} from '@pmndrs/uikit'

export const Container = build<VanillaContainer, ContainerProperties>(true, VanillaContainer)
export const Content = build<VanillaContent, ContentProperties>(true, VanillaContent)
export const Custom = build<VanillaCustom, CustomProperties>(true, VanillaCustom)
export const Image = build<VanillaImage, ImageProperties>(false, VanillaImage)
export const Video = build<VanillaVideo, VideoProperties>(false, VanillaVideo)
export const Input = build<VanillaInput, InputProperties>(false, VanillaInput)
export const Svg = build<VanillaSvg, SvgProperties>(false, VanillaSvg)
export const Textarea = build<VanillaTextarea, TextareaProperties>(false, VanillaTextarea)

extend({ VanillaFullscreen })

export const Fullscreen = forwardRef<VanillaFullscreen, FullscreenProperties>(
  ({ children, attachCamera, ...props }, forwardRef) => {
    const hasAttached = useRef(false)
    useFrame(({ camera, scene }) => {
      //attach camera to something so we can see the camera
      if (camera.parent == null && (attachCamera ?? true)) {
        scene.add(camera)
        hasAttached.current = true
      }
    })
    const store = useStore()
    //cleanup attaching the camera
    useEffect(
      () => () => {
        if (!hasAttached.current) {
          return
        }
        const { camera, scene } = store.getState()
        if (camera.parent != scene) {
          return
        }
        scene.remove(camera)
      },
      [store],
    )
    const camera = useThree((s) => s.camera)
    const renderer = useThree((s) => s.gl)
    const ref = useRef<VanillaFullscreen>(null)
    useImperativeHandle(forwardRef, () => ref.current!, [])
    useSetup(ref, props)
    return createPortal(
      <vanillaFullscreen args={[renderer]} ref={ref}>
        {children}
      </vanillaFullscreen>,
      camera,
    )
  },
)

export const Text = forwardRef<VanillaText, TextProperties>(({ children, ...props }, ref) => {
  props.text = children
  const text = useMemo(() => new VanillaText(), [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useImperativeHandle(ref, () => text, [])
  useSetup({ current: text }, props)
  return <primitive object={text} />
})

export type SuspendingImageProperties = Omit<ImageProperties, 'src'> & {
  src: string
}

/**
 * be aware that this component does not dispose the loaded texture
 */
export const SuspendingImage = forwardRef<VanillaImage, SuspendingImageProperties>(({ src, ...props }, ref) => {
  const texture = useLoader(TextureLoader, src)
  texture.colorSpace = SRGBColorSpace
  texture.matrixAutoUpdate = false
  return <Image ref={ref} src={texture} {...props} />
})

export * from './portal.js'
export * from './build.js'
