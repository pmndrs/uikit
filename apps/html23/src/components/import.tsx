import { Rocket } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog.js'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip.js'
import { Button } from './ui/button.js'
import { DialogClose } from '@radix-ui/react-dialog'
import { create } from 'zustand'
import { tutorialMap } from '@/tutorials.js'

const useImportV0DialogStore = create<boolean>(() => false)

export function showImportV0Dialog() {
  useImportV0DialogStore.setState(true)
}

export function ImportV0Dialog() {
  const open = useImportV0DialogStore()
  return (
    <Dialog open={open} onOpenChange={useImportV0DialogStore.setState}>
      <DialogContent className="flex flex-col flex-shrink">
        <DialogHeader>
          <DialogTitle className="flex flex-row gap-1 items-center">
            Import from <img src="v0.svg" className="invert h-4" />
          </DialogTitle>
          <DialogDescription>How to import a User Interface from v0.dev?</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <span>
            You can create a 3D User Interface with AI by describing the user interface you want. Visit{' '}
            <a href="https://v0.dev" className="inline text-blue-500" target="_blank">
              v0.dev
            </a>
            , write a prompt, generate a user interface, copy the code, and press Import again.
          </span>
          <span className="text-muted-foreground">The following tutorial shows how its done:</span>
          <Button asChild className="gap-2">
            <a target="_blank" href={tutorialMap.aiTo3DUI.url}>
              <img className="h-4" src="youtube.svg" />
              {tutorialMap.aiTo3DUI.title}
            </a>
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" type="button">
              Ok
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
