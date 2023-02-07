// @ts-ignore
import { RootDatabase, clearKeptObjects, open } from "lmdb"

export class LMDBArray {
  _nextKey: number
  db: RootDatabase
  length: number

  constructor() {
    this.db = open({
      compression: true,
      // cache: false
      cache: true,
      noMemInit: true,
      useWritemap: true,
      noSync: true,
    })

    this.length = 0
    this._nextKey = 0
  }

  getElementAtIndex(index: number) {
    return this.db.get(index)
  }
  push(element: any) {
    const index = this._nextKey
    this.db.put(index, element)
    this._nextKey++
    this.length++
    return this.length
  }
  pop(): any {
    const index: number = this._nextKey - 1
    const item = this.db.get(index)
    this.db.remove(index)
    this._nextKey--
    this.length--
    return item
  }
  deleteAt(index: number) {
    const exists = this.db.get(index)
    this.db.remove(index)
    if (exists) {
      this.length--
    }
    return this
  }
  insertAt(item: any, index: number) {
    const exists = this.db.get(index)
    this.db.put(index, item)
    if (!exists) {
      this.length++
    }
    return this
  }
}

