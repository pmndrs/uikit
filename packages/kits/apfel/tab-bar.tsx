import { Container, DefaultProperties } from '@react-three/uikit'
import {
  ComponentPropsWithoutRef,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Card } from './card'
import { colors } from './theme'

type TabBarContext = {
  value: unknown
  setValue(value: unknown): void
  isExpanded: boolean
  setIsExpanded(value: SetStateAction<boolean>): void
}

const TabBarContext = createContext<TabBarContext | undefined>(undefined)

export function TabBar({
  value: valueProp,
  defaultValue,
  onValueChange,
  ...props
}: ComponentPropsWithoutRef<typeof Card> & {
  value?: string
  defaultValue?: string
  onValueChange?(value: string): void
}) {
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue)
  const value = valueProp !== undefined ? valueProp : internalValue
  const onValueChangeRef = useRef(onValueChange)
  onValueChangeRef.current = onValueChange

  const [isExpanded, setIsExpanded] = useState(false)
  const context = useMemo(
    () => ({
      isExpanded,
      setIsExpanded,
      value,
      setValue: (value: string) => {
        setInternalValue(value)
        onValueChangeRef.current?.(value)
      },
    }),
    [isExpanded, value],
  )

  const timeoutRef = useRef<number>()

  return (
    <TabBarContext.Provider value={context}>
      <Card
        minHeight={68}
        borderRadius={34}
        minWidth={68}
        padding={8}
        border={4}
        flexDirection="column"
        gapRow={8}
        onHoverChange={(hovered) => {
          if (hovered) {
            timeoutRef.current = setTimeout(() => setIsExpanded(true), 300) as any
          } else {
            clearTimeout(timeoutRef.current)
            setIsExpanded(false)
          }
        }}
        {...props}
      />
    </TabBarContext.Provider>
  )
}

export function TabBarItem({
  value: tabValue,
  children,
  icon,
  ...props
}: ComponentPropsWithoutRef<typeof Container> & {
  value: string
  icon: ReactNode
}) {
  const { isExpanded, value, setValue } = useContext(TabBarContext)!
  const isSelected = value === tabValue

  return (
    <Container
      minWidth={44}
      height={44}
      borderRadius={22}
      backgroundColor={colors.foreground}
      backgroundOpacity={isSelected ? 0.2 : 0}
      hover={isSelected ? undefined : { backgroundOpacity: 0.1 }}
      cursor="pointer"
      flexDirection="row"
      alignItems="center"
      gapColumn={10}
      {...props}
      onClick={(e) => {
        setValue(tabValue)
        props.onClick?.(e)
      }}
    >
      <DefaultProperties color={colors.foreground} fontSize={16}>
        <Container width={44} flexDirection="row" justifyContent="center">
          <DefaultProperties width={22} height={22}>
            {icon}
          </DefaultProperties>
        </Container>
        {isExpanded && <Container paddingRight={28}>{children}</Container>}
      </DefaultProperties>
    </Container>
  )
}
