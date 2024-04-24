import {
  ConversionColorMap,
  ConversionComponentMap as ConversionComponentMapWihoutRenderAsComponent,
  convertHtml,
} from '@pmndrs/uikit/internals'
import { ComponentType, Fragment, ReactNode, useMemo } from 'react'
import { DefaultProperties } from '../../default.js'
import { Container } from '../../container.js'
import { Input } from '../../input.js'
import { Text } from '../../text.js'
import { Svg } from '../../svg.js'
import { Image } from '../../image.js'
import { VideoContainer } from '../../video.js'

export type ConversionComponentMap = ConversionComponentMapWihoutRenderAsComponent &
  Record<string, { renderAsImpl: ComponentType<any> }>

export function Preview({
  children,
  colorMap,
  componentMap,
}: {
  children: string
  colorMap?: ConversionColorMap
  componentMap?: ConversionComponentMap
}) {
  return useMemo(() => {
    try {
      return convertHtml<ReactNode>(children, createRenderElement(componentMap), colorMap, componentMap)
    } catch (e) {
      return null
    }
  }, [children, componentMap, colorMap])
}

function createRenderElement(componentMap?: ConversionComponentMap) {
  return (
    typeName: string,
    props: Record<string, unknown>,
    index: number,
    children?: Array<ReactNode> | undefined,
  ): ReactNode => {
    if (componentMap != null && typeName in componentMap) {
      const Component = componentMap[typeName].renderAsImpl
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
        throw new Error(`not implemented`)
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
