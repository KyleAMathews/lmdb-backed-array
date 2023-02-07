# lmdb-backed-array
LMDB-backed array implementation for Node.js, Deno, Bun for lowering memory usage for huge arrays.

## Benchmark
First install dependencies `pnpm install`

Then prepare the database to read from — `npx tsx benchmark/prepare-data.ts`

Then run one of the benchmarks. They all OOM at around 4-500k objects.

### Normal JS Array
time ./benchmark/memusg npx tsx --expose-gc benchmark/index.mjs --data-type=object --benchmark=js-array --items=600000

### LMDB-backed Array
time ./benchmark/memusg npx tsx --expose-gc benchmark/index.mjs --data-type=object --benchmark=lmdb-array --items=600000

### Raw copy from one LMDB db to another
time ./benchmark/memusg npx tsx --expose-gc benchmark/index.mjs --data-type=object --benchmark=raw-lmdb --items=600000
