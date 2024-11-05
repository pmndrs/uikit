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
import { ComponentInternals } from './ref.js'
import { useThree } from '@react-three/fiber'
import { R3FEventMap } from './utils.js'

const VideoContext = createContext<HTMLVideoElement | undefined>(undefined)

export function useVideoElement(): HTMLVideoElement {
  const element = useContext(VideoContext)
  if (element == null) {
    throw new Error(`useVideoElement can only be executed inside a Video component`)
  }
  return element
}

export type VideoInternals = ComponentInternals<Omit<ImageProperties<R3FEventMap>, 'src'>> & {
  element: HTMLVideoElement
}

export type VideoRef = VideoInternals

export type VideoProperties = BaseVideoProperties<R3FEventMap> & {
  children?: ReactNode
}

export const Video: (props: VideoProperties & RefAttributes<VideoRef>) => ReactNode = forwardRef(
  (props: VideoProperties, ref) => {
    const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
    const aspectRatio = useMemo(() => signal<number>(1), [])

    const providedHtmlElement = props.src instanceof HTMLVideoElement ? props.src : undefined

    const element = useMemo(() => {
      if (providedHtmlElement != null) {
        return providedHtmlElement
      }
      const result = document.createElement('video')
      result.style.position = 'absolute'
      result.style.width = '1px'
      result.style.zIndex = '-1000'
      result.style.top = '0px'
      result.style.left = '0px'
      return result
    }, [providedHtmlElement])

    const isElementProvided = props.src instanceof HTMLVideoElement
    useEffect(() => {
      if (isElementProvided) {
        return
      }
      document.body.appendChild(element)
      return () => element.remove()
    }, [element, isElementProvided])

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
      videoTexture.needsUpdate = true
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
