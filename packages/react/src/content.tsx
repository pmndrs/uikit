import { forwardRef, ReactNode, RefAttributes, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { ParentProvider, useParent } from './context.js'
import { AddHandlers, R3FEventMap, usePropertySignals } from './utils.js'
import { ComponentInternals, useComponentInternals } from './ref.js'
import { ContentProperties as BaseContentProperties, createContentState, setupContent } from '@pmndrs/uikit/internals'

export type ContentProperties = {
  name?: string
  children?: ReactNode
} & BaseContentProperties<R3FEventMap>

export type ContentRef = ComponentInternals<BaseContentProperties<R3FEventMap>>

export const Content: (props: ContentProperties & RefAttributes<ContentRef>) => ReactNode = forwardRef(
  (properties, ref) => {
    const parent = useParent()
    const outerRef = useRef<Object3D>(null)
    const innerRef = useRef<Object3D>(null)
    const propertySignals = usePropertySignals(properties)
    const internals = useMemo(
      () =>
        createContentState<R3FEventMap>(
          parent,
          propertySignals.style,
          propertySignals.properties,
          propertySignals.default,
          innerRef,
        ),
      [parent, propertySignals],
    )

    internals.interactionPanel.name = properties.name ?? ''

    useEffect(() => {
      if (outerRef.current == null || innerRef.current == null) {
        return
      }
      const abortController = new AbortController()
      setupContent<R3FEventMap>(
        internals,
        parent,
        propertySignals.style,
        propertySignals.properties,
        outerRef.current,
        innerRef.current,
        abortController.signal,
      )
      return () => abortController.abort()
    }, [internals, parent, propertySignals])

    useComponentInternals(ref, parent.root.pixelSize, propertySignals.style, internals, internals.interactionPanel)

    return (
      <AddHandlers handlers={internals.handlers} ref={outerRef}>
        <primitive object={internals.interactionPanel} />
        <object3D matrixAutoUpdate={false} ref={innerRef}>
          <ParentProvider value={undefined}>{properties.children}</ParentProvider>
        </object3D>
      </AddHandlers>
    )
  },
)
