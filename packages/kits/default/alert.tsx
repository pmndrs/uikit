import { AllOptionalProperties, Container, DefaultProperties } from "@react-three/uikit";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import { colors } from "./defaults.js";

const alertVariants = {
  default: {},
  destructive: {
    borderColor: colors.destructive,
    borderOpacity: 0.5,
    color: colors.destructive,
  },
} satisfies { [Key in string]: AllOptionalProperties };

export function Alert(
  props: ComponentPropsWithoutRef<typeof Container> & { variant?: keyof typeof alertVariants },
) {
  return (
    <DefaultProperties {...alertVariants[props.variant ?? "default"]}>
      <Container
        positionType="relative"
        width="100%"
        borderRadius={8}
        border={1}
        padding={16}
        {...props}
      />
    </DefaultProperties>
  );
}

export function AlertIcon(props: ComponentPropsWithoutRef<typeof Container>) {
  return <Container positionLeft={16} positionTop={16} positionType="absolute" {...props} />;
}

export function AlertTitle(props: ComponentPropsWithoutRef<typeof Container>) {
  return <Container marginBottom={4} padding={0} paddingLeft={28} {...props} />;
}

export function AlertDescription({ children }: { children?: ReactNode }) {
  return (
    <DefaultProperties lineHeight={1.43} fontSize={14}>
      <Container paddingLeft={28}>{children}</Container>
    </DefaultProperties>
  );
}
