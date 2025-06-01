import {
  InProperties,
  VideoOutProperties as BaseVideoOutProperties,
  Container,
  ThreeEventMap,
  Video as VideoImpl,
  Text,
  BaseOutProperties,
} from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { Play, Pause, VolumeX, Volume2 } from '@pmndrs/uikit-lucide'
import { Slider } from './slider.js'
import { Button } from './button.js'
import { colors } from './theme.js'
import { Object3D } from 'three/src/Three.js'
import { abortableEffect, readReactive } from '@pmndrs/uikit/src/utils.js'

export type VideoOutProperties<EM extends ThreeEventMap> = BaseVideoOutProperties<EM> & {
  controls?: boolean
}

export type VideoProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<VideoOutProperties<EM>>

export class Video<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, VideoOutProperties<EM>> {
  readonly interacting = signal(false)
  private timeoutRef?: NodeJS.Timeout

  readonly video: VideoImpl

  constructor(
    inputProperties?: VideoProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: any,
  ) {
    super(inputProperties, initialClasses, renderContext)

    super.add(
      (this.video = new VideoImpl({
        src: this.properties.signal.src,
      })),
    )

    super.add(
      new VideoControls({
        display: computed(() => (this.interacting.value && (this.properties.value.controls ?? true) ? 'flex' : 'none')),
      }),
    )
  }

  protected internalResetProperties(props: VideoProperties<EM> = {}): void {
    const onInteract = () => {
      this.interacting.value = true
      if (this.timeoutRef != null) {
        clearTimeout(this.timeoutRef)
      }
      this.timeoutRef = setTimeout(() => (this.interacting.value = false), 2000)
    }
    super.internalResetProperties({
      positionType: 'relative',
      onPointerMove: onInteract,
      onPointerDown: onInteract,
      ...props,
    })
  }

  add(...object: Object3D[]): this {
    throw new Error(`the input component can not have any children`)
  }

  dispose(): void {
    super.dispose()
    if (this.timeoutRef != null) {
      clearTimeout(this.timeoutRef)
    }
  }
}

export type VideoControlsProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<BaseOutProperties<EM>>

export class VideoControls<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<
  T,
  EM,
  BaseOutProperties<EM>
> {
  constructor(
    inputProperties?: VideoControlsProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    renderContext?: any,
  ) {
    super(inputProperties, initialClasses, renderContext)
    const videoElementSignal = computed(() =>
      this.parentContainer.value instanceof Video ? this.parentContainer.value.video.element.value : undefined,
    )

    const paused = signal(false)
    const muted = signal(false)
    const durationSignal = signal(1)
    const timeSignal = signal(0)

    abortableEffect(() => {
      const videoElement = videoElementSignal.value
      if (videoElement == null) {
        return
      }

      const internalAbort = new AbortController()
      const updatePlayPause = () => (paused.value = videoElement.paused)
      const updateMuted = () => (muted.value = videoElement.muted)
      const updateDuration = () => (durationSignal.value = isNaN(videoElement.duration) ? 1 : videoElement.duration)
      const updateTime = () => (timeSignal.value = videoElement.currentTime)

      videoElement.addEventListener('pause', updatePlayPause, { signal: internalAbort.signal })
      videoElement.addEventListener('play', updatePlayPause, { signal: internalAbort.signal })
      videoElement.addEventListener('volumechange', updateMuted, { signal: internalAbort.signal })
      videoElement.addEventListener('loadedmetadata', updateDuration, { signal: internalAbort.signal })
      videoElement.addEventListener('timeupdate', updateTime, { signal: internalAbort.signal })

      updatePlayPause()
      updateMuted()
      updateDuration()
      updateTime()

      return () => internalAbort.abort()
    }, this.abortSignal)

    // Setup control container
    const controlsContainer = new Container({
      flexDirection: 'row',
      alignItems: 'center',
    })

    // Setup play button
    const playButton = new Button({
      size: 'icon',
      variant: 'ghost',
      marginRight: 8,
      onClick: () => {
        const videoElement = videoElementSignal.peek()
        if (videoElement) {
          if (paused.value) {
            videoElement.play()
          } else {
            videoElement.pause()
          }
        }
      },
    })
    const pauseIcon = new Pause({
      cursor: 'pointer',
      width: 16,
      height: 16,
    })
    const playIcon = new Play({
      cursor: 'pointer',
      width: 16,
      height: 16,
    })
    abortableEffect(() => {
      playButton.clear()
      if (paused.value) {
        playButton.add(playIcon)
      } else {
        playButton.add(pauseIcon)
      }
    }, this.abortSignal)

    // Setup mute button
    const muteButton = new Button({
      size: 'icon',
      variant: 'ghost',
      marginRight: 8,
      onClick: () => {
        const videoElement = videoElementSignal.peek()
        if (videoElement) {
          videoElement.muted = !muted.peek()
        }
      },
    })
    const volume2Icon = new Volume2({
      cursor: 'pointer',
      width: 16,
      height: 16,
    })
    const volumeXIcon = new VolumeX({
      cursor: 'pointer',
      width: 16,
      height: 16,
    })
    abortableEffect(() => {
      muteButton.clear()
      if (muted.value) {
        muteButton.add(volumeXIcon)
      } else {
        muteButton.add(volume2Icon)
      }
    }, this.abortSignal)

    // Setup spacer
    const spacer = new Container({
      flexGrow: 1,
    })

    // Setup time text
    const timeText = new Text({
      marginRight: 16,
      fontSize: 12,
      text: computed(() => `${formatDuration(timeSignal.value)} / ${formatDuration(durationSignal.value)}`),
    })

    // Setup slider
    const slider = new Slider({
      min: 0,
      margin: 16,
      marginTop: 8,
      width: undefined,
      max: durationSignal,
      value: timeSignal,
      onValueChange: (t: number) => {
        const videoElement = videoElementSignal.peek()
        if (videoElement) {
          videoElement.currentTime = t
        }
      },
    })

    // Add components to containers
    controlsContainer.add(playButton)
    controlsContainer.add(muteButton)
    controlsContainer.add(spacer)
    controlsContainer.add(timeText)

    super.add(controlsContainer)
    super.add(slider)
  }

  protected internalResetProperties(props: VideoControlsProperties<EM> = {}): void {
    super.internalResetProperties({
      display: computed(() =>
        this.parentContainer.value instanceof Video && this.parentContainer.value.interacting.value ? 'flex' : 'none',
      ),
      zIndexOffset: 1,
      positionType: 'absolute',
      padding: 8,
      positionBottom: 0,
      positionLeft: 0,
      positionRight: 0,
      flexDirection: 'column',
      backgroundOpacity: 0.5,
      backgroundColor: colors.background,
      gap: 8,
      ...props,
    })
  }

  add(...object: Object3D[]): this {
    throw new Error(`the input component can not have any children`)
  }
}

function formatDuration(seconds: number): string {
  const hour = Math.floor(seconds / 3600)
  const min = Math.floor((seconds / 60) % 60)
  const sec = Math.floor(seconds % 60)
  return `${hour > 0 ? `${hour}:` : ''}${hour > 0 ? min.toString().padStart(2, '0') : min}:${sec.toString().padStart(2, '0')}`
}
