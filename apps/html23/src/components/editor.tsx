import EditorImpl from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs'
import { useEditorStore } from '@/state.js'
import { startTransition } from 'react'

export function Editor() {
  const code = useEditorStore((state) => state.code)
  return (
    <EditorImpl
      value={code}
      onValueChange={(code) => startTransition(() => useEditorStore.getState().setCode(code))}
      highlight={(code) => highlight(code, languages.html, 'html')}
      className="font-mono text-base flex-grow flex-shrink-0"
      textareaClassName="outline-none"
    />
  )
}
