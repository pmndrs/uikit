import React, {
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Texture, VideoTexture } from 'three'
import { signal } from '@preact/signals-core'
import { VideoContainerProperties as BaseVideoContainerProperties, ImageProperties } from '@react-three/uikit'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'
import { ComponentInternals, Container, Image } from '@react-three/uikit'
import { updateVideoElement } from '../../../uikit/dist/components'
import VideoControls from './VideoControls'

const VideoContainerContext = createContext<HTMLVideoElement | undefined>(undefined)

export function useVideoContainerElement(): HTMLVideoElement {
  const element = useContext(VideoContainerContext)
  if (!element) {
    throw new Error('useVideoContainerElement can only be executed inside a VideoContainer')
  }
  return element
}

export type VideoInternals = ComponentInternals<ImageProperties> & {
  element: HTMLVideoElement
}

export type VideoContainerProperties = BaseVideoContainerProperties &
  EventHandlers & {
    children?: ReactNode
    controls?: boolean
    videoEl?: HTMLVideoElement
  }

export const VideoContainer: (props: VideoContainerProperties & RefAttributes<VideoInternals>) => ReactNode =
  forwardRef((props: VideoContainerProperties, ref) => {
    const texture = useMemo(() => signal<Texture | undefined>(undefined), [])
    const aspectRatio = useMemo(() => signal<number>(1), [])
    const video = useMemo(() => props.videoEl ?? document.createElement('video'), [props.videoEl])

    useEffect(() => {
      if (!props.videoEl) {
        document.body.append(video)
        return () => video.remove()
      }
    }, [video, props.videoEl])

    const { src, autoplay, volume, preservesPitch, playbackRate, muted, loop } = props

    useEffect(() => {
      updateVideoElement(video, src, autoplay, volume, preservesPitch, playbackRate, muted, loop)
    }, [video, src, autoplay, volume, preservesPitch, playbackRate, muted, loop])

    useEffect(() => {
      const updateAspectRatio = () => {
        aspectRatio.value = video.videoWidth / video.videoHeight
      }
      updateAspectRatio()
      video.addEventListener('resize', updateAspectRatio)
      return () => {
        video.removeEventListener('resize', updateAspectRatio)
      }
    }, [aspectRatio, video])

    useEffect(() => {
      const videoTexture = new VideoTexture(video)
      texture.value = videoTexture
      return () => {
        videoTexture.dispose()
      }
    }, [texture, video])

    const internalRef = useRef<ComponentInternals<ImageProperties>>(null)
    useImperativeHandle(ref, () => ({ ...internalRef.current!, element: video }), [video])

    // Control State
    const [isMuted, setIsMuted] = useState(props.muted)
    const [currentVideoTime, setCurrentVideoTime] = useState(0)
    const [videoDuration, setVideoDuration] = useState(0)

    const toggleMute = () => {
      video.muted = !video.muted
      setIsMuted(!isMuted)
    }

    const changeVideoTime = (time: number) => {
      const timeInSec = (time * videoDuration) / 100
      video.currentTime = timeInSec
      setCurrentVideoTime(timeInSec)
    }

    const onLoadedmetadata = () => {
      setVideoDuration(video.duration)
      if (props.autoplay) {
        video.play()
      }
    }

    const updateTime = () => {
      setCurrentVideoTime(video.currentTime)
    }

    useEffect(() => {
      if (video) {
        video.addEventListener('timeupdate', updateTime)
        video.addEventListener('loadedmetadata', onLoadedmetadata)

        return () => {
          video.removeEventListener('timeupdate', updateTime)
          video.removeEventListener('loadedmetadata', onLoadedmetadata)
        }
      }
    }, [video])

    return (
      <Container flexDirection="column">
        <VideoContainerContext.Provider value={video}>
          {/* @ts-ignore */}
          <Image aspectRatio={aspectRatio} {...props} ref={internalRef} src={texture} />
        </VideoContainerContext.Provider>
        {props.controls && (
          <VideoControls
            video={video}
            // @ts-ignore
            isMuted={isMuted}
            toggleMute={toggleMute}
            currentVideoTime={currentVideoTime}
            videoDuration={videoDuration}
            changeVideoTime={changeVideoTime}
          />
        )}
      </Container>
    )
  })

export default VideoContainer
