export type Bucket<E> = {
  offset: number
  elements: Array<E>
  /**
   * positive: missing space
   * negative: too much space
   */
  missingSpace: number
  add: Array<E>
}

export function assureBucketExists(buckets: Array<Bucket<unknown>>, bucketIndex: number) {
  while (bucketIndex >= buckets.length) {
    let offset = 0
    let missingSpace = 0
    if (buckets.length > 0) {
      const prevBucket = buckets[buckets.length - 1]
      offset += prevBucket.offset + prevBucket.elements.length
      missingSpace = Math.min(0, prevBucket.missingSpace) //taking only the exceeding space
      prevBucket.missingSpace -= missingSpace
    }
    buckets.push({
      add: [],
      missingSpace,
      offset,
      elements: [],
    })
  }
}

export function resizeSortedBucketsSpace(buckets: Array<Bucket<unknown>>, oldSize: number, newSize: number): void {
  assureBucketExists(buckets, 0)
  //add new space to last bucket
  const lastBucket = buckets[buckets.length - 1]
  lastBucket.missingSpace += oldSize - newSize
}

/**
 * @returns true iff a call to @function updateSortedBucketsAllocation is necassary
 */
export function addToSortedBuckets<E>(
  buckets: Array<Bucket<E>>,
  bucketIndex: number,
  element: E,
  activateElement: (element: E, bucket: Bucket<E>, index: number) => void,
): boolean {
  assureBucketExists(buckets, bucketIndex)
  const bucket = buckets[bucketIndex]
  bucket.missingSpace += 1
  if (bucket.missingSpace <= 0) {
    //bucket has still room at the end => just place the element there
    activateElement(element, bucket, bucket.elements.length)
    bucket.elements.push(element)
    return false
  }
  bucket.add.push(element)
  return true
}

/**
 * assures that the free space of a bucket is always at the end
 * @returns true iff a call to @function updateSortedBucketsAllocation is necassary
 */
export function removeFromSortedBuckets<E>(
  buckets: Array<Bucket<E>>,
  bucketIndex: number,
  element: E,
  elementIndex: number | undefined,
  activateElement: (element: E, bucket: Bucket<E>, index: number) => void,
  clearBufferAt: (index: number) => void,
  setElementIndex: (element: E, index: number) => void,
  bufferCopyWithin: (targetIndex: number, startIndex: number, endIndex: number) => void,
): boolean {
  if (bucketIndex >= buckets.length) {
    throw new Error(`no bucket at index ${bucketIndex}`)
  }
  const bucket = buckets[bucketIndex]
  bucket.missingSpace -= 1
  const addIndex = bucket.add.indexOf(element)
  if (addIndex != -1) {
    bucket.add.splice(addIndex, 1)
    return false
  }
  if (elementIndex == null || elementIndex >= bucket.elements.length) {
    throw new Error(`no element at index ${elementIndex}`)
  }
  if (bucket.add.length > 0) {
    //replace
    const newElement = bucket.add.shift()!
    bucket.elements[elementIndex] = newElement
    activateElement(newElement, bucket, elementIndex)
    return false
  }

  const offset = bucket.offset
  const lastIndexInBucket = bucket.elements.length - 1
  if (lastIndexInBucket != elementIndex) {
    //element not the last element => need to be moved to the end
    const startIndex = offset + lastIndexInBucket
    const targetIndex = offset + elementIndex
    bufferCopyWithin(targetIndex, startIndex, startIndex + 1)
    const swapElement = bucket.elements[lastIndexInBucket]
    bucket.elements[elementIndex] = swapElement
    setElementIndex(swapElement, elementIndex)
  }

  clearBufferAt(offset + lastIndexInBucket)

  bucket.elements.length -= 1

  if (bucketIndex < buckets.length - 1) {
    return true
  }

  //we are at the last bucket => merge missing space with the previous bucket(s)
  let currentBucket = bucket
  while (currentBucket.elements.length === 0 && currentBucket.add.length == 0 && bucketIndex > 0) {
    const prevBucket = buckets[bucketIndex - 1]
    prevBucket.missingSpace += currentBucket.missingSpace
    currentBucket = buckets[--bucketIndex]
  }
  buckets.length = bucketIndex + 1

  return false
}

/**
 * @requires that the buffer has room for elementCount number of elements
 */
