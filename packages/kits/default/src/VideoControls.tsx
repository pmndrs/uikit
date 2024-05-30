import React from 'react'
import { Play, Pause, VolumeX, Volume2 } from '@react-three/uikit-lucide'
import { Container, Text } from '@react-three/uikit'
import { Slider } from './slider'

type VideoControlsProps = {
  video: HTMLVideoElement
  isMuted: boolean
  toggleMute: () => void
  currentVideoTime: number
  videoDuration: number
  changeVideoTime: (time: number) => void
}

const VideoControls: React.FC<VideoControlsProps> = ({
  video,
  isMuted,
  toggleMute,
  currentVideoTime,
  videoDuration,
  changeVideoTime,
}) => {
  const newSliderValue = videoDuration !== 0 ? (currentVideoTime / videoDuration) * 100 : 0

  const convertToSecAndMin = (t1: number, t2: number) => {
    const t1Min = Math.floor(t1 / 60)
    const t1Sec = Math.floor(t1 % 60)
    const t2Min = Math.floor(t2 / 60)
    const t2Sec = Math.floor(t2 % 60)
    return `${(t1Min < 10 ? '0' : '') + t1Min}:${t1Sec < 10 ? '0' : ''}${t1Sec} / ${t2Min < 10 ? '0' : ''}${t2Min}:${t2Sec < 10 ? '0' : ''}${t2Sec}`
  }

  return (
    <Container flexDirection="column">
      <Container marginTop={10} marginBottom={5}>
        <Slider borderColor="#2C2D2E" width={'100%'} value={newSliderValue} onValueChange={changeVideoTime} />
      </Container>
      <Container flexDirection="row" justifyContent="space-between" alignItems="center">
        <Container justifyContent="flex-start">
          <Container>
            {video.paused ? (
              <Play cursor="pointer" marginRight={8} width={16} height={16} onClick={() => video.play()} />
            ) : (
              <Pause cursor="pointer" marginRight={8} width={16} height={16} onClick={() => video.pause()} />
            )}
          </Container>
          <Container>
            {isMuted ? (
              <VolumeX cursor="pointer" marginRight={8} width={16} height={16} onClick={toggleMute} />
            ) : (
              <Volume2 cursor="pointer" marginRight={8} width={16} height={16} onClick={toggleMute} />
            )}
          </Container>
        </Container>
        <Container justifyContent="flex-end">
          <Text color="white" fontSize={10}>
            {convertToSecAndMin(currentVideoTime, videoDuration)}
          </Text>
        </Container>
      </Container>
    </Container>
  )
}

export default VideoControls
