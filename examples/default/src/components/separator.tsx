import { DefaultProperties, Text, Container } from '@react-three/uikit'
import { colors } from '@/theme.js'
import { Separator } from '@/separator.js'

export function SeparatorDemo() {
  return (
    <Container width={300} flexDirection="column">
      <Container flexDirection="column" gap={4}>
        <Text fontSize={14} lineHeight="100%">
          Radix Primitives
        </Text>
        <Text fontSize={14} lineHeight={20} color={colors.mutedForeground}>
          An open-source UI component library.
        </Text>
      </Container>
      <Separator marginY={16} />
      <Container flexDirection="row" height={20} alignItems="center" gap={16}>
        <DefaultProperties fontSize={14} lineHeight={20}>
          <Text>Blog</Text>
          <Separator orientation="vertical" />
          <Text>Docs</Text>
          <Separator orientation="vertical" />
          <Text>Source</Text>
        </DefaultProperties>
      </Container>
    </Container>
  )
}
