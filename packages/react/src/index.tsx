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
import { build, useRenderContext, useSetup } from './build.js'
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
  InProperties,
} from '@pmndrs/uikit'
import { ReadonlySignal } from '@preact/signals-core'
import { createPortal, extend, ThreeElement, useFrame, useLoader, useStore, useThree } from '@react-three/fiber'
import { Object3D, SRGBColorSpace, TextureLoader } from 'three'
import { jsx } from 'react/jsx-runtime'

export type ClassListProperties = { classList?: Array<string | InProperties> }

export type ContainerProperties = VanillaContainerProperties & { children?: ReactNode } & ClassListProperties
export type ContentProperties = VanillaContentProperties & { children?: ReactNode } & ClassListProperties
export type CustomProperties = VanillaCustomProperties & { children?: ReactNode } & ClassListProperties
export type ImageProperties = VanillaImageProperties & ClassListProperties
export type VideoProperties = VanillaVideoProperties & ClassListProperties
export type InputProperties = VanillaInputProperties & ClassListProperties
export type SvgProperties = VanillaSvgProperties & ClassListProperties
export type TextareaProperties = VanillaTextareaProperties & ClassListProperties
export type TextProperties = VanillaTextProperties & {
  children?: unknown
} & ClassListProperties
export type FullscreenProperties = VanillaFullscreenProperties & {
  children?: ReactNode
  attachCamera?: boolean
} & ClassListProperties

export {
  readReactive,
  type FontFamilies,
  type BaseOutProperties,
  Component as VanillaComponent,
  Container as VanillaContainer,
  type ContainerProperties as VanillaContainerProperties,
  Content as VanillaContent,
  type ContentProperties as VanillaContentProperties,
  Custom as VanillaCustom,
  type CustomProperties as VanillaCustomProperties,
  Fullscreen as VanillaFullscreen,
  type FullscreenProperties as VanillaFullscreenProperties,
  Image as VanillaImage,
  type ImageProperties as VanillaImageProperties,
  Video as VanillaVideo,
  type VideoProperties as VanillaVideoProperties,
  Input as VanillaInput,
  type InputProperties as VanillaInputProperties,
  Svg as VanillaSvg,
  type SvgProperties as VanillaSvgProperties,
  Text as VanillaText,
  type TextProperties as VanillaTextProperties,
  Textarea as VanillaTextarea,
  type TextareaProperties as VanillaTextareaProperties,
} from '@pmndrs/uikit'

export const Container = build<VanillaContainer, ContainerProperties>(VanillaContainer)
export const Content = build<VanillaContent, ContentProperties>(VanillaContent)
export const Custom = build<VanillaCustom, CustomProperties>(VanillaCustom)
export const Image = build<VanillaImage, ImageProperties>(VanillaImage)
export const Video = build<VanillaVideo, VideoProperties>(VanillaVideo)
export const Input = build<VanillaInput, InputProperties>(VanillaInput)
export const Svg = build<VanillaSvg, SvgProperties>(VanillaSvg)
export const Textarea = build<VanillaTextarea, TextareaProperties>(VanillaTextarea)

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
        hasAttached.current = false
        const { camera, scene } = store.getState()
        if (camera.parent != scene) {
          return
        }
        scene.remove(camera)
      },
      [store],
    )
    const camera = useThree((s) => s.camera)
    const fullscreenWrapper = useMemo(() => new Object3D(), [])
    fullscreenWrapper.parent?.remove(fullscreenWrapper)
    camera.add(fullscreenWrapper)
    const renderer = useThree((s) => s.gl)
    const ref = useRef<VanillaFullscreen>(null)
    useImperativeHandle(forwardRef, () => ref.current!, [])
    const renderContext = useRenderContext()
    const args = useMemo(() => [renderer, undefined, undefined, { renderContext }], [renderer, renderContext])
    const outProps = useSetup(ref, props, args)
    return createPortal(
      <vanillaFullscreen {...outProps} ref={ref}>
        {children}
      </vanillaFullscreen>,
      fullscreenWrapper,
    )
  },
)

extend({ VanillaText })

export const Text = forwardRef<VanillaText, TextProperties>(({ children, ...props }, forwardRef) => {
  const ref = useRef<VanillaText>(null)
  useImperativeHandle(forwardRef, () => ref.current!, [])
  const renderContext = useRenderContext()
  const args = useMemo(() => [undefined, undefined, { renderContext }], [renderContext])
  const outProps = useSetup(ref, { ...props, text: children }, args)
  return jsx(`vanillaText` as any, { ...outProps, ref })
})

export * from './portal.js'
export * from './build.js'
export * from './suspending.js'
export * from './deprecated.js'
