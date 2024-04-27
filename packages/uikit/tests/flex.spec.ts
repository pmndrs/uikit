import { expect } from 'chai'
import {
  Align,
  Overflow,
  Node,
  Edge,
  Display,
  FlexDirection,
  Wrap,
  Justify,
  PositionType,
  Unit,
  loadYoga,
  Yoga,
  Config,
} from 'yoga-layout/load'
import { YogaProperties, setMeasureFunc, setter } from '../src/flex/index.js'
import { createDefaultConfig } from '../src/flex/yoga.js'

const testValues: YogaProperties = {
  alignContent: 'center',
  alignItems: 'flex-end',
  alignSelf: 'space-around',
  aspectRatio: 2,
  borderBottomWidth: 3,
  borderLeftWidth: 4,
  borderRightWidth: 5,
  borderTopWidth: 6,
  display: 'none',
  flexBasis: 7,
  flexDirection: 'row-reverse',
  flexGrow: 8,
  flexShrink: 9,
  flexWrap: 'wrap-reverse',
  height: 10,
  justifyContent: 'space-evenly',
  marginBottom: 11,
  marginLeft: 12,
  marginRight: 13,
  marginTop: 14,
  maxHeight: 15,
  maxWidth: 16,
  minHeight: 17,
  minWidth: 18,
  overflow: 'scroll',
  paddingBottom: 19,
  paddingLeft: 20,
  paddingRight: 21,
  paddingTop: 22,
  positionBottom: 23,
  positionLeft: 24,
  positionRight: 25,
  positionTop: 26,
  positionType: 'absolute',
  width: '50%',
}

export const rawTestValues = {
  alignContent: Align.Center,
  alignItems: Align.FlexEnd,
  alignSelf: Align.SpaceAround,
  aspectRatio: 2,
  borderBottom: 3,
  borderLeft: 4,
  borderRight: 5,
  borderTop: 6,
  display: Display.None,
  flexBasis: 7,
  flexDirection: FlexDirection.RowReverse,
  flexGrow: 8,
  flexShrink: 9,
  flexWrap: Wrap.WrapReverse,
  height: 10,
  justifyContent: Justify.SpaceEvenly,
  marginBottom: 11,
  marginLeft: 12,
  marginRight: 13,
  marginTop: 14,
  maxHeight: 15,
  maxWidth: 16,
  minHeight: 17,
  minWidth: 18,
  overflow: Overflow.Scroll,
  paddingBottom: 19,
  paddingLeft: 20,
  paddingRight: 21,
  paddingTop: 22,
  positionBottom: 23,
  positionLeft: 24,
  positionRight: 25,
  positionTop: 26,
  positionType: PositionType.Absolute,
  width: 50, //50%
}

const properties = Object.keys(testValues) as Array<keyof typeof testValues>

const propertiesWithEdge = ['border', 'padding', 'margin', 'position'] as const

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getRawValue(property: string, node: Node): any {
  for (const propertyWithEdge of propertiesWithEdge) {
    if (property.startsWith(propertyWithEdge)) {
      if (property.endsWith('Top')) {
        return flatten(node[`get${capitalize(property.slice(0, -3))}` as 'getBorder'](Edge.Top))
      }
      if (property.endsWith('Bottom')) {
        return flatten(node[`get${capitalize(property.slice(0, -6))}` as 'getBorder'](Edge.Bottom))
      }
      if (property.endsWith('Right')) {
        return flatten(node[`get${capitalize(property.slice(0, -5))}` as 'getBorder'](Edge.Right))
      }
      if (property.endsWith('Left')) {
        return flatten(node[`get${capitalize(property.slice(0, -4))}` as 'getBorder'](Edge.Left))
      }
    }
  }
  return flatten(node[`get${capitalize(property)}` as 'getWidth']())
}

/*describe('test yoga', () => {
  it('test weird case with 3 children', async () => {
    const yoga = await loadYoga()
    const config = yoga.Config.create()
    config.setUseWebDefaults(true)
    config.setPointScaleFactor(100)
    const node = yoga.Node.create(config)
    const child1 = yoga.Node.create(config)
    const child2 = yoga.Node.create(config)
    const child3 = yoga.Node.create(config)
    node.setHeight(99)
    node.insertChild(child1, 0)
    node.setFlexDirection(FlexDirection.Column)
    child1.setMargin(Edge.Bottom, 100)
    child1.setMeasureFunc(() => ({ width: 1, height: 10.01 }))
    child1.markDirty()
    node.insertChild(child2, 1)
    child2.setMeasureFunc(() => ({ width: 1, height: 10.01 }))
    child2.markDirty()
    node.insertChild(child3, 2)
    child3.setMeasureFunc(() => ({ width: 1, height: 12.01 }))
    child3.markDirty()
    node.calculateLayout(undefined, undefined)
    console.log(child1.getComputedHeight(), child1.getComputedTop())
    console.log(child2.getComputedHeight(), child2.getComputedTop())
    console.log(child3.getComputedHeight(), child3.getComputedTop())
  })
})*/

