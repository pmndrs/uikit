import { expect } from 'chai'
import {
  Bucket,
  addToSortedBuckets,
  removeFromSortedBuckets,
  resizeSortedBucketsSpace,
  updateSortedBucketsAllocation,
} from '../src/allocation/sorted-buckets.js'

type Element = {
  value: number
  index: number
}

function createSortedBuckets(data: Float32Array, buckets: Array<Bucket<Element>>) {
  const activateElement = (element: Element, bucket: Bucket<Element>, index: number) => {
    data[bucket.offset + index] = element.value
    element.index = index
  }
  const setElementIndex = (element: Element, index: number) => {
    element.index = index
  }
  const copyBufferWithin = (targetIndex: number, startIndex: number, endIndex: number) => {
    data.copyWithin(targetIndex, startIndex, endIndex)
  }
  return {
    add(value: number, bucketIndex: number): Element {
      const result = { value, index: 0 }
      addToSortedBuckets(buckets, bucketIndex, result, activateElement)
      return result
    },
    remove(element: Element, bucketIndex: number) {
      removeFromSortedBuckets(
        buckets,
        bucketIndex,
        element,
        element.index,
        activateElement,
        () => {},
        setElementIndex,
        copyBufferWithin,
      )
    },
    update() {
      updateSortedBucketsAllocation(buckets, activateElement, copyBufferWithin)
    },
  }
}

describe('sorted buckets allocation', () => {
  it('should add 3 elements to 2 different buckets', () => {
    const data = new Float32Array(3)
    const buckets: Array<Bucket<Element>> = []
    resizeSortedBucketsSpace(buckets, 0, 3)
    const sortedBuckets = createSortedBuckets(data, buckets)
    sortedBuckets.add(22, 1)
    sortedBuckets.add(33, 0)
    sortedBuckets.add(99, 1)
    sortedBuckets.update()
    expect(data.slice(0, 3)).to.deep.equal(new Float32Array([33, 22, 99]))
  })
  it('should delete 3 elements from 2 different buckets', () => {
    const data = new Float32Array([1, 2, 3, 4, 5])
    const element_1 = { index: 0, value: 1 }
    const element_3 = { index: 0, value: 3 }
    const element_5 = { index: 2, value: 5 }
    const buckets: Array<Bucket<Element>> = [
      {
        add: [],
        elements: [element_1, { index: 1, value: 2 }],
        offset: 0,
        missingSpace: 0,
      },
      {
        add: [],
        elements: [element_3, { index: 1, value: 4 }, element_5],
        offset: 2,
        missingSpace: 0,
      },
    ]
    const sortedBuckets = createSortedBuckets(data, buckets)
    sortedBuckets.remove(element_1, 0)
    sortedBuckets.remove(element_3, 1)
    sortedBuckets.remove(element_5, 1)
    sortedBuckets.update()
    expect(data.slice(0, 2)).to.deep.equal(new Float32Array([2, 4]))
    expect(buckets[1].missingSpace, 'missing space must be moved to the end of the last bucket').to.equal(-3)
  })
  it('should add 3 and delete 2 elements to and from 2 different buckets', () => {
    const element3: Element = { index: 1, value: 3 }
    const data = new Float32Array([1, 3, 5, 0, 0, 0])
    const buckets: Array<Bucket<Element>> = [
      {
        add: [],
        elements: [{ index: 0, value: 1 }, element3],
        offset: 0,
        missingSpace: 0,
      },
      {
        add: [],
        elements: [{ index: 0, value: 5 }],
        offset: 2,
        missingSpace: 0,
      },
    ]
    const sortedBuckets = createSortedBuckets(data, buckets)
    resizeSortedBucketsSpace(buckets, 3, 6)
    sortedBuckets.add(4, 1)
    sortedBuckets.add(2, 0)
    const element6 = sortedBuckets.add(6, 1)
    sortedBuckets.update()
    expect(buckets[1].missingSpace, 'missing space must be moved to the end of the last bucket').to.equal(0)
    expect(data.slice(0, 6)).to.deep.equal(new Float32Array([1, 3, 2, 5, 4, 6]))
    sortedBuckets.remove(element3, 0)
    sortedBuckets.remove(element6, 1)
    sortedBuckets.update()
    expect(data.slice(0, 4)).to.deep.equal(new Float32Array([1, 2, 5, 4]))
    expect(buckets[1].missingSpace, 'missing space must be moved to the end of the last bucket').to.equal(-2)
  })

  it('should insert in one bucket and remove from the other', () => {
    const element3: Element = { index: 1, value: 3 }
    const data = new Float32Array([1, 3, 5])
    const buckets: Array<Bucket<Element>> = [
      {
        add: [],
        elements: [{ index: 0, value: 1 }, element3],
        offset: 0,
        missingSpace: 0,
      },
      {
        add: [],
        elements: [{ index: 0, value: 5 }],
        offset: 2,
        missingSpace: 0,
      },
    ]
    const sortedBuckets = createSortedBuckets(data, buckets)
    sortedBuckets.remove(element3, 0)
    sortedBuckets.add(3, 1)
    sortedBuckets.update()
    expect(data.slice(0, 3)).to.deep.equal(new Float32Array([1, 5, 3]))
  })

  it('should remove empty buckets', () => {
    const element3: Element = { index: 0, value: 3 }
    const data = new Float32Array([1, 3, 5])
    const buckets: Array<Bucket<Element>> = [
      {
        add: [],
        elements: [
          { index: 0, value: 1 },
          { index: 1, value: 5 },
        ],
        offset: 0,
        missingSpace: 0,
      },
      {
        add: [],
        elements: [element3],
        offset: 2,
        missingSpace: 0,
      },
    ]
    const sortedBuckets = createSortedBuckets(data, buckets)
    sortedBuckets.remove(element3, 1)
    expect(buckets.length).to.equal(1)
    expect(buckets[0].missingSpace).to.equal(-1)
  })

  it('should have no effect when adding and removing before updating', () => {
    const data = new Float32Array([1, 5, 0])
    const buckets: Array<Bucket<Element>> = [
      {
        add: [],
        elements: [
          { index: 0, value: 1 },
          { index: 1, value: 5 },
        ],
        offset: 0,
        missingSpace: 0,
      },
    ]
    const sortedBuckets = createSortedBuckets(data, buckets)
    const element = sortedBuckets.add(3, 0)
    sortedBuckets.remove(element, 0)
    sortedBuckets.update()
    expect(data.slice(0, 3)).to.deep.equal(new Float32Array([1, 5, 0]))
  })
})
