import {
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { Image } from './image.js'
import { SRGBColorSpace, Texture, VideoTexture } from 'three'
import { signal } from '@preact/signals-core'
import { VideoProperties as BaseVideoProperties, ImageProperties } from '@pmndrs/uikit'
import { updateVideoElement } from '@pmndrs/uikit/internals'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { ComponentInternals } from './ref.js'
import { useThree } from '@react-three/fiber'

const VideoContext = createContext<HTMLVideoElement | undefined>(undefined)

export function useVideoElement(): HTMLVideoElement {
  const element = useContext(VideoContext)
  if (element == null) {
    throw new Error(`useVideoElement can only be executed inside a Video component`)
  }
  return element
}

export type VideoInternals = ComponentInternals<Omit<ImageProperties, 'src'> & EventHandlers> & {
  element: HTMLVideoElement
}

export type VideoProperties = BaseVideoProperties &
  EventHandlers & {
    children?: ReactNode
  }

export const Video: (props: VideoProperties & RefAttributes<VideoInternals>) => ReactNode = forwardRef(
  (props: VideoProperties, ref) => {
    const { src, autoplay, volume, preservesPitch, playbackRate, muted, loop } = props

    const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
    const aspectRatio = useMemo(() => signal<number>(1), [])

    const video = useMemo(() => (src instanceof HTMLVideoElement ? src : document.createElement('video')), [src])

    useEffect(() => {
      if (!(src instanceof HTMLVideoElement)) {
        document.body.append(video)

        return () => video.remove()
      }
    }, [video])

    const invalidate = useThree((s) => s.invalidate)
    useEffect(() => {
      const callback = () => {
        invalidate()
        video.requestVideoFrameCallback(callback)
      }
      callback()
    }, [video, invalidate])

    updateVideoElement(video, src, autoplay, volume, preservesPitch, playbackRate, muted, loop)

    useEffect(() => {
      const updateAspectRatio = () => (aspectRatio.value = video.videoWidth / video.videoHeight)
      updateAspectRatio()
      video.addEventListener('resize', updateAspectRatio)
      return () => video.removeEventListener('resize', updateAspectRatio)
    }, [aspectRatio, video])

    useEffect(() => {
      const videoTexture = new VideoTexture(video)
      videoTexture.colorSpace = SRGBColorSpace
      texture.value = videoTexture
      return () => videoTexture.dispose()
    }, [texture, video])

    const internalRef = useRef<ComponentInternals<ImageProperties>>(null)

    useImperativeHandle(ref, () => ({ ...internalRef.current!, element: video }), [video])

    return (
      <VideoContext.Provider value={video}>
        <Image aspectRatio={aspectRatio} {...props} ref={internalRef} src={texture} />
      </VideoContext.Provider>
    )
  },
)
