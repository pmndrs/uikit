import { ImageProperties as BaseImageProperties, createImageState, setupImage } from '@pmndrs/uikit/internals'
import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import { ParentProvider, useParent } from './context.js'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { DefaultProperties } from './default.js'

export type ImageProperties = BaseImageProperties<R3FEventMap> & {
  children?: ReactNode
  name?: string
}

export type ImageRef = ComponentInternals<BaseImageProperties<R3FEventMap>>

export const Image: (props: ImageProperties & RefAttributes<ImageRef>) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const internals = useMemo(
    () =>
      createImageState<R3FEventMap>(
        parent,
        outerRef,
        propertySignals.style,
        propertySignals.properties,
        propertySignals.default,
      ),
    [parent, propertySignals],
  )

  internals.interactionPanel.name = properties.name ?? ''

  useEffect(() => {
    if (outerRef.current == null || innerRef.current == null) {
      return
    }
    const abortController = new AbortController()
    setupImage<R3FEventMap>(
      internals,
      parent,
      propertySignals.style,
      propertySignals.properties,
      outerRef.current,
      innerRef.current,
      abortController.signal,
    )
    return () => abortController.abort()
  }, [parent, propertySignals, internals])

  useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

  return (
    <AddHandlers ref={outerRef} handlers={internals.handlers}>
      <primitive object={internals.interactionPanel} />
      <object3D matrixAutoUpdate={false} ref={innerRef}>
        <DefaultProperties {...internals.defaultProperties}>
          <ParentProvider value={internals}>{properties.children}</ParentProvider>
        </DefaultProperties>
      </object3D>
    </AddHandlers>
  )
})
