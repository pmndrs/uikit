import { ContainerRef, Container, ContainerProperties, DefaultProperties } from '@react-three/uikit'
import React, {
  ReactNode,
  RefAttributes,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { borderRadius, colors } from './theme.js'

const TooltipContext = createContext<boolean>(null as any)

export type TooltipProperties = ContainerProperties

export const Tooltip: (props: TooltipProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  ({ children, ...props }, ref) => {
    const [open, setOpen] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
    useEffect(
      () => () => {
        if (timeoutRef.current == null) {
          return
        }
        clearTimeout(timeoutRef.current)
      },
      [],
    )
    return (
      <Container
        onPointerOver={() => {
          if (timeoutRef.current != null) {
            return
          }
          timeoutRef.current = setTimeout(() => {
            timeoutRef.current = undefined
            setOpen(true)
          }, 1000)
        }}
        onPointerOut={() => {
          if (timeoutRef.current != null) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = undefined
            return
          }
          setOpen(false)
        }}
        positionType="relative"
        flexDirection="column"
        alignItems="center"
        ref={ref}
        {...props}
      >
        <TooltipContext.Provider value={open}>{children}</TooltipContext.Provider>
      </Container>
    )
  },
)

export type TooltipTriggerProperties = ContainerProperties

export const TooltipTrigger: (props: TooltipTriggerProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  (props, ref) => {
    return <Container alignSelf="stretch" ref={ref} {...props} />
  },
)

export type TooltipContentProperties = ContainerProperties & { sideOffset?: number }

export const TooltipContent: (props: TooltipContentProperties & RefAttributes<ContainerRef>) => ReactNode = forwardRef(
  ({ children, sideOffset = 4, ...props }, ref) => {
    const open = useContext(TooltipContext)
    if (!open) {
      return null
    }
    return (
      <Container
        positionType="absolute"
        positionBottom="100%"
        marginBottom={sideOffset}
        zIndexOffset={50}
        overflow="hidden"
        borderRadius={borderRadius.md}
        borderWidth={1}
        backgroundColor={colors.popover}
        paddingX={12}
        paddingY={6}
        ref={ref}
        {...props}
      >
        <DefaultProperties wordBreak="keep-all" fontSize={14} lineHeight={20} color={colors.popoverForeground}>
          {children}
        </DefaultProperties>
      </Container>
    )
  },
)
