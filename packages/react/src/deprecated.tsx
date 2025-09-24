import { forwardRef, ReactNode } from 'react'
import { Container, ContainerProperties, VanillaContainer } from './index.js'
import { FontFamilies } from '@pmndrs/uikit'

/**
 * @deprecated Root is not necassary anymore, can be removed or replaced with a Container
 */
export const Root = forwardRef<VanillaContainer, ContainerProperties>((props, ref) => {
  return <Container ref={ref} {...props} />
})

/**
 * @deprecated use <Container display="contents" {...{ '*': defaultProps }}> instead or put "*" directly on an existing component
 */
export function DefaultProperties({ children, ...props }: ContainerProperties['*'] & { children?: ReactNode }) {
  return (
    <Container display="contents" {...{ '*': props }}>
      {children}
    </Container>
  )
}

/**
 * @deprecated use <Container display="contents" fontFamilies={...}> instead or put fontFamilies directly on an existing component
 */
export function FontFamilyProvider({ children, fontFamilies }: { fontFamilies?: FontFamilies; children?: ReactNode }) {
  return (
    <Container display="contents" fontFamilies={fontFamilies}>
      {children}
    </Container>
  )
}
