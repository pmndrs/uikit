import {
  ComponentPropsWithoutRef,
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

const VideoContainerContext = createContext<HTMLVideoElement | undefined>(undefined)

export function useVideoElement(): HTMLVideoElement {
  const element = useContext(VideoContainerContext)
  if (element == null) {
    throw new Error(`useVideoElement can only be executed inside a VideoContainer`)
  }
  return element
}

export const VideoContainer: (
  props: Omit<ComponentPropsWithoutRef<typeof Image>, 'src'> & {
    src: string | MediaStream
    volume?: number
    preservesPitch?: boolean
    playbackRate?: number
    muted?: boolean
    loop?: boolean
    autoplay?: boolean
  } & RefAttributes<HTMLVideoElement>,
) => ReactNode = forwardRef(
  (
    props: Omit<ComponentPropsWithoutRef<typeof Image>, 'src'> & {
      src: string | MediaStream
      volume?: number
      preservesPitch?: boolean
      playbackRate?: number
      muted?: boolean
      loop?: boolean
      autoplay?: boolean
    },
    ref,
  ) => {
    const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
    const aspectRatio = useMemo(() => signal<number>(1), [])
    const video = useMemo(() => document.createElement('video'), [])
    useEffect(() => {
      if (!props.autoplay) {
        return
      }
      video.style.position = 'absolute'
      video.style.width = '1px'
      video.style.zIndex = '-1000'
      video.style.top = '0px'
      video.style.left = '0px'
      document.body.append(video)
      return () => video.remove()
    }, [props.autoplay, video])
    video.playsInline = true
    video.volume = props.volume ?? 1
    video.preservesPitch = props.preservesPitch ?? true
    video.playbackRate = props.playbackRate ?? 1
    video.muted = props.muted ?? false
    video.loop = props.loop ?? false
    video.autoplay = props.autoplay ?? false
    useEffect(() => {
      if (typeof props.src === 'string') {
        video.src = props.src
      } else {
        video.srcObject = props.src
      }
      const updateAspectRatio = () => (aspectRatio.value = video.videoWidth / video.videoHeight)
      updateAspectRatio()
      video.addEventListener('resize', updateAspectRatio)
      return () => video.removeEventListener('resize', updateAspectRatio)
    }, [aspectRatio, props.src, video])
    useEffect(() => {
      const videoTexture = new VideoTexture(video)
      texture.value = videoTexture
      return () => videoTexture.dispose()
    }, [texture, video])

    useImperativeHandle(ref, () => video, [video])
    return <Image aspectRatio={aspectRatio} {...props} src={texture} />
  },
)
