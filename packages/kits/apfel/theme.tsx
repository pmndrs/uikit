import { DefaultProperties, DefaultPropertiesProperties } from '@react-three/uikit'
import React from 'react'
import { Color, MeshPhongMaterial } from 'three'

export class GlassMaterial extends MeshPhongMaterial {
  constructor() {
    super({
      specular: '#555',
      shininess: 100,
    })
  }
}

function hsl(h: number, s: number, l: number) {
  return new Color().setHSL(h / 360, s / 100, l / 100, 'srgb')
}

export const colors = {
  foreground: hsl(0, 0, 100),
  background: hsl(0, 0, 0),
  card: hsl(0, 0, 53),
  cardForeground: hsl(0, 0, 100),
  accent: hsl(210, 100, 52),
  accentForeground: hsl(0, 0, 100),
}

export function Defaults(props: DefaultPropertiesProperties) {
  return (
    <DefaultProperties
      scrollbarColor={colors.background}
      scrollbarBorderRadius={4}
      scrollbarOpacity={0.3}
      color={colors.background}
      fontWeight="medium"
      {...props}
    />
  )
}