describe('set & get properties', () => {
  let node: Node

  const rawValues: any = {}
  let yoga: Yoga
  let defaultYogaConfig: Config

  before(async () => {
    yoga = await loadYoga()
    defaultYogaConfig = createDefaultConfig(yoga.Config)
    node = yoga.Node.create(defaultYogaConfig)
  })

  it('it re-arrange children', () => {
    const parent = yoga.Node.create(defaultYogaConfig)
    const child1 = yoga.Node.create(defaultYogaConfig)
    const child2 = yoga.Node.create(defaultYogaConfig)

    parent.insertChild(child1, 0)
    parent.insertChild(child2, 1)

    child1.getParent()?.removeChild(child1)
    child2.getParent()?.removeChild(child2)

    expect(() => parent.insertChild(child1, 1)).to.not.throw
    expect(() => parent.insertChild(child2, 0)).to.not.throw
  })

  it('it change parents', () => {
    const child = yoga.Node.create(defaultYogaConfig)
    const parent1 = yoga.Node.create(defaultYogaConfig)
    const parent2 = yoga.Node.create(defaultYogaConfig)

    parent1.insertChild(child, 0)

    child.getParent()?.removeChild(child)

    expect(() => parent2.insertChild(child, 0)).to.not.throw
  })

  it('it should throw an error', () => {
    expect(() => setter.alignItems(node, 'centerx' as any), 'assign alignItems a unknown value').to.throw(
      `unexpected value centerx, expected auto, flex-start, center, flex-end, stretch, baseline, space-between, space-around`,
    )

    expect(() => setter.alignItems(node, 1 as any), 'assign alignItems a wrong value type').to.throw(
      `unexpected value 1, expected auto, flex-start, center, flex-end, stretch, baseline, space-between, space-around`,
    )
  })

  it('should get raw vaues', () => {
    properties.forEach((property) => {
      rawValues[property] = getRawValue(property, node)
    })
  })

  it('it should set new values', () => {
    ;(Object.entries(testValues) as Array<[keyof YogaProperties, any]>).forEach(([name, value]) =>
      setter[name](node, value),
    )
    properties.forEach((property) =>
      expect(getRawValue(property, node), `compare ${property} to expected value`).to.equal(
        rawTestValues[property as any as keyof typeof rawTestValues],
      ),
    )
  })

  it('it should reset all values', () => {
    ;(Object.keys(testValues) as Array<keyof YogaProperties>).forEach((name) => setter[name](node, undefined))
    properties.forEach((property) => {
      expect(equal(getRawValue(property, node), rawValues[property]), `compare ${property} to the default value`).to.be
        .true
    })
  })

  it('it should set value as points or precentages', () => {
    setter.width(node, 10.5)
    expect(node.getWidth()).to.deep.equal({
      unit: Unit.Point,
      value: 10.5,
    })
    setter.width(node, '50%')
    expect(node.getWidth()).to.deep.equal({
      unit: Unit.Percent,
      value: 50,
    })
  })

  it('it should set and unset measure func', () => {
    expect(() => {
      setMeasureFunc(node, () => ({ width: 0, height: 0 }))
      node.unsetMeasureFunc()
    }).to.not.throw()
  })
})

