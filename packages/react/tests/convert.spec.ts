import { expect } from 'chai'
import { htmlToCode } from '../src/convert/html/index.js'

const pureHtml = `
export default function Index() {
  return (
    <Container>
      <Text fontSize={32} fontWeight="bold">
        Hello
      </Text>
      <Text fontSize={24} fontWeight="bold">
        World
      </Text>
    </Container>
  )
}
`.trimStart()

const htmlTailwind = `
export default function Index() {
  return (
    <Text
      backgroundColor="rgb(255,255,255)"
      marginLeft={16}
      marginRight={16}
      marginTop={8}
      padding={4}
      borderWidth={1}
    >
      What up?
    </Text>
  )
}
`.trimStart()

const htmlWithInlineCss = `
export default function Index() {
  return <Text width={32}>What up?</Text>
}
`.trimStart()

const htmlWithoutInlineCss = `
export default function Index() {
  return <Text>What up?</Text>
}
`.trimStart()

const htmlWithTwConditions = `
export default function Index() {
  return (
    <Text
      marginLeft={16}
      marginRight={16}
      hover={{ backgroundColor: "rgb(255,255,255)" }}
    >
      What up?
    </Text>
  )
}
`.trimStart()

const htmlWith2Divs = `
export default function Index() {
  return (
    <>
      <Container></Container>
      <Container></Container>
    </>
  )
}
`.trimStart()

const htmlWithCustomComponent = `
export default function Index() {
  return (
    <Button>
      <Text>Hello World!</Text>
    </Button>
  )
}
`.trimStart()

const htmlWithSpaceXY = `
export default function Index() {
  return (
    <Text flexDirection="column" gapRow={16}>
      Hello World!
    </Text>
  )
}
`.trimStart()

const htmlFlexShorthand = `
export default function Index() {
  return (
    <Text flexGrow={1} flexShrink={1} flexBasis="0%">
      Hello World!
    </Text>
  )
}
`.trimStart()

const htmlOnlyDiv = `
export default function Index() {
  return (
    <Container
      width="100%"
      height="100%"
      backgroundColor="rgb(0,0,0)"
    ></Container>
  )
}
`.trimStart()

const htmlOnlyDivWithAspectRatio = `
export default function Index() {
  return <Container aspectRatio={1.3333333333333333}></Container>
}
`.trimStart()

const htmlWithSvg = `
export default function Index() {
  return (
    <>
      <Icon
        color="rgb(209,213,219)"
        svgWidth={24}
        svgHeight={24}
        text={\`<svg         className=" h-10 w-10 text-gray-300"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" ></path>
      </svg>\`}
        height={40}
        width={40}
      />
    </>
  )
}
`.trimStart()

describe('html to react converter', () => {
  it('should convert pure html', async () => {
    expect(await htmlToCode(`<div><h1>Hello</h1><h2>World</h2></div>`)).to.equal(pureHtml)
  })
  it('should convert html with tailwind classes', async () => {
    expect(await htmlToCode(`<div class="bg-white mx-4 mt-2 p-1 border">What up?</div>`)).to.equal(htmlTailwind)
  })
  it('should convert tailwind classes', async () => {
    expect(await htmlToCode(`<div className="bg-white mx-4 mt-2 p-1 border">What up?</div>`)).to.equal(htmlTailwind)
  })
  it('should convert tailwind classes with conditionals', async () => {
    expect(await htmlToCode(`<div className="hover:bg-white mx-4">What up?</div>`)).to.equal(htmlWithTwConditions)
  })
  it('should convert html with inline css', async () => {
    expect(await htmlToCode(`<div style="width: 2rem">What up?</div>`)).to.equal(htmlWithInlineCss)
  })
  it('should not convert unknown property in inline css', async () => {
    expect(await htmlToCode(`<div style="widthhhh: 2rem">What up?</div>`)).to.equal(htmlWithoutInlineCss)
  })
  it('should not convert known property with incorrect type in inline css', async () => {
    expect(await htmlToCode(`<div style="width: red">What up?</div>`)).to.equal(htmlWithoutInlineCss)
  })

  it('should convert 2 divs to 2 containers; nothing else', async () => {
    expect(
      await htmlToCode(`
        <div></div>
        <div></div>`),
    ).to.equal(htmlWith2Divs)
  })

  it('should convert space-x/y to flex direction and gap', async () => {
    expect(await htmlToCode(`<div class="space-y-4">Hello World!</div>`)).to.equal(htmlWithSpaceXY)
  })

  it('should convert shorthand css property flex property to flex grow, shrink, basis', async () => {
    expect(await htmlToCode(`<div class="flex-1">Hello World!</div>`)).to.equal(htmlFlexShorthand)
  })

  it('support for custom components', async () => {
    expect(
      await htmlToCode(`<Button>Hello World!</Button>`, undefined, {
        Button: {
          renderAs: 'Button',
          propertyTypes: {},
          renderAsImpl: null as any,
        },
      }),
    ).to.equal(htmlWithCustomComponent)
  })

  it('should convert a root div with white space should convert to only a container', async () => {
    expect(await htmlToCode(`<div class="w-full h-full bg-black"> </div>`)).to.equal(htmlOnlyDiv)
  })

  it('should convert a div with a aspect ratio', async () => {
    expect(await htmlToCode(`<div class="aspect-[4/3]"> </div>`)).to.equal(htmlOnlyDivWithAspectRatio)
  })

  it('should convert a svg element with its content', async () => {
    expect(
      await htmlToCode(`
      <svg
        className=" h-10 w-10 text-gray-300"
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>`),
    ).to.equal(htmlWithSvg)
  })
})
