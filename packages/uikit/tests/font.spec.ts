import { expect } from 'chai'
import { Text } from '../src/index.js'

describe('font inheritance', () => {
  it('should not throw before inherited font families are available', () => {
    expect(() => new Text({ fontFamily: 'openSans' })).to.not.throw()
  })
})
