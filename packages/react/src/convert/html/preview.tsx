import {
  ConversionColorMap,
  ConversionComponentMap as ConversionComponentMapWihoutRenderAsComponent,
  convertParsedHtml,
  ConversionNode,
  parseHtml,
} from '@pmndrs/uikit/internals'
import { ComponentType, ReactNode, RefObject, useMemo, useRef } from 'react'
import { DefaultProperties } from '../../default.js'
import { Container } from '../../container.js'
import { Input } from '../../input.js'
import { Text } from '../../text.js'
import { Svg } from '../../svg.js'
import { Image } from '../../image.js'
import { Video } from '../../video.js'
import { Icon } from '../../icon.js'
import { ComponentInternals } from '../../ref.js'

export type ConversionComponentMap = ConversionComponentMapWihoutRenderAsComponent &
  Record<string, { renderAsImpl: ComponentType<any> }>

export type CustomHook = (
  element: ConversionNode | undefined,
  ref: RefObject<ComponentInternals | null>,
  properties: Record<string, unknown>,
) => Record<string, unknown>

export function PreviewHtml({
  children,
  colorMap,
  customHook,
}: {
  children: string
  colorMap?: ConversionColorMap
  customHook?: CustomHook
  wrapperComponent?: ComponentType<{}>
}) {
  const { classes, element } = useMemo(() => parseHtml(children, colorMap), [children, colorMap])
  return <PreviewParsedHtml classes={classes} element={element} colorMap={colorMap} customHook={customHook} />
}

export function PreviewParsedHtml({
  classes,
  element,
  colorMap,
  componentMap,
  customHook,
}: {
  element: ConversionNode
  classes: Map<string, any>
  colorMap?: ConversionColorMap
  componentMap?: ConversionComponentMap
  customHook?: CustomHook
}) {
  return useMemo(() => {
    try {
      return convertParsedHtml<ReactNode>(
        element,
        classes,
        createRenderElement(componentMap, customHook),
        colorMap,
        componentMap,
      )
    } catch (e) {
      console.error(e)
      return null
    }
  }, [element, classes, componentMap, colorMap, customHook])
}

function createRenderElement(componentMap?: ConversionComponentMap, customHook?: CustomHook) {
  const Component = ({
    custom,
    props,
    typeName,
    children,
    element,
  }: {
    element: ConversionNode | undefined
    typeName: string
    custom: boolean
    props: Record<string, unknown>
    children?: Array<ReactNode> | undefined
  }) => {
    const ref = useRef(null)
    props = customHook?.(element, ref, props) ?? props
    if (custom && componentMap != null) {
      const Component = componentMap[typeName].renderAsImpl
      if (Component == null) {
        throw new Error(`unknown custom component "${typeName}"`)
      }
      return (
        <Component {...props} ref={ref}>
          {children}
        </Component>
      )
    }
    switch (typeName) {
      case 'Video':
        return <Video {...props} ref={ref} />
      case 'Image':
        return (
          <Image {...props} ref={ref}>
            {children}
          </Image>
        )
      case 'Svg':
        return (
          <Svg {...props} ref={ref}>
            {children}
          </Svg>
        )
      case 'Icon':
        return <Icon {...(props as any)} ref={ref} />
      case 'Input':
        return <Input {...props} ref={ref} />
      case 'Text':
        return (
          <Text {...props} ref={ref}>
            {children?.join('') ?? ''}
          </Text>
        )
      case 'Container':
        return (
          <Container {...props} ref={ref}>
            {children}
          </Container>
        )
      case 'DefaultProperties':
        return <DefaultProperties {...props}>{children}</DefaultProperties>
      case 'Fragment':
        return <>{children}</>
    }
  }
  return (
    element: ConversionNode | undefined,
    typeName: string,
    custom: boolean,
    props: Record<string, unknown>,
    index: number,
    children?: Array<ReactNode> | undefined,
  ): ReactNode => (
    <Component key={index} element={element} custom={custom} props={props} typeName={typeName} children={children} />
  )
}
