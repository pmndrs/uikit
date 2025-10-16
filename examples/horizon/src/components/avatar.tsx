import { Container } from '@react-three/uikit'
import { Avatar } from '@react-three/uikit-horizon'

export function AvatarDemo() {
  return (
    <Container alignItems="center">
      <Avatar
        src="https://raw.githubusercontent.com/pmndrs/uikit/refs/heads/main/examples/horizon/public/avatar.png"
        size="lg"
        attributionActive
      />
    </Container>
  )
}
