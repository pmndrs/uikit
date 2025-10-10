import { Container } from '@react-three/uikit'
import { IconIndicator } from '@react-three/uikit-horizon'

export function IconIndicatorDemo() {
  return (
    <Container flexDirection="row" gap={8}>
      <IconIndicator variant="none" />
      <IconIndicator variant="good" />
      <IconIndicator variant="poor" />
      <IconIndicator variant="bad" />
    </Container>
  )
}


