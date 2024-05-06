import { ReactNode, useState } from 'react'
import z from 'zod'
import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog.js'
import { Button } from './ui/button.js'
import { Switch } from './ui/switch.js'
import { Label } from './ui/label.js'
import { useEditorStore, useUiState } from '@/state.js'
import { tutorialMap } from '@/tutorials.js'

export type OnboardedState = {
  onboarded?: boolean
}

const initialState: OnboardedState = {}

const useOnboardedState = create(persist(() => initialState, { name: 'html23-onboard' }))

export function Onboarding({ children }: { children?: ReactNode }) {
  const onboarded = useOnboardedState((s) => s.onboarded ?? false)
  return (
    <>
      {!onboarded && <OnboardDialog />}
      {children}
    </>
  )
}

export type SuggestedTutorial = { title: string; url: string }

function skipOnboarding() {
  useUiState.setState({ showEditor: true })
  useOnboardedState.setState({
    onboarded: true,
  })
}

function OnboardDialog() {
  const [suggestedTutorials, setSuggestedTutorials] = useState<Array<SuggestedTutorial> | undefined>(undefined)
  return (
    <Dialog onOpenChange={skipOnboarding} open>
      <DialogContent className="flex flex-col flex-shrink bg-black">
        <div className="flex flex-col gap-6 items-center mb-8">
          <img width={100} src="./logo.svg" />
          <h1 className="font-bold text-2xl">Welcome to HTML23</h1>
        </div>
        {suggestedTutorials != null ? (
          <TutorialSuggestion tutorials={suggestedTutorials} />
        ) : (
          <ExperienceQuestionnaire setSuggestedTutorials={setSuggestedTutorials} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ExperienceQuestionnaire({
  setSuggestedTutorials,
}: {
  setSuggestedTutorials: (tutorials: Array<SuggestedTutorial>) => void
}) {
  const [htmlCss, setHtmlCss] = useState(false)
  const [tailwind, setTailwind] = useState(false)
  const [shadcn, setShadcn] = useState(false)
  const [webxr, setWebXR] = useState(false)
  return (
    <>
      <h2 className="text-muted-foreground">HTML23 simplifies building 3D user interfaces on the web.</h2>

      <h3 className="text-foreground">
        For the best experience answer the following questions to the best of your knowledge.
      </h3>
      <span className="text-sm text-muted-foreground italic">check any that apply</span>
      <div className="flex items-center flex-row gap-2">
        <Switch checked={htmlCss} onCheckedChange={setHtmlCss} id="html-css" />
        <Label htmlFor="html-css">I have experience with Html/CSS</Label>
      </div>

      <div className="flex items-center flex-row gap-2">
        <Switch checked={tailwind} onCheckedChange={setTailwind} id="tailwind-css" />
        <Label htmlFor="tailwind-css">I have experience with TailwindCSS</Label>
      </div>

      <div className="flex items-center flex-row gap-2">
        <Switch checked={shadcn} onCheckedChange={setShadcn} id="shadcn" />
        <Label htmlFor="shadcn">I have experience with Shadcn</Label>
      </div>

      <div className="flex items-center flex-row gap-2">
        <Switch checked={webxr} onCheckedChange={setWebXR} id="webxr" />
        <Label htmlFor="webxr">I want to build WebXR experiences</Label>
      </div>
      <DialogFooter className="gap-2 mt-4">
        <Button onClick={skipOnboarding} type="button" variant="ghost">
          Skip
        </Button>
        <Button
          onClick={() => {
            const isDeveloper = htmlCss || tailwind || shadcn
            useUiState.setState({
              showEditor: isDeveloper,
              showOutputCode: false,
            })
            let suggestedTutorials = [tutorialMap.aiTo3DUI]
            if (shadcn) {
              suggestedTutorials.push(tutorialMap.shadcnTo3DUI)
            }
            if (tailwind) {
              suggestedTutorials.push(tutorialMap.tailwindTo3DUI)
            }
            if (htmlCss) {
              suggestedTutorials.push(tutorialMap.htmlCssTo3DUI)
            }
            if (webxr) {
              suggestedTutorials.push(tutorialMap.webxr3DUI)
            }
            setSuggestedTutorials(suggestedTutorials)
          }}
          type="button"
        >
          Next
        </Button>
      </DialogFooter>
    </>
  )
}

function TutorialSuggestion({ tutorials }: { tutorials: Array<SuggestedTutorial> }) {
  return (
    <>
      <h3 className="text-foreground">We recommend watching the following tutorial to get started with HTML23.</h3>
      {tutorials.map(({ title, url }) => (
        <Button asChild className="gap-2 justify-start">
          <a target="_blank" href={url}>
            <img className="h-4" src="youtube.svg" />
            {title}
          </a>
        </Button>
      ))}

      <DialogFooter className="gap-2 mt-4">
        <Button
          onClick={() =>
            useOnboardedState.setState({
              onboarded: true,
            })
          }
          type="button"
          variant="ghost"
        >
          Skip
        </Button>
        <Button
          onClick={() =>
            useOnboardedState.setState({
              onboarded: true,
            })
          }
          type="button"
        >
          Finish
        </Button>
      </DialogFooter>
    </>
  )
}
