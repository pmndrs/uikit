import {
  ConversionColorMap,
  ConversionComponentMap as ConversionComponentMapWihoutRenderAsComponent,
  convertParsedHtml,
  ConversionNode,
  parseHtml,
} from '@pmndrs/uikit/internals'
import { ComponentType, Fragment, ReactNode, useMemo } from 'react'
import { DefaultProperties } from '../../default.js'
import { Container } from '../../container.js'
import { Input } from '../../input.js'
import { Text } from '../../text.js'
import { Svg } from '../../svg.js'
import { Image } from '../../image.js'
import { VideoContainer } from '../../video.js'
import { Icon } from '../../icon.js'

export type ConversionComponentMap = ConversionComponentMapWihoutRenderAsComponent &
  Record<string, { renderAsImpl: ComponentType<any> }>

export function PreviewHtml({
  children,
  colorMap,
  componentMap,
}: {
  children: string
  colorMap?: ConversionColorMap
  componentMap?: ConversionComponentMap
}) {
  const { classes, element } = useMemo(() => parseHtml(children, colorMap), [children, colorMap])
  return <PreviewParsedHtml classes={classes} element={element} colorMap={colorMap} componentMap={componentMap} />
}

export function PreviewParsedHtml({
  classes,
  element,
  colorMap,
  componentMap,
}: {
  element: ConversionNode
  classes: Map<string, any>
  colorMap?: ConversionColorMap
  componentMap?: ConversionComponentMap
}) {
  return useMemo(() => {
    try {
      return convertParsedHtml<ReactNode>(element, classes, createRenderElement(componentMap), colorMap, componentMap)
    } catch (e) {
      console.error(e)
      return null
    }
  }, [element, classes, componentMap, colorMap])
}

function createRenderElement(componentMap?: ConversionComponentMap) {
  return (
    typeName: string,
    custom: boolean,
    props: Record<string, unknown>,
    index: number,
    children?: Array<ReactNode> | undefined,
  ): ReactNode => {
    if (custom && componentMap != null) {
      const Component = componentMap[typeName].renderAsImpl
      if (Component == null) {
        throw new Error(`unknown custom component "${typeName}"`)
      }
      return (
        <Component key={index} {...props}>
          {children}
        </Component>
      )
    }
    switch (typeName) {
      case 'VideoContainer':
        return <VideoContainer key={index} {...props} />
      case 'Image':
        return (
          <Image key={index} {...props}>
            {children}
          </Image>
        )
      case 'Svg':
        return (
          <Svg key={index} {...props}>
            {children}
          </Svg>
        )
      case 'Icon':
        return <Icon key={index} {...(props as any)} />
      case 'Input':
        return <Input key={index} {...props} />
      case 'Text':
        return (
          <Text key={index} {...props}>
            {children?.join('') ?? ''}
          </Text>
        )
      case 'Container':
        return (
          <Container key={index} {...props}>
            {children}
          </Container>
        )
      case 'DefaultProperties':
        return (
          <DefaultProperties key={index} {...props}>
            {children}
          </DefaultProperties>
        )
      case 'Fragment':
        return <Fragment key={index}>{children}</Fragment>
    }
  }
}
