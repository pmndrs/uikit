import { createImage, ImageProperties, destroyImage } from '@vanilla-three/uikit/internals'
import { ReactNode, RefAttributes, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { AddHandlers, usePropertySignals } from './utilts.js'
import { ParentProvider, useParent } from './context.js'
import { ComponentInternals, useComponentInternals } from './ref.js'

export const Image: (
  props: ImageProperties & RefAttributes<ComponentInternals> & { children?: ReactNode },
) => ReactNode = forwardRef((properties, ref) => {
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const propertySignals = usePropertySignals(properties)
  const internals = useMemo(
    () => createImage(parent, propertySignals.properties, propertySignals.default, outerRef, innerRef),
    [parent, propertySignals],
  )
  useEffect(() => () => destroyImage(internals), [internals])

  useComponentInternals(ref, propertySignals.style, internals)

  return (
    <AddHandlers ref={outerRef} handlers={internals.handlers}>
      <primitive object={internals.interactionPanel} />
      <object3D ref={innerRef}>
        <ParentProvider value={internals}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
