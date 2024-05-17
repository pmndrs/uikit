import { useParsedHtmlStore, useUiState } from '@/state.js'
import { ConversionNode, parsedHtmlToCode } from '@react-three/uikit'
import { colors } from '@react-three/uikit-default'
import { suspend } from 'suspend-react'
import { Highlight, PrismTheme } from 'prism-react-renderer'
import { componentMap } from '@/App.js'
import { cn } from '@/lib/utils.js'
import { Suspense } from 'react'
import { ResizableHandle, ResizablePanel } from './ui/resizable.js'
import { useIsInSessionMode } from '@coconut-xr/natuerlich/react'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip.js'
import { Button } from './ui/button.js'
import { ChevronDown, ChevronUp, Copy } from 'lucide-react'

async function tryparsedHtmlToCode(element: ConversionNode, classes: Map<string, any>): Promise<string> {
  try {
    return parsedHtmlToCode(element, classes, customColorsForText, componentMap).catch((e) => {
      console.error(e)
      return ''
    })
  } catch (e: any) {
    console.error(e)
    return ''
  }
}

const cacheSymbol = Symbol('htmlToCode')

const customColorsForText = {
  background: colors.background.value.getStyle(),
  foreground: colors.foreground.value.getStyle(),
  card: colors.card.value.getStyle(),
  cardForeground: colors.cardForeground.value.getStyle(),
  popover: colors.popover.value.getStyle(),
  popoverForeground: colors.popoverForeground.value.getStyle(),
  primary: colors.primary.value.getStyle(),
  primaryForeground: colors.primaryForeground.value.getStyle(),
  secondary: colors.secondary.value.getStyle(),
  secondaryForeground: colors.secondaryForeground.value.getStyle(),
  muted: colors.muted.value.getStyle(),
  mutedForeground: colors.mutedForeground.value.getStyle(),
  accent: colors.accent.value.getStyle(),
  accentForeground: colors.accentForeground.value.getStyle(),
  destructive: colors.destructive.value.getStyle(),
  destructiveForeground: colors.destructiveForeground.value.getStyle(),
  border: colors.border.value.getStyle(),
  input: colors.input.value.getStyle(),
  ring: colors.ring.value.getStyle(),
}

export function OutputCode({ fullscreen }: { fullscreen: boolean }) {
  const isInXR = useIsInSessionMode(['immersive-ar', 'immersive-vr'])
  const isVisible = useUiState((s) => s.showOutputCode ?? false) && !isInXR

  if (!isVisible) {
    return (
      <div className="w-full h-0 relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="right-16 h-8 absolute z-50"
              size="icon"
              variant="outline"
              onClick={() => useUiState.setState({ showOutputCode: true })}
              style={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0, transform: 'translate(0, -99%)', top: 0 }}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Show the Output Code</TooltipContent>
        </Tooltip>
      </div>
    )
  }
  return (
    <>
      <ResizableHandle className={cn(fullscreen && 'hidden', 'relative !overflow-visible')} withHandle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="right-20 h-8 absolute z-50"
              size="icon"
              variant="outline"
              onClick={() => useUiState.setState({ showOutputCode: false })}
              style={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0, transform: 'translate(0, -99%)', top: 0 }}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Hide the Output Code</TooltipContent>
        </Tooltip>
      </ResizableHandle>
      <ResizablePanel minSize={20} id="bottom" order={2} className={cn(fullscreen && 'hidden', 'relative')}>
        <Suspense fallback={null}>
          <ConvertAndHighlightCode />
        </Suspense>
      </ResizablePanel>
    </>
  )
}

const theme: PrismTheme = {
  plain: {
    color: '#a6accd',
    backgroundColor: '#1b1e28',
  },
  styles: [
    {
      types: ['comment', 'punctuation'],
      style: {
        color: '#767C9DB0',
        fontStyle: 'italic',
      },
    },
    {
      types: ['builtin', 'variable', 'function', 'string'],
      style: {
        color: '#ADD7FF',
      },
    },
    {
      types: ['constant'],
      style: {
        color: '#E4F0FB',
      },
    },
    {
      types: ['keyword', 'tag', 'deleted', 'number', 'char', 'symbol', 'inserted'],
      style: {
        color: '#5DE4C7',
      },
    },
    {
      types: ['operator', 'changed'],
      style: {
        color: '#91B4D5',
      },
    },
    {
      types: ['boolean'],
      style: {
        color: '#D0679D',
      },
    },
    {
      types: ['hexcode'],
      style: {
        color: '#FFFFFF',
      },
    },
    {
      types: ['attr-name', 'selector'],
      style: {
        color: '#91B4D5',
        fontStyle: 'italic',
      },
    },
    {
      types: ['regex'],
      style: {
        color: '#5FB3A1',
      },
    },
  ],
}

function ConvertAndHighlightCode() {
  const parsed = useParsedHtmlStore((state) => state.parsed)
  if (parsed == null) {
    return null
  }
  const result = suspend(tryparsedHtmlToCode, [parsed.element, parsed.classes, cacheSymbol])
  return (
    <>
      <Button
        onClick={() => navigator.clipboard.writeText(result)}
        className="absolute bottom-5 z-40 right-5 text-sm gap-2"
        variant="outline"
        size="sm"
      >
        <Copy className="w-3 h-3" /> Copy Code
      </Button>
      <div className="relative h-full w-full justify-stretch basis-0 items-stretch p-4 overflow-auto">
        <Highlight theme={theme} code={result} language="jsx">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </>
  )
}
