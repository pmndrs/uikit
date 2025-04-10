export const htmlElements: Record<
  string,
  {
    convertTo?: 'input'
    defaultProperties?: Record<string, any>
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
  li: {},
  p: {
    //tailwind disables this marginY: 16
  },
  span: {},
  a: {
    //TODO: custom property converter href => onClick ...
    defaultProperties: {
      //color: 'blue',
      cursor: 'pointer',
    },
  },
  button: { defaultProperties: { verticalAlign: 'middle', textAlign: 'center', cursor: 'pointer' } },
  textarea: {
    convertTo: 'input',
    defaultProperties: { multiline: true },
  },
}
//TBD select option
