import { ConversionComponentData } from './internals.js'

export const htmlDefaults: Record<
  string,
  Partial<Omit<ConversionComponentData, 'hasProperty'>> & {
    renderAs?: 'Image' | 'Input' | 'Video' | 'Icon' | 'Container' | 'Text'
  }
> = {
  h1: {
    defaultProperties: {
      //tailwind disables this marginY: 10.67,
      fontSize: 32,
      fontWeight: 'bold',
    },
  },
  h2: {
    defaultProperties: {
      //tailwind disables this marginY: 13.28,
      fontSize: 24,
      fontWeight: 'bold',
    },
  },
  h3: {
    defaultProperties: {
      //tailwind disables this marginY: 16,
      fontSize: 18.72,
      fontWeight: 'bold',
    },
  },
  h4: {
    defaultProperties: {
      //tailwind disables this marginY: 21.28,
      fontSize: 16,
      fontWeight: 'bold',
    },
  },
  h5: {
    defaultProperties: {
      //tailwind disables this marginY: 26.72,
      fontSize: 13.28,
      fontWeight: 'bold',
    },
  },
  h6: {
    defaultProperties: {
      //tailwind disables this marginY: 37.28,
      fontSize: 10.67,
      fontWeight: 'bold',
    },
  },
  ol: {
    defaultProperties: { flexDirection: 'column' },
  },
  ul: {
    defaultProperties: { flexDirection: 'column' },
  },
  p: {
    defaultProperties: {
      //tailwind disables this marginY: 16
    },
  },
  a: {
    //TODO: custom property converter href => onClick ...
    defaultProperties: {
      //color: 'blue',
      cursor: 'pointer',
    },
  },
  img: {
    renderAs: 'Image',
  },
  button: { defaultProperties: { verticalAlign: 'middle', textAlign: 'center', cursor: 'pointer' } },
  input: {
    renderAs: 'Input',
    children: 'none',
  },
  textarea: {
    renderAs: 'Input',
    children: 'none',
    defaultProperties: { multiline: true },
  },
  video: {
    renderAs: 'Video',
  },
}
//TBD select option
