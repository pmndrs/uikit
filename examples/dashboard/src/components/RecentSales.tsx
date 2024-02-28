import { Container, Text } from '@react-three/uikit'
import { Avatar } from '@/avatar'
import { colors } from '@/theme'

export function RecentSales() {
  return (
    <Container gap={32}>
      <Container flexDirection="row" alignItems="center">
        <Avatar height={36} width={36} src="/01.png" />
        <Container marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight={1} fontWeight="medium">
            Olivia Martin
          </Text>
          <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
            olivia.martin@email.com
          </Text>
        </Container>
        <Text marginLeft="auto" fontWeight="medium">
          +$1,999.00
        </Text>
      </Container>
      <Container flexDirection="row" alignItems="center">
        <Avatar height={36} width={36} alignItems="center" justifyContent="center" border={1} gap={0} src="/02.png" />
        <Container marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight={1} fontWeight="medium">
            Jackson Lee
          </Text>
          <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
            jackson.lee@email.com
          </Text>
        </Container>
        <Text marginLeft="auto" fontWeight="medium">
          +$39.00
        </Text>
      </Container>
      <Container flexDirection="row" alignItems="center">
        <Avatar width={36} height={36} src="/03.png" />
        <Container marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight={1} fontWeight="medium">
            Isabella Nguyen
          </Text>
          <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
            isabella.nguyen@email.com
          </Text>
        </Container>
        <Text marginLeft="auto" fontWeight="medium">
          +$299.00
        </Text>
      </Container>
      <Container flexDirection="row" alignItems="center">
        <Avatar width={36} height={36} src="/04.png" />
        <Container marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight={1} fontWeight="medium">
            William Kim
          </Text>
          <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
            will@email.com
          </Text>
        </Container>
        <Text marginLeft="auto" fontWeight="medium">
          +$99.00
        </Text>
      </Container>
      <Container flexDirection="row" alignItems="center">
        <Avatar width={36} height={36} src="/05.png" />
        <Container marginLeft={16} gap={4}>
          <Text fontSize={14} lineHeight={1} fontWeight="medium">
            Sofia Davis
          </Text>
          <Text fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
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