export function updateSortedBucketsAllocation<E>(
  buckets: Array<Bucket<E>>,
  activateElement: (element: E, bucket: Bucket<E>, index: number) => void,
  bufferCopyWithin: (targetIndex: number, startIndex: number, endIndex: number) => void,
): void {
  let bucketsLength = buckets.length
  let lastBucketWithElements = -1
  for (let i = 0; i < bucketsLength; i++) {
    const bucket = buckets[i]
    if (bucket.elements.length + bucket.add.length > 0) {
      //bucket will have more than 0 elements after this
      lastBucketWithElements = i
    }

    const lastBucket = i === bucketsLength - 1

    if (!lastBucket && bucket.missingSpace === 0) {
      continue
    }

    //find shift partner - TODO: use skip list (negative buckets, positive buckets)
    const hasSpace = bucket.missingSpace < 0
    for (let ii = i - 1; ii >= 0; ii--) {
      //2 cases:
      //    1. one has space and the other needs space
      //    2. both have space
      const otherBucket = buckets[ii]
      if (otherBucket.missingSpace === 0) {
        continue
      }
      const otherHasSpace = otherBucket.missingSpace < 0
      if (otherHasSpace && (lastBucket || hasSpace)) {
        //case 2 - both have space: merge space into bucket by shifting to other bucket (so that the hole is increased at the end of the bucket)
        shiftLeft(buckets, bufferCopyWithin, ii, i, Math.abs(otherBucket.missingSpace))
        continue
      }
      if (!hasSpace && !otherHasSpace) {
        continue
      }
      //case 1 - bucket has space the other needs space: shift to the one with space
      const shiftBy = Math.min(Math.abs(otherBucket.missingSpace), Math.abs(bucket.missingSpace))

      if (hasSpace) {
        //shift to bucket to increase the space at the other bucket (so that the hole is increased at the end of the other bucket)
        shiftRight(buckets, bufferCopyWithin, ii, i, shiftBy)
      } else {
        //shift to other bucket to increase the space at the bucket (so that the hole is increased at the end of the bucket)
        shiftLeft(buckets, bufferCopyWithin, ii, i, shiftBy)
      }
    }
  }
  const newLastBucket = buckets[lastBucketWithElements]
  for (let i = lastBucketWithElements + 1; i < bucketsLength; i++) {
    newLastBucket.missingSpace += buckets[i].missingSpace
  }
  bucketsLength = buckets.length = lastBucketWithElements + 1

  //add elements at the end of the elements of the buckets
  for (let i = 0; i < bucketsLength; i++) {
    const bucket = buckets[i]
    const { elements, add } = bucket
    const addLength = add.length
    for (let ii = 0; ii < addLength; ii++) {
      const element = add[ii]
      activateElement(element, bucket, elements.length)
      elements.push(element)
    }
    add.length = 0
  }
}

function shiftLeft(
  buckets: Array<Bucket<unknown>>,
  bufferCopyWithin: (targetIndex: number, startIndex: number, endIndex: number) => void,
  startIndexIncl: number,
  endIndexIncl: number,
  shiftBy: number,
): void {
  const endBucket = buckets[endIndexIncl]

  const startIndex = buckets[startIndexIncl + 1].offset
  //array shifting
  bufferCopyWithin(startIndex - shiftBy, startIndex, endBucket.offset + endBucket.elements.length)

  //updating delta and panel array
  const startBucket = buckets[startIndexIncl]
  startBucket.missingSpace += shiftBy
  endBucket.missingSpace -= shiftBy

  //updating the offsets
  for (let i = startIndexIncl + 1; i <= endIndexIncl; i++) {
    buckets[i].offset -= shiftBy
  }
}

function shiftRight(
  buckets: Array<Bucket<unknown>>,
  bufferCopyWithin: (targetIndex: number, startIndex: number, endIndex: number) => void,
  startIndexIncl: number,
  endIndexIncl: number,
  shiftBy: number,
): void {
  const endBucket = buckets[endIndexIncl]

  const startIndex = buckets[startIndexIncl + 1].offset
  //array shifting
  bufferCopyWithin(startIndex + shiftBy, startIndex, endBucket.offset + endBucket.elements.length)

  //updating delta and panel array
  const startBucket = buckets[startIndexIncl]
  startBucket.missingSpace -= shiftBy
  endBucket.missingSpace += shiftBy

  //updating the offsets
  for (let i = startIndexIncl + 1; i <= endIndexIncl; i++) {
    buckets[i].offset += shiftBy
  }
}
