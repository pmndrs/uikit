import { createImage, ImageProperties, destroyImage } from '@vanilla-three/uikit/internals'
import { ReactNode, forwardRef, useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'
import { AddHandlers, AddScrollHandler } from './utilts'
import { ParentProvider, useParent } from './context'
import { useDefaultProperties } from './default'

export const Image: (props: ImageProperties & { children?: ReactNode }) => ReactNode = forwardRef((properties, ref) => {
  //TODO: ComponentInternals
  const parent = useParent()
  const outerRef = useRef<Object3D>(null)
  const innerRef = useRef<Object3D>(null)
  const defaultProperties = useDefaultProperties()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const internals = useMemo(() => createImage(parent, properties, defaultProperties, outerRef, innerRef), [parent])
  useEffect(() => () => destroyImage(internals), [internals])

  //TBD: useComponentInternals(ref, node, interactionPanel, scrollPosition)

  return (
    <AddHandlers ref={outerRef} handlers={internals.handlers}>
      <AddScrollHandler handlers={internals.scrollHandlers}>
        <primitive object={internals.interactionPanel} />
      </AddScrollHandler>
      <object3D ref={innerRef}>
        <ParentProvider value={internals}>{properties.children}</ParentProvider>
      </object3D>
    </AddHandlers>
  )
})
