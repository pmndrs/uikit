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

const useDeployDialogStore = create<boolean>(() => false)

export function showDeployDialog() {
  useDeployDialogStore.setState(true)
}

export function DeployDialog() {
  const open = useDeployDialogStore()
  return (
    <Dialog open={open} onOpenChange={useDeployDialogStore.setState}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="outline" className="hidden md:flex flex-row items-center gap-2">
              <Rocket className="h-5" />
              Deploy
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Deploy the Project</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" className="md:hidden" size="icon">
              <Rocket className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Deploy the Project</TooltipContent>
      </Tooltip>
      <DialogContent className="flex flex-col flex-shrink">
        <DialogHeader>
          <DialogTitle className="text-2xl">Project deployment is not yet supported.</DialogTitle>
          <DialogDescription className="text-xl">Sorry 😔</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col pb-4 flex-grow text-md gap-4">
          <span className="text-lg">This project is Free and Open Source build by individuals</span>
          <hr />
          <span className="text-lg">
            We are evaluating if there's enough interest for pro features, such as <b>One Click Deployment</b>.
          </span>
          <span className="text-lg">
            Interested in html23 pro features?
            <br />↳ Select ✅ and fill out the questionaire.
          </span>
          <span className="text-gray-400">Your responses will help us decide if html23 pro is demanded.</span>
        </div>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button className="bg-gray-400 w-full flex-basis-0" type="button">
              ❌ Not Interested
            </Button>
          </DialogClose>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfVb1eBPEU2kMo2CqYpW6HrlwIe027bBHeSvLJmJpqMH6QWcQ/viewform"
            target="_blank"
          >
            <Button type="button" className="w-full flex-basis-0">
              <span className="text-lg mr-3">✅</span> I am interested in Pro Features
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
