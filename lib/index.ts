// @ts-ignore
import { RootDatabase, clearKeptObjects, open } from "lmdb"
import * as os from "os"
import * as path from "path"

const randomFileName =
  Math.random().toString(36).substring(2, 15) + `-lmdb-backed-array`
const filePath = path.join(os.tmpdir(), randomFileName)

export class LMDBArray {
  _nextKey: number
  db: RootDatabase
  length: number

  constructor() {
    this.db = open({
      path: filePath,
      compression: true,
      cache: false
      // cache: {
        // cacheSize: 1000
      // },
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

