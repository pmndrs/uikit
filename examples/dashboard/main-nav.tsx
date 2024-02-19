import { colors } from "@/defaults.js";
import { Container, Text } from "@react-three/uikit";
import { ComponentPropsWithoutRef } from "react";

export function MainNav(props: Omit<ComponentPropsWithoutRef<typeof Container>, "children">) {
  return (
    <Container alignItems="center" flexDirection="row" gap={16} lg={{ gap: 24 }} {...props}>
      <Text fontSize={14} lineHeight={1.43} fontWeight="medium" hover={{ color: colors.primary }}>
        Overview
      </Text>
      <Text color={colors.mutedForeground} fontSize={14} lineHeight={1.43} fontWeight="medium">
        Customers
      </Text>
      <Text color={colors.mutedForeground} fontSize={14} lineHeight={1.43} fontWeight="medium">
        Products
      </Text>
      <Text color={colors.mutedForeground} fontSize={14} lineHeight={1.43} fontWeight="medium">
        Settings
      </Text>
    </Container>
  );
}
