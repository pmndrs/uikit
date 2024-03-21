import { Object3D } from 'three'
import { Container } from './container'
import { Root } from './root'
import { Image } from './image'
import { EventHandlers } from '../events'

export type Component = Container | Root | Image

export type BindEventHandlers = (object: Object3D, handlers: EventHandlers) => void
