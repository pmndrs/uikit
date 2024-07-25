import { Signal, computed, effect } from '@preact/signals-core'
import {
  ReactNode,
  RefAttributes,
  RefObject,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  HalfFloatType,
  LinearFilter,
  Scene,
  WebGLRenderTarget,
  PerspectiveCamera,
  Raycaster,
  Vector2,
  Vector3,
} from 'three'
import { Image } from './image.js'
import {
  InjectState,
  RootState,
  createPortal,
  reconciler,
  useFrame,
  useStore,
  context,
  Viewport,
} from '@react-three/fiber'
import type { DomEvent, EventHandlers, EventManager } from '@react-three/fiber/dist/declarations/src/core/events.js'
import type { ImageProperties, PointerEventsProperties } from '@pmndrs/uikit/internals'
import type { ComponentInternals } from './ref.js'
import { create } from 'zustand'

// Keys that shouldn't be copied between R3F stores
export const privateKeys = [
  'set',
  'get',
  'setSize',
  'setFrameloop',
  'setDpr',
  'events',
  'invalidate',
  'advance',
  'size',
  'viewport',
]

type Camera = THREE.OrthographicCamera | THREE.PerspectiveCamera
const isOrthographicCamera = (def: Camera): def is THREE.OrthographicCamera =>
  def && (def as THREE.OrthographicCamera).isOrthographicCamera

type BasePortalProperties = Omit<ImageProperties, 'src' | 'objectFit'>

export type PortalProperties = {
  frames?: number
  renderPriority?: number
  eventPriority?: number
  /**
   * ratio between the size (in pixels) and the size of the render target (in pixels)
   * higher dpr means higher resolution of the render target
   */
  dpr?: number
  children?: ReactNode
} & BasePortalProperties &
  EventHandlers & {
    children?: ReactNode
  } & PointerEventsProperties

export const Portal: (
  props: PortalProperties & RefAttributes<ComponentInternals<BasePortalProperties & EventHandlers>>,
) => ReactNode = forwardRef(
  ({ children, dpr, frames = Infinity, renderPriority = 0, eventPriority = 0, ...props }, ref) => {
    const fbo = useMemo(() => new Signal<WebGLRenderTarget | undefined>(undefined), [])
    const imageRef = useRef<ComponentInternals<ImageProperties>>(null)
    const previousRoot = useStore()
    dpr ??= previousRoot.getState().viewport.dpr
    useImperativeHandle(ref, () => imageRef.current!, [])
    const texture = useMemo(() => computed(() => fbo.value?.texture), [fbo])

    const usePortalStore = useMemo(() => {
      let previousState = previousRoot.getState()
      // We have our own camera in here, separate from the main scene.
      const camera = new PerspectiveCamera(50, 1, 0.1, 1000)
      camera.position.set(0, 0, 5)
      const pointer = new Vector2()
      let ownState = {
        events: { compute: uvCompute.bind(null, imageRef), priority: eventPriority },
        size: { width: 1, height: 1, left: 0, top: 0 },
        camera,
        scene: new Scene(),
        raycaster: new Raycaster(),
        pointer: pointer,
        mouse: pointer,
        previousRoot,
      }
      //we now merge in order previousState, injectState, ownState
      const store = create<RootState & { setPreviousState: (prevState: RootState) => void }>((innerSet, get) => {
        const merge = () => {
          const result = {} as any
          for (const key in previousState) {
            if (privateKeys.includes(key)) {
              continue
            }
            result[key as keyof RootState] = previousState[key as keyof RootState] as never
          }
          return Object.assign(result, ownState, {
            events: { ...previousState.events, ...ownState.events },
            viewport: Object.assign(
              {},
              previousState.viewport,
              previousState.viewport.getCurrentViewport(camera, new Vector3(), ownState.size),
            ),
          })
        }
        const update = () => innerSet(merge())
        return {
          ...previousState,
          // Set and get refer to this root-state
          set(newOwnState: Partial<InjectState> | ((s: InjectState) => Partial<InjectState>)) {
            if (typeof newOwnState === 'function') {
              newOwnState = newOwnState(get())
            }
            Object.assign(ownState, newOwnState)
            update()
          },
          setPreviousState(prevState: RootState) {
            previousState = prevState
            update()
          },
          get,
          // Layers are allowed to override events
          setEvents(events: Partial<EventManager<any>>) {
            Object.assign(ownState.events, events)
            update()
          },
          ...merge(),
        }
      })
      return Object.assign(store, {
        setState(state: Partial<RootState>) {
          store.getState().set(state as any)
        },
      })
    }, [eventPriority, previousRoot])

    //syncing up previous store with the current store
    useEffect(() => previousRoot.subscribe(usePortalStore.getState().setPreviousState), [previousRoot, usePortalStore])

    useEffect(() => {
      if (imageRef.current == null) {
        return
      }
      const renderTarget = (fbo.value = new WebGLRenderTarget(1, 1, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        type: HalfFloatType,
      }))
      const { size } = imageRef.current
      const unsubscribeSetSize = effect(() => {
        if (size.value == null) {
          return
        }
        const [width, height] = size.value
        renderTarget.setSize(width * dpr, height * dpr)
        usePortalStore.setState({
          size: { width, height, top: 0, left: 0 },
          viewport: { ...previousRoot.getState().viewport, width, height, aspect: width / height },
        })
      })
      return () => {
        unsubscribeSetSize()
        renderTarget.dispose()
      }
    }, [fbo, previousRoot, usePortalStore, dpr])

    return (
      <>
        {reconciler.createPortal(
          <context.Provider value={usePortalStore}>
            <ChildrenToFBO renderPriority={renderPriority} frames={frames} fbo={fbo}>
              {children}
              {/* Without an element that receives pointer events state.pointer will always be 0/0 */}
              <group onPointerOver={() => null} />
            </ChildrenToFBO>
          </context.Provider>,
          usePortalStore,
          null,
        )}
        <Image src={texture} objectFit="fill" keepAspectRatio={false} {...props} ref={imageRef} />
      </>
    )
  },
)

