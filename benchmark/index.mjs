import { open, clearKeptObjects } from "lmdb"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { LMDBArray } from "../lib/index.ts"

import processTop from "process-top"
const ptop = processTop()
function mem() {
  // if (global.gc) {
    // console.time(`gc`)
    // global.gc()
    // console.timeEnd(`gc`)
  // }
  console.log(ptop.toString())
}

const args = yargs(hideBin(process.argv)).parse()

let db

if (args.dataType === `object`) {
  db = open(`benchmark-data`, { compression: true, cache: false })
} else if (args.dataType === `number`) {
  db = open(`benchmark-data-int`, { compression: true, cache: false })
} else {
  console.log(`set which data type to use with --data-type=object (or number)`)
  process.exit(1)
}

if (args.benchmark === `open`) {
  db.getRange({ start: 0, end: args.items }).forEach((i) => i)
}

if (args.benchmark === `js-array`) {
  const array = []
  db.getRange({ start: 0, end: args.items }).forEach(({ key, value }) => {
    array.push(value)
  })
  mem()
}

if (args.benchmark === `lmdb-array`) {
  const array = new LMDBArray()
  for (let {key, value} of db.getRange({ start: 0, end: args.items })) {
    // console.log({key, value})
    array.push(value)
    if (key % 3000 == 0) {
      console.time(`flushing & waiting`)
      // await array.db.flushed
      await new Promise(resolve => setTimeout(resolve, 50))
      clearKeptObjects()
      mem()
      console.timeEnd(`flushing & waiting`)
    }
  }
  // const chunks = 20
  // const chunkSize = Math.round(args.items / chunks)
  // console.log({ chunks, chunkSize })
  // for (let chunkI = 0; chunkI < chunks; chunkI++) {
  // db.getRange({
  // start: chunkI * chunkSize,
  // end: chunkI * chunkSize + chunkSize,
  // }).forEach(({ key, value }) => {
  // array.push(value)
  // })
  // console.time(`flushed`)
  // await array.db.flushed
  // clearKeptObjects()
  // mem()
  // console.timeEnd(`flushed`)
  // console.log({ chunkI })
  // }
}

if (args.benchmark === `raw-lmdb`) {
  async function benchmark() {
    mem()
    const newDb = open({
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