/*
describe('flex node', () => {
  let parent: FlexNode
  let child1: FlexNode
  let child2: FlexNode

  before(async () => {
    parent = new FlexNode(signal(yoga), 0.01, 1, () => {})
    child1 = parent.createChild()
    child2 = parent.createChild()
  })

  it('should receive yoga instance after setting up', () => {
    const yogaSignal = signal<Yoga | undefined>(undefined)
    const parent = new FlexNode(yogaSignal, 0.01, 1, () => {})
    const child1 = parent.createChild()
    const child2 = parent.createChild()
    child1.nextProperties.flexGrow = 0
    child1.finalizeProperties()
    child1.nextProperties.flexGrow = 1
    child1.finalizeProperties()
    child2.nextProperties.flexGrow = 1
    child2.finalizeProperties()
    parent.nextProperties.height = 1
    parent.finalizeProperties()
    expect(child1.outerBounds.value, 'child 1 top').to.deep.equal([
      [0, 0],
      [0, 0],
    ])
    expect(child2.outerBounds.value, 'child 2 top').to.deep.equal([
      [0, 0],
      [0, 0],
    ])
    yogaSignal.value = yoga
    parent.calculateLayout()
    expect(child1.outerBounds.value, 'child 1 top').to.deep.equal([
      [0, 0.25],
      [0, 0.5],
    ])
    expect(child2.outerBounds.value, 'child 2 top').to.deep.equal([
      [0, -0.25],
      [0, 0.5],
    ])
  })

  it('should add children in order', () => {
    child1.nextProperties.flexGrow = 1
    child1.finalizeProperties()
    child2.nextProperties.flexGrow = 1
    child2.finalizeProperties()
    parent.nextProperties.height = 1
    parent.finalizeProperties()
    parent.calculateLayout()
    expect(child1.outerBounds.value[0][1], 'child 1 top').to.equal(0)
    expect(child1.outerBounds.value[1][1], 'child 1 height').to.equal(0.5)
    expect(child2.outerBounds.value[0][1], 'child 2 top').to.equal(0.5)
    expect(child2.outerBounds.value[1][1], 'child 2 height').to.equal(0.5)
  })

  it('should remove a property', () => {
    //no addProperties => remove all
    child1.finalizeProperties()
    parent.calculateLayout()
    expect(child1.outerBounds.value[0][1], 'child 1 top').to.equal(0)
    expect(child1.outerBounds.value[1][1], 'child 1 height').to.equal(0)
    expect(child2.outerBounds.value[0][1], 'child 2 top').to.equal(0)
    expect(child2.outerBounds.value[1][1], 'child 2 height').to.equal(1)
  })

  it('change children order', () => {
    child1.nextProperties.flexGrow = 1
    child1.finalizeProperties()
    child1.index = 1
    child2.index = 0
    parent.calculateLayout()
    expect(child1.outerBounds.value[0][1], 'child 1 top').to.equal(0.5)
    expect(child1.outerBounds.value[1][1], 'child 1 height').to.equal(0.5)
    expect(child2.outerBounds.value[0][1], 'child 2 top').to.equal(0)
    expect(child2.outerBounds.value[1][1], 'child 2 height').to.equal(0.5)
  })

  it('change nothing', () => {
    parent.calculateLayout()
    expect(child1.outerBounds.value[0][1], 'child 1 top').to.equal(0.5)
    expect(child1.outerBounds.value[1][1], 'child 1 height').to.equal(0.5)
    expect(child2.outerBounds.value[0][1], 'child 2 top').to.equal(0)
    expect(child2.outerBounds.value[1][1], 'child 2 height').to.equal(0.5)
  })

  it('remove child & destroy before commit', () => {
    parent.removeChild(child2)
    child2.destroy()
    parent.nextProperties.height = 2
    parent.finalizeProperties()
    parent.calculateLayout()
    expect(child1.outerBounds.value[0][1], 'child 1 top').to.equal(0)
    expect(child1.outerBounds.value[1][1], 'child 1 height').to.equal(2)
  })

  it('remove child & destroy after commit', () => {
    const c = parent.createChild()
    parent.removeChild(c)
    parent.calculateLayout()
    expect(child1.outerBounds.value[0][1], 'child 1 top').to.equal(0)
    expect(child1.outerBounds.value[1][1], 'child 1 height').to.equal(2)
    c.destroy()
  })

  it('use percentage', () => {
    child1.nextProperties.height = '25%'
    child1.finalizeProperties()
    parent.calculateLayout()
    expect(child1.outerBounds.value[0][1], 'child 1 top').to.equal(0)
    expect(child1.outerBounds.value[1][1], 'child 1 height').to.equal(0.5)
  })

  it('use absolute value', () => {
    child1.nextProperties.height = 0.33
    child1.finalizeProperties()
    parent.calculateLayout()
    expect(child1.outerBounds.value[0][1], 'child 1 top').to.equal(0)
    expect(child1.outerBounds.value[1][1], 'child 1 height').to.equal(0.33)
  })
})*/

function equal(val1: any, val2: any) {
  return val1 === val2 || (isNaN(val1) && isNaN(val2))
}

function flatten(val: any): any {
  if (val == null) {
    return val
  }
  if (typeof val === 'object' && 'value' in val) {
    return val.value
  }
  return val
}
