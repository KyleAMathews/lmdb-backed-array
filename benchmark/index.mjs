import { open, clearKeptObjects } from "lmdb"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { LMDBArray } from "../dist/lmdb-array.module.js"
import * as os from "os"
import * as path from "path"

import processTop from "process-top"
const ptop = processTop()
function mem() {
  if (global.gc) {
    global.gc()
  }
  console.log(ptop.toString())
}

const args = yargs(hideBin(process.argv)).parse()

const db = open(`benchmark-data`, { compression: true, cache: false })

if (args.benchmark === `open`) {
  db.getRange({ start: 0, end: args.items }).forEach((i) => i)
}

if (args.benchmark === `js-array`) {
  const array = []
  db.getRange({ start: 0, end: args.items }).forEach((i) => {
    array.push(i)
  })
  mem()
}

if (args.benchmark === `lmdb-array`) {
  const array = new LMDBArray()
  const chunks = 20
  const chunkSize = Math.round(args.items / chunks)
  console.log({ chunks, chunkSize })
  for (let chunkI = 0; chunkI < chunks; chunkI++) {
    db.getRange({
      start: chunkI * chunkSize,
      end: chunkI * chunkSize + chunkSize,
    }).forEach(({ key, value }) => {
      array.push(value)
    })
    console.time(`flushed`)
    await array.db.flushed
    clearKeptObjects()
    mem()
    console.timeEnd(`flushed`)
    console.log({ chunkI })
  }
}

if (args.benchmark === `raw-lmdb`) {
  async function benchmark() {
    const randomFileName =
      Math.random().toString(36).substring(2, 15) + `-lmdb-backed-array`
    const filePath = path.join(os.tmpdir(), randomFileName)
    mem()
    const newDb = open({
      path: filePath,
      compression: true,
      cache: {
        cacheSize: 1000,
      },
    })
    console.time(`copy`)
    let promise
    const chunks = 20
    const chunkSize = Math.round(args.items / chunks)
    console.log({ chunks, chunkSize })
    for (let chunkI = 0; chunkI < chunks; chunkI++) {
      db.getRange({
        start: chunkI * chunkSize,
        end: chunkI * chunkSize + chunkSize,
      }).forEach(({ key, value }) => {
        promise = newDb.put(key, value)
      })
      clearKeptObjects()
      mem()
      await promise
    }
    await promise
    console.timeEnd(`copy`)
    mem()
  }
  benchmark()
}
