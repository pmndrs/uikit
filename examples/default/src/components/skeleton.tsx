import { Container } from '@react-three/uikit'
import { Skeleton } from '@/skeleton.js'

export function SkeletonDemo() {
  return (
    <Container flexDirection="row" alignItems="center" gap={16}>
      <Skeleton borderRadius={1000} height={48} width={48} />
      <Container flexDirection="column" gap={8}>
        <Skeleton height={16} width={250} />
        <Skeleton height={16} width={200} />
      </Container>
    </Container>
  )
}
