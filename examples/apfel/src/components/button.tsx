import { Container, Text } from '@react-three/uikit'
import { Card } from '@/card'
import { Button } from '@/button'
import { BoxSelect } from '@react-three/uikit-lucide'

export function ButtonsOnCard() {
  return (
    <Container flexDirection="column" md={{ flexDirection: 'row' }} alignItems="center" gap={32}>
      <Card borderRadius={32} padding={16}>
        <Container flexDirection="row" gapColumn={16}>
          <Container flexDirection="column" justifyContent="space-between" alignItems="center" gapRow={16}>
            <Button variant="icon" size="xs">
              <BoxSelect />
            </Button>
            <Button variant="icon" size="sm">
              <BoxSelect />
            </Button>
            <Button variant="icon" size="md">
              <BoxSelect />
            </Button>
            <Button variant="icon" size="lg">
              <BoxSelect />
            </Button>
            <Button variant="icon" size="xl">
              <BoxSelect />
            </Button>
          </Container>
          <Container flexDirection="column" justifyContent="space-between" alignItems="center" gapRow={16}>
            <Button variant="icon" size="xs" platter>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="sm" platter>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="md" platter>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="lg" platter>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="xl" platter>
              <BoxSelect />
            </Button>
          </Container>
          <Container flexDirection="column" justifyContent="space-between" alignItems="center" gapRow={16}>
            <Button variant="icon" size="xs" selected>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="sm" selected>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="md" selected>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="lg" selected>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="xl" selected>
              <BoxSelect />
            </Button>
          </Container>
          <Container flexDirection="column" justifyContent="space-between" alignItems="center" gapRow={16}>
            <Button variant="icon" size="xs" disabled>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="sm" disabled>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="md" disabled>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="lg" disabled>
              <BoxSelect />
            </Button>
            <Button variant="icon" size="xl" disabled>
              <BoxSelect />
            </Button>
          </Container>
        </Container>
      </Card>

      <Card borderRadius={32} padding={24}>
        <Container flexDirection="column" gapRow={32}>
          <Container flexDirection="row" gapColumn={16}>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="pill" size="sm">
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="md">
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="lg">
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="pill" size="sm" platter>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="md" platter>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="lg" platter>
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="pill" size="sm" selected>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="md" selected>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="lg" selected>
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="pill" size="sm" disabled>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="md" disabled>
                <Text>Label</Text>
              </Button>
              <Button variant="pill" size="lg" disabled>
                <Text>Label</Text>
              </Button>
            </Container>
          </Container>

          <Container flexDirection="row" gapColumn={16}>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="rect" size="sm">
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="md">
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="lg">
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="rect" size="sm" platter>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="md" platter>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="lg" platter>
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="rect" size="sm" selected>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="md" selected>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="lg" selected>
                <Text>Label</Text>
              </Button>
            </Container>
            <Container flexDirection="column" alignItems="flex-start" gapRow={16}>
              <Button variant="rect" size="sm" disabled>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="md" disabled>
                <Text>Label</Text>
              </Button>
              <Button variant="rect" size="lg" disabled>
                <Text>Label</Text>
              </Button>
            </Container>
          </Container>
        </Container>
      </Card>
    </Container>
  )
}
