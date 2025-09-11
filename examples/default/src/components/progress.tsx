import { useEffect, useState } from 'react'
import { Progress } from '@react-three/uikit-default'

export function ProgressDemo() {
  const [progress, setProgress] = useState(13)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 1000)
    return () => clearTimeout(timer)
  }, [])

  return <Progress value={progress} width={200} />
}
