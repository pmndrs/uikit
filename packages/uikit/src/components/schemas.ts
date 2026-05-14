import { ContainerPropertiesSchema } from './container.js'
import { ContentPropertiesSchema } from './content.js'
import { CustomPropertiesSchema } from './custom.js'
import { FullscreenPropertiesSchema } from './fullscreen.js'
import { ImagePropertiesSchema } from './image.js'
import { InputPropertiesSchema } from './input.js'
import { SvgPropertiesSchema } from './svg.js'
import { TextPropertiesSchema } from './text.js'
import { TextareaPropertiesSchema } from './textarea.js'
import { VideoPropertiesSchema } from './video.js'

export const ComponentPropertiesSchemas = /* @__PURE__ */ (() =>
  ({
    Container: ContainerPropertiesSchema,
    Content: ContentPropertiesSchema,
    Custom: CustomPropertiesSchema,
    Fullscreen: FullscreenPropertiesSchema,
    Image: ImagePropertiesSchema,
    Input: InputPropertiesSchema,
    Svg: SvgPropertiesSchema,
    Text: TextPropertiesSchema,
    Textarea: TextareaPropertiesSchema,
    Video: VideoPropertiesSchema,
  }) as const)()

export const componentSchemas = ComponentPropertiesSchemas

export type ComponentSchemaName = keyof typeof ComponentPropertiesSchemas
