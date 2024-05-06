import { showImportV0Dialog } from './components/import.js'
import { toast } from './components/ui/use-toast.js'
import { confirmNotOverrride, useEditorStore, useUiState } from './state.js'

export async function copyLink() {
  navigator.clipboard.writeText(await useEditorStore.getState().generateLink())
  toast({ title: 'Link successfully copied', className: 'bg-green-500 p-4' })
}

export function toggleCodeEditor() {
  useUiState.setState({ showEditor: !(useUiState.getState().showEditor ?? false) })
}

export function toggleCodeOutput() {
  useUiState.setState({ showOutputCode: !(useUiState.getState().showOutputCode ?? false) })
}

export function toggleWebXR() {
  useUiState.setState({ showWebXRButtons: !(useUiState.getState().showWebXRButtons ?? false) })
}

export async function toggleFullscreen() {
  try {
    if (document.fullscreenElement === document.body) {
      await document.exitFullscreen()
    } else {
      await document.body.requestFullscreen()
    }
  } catch (e: any) {}
}

export function toggleDarkMode() {
  useEditorStore.getState().setLightMode(!useEditorStore.getState().lightMode)
}

export function toggleVignetteEffect() {
  useEditorStore.getState().setVignetteEffect(!useEditorStore.getState().vignetteEffect)
}

export function toggleBloomEffect() {
  useEditorStore.getState().setBloomEffect(!useEditorStore.getState().bloomEffect)
}

export function toggleTiltshiftEffect() {
  useEditorStore.getState().setTiltshiftEffect(!useEditorStore.getState().tiltShiftEffect)
}

export function toggleChromaticAberrationEffect() {
  useEditorStore.getState().setChromaticAberrationEffect(!useEditorStore.getState().chromaticAberrationEffect)
}

const codeRegex = /return \(([^\)]+)/m

export async function importV0() {
  try {
    const text = await navigator.clipboard.readText()
    const result = codeRegex.exec(text)
    if (result == null) {
      showImportV0Dialog()
      return
    }
    if (!confirmNotOverrride()) {
      return
    }
    useEditorStore.setState({
      environment: 0xffffff,
      bloomEffect: false,
      borderRadius: 0.5,
      theme: 'slate',
      view: 'floating',
      chromaticAberrationEffect: false,
      lightMode: true,
      tiltShiftEffect: false,
      vignetteEffect: false,
      code: result[1].replaceAll('/placeholder.svg', 'placeholder.svg'),
    })
  } catch (e: any) {
    window.alert(e.message)
  }
}
