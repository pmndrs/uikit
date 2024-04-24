import {
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react'
import { Image } from './image.js'
import { Texture, VideoTexture } from 'three'
import { signal } from '@preact/signals-core'
import { VideoContainerProperties as BaseVideoContainerProperties } from '@pmndrs/uikit'
import { updateVideoElement } from '@pmndrs/uikit/internals'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'

const VideoContainerContext = createContext<HTMLVideoElement | undefined>(undefined)

export function useVideoElement(): HTMLVideoElement {
  const element = useContext(VideoContainerContext)
  if (element == null) {
    throw new Error(`useVideoElement can only be executed inside a VideoContainer`)
  }
  return element
}

export type VideoContainerProperties = BaseVideoContainerProperties &
  EventHandlers & {
    children?: ReactNode
  }

export const VideoContainer: (props: VideoContainerProperties & RefAttributes<HTMLVideoElement>) => ReactNode =
  forwardRef(({ children, ...props }: VideoContainerProperties, ref) => {
    const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
    const aspectRatio = useMemo(() => signal<number>(1), [])
    const video = useMemo(() => document.createElement('video'), [])
    useEffect(() => {
      if (!props.autoplay) {
        return
      }
      document.body.append(video)
      return () => video.remove()
    }, [props.autoplay, video])
    const { src, autoplay, volume, preservesPitch, playbackRate, muted, loop } = props
    updateVideoElement(video, src, autoplay, volume, preservesPitch, playbackRate, muted, loop)
    useEffect(() => {
      const updateAspectRatio = () => (aspectRatio.value = video.videoWidth / video.videoHeight)
      updateAspectRatio()
      video.addEventListener('resize', updateAspectRatio)
      return () => video.removeEventListener('resize', updateAspectRatio)
    }, [aspectRatio, video])
    useEffect(() => {
      const videoTexture = new VideoTexture(video)
      texture.value = videoTexture
      return () => videoTexture.dispose()
    }, [texture, video])

    useImperativeHandle(ref, () => video, [video])
    return (
      <Image aspectRatio={aspectRatio} {...props} src={texture}>
        <VideoContainerContext.Provider value={video}>{children}</VideoContainerContext.Provider>
      </Image>
    )
  })
