import { ComponentPropsWithoutRef } from 'react'
import { Container, Text } from '@react-three/uikit'
import { colors } from '@/theme.js'

export function MainNav(props: Omit<ComponentPropsWithoutRef<typeof Container>, 'children'>) {
  return (
    <Container alignItems="center" flexDirection="row" gap={16} lg={{ gap: 24 }} {...props}>
      <Text fontSize={14} lineHeight={20} fontWeight="medium">
        Overview
      </Text>
      <Text color={colors.mutedForeground} fontSize={14} lineHeight={20} fontWeight="medium">
        Customers
      </Text>
      <Text color={colors.mutedForeground} fontSize={14} lineHeight={20} fontWeight="medium">
        Products
      </Text>
      <Text color={colors.mutedForeground} fontSize={14} lineHeight={20} fontWeight="medium">
        Settings
      </Text>
    </Container>
  )
}
