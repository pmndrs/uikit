import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Fullscreen, Text, getPreferredColorScheme, setPreferredColorScheme } from '@react-three/uikit'
//import { Copy, Moon, Sun, SunMoon } from '@react-three/uikit-lucide'
//import { Button } from '@react-three/uikit-horizon'
import { AvatarDemo } from './components/avatar.js'
/*import { TooltipDemo } from './components/tooltip.js'
import { BadgeDemo } from './components/badge.js'
import { ButtonDemo } from './components/button.js'
import { CheckboxDemo } from './components/checkbox.js'
import { DialogDemo } from './components/dialog.js'
import { ProgressDemo } from './components/progress.js'
import { RadioGroupDemo } from './components/radio-group.js'
import { SeparatorDemo } from './components/separator.js'
import { SliderDemo } from './components/slider.js'
import { SwitchDemo } from './components/switch.js'
import { TabsDemo } from './components/tabs.js'
import InputDemo from './components/input.js'
import { VideoDemo } from './components/video.js'*/
import { noEvents, PointerEvents } from '@react-three/xr'

const componentPages = {
  avatar: AvatarDemo,
  /*badge: BadgeDemo,
  button: ButtonDemo,
  checkbox: CheckboxDemo,
  dialog: DialogDemo,
  progress: ProgressDemo,
  'radio-group': RadioGroupDemo,
  separator: SeparatorDemo,
  slider: SliderDemo,
  switch: SwitchDemo,
  tabs: TabsDemo,
  tooltip: TooltipDemo,
  input: InputDemo,
  video: VideoDemo,*/
}

const defaultComponent = 'avatar'

export default function App() {
  const [component, set] = useState<keyof typeof componentPages>(() => {
    const params = new URLSearchParams(window.location.search)
    let selected = params.get('component')
    if (selected == null || !(selected in componentPages)) {
      selected = defaultComponent
    }
    return selected as keyof typeof componentPages
  })
  const setComponent = (value: keyof typeof componentPages) => {
    const params = new URLSearchParams(window.location.search)
    params.set('component', value)
    history.replaceState(null, '', '?' + params.toString())
    set(value)
  }
  const [pcs, updatePCS] = useState(() => getPreferredColorScheme())
  return (
    <Canvas events={noEvents} style={{ height: '100dvh', touchAction: 'none' }} gl={{ localClippingEnabled: true }}>
      <PointerEvents />
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0} position={[5, 1, 10]} />
      <Fullscreen flexDirection="column" alignItems="center" padding={32}>
        <AvatarDemo />
      </Fullscreen>
    </Canvas>
  )
}
