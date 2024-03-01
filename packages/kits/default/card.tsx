import { Container, DefaultProperties } from '@react-three/uikit'
import { ComponentPropsWithoutRef, ReactNode } from 'react'
import { colors } from './theme'

export function Card({ children, ...props }: ComponentPropsWithoutRef<typeof Container>) {
  return (
    <Container borderRadius={8} border={1} backgroundColor={colors.card} {...props}>
      <DefaultProperties color={colors.cardForeground}>{children}</DefaultProperties>
    </Container>
  )
}

export function CardHeader(props: ComponentPropsWithoutRef<typeof Container>) {
  return <Container padding={24} flexDirection="column" gap={6} {...props} />
}

export function CardTitle({ children }: { children?: ReactNode }) {
  return (
    <DefaultProperties fontWeight="semi-bold" letterSpacing={-0.4} fontSize={24} lineHeight={1}>
      {children}
    </DefaultProperties>
  )
}
export function CardDescription({ children }: { children?: ReactNode }) {
  return (
    <DefaultProperties fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
      {children}
    </DefaultProperties>
  )
}

export function CardContent(props: ComponentPropsWithoutRef<typeof Container>) {
  return <Container padding={24} paddingTop={0} {...props} />
}

export function CardFooter(props: ComponentPropsWithoutRef<typeof Container>) {
  return <Container flexDirection="row" alignItems="center" padding={24} paddingTop={0} {...props} />
}
