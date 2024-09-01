import { Container, Text } from '@react-three/uikit'
import { Card } from '@/card.js'
import { Button } from '@/button.js'
import { BoxSelect } from '@react-three/uikit-lucide'

export function ButtonsOnCard() {
  return (
    <Container flexDirection="column" md={{ flexDirection: 'row' }} alignItems="center" gap={32}>
      <Card borderRadius={32} padding={16}>
        <Container flexDirection="column" justifyContent="space-between" alignItems="center" gapRow={16}>
          <Button variant="icon" size="xs">
            <BoxSelect />
          </Button>
          <Button variant="rect" size="sm" platter>
            <Text>Label</Text>
          </Button>
          <Button variant="rect" size="lg" disabled>
            <Text>Label</Text>
          </Button>
        </Container>
      </Card>
    </Container>
  )
}
