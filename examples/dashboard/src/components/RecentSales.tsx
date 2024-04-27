import { Container, Text } from '@react-three/uikit'
import { Avatar } from '@/avatar.js'
import { colors } from '@/theme.js'

export function RecentSales() {
  return (
    <Container flexDirection="column" gap={32}>
      <Container flexDirection="row" alignItems="center">
        <Avatar height={36} width={36} src="/uikit/examples/dashboard/01.png" />
        <Container flexDirection="column" marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight="100%" fontWeight="medium">
            Olivia Martin
          </Text>
          <Text fontSize={14} lineHeight={20} color={colors.mutedForeground}>
            olivia.martin@email.com
          </Text>
        </Container>
        <Text marginLeft="auto" fontWeight="medium">
          +$1,999.00
        </Text>
      </Container>
      <Container flexDirection="row" alignItems="center">
        <Avatar
          height={36}
          width={36}
          alignItems="center"
          justifyContent="center"
          borderWidth={1}
          gap={0}
          src="/uikit/examples/dashboard/02.png"
        />
        <Container flexDirection="column" marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight="100%" fontWeight="medium">
            Jackson Lee
          </Text>
          <Text fontSize={14} lineHeight={20} color={colors.mutedForeground}>
            jackson.lee@email.com
          </Text>
        </Container>
        <Text marginLeft="auto" fontWeight="medium">
          +$39.00
        </Text>
      </Container>
      <Container flexDirection="row" alignItems="center">
        <Avatar width={36} height={36} src="/uikit/examples/dashboard/03.png" />
        <Container flexDirection="column" marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight="100%" fontWeight="medium">
            Isabella Nguyen
          </Text>
          <Text fontSize={14} lineHeight={20} color={colors.mutedForeground}>
            isabella.nguyen@email.com
          </Text>
        </Container>
        <Text marginLeft="auto" fontWeight="medium">
          +$299.00
        </Text>
      </Container>
      <Container flexDirection="row" alignItems="center">
        <Avatar width={36} height={36} src="/uikit/examples/dashboard/04.png" />
        <Container flexDirection="column" marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight="100%" fontWeight="medium">
            William Kim
          </Text>
          <Text fontSize={14} lineHeight={20} color={colors.mutedForeground}>
            will@email.com
          </Text>
        </Container>
        <Text marginLeft="auto" fontWeight="medium">
          +$99.00
        </Text>
      </Container>
      <Container flexDirection="row" alignItems="center">
        <Avatar width={36} height={36} src="/uikit/examples/dashboard/05.png" />
        <Container flexDirection="column" marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight="100%" fontWeight="medium">
            Sofia Davis
          </Text>
          <Text fontSize={14} lineHeight={20} color={colors.mutedForeground}>
            sofia.davis@email.com
          </Text>
        </Container>
        <Text marginLeft="auto" fontWeight="medium">
          +$39.00
        </Text>
      </Container>
    </Container>
  )
}
