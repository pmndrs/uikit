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

export const ComponentPropertiesSchemas: {
  readonly Container: typeof ContainerPropertiesSchema
  readonly Content: typeof ContentPropertiesSchema
  readonly Custom: typeof CustomPropertiesSchema
  readonly Fullscreen: typeof FullscreenPropertiesSchema
  readonly Image: typeof ImagePropertiesSchema
  readonly Input: typeof InputPropertiesSchema
  readonly Svg: typeof SvgPropertiesSchema
  readonly Text: typeof TextPropertiesSchema
  readonly Textarea: typeof TextareaPropertiesSchema
  readonly Video: typeof VideoPropertiesSchema
} = /* @__PURE__ */ (() =>
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

export const componentSchemas: typeof ComponentPropertiesSchemas = ComponentPropertiesSchemas

export type ComponentSchemaName = keyof typeof ComponentPropertiesSchemas
