import { Component, EventHandlers, reversePainterSortStable } from '@pmndrs/uikit'
import { effect } from '@preact/signals-core'
import { extend, RootStore, useFrame, useStore, useThree } from '@react-three/fiber'
import {
  forwardRef,
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  PropsWithoutRef,
  ReactNode,
  RefAttributes,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import { jsx } from 'react/jsx-runtime'

declare module 'three' {
  interface Object3D {
    __r3f?: {
      root: RootStore
      eventCount: number
      handlers: EventHandlers
    }
  }
}

//TODO: pass renderContext from r3f

export function build<T extends Component, P>(canHaveChildren: boolean, Component: { new (): T }) {
  return forwardRef<T, P>(canHaveChildren ? buildWithChildren<T, P>(Component) : buildWithoutChildren<T, P>(Component))
}

function buildWithChildren<T, P>(Component: { new (): Component }): ForwardRefRenderFunction<T, PropsWithoutRef<P>> {
  extend({ [`Vanilla${Component.name}`]: Component })
  return ({ children, ...props }: any, forwardRef) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ref = useRef<Component>(null)
    useImperativeHandle(forwardRef, () => ref.current! as T, [])
    useSetup(ref, props)
    return jsx(`vanilla${Component.name}` as any, { ref, children })
  }
}

function buildWithoutChildren<T, P>(Component: { new (): Component }): ForwardRefRenderFunction<T, PropsWithoutRef<P>> {
  return (props, ref) => {
    const component = useMemo(() => new Component(), [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useImperativeHandle(ref, () => component as T, [])
    useSetup({ current: component }, props)
    return <primitive object={component} />
  }
}

export function useSetup(ref: { current: Component | null }, props: any) {
  useFrame((_, delta) => {
    ref.current?.update(delta * 1000)
  })
  const renderer = useThree((s) => s.gl)
  useEffect(() => {
    renderer.localClippingEnabled = true
    renderer.setTransparentSort(reversePainterSortStable)
  }, [renderer])
  const root = useStore()
  useEffect(() => {
    ref.current?.resetProperties(props)
  })
  useEffect(() => {
    const container = ref.current
    if (container == null) {
      return undefined
    }
    return effect(() => {
      const { value: handlers } = container.handlers
      if (container.__r3f != null) {
        container.__r3f.handlers = handlers
        return
      }
      container.__r3f = {
        root,
        eventCount: 1,
        handlers,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root])
}
