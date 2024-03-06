import { DefaultProperties, Text, Container } from '@react-three/uikit'
import { colors } from '@/theme'
import { Separator } from '@/separator'

export function SeparatorDemo() {
  return (
    <Container>
      <Container gap={4}>
        <Text fontSize={14} lineHeight={1}>
          Radix Primitives
        </Text>
        <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
          An open-source UI component library.
        </Text>
      </Container>
      <Separator marginY={16} />
      <Container flexDirection="row" height={20} alignItems="center" gap={16}>
        <DefaultProperties fontSize={14} lineHeight={1.43}>
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
