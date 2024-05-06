import { SheetTrigger, SheetContent, SheetHeader, SheetTitle, Sheet, SheetClose } from './ui/sheet.js'
import { HeartHandshake, Menu } from 'lucide-react'
import { Button } from './ui/button.js'
import { Logo } from '@/logo.js'
import { useEditorStore } from '@/state.js'
import { cn } from '@/lib/utils.js'
import { forwardRef } from 'react'
import { Separator } from './ui/separator.js'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip.js'
import { examples } from '@/examples.js'

export function Drawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetHeader>
          <Logo />
        </SheetHeader>
        <div className="flex flex-col pt-4 flex-grow flex-shrink min-h-0">
          <span className="font-bold text-sm text-muted-foreground">Examples</span>
          <Separator orientation="horizontal" className="my-2" />
          <Examples />
        </div>
        <div className="flex flex-row">
          <Tooltip>
            <TooltipTrigger asChild>
              <a href="https://github.com/sponsors/bbohlender" target="_blank">
                <Button size="icon" variant="ghost">
                  <HeartHandshake className="cursor-pointer w-4 h-4" />
                </Button>
              </a>
            </TooltipTrigger>
            <TooltipContent>Support the Project</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost">
                <a href="https://github.com/pmndrs/uikit" target="_blank">
                  <svg className="fill-white w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Github</TooltipContent>
          </Tooltip>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function Examples() {
  return (
    <div className="flex flex-col gap-4 -mx-3 flex-shrink overflow-scroll">
      {examples.map(({ content, description, title }) => (
        <ListItem
          key={title}
          className="cursor-pointer"
          onClick={() => useEditorStore.getState().setExample(content)}
          title={title}
        >
          {description}
        </ListItem>
      ))}
    </div>
  )
}

const ListItem = forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <SheetClose asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </SheetClose>
    )
  },
)
