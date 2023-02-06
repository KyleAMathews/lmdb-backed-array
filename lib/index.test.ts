import { beforeAll, expect, test } from "vitest"
import { LMDBArray } from "./"

let array: LMDBArray

beforeAll(() => {
  array = new LMDBArray()
})

test(`push`, () => {
  array.push(12)
  array.push(13)
  array.push(14)
  array.push(10)
  array.push(989)
  expect(array.length).eq(5)
  expect(array.getElementAtIndex(2)).eq(14)
})
test(`pop`, () => {
  const item = array.pop()
  expect(array.length).eq(4)
  expect(item).eq(989)
})

test(`insertAt`, async () => {
  array.insertAt(456, 2)
  expect(array.getElementAtIndex(2)).eq(456)
  expect(array.length).eq(4)
  array.insertAt(456, 4)
  expect(array.getElementAtIndex(4)).eq(456)
  expect(array.length).eq(5)
})

test(`deleteAt`, () => {
  array.deleteAt(3)
  expect(array.length).eq(4)
  expect(array.getElementAtIndex(3)).toBeUndefined()
})
