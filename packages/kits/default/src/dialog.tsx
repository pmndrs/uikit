import { ComponentInternals, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import { borderRadius, colors } from './theme.js'
import React, {
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { X } from '@react-three/uikit-lucide'

type DialogAnchorSetElement = (prevElement: ReactNode | undefined, element: ReactNode | undefined) => void

const DialogAnchorContext = createContext<DialogAnchorSetElement | undefined>(undefined)

export type DialogAnchorProperties = { children?: ReactNode }

export function DialogAnchor({ children }: DialogAnchorProperties) {
  const [element, setElement] = useState<ReactNode | undefined>(undefined)
  const set = useCallback<DialogAnchorSetElement>(
    (prevElement, element) => setElement((e) => (e === prevElement ? element : e)),
    [],
  )
  return (
    <>
      <DialogAnchorProvider set={set} children={children} />
      {element}
    </>
  )
}

const DialogAnchorProvider = memo(({ children, set }: { children?: ReactNode; set: DialogAnchorSetElement }) => {
  return <DialogAnchorContext.Provider value={set}>{children}</DialogAnchorContext.Provider>
})

const DialogContext = createContext<
  | {
      setOpen: (open: boolean) => void
      setContent: (element: ReactNode) => void
    }
  | undefined
>(undefined)

export function useDialogContext() {
  const ctx = useContext(DialogContext)
  if (ctx == null) {
    throw new Error(`Can only be used inside a <Dialog> component.`)
  }
  return ctx
}

export type DialogProperties = {
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Dialog({ children, open: providedOpen, onOpenChange, defaultOpen }: DialogProperties) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen ?? false)
  const open = providedOpen ?? uncontrolled
  const setElement = useContext(DialogAnchorContext)
  if (setElement == null) {
    throw new Error(`Can only be used inside a <DialogAnchor> component.`)
  }
  const contentRef = useRef<ReactNode | undefined>(undefined)
  const displayedRef = useRef<ReactNode | undefined>(undefined)
  useEffect(() => {
    if (!open) {
      setElement(displayedRef.current, undefined)
      displayedRef.current = undefined
      return
    }
    if (contentRef.current == null) {
      return
    }
    setElement(undefined, contentRef.current)
    displayedRef.current = contentRef.current
  }, [open, setElement])
  const ref = useRef(onOpenChange)
  ref.current = onOpenChange
  const openWasProvided = providedOpen != null
  const value = useMemo(
    () => ({
      setContent(content: ReactNode) {
        if (displayedRef.current != null) {
          setElement(displayedRef.current, content)
          displayedRef.current = content
        }
        contentRef.current = content
      },
      setOpen(open: boolean) {
        if (!openWasProvided) {
          setUncontrolled(open)
        }
        ref.current?.(open)
      },
    }),
    [openWasProvided, setElement],
  )
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
}

export type DialogTriggerProperties = ContainerProperties

export const DialogTrigger: (props: DialogTriggerProperties & RefAttributes<ComponentInternals>) => ReactNode =
  forwardRef(({ onClick, ...props }, ref) => {
    const { setOpen } = useDialogContext()
    return (
      <Container
        onClick={(e) => {
          setOpen(true)
          onClick?.(e)
        }}
        ref={ref}
        {...props}
      />
    )
  })

export type DialogOverlayProperties = ContainerProperties

export const DialogOverlay: (props: DialogOverlayProperties & RefAttributes<ComponentInternals>) => ReactNode =
  forwardRef((props, ref) => {
    return (
      <Container
        onPointerMove={(e) => e.stopPropagation()}
        onPointerEnter={(e) => e.stopPropagation()}
        onPointerLeave={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
        positionType="absolute"
        inset={0}
        zIndexOffset={50}
        backgroundColor="black"
        backgroundOpacity={0.8}
        ref={ref}
        {...props}
      />
    )
  })

export function useCloseDialog() {
  const { setOpen } = useDialogContext()
  return useCallback(() => setOpen(false), [setOpen])
}

export type DialogContentPrimitiveProperties = { children?: ReactNode }

export function DialogContentPrimitive({ children }: DialogContentPrimitiveProperties) {
  const dialogContext = useDialogContext()
  useEffect(
    () => dialogContext.setContent(<DialogContext.Provider value={dialogContext}>{children}</DialogContext.Provider>),
    [children, dialogContext],
  )
  return null
}

export type DialogContentProperties = ContainerProperties

export const DialogContent: (props: DialogContentProperties & RefAttributes<ComponentInternals>) => ReactNode =
  forwardRef(({ children, sm, ...props }, ref) => {
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
            width="100%"
            gap={16}
            borderWidth={1}
            backgroundColor={colors.background}
            padding={24}
            sm={{ borderRadius: borderRadius.lg, ...sm }}
            ref={ref}
            {...props}
          >
            {children}
            <X
              color={colors.mutedForeground}
              onClick={close}
              cursor="pointer"
              positionType="absolute"
              zIndexOffset={50}
              positionRight={16}
              positionTop={16}
              borderRadius={2}
              opacity={0.7}
              backgroundOpacity={0.7}
              hover={{ opacity: 1, backgroundOpacity: 1 }}
              width={16}
              height={16}
            />
          </Container>
        </DialogOverlay>
      </DialogContentPrimitive>
    )
  })

export type DialogHeaderProperties = ContainerProperties

export const DialogHeader: (props: DialogHeaderProperties & RefAttributes<ComponentInternals>) => ReactNode =
  forwardRef(({ children, ...props }, ref) => {
    return (
      <Container flexDirection="column" gap={6} ref={ref} {...props}>
        <DefaultProperties textAlign="center" sm={{ textAlign: 'left' }}>
          {children}
        </DefaultProperties>
      </Container>
    )
  })

export type DialogFooterProperties = ContainerProperties

export const DialogFooter: (props: DialogFooterProperties & RefAttributes<ComponentInternals>) => ReactNode =
  forwardRef(({ sm, ...props }, ref) => {
    return (
      <Container
        flexDirection="column-reverse"
        sm={{ flexDirection: 'row', justifyContent: 'flex-end', ...sm }}
        gap={8}
        ref={ref}
        {...props}
      />
    )
  })

export type DialogTitleProperties = { children?: ReactNode }

export function DialogTitle(props: DialogTitleProperties) {
  return <DefaultProperties fontSize={18} lineHeight="100%" letterSpacing={-0.4} fontWeight="semi-bold" {...props} />
}

export type DialogDescriptionProperties = { children?: ReactNode }

export function DialogDescription(props: DialogDescriptionProperties) {
  return <DefaultProperties fontSize={14} lineHeight={20} color={colors.mutedForeground} {...props} />
}
