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
import { setupVideoElementInvalidation, updateVideoElement } from '@pmndrs/uikit/internals'
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
    const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
    const aspectRatio = useMemo(() => signal<number>(1), [])

    const providedHtmlElement = props.src instanceof HTMLVideoElement ? props.src : undefined

    const element = useMemo(() => providedHtmlElement ?? document.createElement('video'), [providedHtmlElement])

    const invalidate = useThree((s) => s.invalidate)
    useEffect(() => setupVideoElementInvalidation(element, invalidate), [element, invalidate])

    updateVideoElement(element, props)

    useEffect(() => {
      const updateAspectRatio = () => (aspectRatio.value = element.videoWidth / element.videoHeight)
      updateAspectRatio()
      element.addEventListener('resize', updateAspectRatio)
      return () => element.removeEventListener('resize', updateAspectRatio)
    }, [aspectRatio, element])

    useEffect(() => {
      const videoTexture = new VideoTexture(element)
      videoTexture.colorSpace = SRGBColorSpace
      texture.value = videoTexture
      return () => videoTexture.dispose()
    }, [texture, element])

    const internalRef = useRef<ComponentInternals<ImageProperties>>(null)

    useImperativeHandle(ref, () => ({ ...internalRef.current!, element: element }), [element])

    return (
      <VideoContext.Provider value={element}>
        <Image aspectRatio={aspectRatio} {...props} ref={internalRef} src={texture} />
      </VideoContext.Provider>
    )
  },
)
