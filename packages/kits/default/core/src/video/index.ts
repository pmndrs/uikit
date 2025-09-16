import {
  InProperties,
  VideoOutProperties as BaseVideoOutProperties,
  Container,
  ThreeEventMap,
  Video as VideoImpl,
  Text,
  BaseOutProperties,
  abortableEffect,
  withOpacity,
} from '@pmndrs/uikit'
import { signal, computed } from '@preact/signals-core'
import { Play, Pause, VolumeX, Volume2 } from '@pmndrs/uikit-lucide'
import { Slider } from '../slider/index.js'
import { Button } from '../button/index.js'
import { colors, componentDefaults, contentDefaults, imageDefaults, textDefaults } from '../theme.js'
import { Object3D } from 'three/src/Three.js'
import { searchFor } from '../utils.js'

export type VideoOutProperties<EM extends ThreeEventMap> = BaseVideoOutProperties<EM> & {
  controls?: boolean
}

export type VideoProperties<EM extends ThreeEventMap = ThreeEventMap> = InProperties<VideoOutProperties<EM>>

export class Video<T = {}, EM extends ThreeEventMap = ThreeEventMap> extends Container<T, EM, VideoOutProperties<EM>> {
  readonly interacting = signal(false)
  private timeoutRef?: NodeJS.Timeout

  readonly video: VideoImpl
  public readonly controls: VideoControls

  constructor(
    inputProperties?: VideoProperties<EM>,
    initialClasses?: Array<InProperties<BaseOutProperties<EM>> | string>,
    config?: { renderContext?: any; defaultOverrides?: InProperties<VideoOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: imageDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        positionType: 'relative',
        onPointerMove: () => this.onInteract(),
        onPointerDown: () => this.onInteract(),
        ...config?.defaultOverrides,
      },
    })

    super.add(
      (this.video = new VideoImpl(undefined, undefined, {
        defaults: imageDefaults,
        defaultOverrides: {
          '*': {
            borderColor: colors.border,
          },
          volume: this.properties.signal.volume,
          preservesPitch: this.properties.signal.preservesPitch,
          playbackRate: this.properties.signal.playbackRate,
          muted: this.properties.signal.muted,
          loop: this.properties.signal.loop,
          autoplay: this.properties.signal.autoplay,
          crossOrigin: this.properties.signal.crossOrigin,
          width: '100%',
          height: '100%',
          src: this.properties.signal.src,
        },
      })),
    )

    super.add(
      (this.controls = new VideoControls(undefined, undefined, {
        defaultOverrides: {
          '*': {
            borderColor: colors.border,
          },
          display: computed(() =>
            this.interacting.value && (this.properties.value.controls ?? true) ? 'flex' : 'none',
          ),
        },
      })),
    )
  }

  private onInteract() {
    this.interacting.value = true
    if (this.timeoutRef != null) {
      clearTimeout(this.timeoutRef)
    }
    this.timeoutRef = setTimeout(() => (this.interacting.value = false), 2000)
  }

  add(...object: Object3D[]): this {
    throw new Error(`the video component can not have any children`)
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
    config?: { renderContext?: any; defaultOverrides?: InProperties<BaseOutProperties<EM>> },
  ) {
    super(inputProperties, initialClasses, {
      defaults: componentDefaults,
      ...config,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        display: computed(() => (searchFor(this, Video, 2)?.interacting.value ? 'flex' : 'none')),
        zIndex: 1,
        positionType: 'absolute',
        padding: 8,
        positionBottom: 0,
        positionLeft: 0,
        positionRight: 0,
        flexDirection: 'column',
        backgroundColor: withOpacity(colors.background, 0.5),
        gap: 8,
        ...config?.defaultOverrides,
      },
    })
    const videoElementSignal = computed(() => searchFor(this, Video, 2)?.video.element.value)

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
    const controlsContainer = new Container(undefined, undefined, {
      defaults: componentDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexDirection: 'row',
        alignItems: 'center',
      },
    })

    // Setup play button
    const playButton = new Button(undefined, undefined, {
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
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
      },
    })
    const pauseIcon = new Pause(undefined, undefined, {
      defaults: contentDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        cursor: 'pointer',
        width: 16,
        height: 16,
      },
    })
    const playIcon = new Play(undefined, undefined, {
      defaults: contentDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        cursor: 'pointer',
        width: 16,
        height: 16,
      },
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
    const muteButton = new Button(undefined, undefined, {
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        size: 'icon',
        variant: 'ghost',
        marginRight: 8,
        onClick: () => {
          const videoElement = videoElementSignal.peek()
          if (videoElement) {
            videoElement.muted = !muted.peek()
          }
        },
      },
    })
    const volume2Icon = new Volume2(undefined, undefined, {
      defaults: contentDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        cursor: 'pointer',
        width: 16,
        height: 16,
      },
    })
    const volumeXIcon = new VolumeX(undefined, undefined, {
      defaults: contentDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        cursor: 'pointer',
        width: 16,
        height: 16,
      },
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
    const spacer = new Container(undefined, undefined, {
      defaults: componentDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        flexGrow: 1,
      },
    })

    // Setup time text
    const timeText = new Text(undefined, undefined, {
      defaults: textDefaults,
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        marginRight: 16,
        fontSize: 12,
        text: computed(() => `${formatDuration(timeSignal.value)} / ${formatDuration(durationSignal.value)}`),
      },
    })

    // Setup slider
    const slider = new Slider(undefined, undefined, {
      defaultOverrides: {
        '*': {
          borderColor: colors.border,
        },
        min: 0,
        margin: 16,
        marginTop: 8,
        width: 'initial',
        max: durationSignal,
        value: timeSignal,
        onValueChange: (t: number) => {
          const videoElement = videoElementSignal.peek()
          if (videoElement) {
            videoElement.currentTime = t
          }
        },
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
