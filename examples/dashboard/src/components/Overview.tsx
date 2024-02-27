import { Container, Text } from '@react-three/uikit'
import { colors } from '@/defaults'

const data = [
  {
    name: 'Jan',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Feb',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Mar',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Apr',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'May',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Jun',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Jul',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Aug',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Sep',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Oct',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Nov',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
  {
    name: 'Dec',
    total: Math.floor(Math.random() * 5000) + 1000,
    total2: Math.floor(Math.random() * 5000) + 1000,
  },
]

const max = 6000

const yAxisLabels = ['$6000', '$4500', '$3000', '$1500', '$0']

export function Overview() {
  return (
    <Container paddingX={16} gap={16} width="100%" height={350} flexDirection="row">
      <Container
        paddingBottom={12 * 1.333 + 8}
        flexDirection="column"
        alignItems="flex-end"
        justifyContent="space-between"
      >
        {yAxisLabels.map((label) => (
          <Text color={colors.mutedForeground} fontSize={12} lineHeight={1.3333} key={label}>
            {label}
          </Text>
        ))}
      </Container>
      <Container gap={16} height="100%" flexGrow={1} flexDirection="row">
        {data.map(({ name, total, total2 }) => (
          <Container gap={8} flexGrow={1} key={name} alignItems="center">
            <Container flexGrow={1} flexShrink={1} justifyContent="flex-end" width="100%">
              <Container
                borderRadiusTop={4}
                height={`${Math.min(1, total / max) * 100}%`}
                backgroundColor={colors.primary}
                width="100%"
                transformTranslateZ={10}
                zIndexOffset={10}
                positionType={`absolute`}
              />
              <Container
                borderRadiusTop={4}
                height={`${Math.min(1, total2 / max) * 100}%`}
                backgroundColor={colors.secondary}
                width="100%"
                transformTranslateZ={20}
                zIndexOffset={20}
                positionType={`absolute`}
              />
            </Container>
            <Text color={colors.mutedForeground} fontSize={12} lineHeight={1.3333}>
              {name}
            </Text>
          </Container>
        ))}
      </Container>
    </Container>
  )
}
