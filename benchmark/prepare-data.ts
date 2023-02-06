import { faker } from "@faker-js/faker"
import { RootDatabase, open } from "lmdb"

function normalDistribution(mean, stddev) {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  num = num * stddev + mean
  return num
}

function makePost() {
  const randomNumber = normalDistribution(1500, 1000)
  const post = {
    title: faker.lorem.sentence(),
    body: faker.lorem.words(randomNumber),
    created_at: faker.date.past(),
    updated_at: faker.date.past(),
    author: faker.name.fullName(),
  }

  return post
}

const db: RootDatabase = open(`benchmark-data`, { compression: true })

function loopWithPause(i = 0) {
  if (i === 1000000) return
  const post = makePost()
  db.put(i, post)
  if (i % 500 === 0) {
    console.log(i)
    setTimeout(() => {
      loopWithPause(i + 1)
    }, 0)
  } else {
    loopWithPause(i + 1)
  }
}

loopWithPause()
