import React, {
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Signal, computed, signal } from '@preact/signals-core'
import {
  Container,
  Video as VideoImpl,
  VideoProperties as BaseVideoProperties,
  Text,
  VideoInternals,
  ContainerProperties,
  useVideoElement,
  ContainerRef,
} from '@react-three/uikit'
import { Play, Pause, VolumeX, Volume2 } from '@react-three/uikit-lucide'
import { Slider } from './slider.js'
import { Button } from './button.js'
import { colors } from './theme.js'
import { EventHandlers } from '@react-three/fiber/dist/declarations/src/core/events.js'

export type VideoProperties = { controls?: boolean } & BaseVideoProperties

//for getting the correct types for conversion
type _VideoProperties = VideoProperties

const movingContext = createContext<Signal<boolean> | undefined>(undefined)

export const Video: (props: VideoProperties & RefAttributes<VideoInternals>) => ReactNode = forwardRef(
  ({ controls, children, ...rest }: VideoProperties, ref) => {
    const moving = useMemo(() => signal(false), [])
    const handlers = useMemo<EventHandlers>(() => {
      let timeoutRef: NodeJS.Timeout | undefined
      const onInteract = () => {
        moving.value = true
        if (timeoutRef != null) {
          clearTimeout(timeoutRef)
        }
        timeoutRef = setTimeout(() => (moving.value = false), 2000)
      }
      return {
        onPointerMove: onInteract,
        onPointerDown: onInteract,
      }
    }, [moving])
    return (
      <VideoImpl {...rest} {...handlers} positionType="relative" ref={ref}>
        <movingContext.Provider value={moving}>{controls && <VideoControls />}</movingContext.Provider>
        {children}
      </VideoImpl>
    )
  },
)

export type VideoControlsProperties = Omit<ContainerProperties, 'children'>

export const VideoControls: (props: VideoControlsProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  (props: VideoControlsProperties, ref) => {
    const videoElement = useVideoElement()
    const [paused, setPaused] = useState(videoElement.paused)
    useEffect(() => {
      const listener = () => setPaused(videoElement.paused)
      videoElement.addEventListener('pause', listener)
      videoElement.addEventListener('play', listener)
      return () => {
        videoElement.removeEventListener('pause', listener)
        videoElement.removeEventListener('play', listener)
      }
    }, [videoElement])

    const [muted, setMuted] = useState(videoElement.muted)
    useEffect(() => {
      const listener = () => setMuted(videoElement.muted)
      videoElement.addEventListener('volumechange', listener)
      return () => videoElement.removeEventListener('volumechange', listener)
    }, [videoElement])

    const durationSignal = useMemo(() => signal(1), [])
    const timeSignal = useMemo(() => signal(0), [])

    const moving = useContext(movingContext)
    if (moving == null) {
      throw new Error(`VideoControls form the default kit can only be used inside a Video from the default kit`)
    }
    const displaySignal = useMemo(() => computed(() => (moving.value ? 'flex' : 'none')), [moving])

    useEffect(() => {
      const metadataListener = () => (durationSignal.value = videoElement.duration)
      const timeUpdateListener = () => (timeSignal.value = videoElement.currentTime)
      if (!isNaN(videoElement.duration)) {
        metadataListener()
      }
      videoElement.addEventListener('loadedmetadata', metadataListener)
      videoElement.addEventListener('timeupdate', timeUpdateListener)
      return () => {
        videoElement.removeEventListener('loadedmetadata', metadataListener)
        videoElement.removeEventListener('timeupdate', timeUpdateListener)
      }
    }, [durationSignal, timeSignal, videoElement])

    const timeTextSignal = useMemo(
      () => computed(() => `${formatDuration(timeSignal.value)} / ${formatDuration(durationSignal.value)}`),
      [durationSignal, timeSignal],
    )

    const setTime = useCallback((t: number) => (videoElement.currentTime = t), [videoElement])

    return (
      <Container
        display={displaySignal}
        positionType="absolute"
        padding={8}
        positionBottom={0}
        positionLeft={0}
        positionRight={0}
        flexDirection="column"
        backgroundOpacity={0.5}
        backgroundColor={colors.background}
        gap={8}
        {...props}
        ref={ref}
      >
        <Container flexDirection="row" alignItems="center">
          <Button
            size="icon"
            variant="ghost"
            marginRight={8}
            onClick={() => (paused ? videoElement.play() : videoElement.pause())}
          >
            {paused ? (
              <Play cursor="pointer" width={16} height={16} />
            ) : (
              <Pause cursor="pointer" width={16} height={16} />
            )}
          </Button>
          <Button size="icon" variant="ghost" marginRight={8} onClick={() => (videoElement.muted = !muted)}>
            {muted ? (
              <VolumeX cursor="pointer" width={16} height={16} />
            ) : (
              <Volume2 cursor="pointer" width={16} height={16} />
            )}
          </Button>
          <Container flexGrow={1} />
          <Text marginRight={16} fontSize={12}>
            {timeTextSignal}
          </Text>
        </Container>
        <Slider
          min={0}
          margin={16}
          marginTop={8}
          width={undefined}
          max={durationSignal}
          value={timeSignal}
          onValueChange={setTime}
        />
      </Container>
    )
  },
)

function formatDuration(seconds: number) {
  const hour = Math.floor(seconds / 3600)
  const min = Math.floor((seconds / 60) % 60)
  const sec = Math.floor(seconds % 60)
  return `${hour > 0 ? `${hour}:` : ''}${hour > 0 ? min.toString().padStart(2, '0') : min}:${sec.toString().padStart(2, '0')}`
}
