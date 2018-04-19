const { readFileSync } = require("fs");
const build = require("./scripts/build/index");

const instantiate = async () => {
  const buffer = readFileSync("./main.wasm");
  const module = await WebAssembly.compile(buffer);
  const instance = await WebAssembly.instantiate(module);
  return instance.exports;
};

const dumpMemory = () => {
  const memory = new Uint32Array(wasm.memory.buffer, 0, 50 * 50);
  let asciiMem = "";
  for (let y = 0; y < 49; y++) {
    for (let x = 0; x < 49; x++) {
      asciiMem += wasm.getCell(x, y) > 0 ? "#" : ".";
    }
    asciiMem += "\n";
  }
  console.log(asciiMem);
};

let wasm;

beforeAll(() => {
  build("main.wat", "main.wasm");
});

beforeEach(async done => {
  wasm = await instantiate();
  done();
});

test("offsetFromCoordinate", () => {
  expect(wasm.offsetFromCoordinate(0, 0)).toBe(0);
  expect(wasm.offsetFromCoordinate(49, 0)).toBe(49 * 4);
  expect(wasm.offsetFromCoordinate(10, 2)).toBe(10 * 4 + 2 * 200);
});

test("get / set cell", () => {
  expect(wasm.getCell(2, 2)).toBe(0);
  wasm.setCell(2, 2, 1);
  expect(wasm.getCell(2, 2)).toBe(1);
});

test("set cell does not leak to neighbours", () => {
  wasm.setCell(2, 2, 1);
  expect(wasm.getCell(3, 2)).toBe(0);
  expect(wasm.getCell(1, 2)).toBe(0);
});

test("memory starts in an empty state", () => {
  for (let x = 0; x < 49; x++) {
    for (let y = 0; y < 49; y++) {
      expect(wasm.getCell(x, y)).toBe(0);
    }
  }
});

test("read memory directly", () => {
  const memory = new Uint32Array(wasm.memory.buffer, 0, 50 * 50);
  wasm.setCell(2, 2, 10);
  expect(memory[2 + 2 * 50]).toBe(10);
  expect(memory[3 + 2 * 50]).toBe(0);
});

test("without boundary values", () => {
  // starts at zero
  expect(wasm.liveNeighbourCount(2, 2)).toBe(0);

  // add each neighbour in turn
  wasm.setCell(1, 1, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(1);
  wasm.setCell(2, 1, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(2);
  wasm.setCell(3, 1, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(3);
  wasm.setCell(3, 2, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(4);
  wasm.setCell(1, 2, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(5);
  wasm.setCell(1, 3, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(6);
  wasm.setCell(2, 3, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(7);
  wasm.setCell(3, 3, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(8);
});

test("get cell handles boundary values", () => {
  for (let x = 0; x < 49; x++) {
    for (let y = 0; y < 49; y++) {
      wasm.setCell(x, y, 1);
    }
  }
  expect(wasm.getCell(-1, 0)).toBe(0);
});

test("inRange", () => {
  // mid
  expect(wasm.inRange(0, 50, 25)).toBe(1);
  // boundary
  expect(wasm.inRange(0, 50, 0)).toBe(1);
  expect(wasm.inRange(0, 50, 49)).toBe(1);
  // outer boundary
  expect(wasm.inRange(0, 50, -1)).toBe(0);
  expect(wasm.inRange(0, 50, 50)).toBe(0);
});
