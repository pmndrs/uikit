import { Container, DefaultProperties } from '@react-three/uikit'
import { colors } from './theme'
import React, {
  ComponentPropsWithoutRef,
  ReactNode,
  createContext,
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

export function DialogAnchor({ children }: { children?: ReactNode }) {
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

export function Dialog({
  children,
  open: providedOpen,
  onOpenChange,
  defaultOpen,
}: {
  children?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
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

export function DialogTrigger({ children }: { children?: ReactNode }) {
  const { setOpen } = useDialogContext()
  return <Container onClick={() => setOpen(true)}>{children}</Container>
}

export function DialogOverlay(props: ComponentPropsWithoutRef<typeof Container>) {
  return (
    <Container
      onPointerMove={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      positionType="absolute"
      inset={0}
      zIndexOffset={50}
      backgroundColor="black"
      backgroundOpacity={0.8}
      {...props}
    />
  )
}

export function useCloseDialog() {
  const { setOpen } = useDialogContext()
  return useCallback(() => setOpen(false), [setOpen])
}

export function DialogContentPrimitive({ children }: { children?: ReactNode }) {
  const dialogContext = useDialogContext()
  useEffect(() =>
    dialogContext.setContent(<DialogContext.Provider value={dialogContext}>{children}</DialogContext.Provider>),
  )
  return null
}

export function DialogContent({ children, sm, ...props }: ComponentPropsWithoutRef<typeof Container>) {
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
          width="100%"
          gap={16}
          border={1}
          backgroundColor={colors.background}
          padding={24}
          sm={{ borderRadius: 8, ...sm }}
          {...props}
        >
          {children}
          <X
            color={colors.mutedForeground}
            onClick={close}
            cursor="pointer"
            positionType="absolute"
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
}

export function DialogHeader({ children, ...props }: ComponentPropsWithoutRef<typeof Container>) {
  return (
    <Container flexDirection="column" gap={6} {...props}>
      <DefaultProperties horizontalAlign="center" sm={{ horizontalAlign: 'left' }}>
        {children}
      </DefaultProperties>
    </Container>
  )
}

export function DialogFooter(props: ComponentPropsWithoutRef<typeof Container>) {
  return (
    <Container
      flexDirection="column-reverse"
      sm={{ flexDirection: 'row', justifyContent: 'flex-end' }}
      gap={8}
      {...props}
    />
  )
}

export function DialogTitle({ children }: { children?: ReactNode }) {
  return (
    <DefaultProperties fontSize={18} lineHeight={1} letterSpacing={-0.4} fontWeight="semi-bold">
      {children}
    </DefaultProperties>
  )
}

export function DialogDescription({ children }: { children?: ReactNode }) {
  return (
    <DefaultProperties fontSize={14} lineHeight={1.43} color={colors.mutedForeground}>
      {children}
    </DefaultProperties>
  )
}
