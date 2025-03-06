import { IconProperties as BaseIconProperties, createIconState, setupIcon } from '@pmndrs/uikit/internals'
import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import { useParent } from './context.js'
import { ComponentInternals, useComponentInternals } from './ref.js'

export type IconProperties = BaseIconProperties<R3FEventMap> & {
  text: string
  svgWidth: number
  svgHeight: number
  children?: ReactNode
  name?: string
}

export type IconRef = ComponentInternals<Partial<BaseIconProperties<R3FEventMap>>>

export const Icon: (props: IconProperties & RefAttributes<IconRef>) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const internals = useMemo(
    () =>
      createIconState<R3FEventMap>(
        parent,
        properties.text,
        properties.svgWidth,
        properties.svgHeight,
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
      ),
    [parent, properties.svgHeight, properties.svgWidth, properties.text, propertySignals],
  )

  internals.interactionPanel.name = properties.name ?? ''

  useEffect(() => {
    if (outerRef.current == null) {
      return
    }
    const abortController = new AbortController()
    setupIcon<R3FEventMap>(
      internals,
      parent,
      propertySignals.style,
      propertySignals.properties,
      outerRef.current,
      abortController.signal,
    )
    return () => abortController.abort()
  }, [parent, propertySignals, internals])

  useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers ref={outerRef} handlers={internals.handlers}>
      <primitive object={internals.interactionPanel} />
      <primitive object={internals.iconGroup} />
    </AddHandlers>
  )
})
