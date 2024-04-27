import React, { ReactNode } from 'react'
import {
  Dialog,
  DialogContentPrimitive,
  DialogDescription,
  DialogDescriptionProperties,
  DialogFooter,
  DialogFooterProperties,
  DialogHeader,
  DialogHeaderProperties,
  DialogOverlay,
  DialogOverlayProperties,
  DialogProperties,
  DialogTrigger,
  DialogTriggerProperties,
  useCloseDialog,
} from './dialog.js'
import { Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import { borderRadius, colors } from './theme.js'
export type AlertDialogOverlayProperties = DialogOverlayProperties

export const AlertDialogOverlay = DialogOverlay

export type AlertDialogProperties = DialogProperties

export const AlertDialog = Dialog

export type AlertDialogTriggerProperties = DialogTriggerProperties

export const AlertDialogTrigger = DialogTrigger

export type AlertDialogContentProperties = ContainerProperties

export function AlertDialogContent({ onClick, sm, ...props }: AlertDialogContentProperties) {
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
          onClick={(e) => {
            e.stopPropagation()
            onClick?.(e)
          }}
          positionType="relative"
          flexDirection="column"
          maxWidth={512}
          width="100%"
          gap={16}
          borderWidth={1}
          backgroundColor={colors.background}
          padding={24}
          sm={{ borderRadius: borderRadius.lg, ...sm }}
          {...props}
        ></Container>
      </DialogOverlay>
    </DialogContentPrimitive>
  )
}

export type AlertDialogHeaderProperties = DialogHeaderProperties

export const AlertDialogHeader = DialogHeader

export type AlertDialogFooterProperties = DialogFooterProperties

export const AlertDialogFooter = DialogFooter

export type AlertDialogTitleProperties = { children?: ReactNode }

export function AlertDialogTitle(props: AlertDialogTitleProperties) {
  return <DefaultProperties fontSize={18} lineHeight={28} fontWeight="semi-bold" {...props} />
}

export type AlertDialogDescriptionProperties = DialogDescriptionProperties

export const AlertDialogDescription = DialogDescription

export type AlertDialogActionProperties = ContainerProperties

export function AlertDialogAction({ children, onClick, ...props }: AlertDialogActionProperties) {
  const close = useCloseDialog()
  return (
    <Container
      borderRadius={borderRadius.md}
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
          lineHeight={20}
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

export type AlertDialogCancelProperties = ContainerProperties

export function AlertDialogCancel({ children, onClick, ...props }: AlertDialogCancelProperties) {
  const close = useCloseDialog()
  return (
    <Container
      borderRadius={borderRadius.md}
      height={40}
      paddingX={16}
      paddingY={8}
      alignItems="center"
      justifyContent="center"
      cursor="pointer"
      flexDirection="row"
      borderWidth={1}
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
      <DefaultProperties fontSize={14} lineHeight={20} fontWeight="medium" wordBreak="keep-all">
        {children}
      </DefaultProperties>
    </Container>
  )
}
