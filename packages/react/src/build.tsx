import { Component, EventHandlers, RenderContext, reversePainterSortStable } from '@pmndrs/uikit'
import { effect } from '@preact/signals-core'
import { extend, RootStore, useFrame, useStore, useThree, Instance, applyProps } from '@react-three/fiber'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { jsx } from 'react/jsx-runtime'

declare module 'three' {
  interface Object3D {
    __r3f?: Instance
  }
}

export function build<T extends Component, P>(Component: { new (): T }, name = Component.name) {
  extend({ [`Vanilla${name}`]: Component })
  return forwardRef<T, P>(({ children, ...props }: any, forwardRef) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ref = useRef<Component>(null)
    useImperativeHandle(forwardRef, () => ref.current! as T, [])
    const renderContext = useRenderContext()
    const args = useMemo(() => [undefined, undefined, { renderContext }], [renderContext])
    const outProps = useSetup(ref, props, args)
    return jsx(`vanilla${name}` as any, { ref, children, ...outProps })
  })
}

export function useRenderContext() {
  const invalidate = useThree((s) => s.invalidate)
  return useMemo<RenderContext>(() => ({ requestFrame: invalidate }), [invalidate])
}

/**
 * @returns the props that should be applied to the component
 */
export function useSetup(ref: { current: Component | null }, inProps: any, args: Array<any>): any {
  useFrame((_, delta) => {
    ref.current?.update(delta * 1000)
  })
  const renderer = useThree((s) => s.gl)
  useEffect(() => {
    renderer.localClippingEnabled = true
    renderer.setTransparentSort(reversePainterSortStable)
  }, [renderer])
  useEffect(() => {
    ref.current?.resetProperties(inProps)
  })
  const outPropsRef = useRef<{ args: Array<any> } & EventHandlers>({ args })
  useEffect(() => {
    const container = ref.current
    if (container == null) {
      return undefined
    }
    const unsubscribe = effect(() => {
      const { value: handlers } = container.handlers
      const eventCount = Object.keys(handlers).length
      if (eventCount === 0) {
        outPropsRef.current = { args }
        if (container.__r3f != null) {
          container.__r3f.props = outPropsRef.current
        }
        applyProps(container, outPropsRef.current)
        return
      }
      if (container.__r3f == null) {
        throw new Error(`missing __r3f attribute`)
      }
      container.__r3f.props = outPropsRef.current = { args, ...handlers }
      applyProps(container, outPropsRef.current)
    })
    return () => {
      unsubscribe()
      outPropsRef.current = { args }
      if (container.__r3f != null) {
        container.__r3f.props = outPropsRef.current
      }
      applyProps(container, outPropsRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args])
  return outPropsRef.current
}
