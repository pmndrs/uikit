import React, { ComponentPropsWithoutRef, ReactNode } from 'react'
import {
  Dialog,
  DialogContentPrimitive,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTrigger,
  useCloseDialog,
} from './dialog.js'
import { Container, DefaultProperties } from '@react-three/uikit'
import { colors } from './theme'

export const AlertDialogOverlay = DialogOverlay

export const AlertDialog = Dialog

export const AlertDialogTrigger = DialogTrigger

export function AlertDialogContent(props: ComponentPropsWithoutRef<typeof Dialog>) {
  const close = useCloseDialog()
  return (
    <DialogContentPrimitive>
      <DialogOverlay
        onClick={(e) => {
          close()
          e.stopPropagation()
        }}
        alignItems="center"
        justifyContent="center"
      >
        <Container
          onClick={(e) => e.stopPropagation()}
          positionType="relative"
          flexDirection="column"
          maxWidth={512}
          width="100%"
          gap={16}
          border={1}
          backgroundColor={colors.background}
          padding={24}
          sm={{ borderRadius: 8 }}
          {...props}
        ></Container>
      </DialogOverlay>
    </DialogContentPrimitive>
  )
}

export const AlertDialogHeader = DialogHeader

export const AlertDialogFooter = DialogFooter

export function AlertDialogTitle({ children }: { children?: ReactNode }) {
  return (
    <DefaultProperties fontSize={18} lineHeight={1.5555} fontWeight="semi-bold">
      {children}
    </DefaultProperties>
  )
}
export const AlertDialogDescription = DialogDescription

export function AlertDialogAction({ children, onClick, ...props }: ComponentPropsWithoutRef<typeof Container>) {
  const close = useCloseDialog()
  return (
    <Container
      borderRadius={6}
      height={40}
      paddingX={16}
      paddingY={8}
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      flexDirection="row"
      backgroundColor={colors.primary}
      onClick={(e) => {
        e.stopPropagation()
        close()
        onClick?.(e)
      }}
      hover={{
        backgroundOpacity: 0.9,
      }}
      {...props}
    >
      <DefaultProperties>
        <DefaultProperties
          fontSize={14}
          lineHeight={1.43}
          fontWeight="medium"
          wordBreak="keep-all"
          color={colors.primaryForeground}
        >
          {children}
        </DefaultProperties>
      </DefaultProperties>
    </Container>
  )
}

export function AlertDialogCancel({ children, onClick, ...props }: ComponentPropsWithoutRef<typeof Container>) {
  const close = useCloseDialog()
  return (
    <Container
      borderRadius={6}
      height={40}
      paddingX={16}
      paddingY={8}
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      flexDirection="row"
      border={1}
      borderColor={colors.input}
      backgroundColor={colors.background}
      onClick={(e) => {
        e.stopPropagation()
        close()
        onClick?.(e)
      }}
      hover={{
        backgroundColor: colors.accent,
      }}
      {...props}
    >
      <DefaultProperties fontSize={14} lineHeight={1.43} fontWeight="medium" wordBreak="keep-all">
        {children}
      </DefaultProperties>
    </Container>
  )
}
