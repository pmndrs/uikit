import React, { createContext, useContext, useState } from 'react'
import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import { ChevronDown } from '@react-three/uikit-lucide'

const AccordionContext = createContext<[string | undefined, (value: string | undefined) => void]>(null as any)

export type AccordionProperties = ContainerProperties

export function Accordion({ children, ...props }: AccordionProperties) {
  const stateHandler = useState<string | undefined>(undefined)
  return (
    <Container flexDirection="column" {...props}>
      <AccordionContext.Provider value={stateHandler}>{children}</AccordionContext.Provider>
    </Container>
  )
}
const AccordionItemContext = createContext<string>('')

export type AccordionItemProperties = ContainerProperties & { value: string }

export function AccordionItem({ children, ...props }: AccordionItemProperties) {
  const [value, setValue] = useContext(AccordionContext)
  const isSelected = props.value === value
  return (
    <Container
      cursor="pointer"
      flexDirection="column"
      onClick={() => setValue(isSelected ? undefined : props.value)}
      borderBottomWidth={1}
      {...props}
    >
      <AccordionItemContext.Provider value={props.value}>{children}</AccordionItemContext.Provider>
    </Container>
  )
}

export type AccordionTriggerProperties = ContainerProperties

export function AccordionTrigger({ children, ...props }: AccordionTriggerProperties) {
  const itemValue = useContext(AccordionItemContext)
  const [value] = useContext(AccordionContext)
  const isSelected = itemValue === value
  return (
    <Container
      flexDirection="row"
      flexGrow={1}
      flexShrink={1}
      alignItems="center"
      justifyContent="space-between"
      paddingY={16}
      {...props}
    >
      <DefaultProperties fontWeight="medium">{children}</DefaultProperties>
      <ChevronDown transformRotateZ={isSelected ? 180 : 0} width={16} height={16} flexShrink={0} />
    </Container>
  )
}

export type AccordionContentProperties = ContainerProperties

export function AccordionContent({ children, ...props }: AccordionContentProperties) {
  const itemValue = useContext(AccordionItemContext)
  const [value] = useContext(AccordionContext)
  if (value != itemValue) {
    return null
  }
  return (
    <Container overflow="hidden" {...props}>
      <Container paddingBottom={16}>
        <DefaultProperties fontSize={14}>{children}</DefaultProperties>
      </Container>
    </Container>
  )
}
