import { Canvas } from '@react-three/fiber'
import { Fullscreen, Text } from '@react-three/uikit'
import { Panel, RadioGroup, RadioGroupItem, Button } from '@react-three/uikit-horizon'
import { parseAsString, useQueryState } from 'nuqs'
import { AvatarDemo } from './components/avatar.js'
import { BadgeDemo } from './components/badge.js'
import { ButtonDemo } from './components/button.js'
import { CheckboxDemo } from './components/checkbox.js'
import { DividerDemo } from './components/divider.js'
import { DropdownDemo } from './components/dropdown.js'
import { IconIndicatorDemo } from './components/icon-indicator.js'
import InputDemo from './components/input.js'
import InputFieldDemo from './components/input-field.js'
import { PanelDemo } from './components/panel.js'
import { ProgressDemo } from './components/progress.js'
import { RadioGroupDemo } from './components/radio-group.js'
import { SliderDemo } from './components/slider.js'
import { ToggleDemo } from './components/toggle.js'
import { noEvents, PointerEvents } from '@react-three/xr'
import { firaCode } from '@pmndrs/msdfonts'

const componentPages = {
  avatar: AvatarDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  checkbox: CheckboxDemo,
  divider: DividerDemo,
  dropdown: DropdownDemo,
  'icon-indicator': IconIndicatorDemo,
  input: InputDemo,
  'input-field': InputFieldDemo,
  panel: PanelDemo,
  progress: ProgressDemo,
  'radio-group': RadioGroupDemo,
  slider: SliderDemo,
  toggle: ToggleDemo,
}

const defaultComponent = 'avatar'

export default function App() {
  const [component, setComponent] = useQueryState('component', parseAsString.withDefault(defaultComponent))

  const installCommand = 'npm install @react-three/uikit @react-three/uikit-horizon'

  return (
    <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <PointerEvents />
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0} position={[5, 1, 10]} />
      <Fullscreen
        color="black"
        dark={{ color: 'white' }}
        flexDirection="column"
        alignItems="center"
        padding={32}
        gap={32}
      >
        <Panel flexShrink={0} alignSelf="center" flexDirection="row">
          <RadioGroup
            overflow="scroll"
            padding={20}
            scrollbarColor="rgba(255, 255, 255, 0.1)"
            scrollbarBorderRadius={4}
            value={component}
            onValueChange={(value) => setComponent(value ?? null)}
            flexDirection="row"
            maxWidth="100%"
            gap={8}
          >
            {Object.keys(componentPages).map((name) => (
              <RadioGroupItem flexShrink={0} value={name} key={name}>
                <Text>
                  {name[0]!.toUpperCase()}
                  {name.slice(1)}
                </Text>
              </RadioGroupItem>
            ))}
          </RadioGroup>
        </Panel>

        <Panel flexDirection="column" flexGrow={1} alignItems="center" justifyContent="center" alignSelf="stretch">
          {(() => {
            const Component = componentPages[component as keyof typeof componentPages] ?? AvatarDemo
            return <Component />
          })()}
        </Panel>

        <Panel padding={8} flexDirection="row" gap={12} alignItems="center">
          <Text
            backgroundColor="black"
            color="white"
            padding={8}
            borderRadius={12}
            marginLeft={4}
            fontFamilies={{ firaCode }}
            fontFamily="firaCode"
          >
            {installCommand}
          </Text>
          <Button onClick={() => navigator.clipboard.writeText(installCommand)}>
            <Text>Copy</Text>
          </Button>
        </Panel>
      </Fullscreen>
    </Canvas>
  )
}
