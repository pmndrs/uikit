import { cn } from '@/lib/utils.js'
import { Button } from '../ui/button.js'
import { Card } from '../ui/card.js'
import { CheckIcon, Image, MoonIcon, Palette, SunIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover.js'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip.js'
import { useEditorStore } from '@/state.js'
import { themes } from '@/themes.js'
import { Label } from '../ui/label.js'
import { startTransition } from 'react'

const themeNames = Object.keys(themes) as Array<keyof typeof themes>
const themeColors = [
  {
    light: '240 5.9% 10%',
    dark: '240 5.2% 33.9%',
  },
  {
    light: '215.4 16.3% 46.9%',
    dark: '215.3 19.3% 34.5%',
  },
  {
    light: '25 5.3% 44.7%',
    dark: '33.3 5.5% 32.4%',
  },
  {
    light: '220 8.9% 46.1%',
    dark: '215 13.8% 34.1%',
  },
  {
    light: '0 0% 45.1%',
    dark: '0 0% 32.2%',
  },
  {
    light: '0 72.2% 50.6%',
    dark: '0 72.2% 50.6%',
  },
  {
    light: '346.8 77.2% 49.8%',
    dark: '346.8 77.2% 49.8%',
  },
  {
    light: '24.6 95% 53.1%',
    dark: '20.5 90.2% 48.2%',
  },
  {
    light: '142.1 76.2% 36.3%',
    dark: '142.1 70.6% 45.3%',
  },
  {
    light: '221.2 83.2% 53.3%',
    dark: '217.2 91.2% 59.8%',
  },
  {
    light: '47.9 95.8% 53.1%',
    dark: '47.9 95.8% 53.1%',
  },
  {
    light: '262.1 83.3% 57.8%',
    dark: '263.4 70% 50.4%',
  },
]

export function ThemePopover() {
  const theme = useEditorStore((state) => state.theme)
  const lightMode = useEditorStore((state) => state.lightMode)
  const borderRadius = useEditorStore((state) => state.borderRadius)
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost">
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="left">Change Theme</TooltipContent>
      </Tooltip>
      <PopoverContent side="left" className="w-auto p-0">
        <Card className="flex flex-col gap-4 p-4 bg-background">
          <div className="flex flex-col gap-2">
            <h4 className="font-medium leading-none">Theme</h4>
            <p className="text-sm text-muted-foreground ">Customize the theme.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Color</Label>
            <div className="grid grid-cols-3 gap-2">
              {themeNames.map((themeName, i) => {
                const isActive = theme === themeName

                return (
                  <Button
                    variant={'outline'}
                    size="sm"
                    key={themeName}
                    onClick={() => useEditorStore.getState().setTheme(themeName)}
                    className={cn('justify-start', isActive && 'border-2 border-primary')}
                    style={
                      {
                        '--theme-primary': `hsl(${themeColors[i][lightMode ? 'light' : 'dark']})`,
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className={cn(
                        'mr-1 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full bg-[--theme-primary]',
                      )}
                    >
                      {isActive && <CheckIcon className="h-4 w-4 text-white" />}
                    </span>
                    {themeName}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Radius</Label>
            <div className="flex flex-row gap-2">
              {['0', '0.3', '0.5', '0.75', '1.0'].map((value) => {
                return (
                  <Button
                    variant={'outline'}
                    size="sm"
                    key={value}
                    onClick={() => useEditorStore.getState().setBorderRadius(parseFloat(value))}
                    className={cn(borderRadius === parseFloat(value) && 'border-2 border-primary')}
                  >
                    {value}
                  </Button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Mode</Label>
            <div className="flex flex-row gap-2">
              <Button
                variant={'outline'}
                size="sm"
                onClick={() => useEditorStore.getState().setLightMode(true)}
                className={cn(lightMode && 'border-2 border-primary')}
              >
                <SunIcon className="mr-1 -translate-x-1" />
                Light
              </Button>
              <Button
                variant={'outline'}
                size="sm"
                onClick={() => useEditorStore.getState().setLightMode(false)}
                className={cn(!lightMode && 'border-2 border-primary')}
              >
                <MoonIcon className="mr-1 -translate-x-1" />
                Dark
              </Button>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