function uvCompute(
  { current }: RefObject<ComponentInternals<ImageProperties>>,
  event: DomEvent,
  state: RootState,
  previous?: RootState,
) {
  if (current == null || previous == null) {
    return false
  }
  // First we call the previous state-onion-layers compute, this is what makes it possible to nest portals
  if (!previous.raycaster.camera) previous.events.compute?.(event, previous, previous.previousRoot?.getState())
  // We run a quick check against the parent, if it isn't hit there's no need to raycast at all
  const [intersection] = previous.raycaster.intersectObject(current.interactionPanel)
  if (!intersection) return false
  // We take that hits uv coords, set up this layers raycaster, et voilà, we have raycasting on arbitrary surfaces
  const uv = intersection.uv
  if (!uv) return false
  state.raycaster.setFromCamera(state.pointer.set(uv.x * 2 - 1, uv.y * 2 - 1), state.camera)
}

function ChildrenToFBO({
  frames,
  renderPriority,
  children,
  fbo,
}: {
  frames: number
  renderPriority: number
  children: ReactNode
  fbo: Signal<WebGLRenderTarget | undefined>
}) {
  const store = useStore()

  useEffect(() => {
    return store.subscribe((state, prevState) => {
      const { size, camera } = state
      if (size) {
        if (isOrthographicCamera(camera)) {
          camera.left = size.width / -2
          camera.right = size.width / 2
          camera.top = size.height / 2
          camera.bottom = size.height / -2
        } else {
          camera.aspect = size.width / size.height
        }
        if (size !== prevState.size || camera !== prevState.camera) {
          camera.updateProjectionMatrix()
          // https://github.com/pmndrs/react-three-fiber/issues/178
          // Update matrix world since the renderer is a frame late
          camera.updateMatrixWorld()
        }
      }
    })
  }, [store])

  let count = 0
  let oldAutoClear
  let oldXrEnabled
  useFrame((state) => {
    const currentFBO = fbo.peek()
    if (currentFBO == null) {
      return
    }
    if (frames === Infinity || count < frames) {
      oldAutoClear = state.gl.autoClear
      oldXrEnabled = state.gl.xr.enabled
      state.gl.autoClear = true
      state.gl.xr.enabled = false
      state.gl.setRenderTarget(currentFBO)
      state.gl.render(state.scene, state.camera)
      state.gl.setRenderTarget(null)
      state.gl.autoClear = oldAutoClear
      state.gl.xr.enabled = oldXrEnabled
      count++
    }
  }, renderPriority)
  return <>{children}</>
}
