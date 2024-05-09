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
import { VideoContainer } from '../../video.js'
import { Icon } from '../../icon.js'
import { ComponentInternals } from '../../ref.js'

export type ConversionComponentMap = ConversionComponentMapWihoutRenderAsComponent &
  Record<string, Record<string, { componentImpl: ComponentType<any> }>>

export type CustomHook = (
  element: ConversionNode | undefined,
  ref: RefObject<ComponentInternals>,
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
    componentCustomOrigin,
    elementProperties,
    componentName,
    elementChildren,
    elementInfo,
  }: {
    componentName: string
    componentCustomOrigin: undefined | string
    elementInfo: ConversionNode | undefined
    elementProperties: Record<string, unknown>
    elementChildren?: Array<ReactNode> | undefined
  }) => {
    const ref = useRef(null)
    elementProperties = customHook?.(elementInfo, ref, elementProperties) ?? elementProperties
    if (componentCustomOrigin && componentMap != null) {
      const Component = componentMap[componentCustomOrigin][componentName].componentImpl
      if (Component == null) {
        throw new Error(`unknown custom component "${componentName}"`)
      }
      return (
        <Component {...elementProperties} ref={ref}>
          {elementChildren}
        </Component>
      )
    }
    switch (componentName) {
      case 'VideoContainer':
        return <VideoContainer {...elementProperties} ref={ref} />
      case 'Image':
        return (
          <Image {...elementProperties} ref={ref}>
            {elementChildren}
          </Image>
        )
      case 'Svg':
        return (
          <Svg {...elementProperties} ref={ref}>
            {elementChildren}
          </Svg>
        )
      case 'Icon':
        return <Icon {...(elementProperties as any)} ref={ref} />
      case 'Input':
        return <Input {...elementProperties} ref={ref} />
      case 'Text':
        return (
          <Text {...elementProperties} ref={ref}>
            {elementChildren?.join('') ?? ''}
          </Text>
        )
      case 'Container':
        return (
          <Container {...elementProperties} ref={ref}>
            {elementChildren}
          </Container>
        )
      case 'DefaultProperties':
        return <DefaultProperties {...elementProperties}>{elementChildren}</DefaultProperties>
      case 'Fragment':
        return <>{elementChildren}</>
    }
  }
  return (
    componentName: string,
    componentCustomOrigin: undefined | string,
    elementInfo: ConversionNode | undefined,
    elementProperties: Record<string, unknown>,
    elementIndex: number,
    elementChildren?: Array<ReactNode> | undefined,
  ): ReactNode => (
    <Component
      key={elementIndex}
      componentName={componentName}
      componentCustomOrigin={componentCustomOrigin}
      elementInfo={elementInfo}
      elementProperties={elementProperties}
      elementChildren={elementChildren}
    />
  )
}
