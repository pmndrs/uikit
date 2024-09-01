import { Video } from '@/video.js'

export function VideoDemo() {
  return (
    <Video
      crossOrigin="anonymous"
      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      controls
      width={500}
    />
  )
}
