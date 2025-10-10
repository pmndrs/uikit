import { Container, Text } from '@react-three/uikit'
import { Divider } from '@react-three/uikit-horizon'

export function DividerDemo() {
  return (
    <Container flexDirection="column" gap={16}>
      {/* Horizontal divider separating a title and content */}
      <Container width={360} flexDirection="column" gap={8}>
        <Text>Profile</Text>
        <Divider height={2} />
        <Text color="rgba(255,255,255,0.75)">Name, email and other details appear below.</Text>
      </Container>

      {/* Vertical dividers between cards */}
      <Container flexDirection="row" alignItems="center" gap={12} height={80}>
        <Container
          alignItems="center"
          justifyContent="center"
          width={120}
          height={60}
          backgroundColor="rgba(255,255,255,0.06)"
          borderRadius={8}
        >
          <Text>A</Text>
        </Container>
        <Divider orientation="vertical" width={2} />
        <Container
          alignItems="center"
          justifyContent="center"
          width={120}
          height={60}
          backgroundColor="rgba(255,255,255,0.06)"
          borderRadius={8}
        >
          <Text>B</Text>
        </Container>
        <Divider orientation="vertical" width={2} />
        <Container
          alignItems="center"
          justifyContent="center"
          width={120}
          height={60}
          backgroundColor="rgba(255,255,255,0.06)"
          borderRadius={8}
        >
          <Text>C</Text>
        </Container>
      </Container>
    </Container>
  )
}


