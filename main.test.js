const { readFileSync } = require("fs");
const build = require("./scripts/build/index");

const instantiate = async () => {
  const buffer = readFileSync("./main.wasm");
  const module = await WebAssembly.compile(buffer);
  const instance = await WebAssembly.instantiate(module, {
    console: {
      log: (x, y) => console.log(x, y)
    }
  });
  return instance.exports;
};

const setAllCells = value => {
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      wasm.setCell(x, y, value);
    }
  }
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
  debugger;
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
  setAllCells(1);
  // x outer boundaries
  expect(wasm.getCell(0, 0)).toBe(1);
  expect(wasm.getCell(49, 0)).toBe(1);
  expect(wasm.getCell(-1, 0)).toBe(0);
  expect(wasm.getCell(50, 0)).toBe(0);
  // y boundaries
  expect(wasm.getCell(5, -1)).toBe(0);
  expect(wasm.getCell(5, 50)).toBe(0);
  expect(wasm.getCell(5, 0)).toBe(1);
  expect(wasm.getCell(5, 49)).toBe(1);
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

test("ensure isCellAlive only evaluates the first bit", () => {
  wasm.setCell(2, 2, 0b1);
  expect(wasm.isCellAlive(2, 2)).toBe(1);

  wasm.setCell(2, 2, 0b11);
  expect(wasm.isCellAlive(2, 2)).toBe(1);

  wasm.setCell(2, 2, 0b10);
  expect(wasm.isCellAlive(2, 2)).toBe(0);
});

test("setCellStateForNextGeneration", () => {
  // live cell
  wasm.setCell(2, 2, 1);

  // alive in next generation
  wasm.setCellStateForNextGeneration(2, 2, 1);
  expect(wasm.getCell(2, 2)).toBe(0b11);

  // dead in next generation
  wasm.setCellStateForNextGeneration(2, 2, 0);
  expect(wasm.getCell(2, 2)).toBe(0b01);

  // dead cell
  wasm.setCell(2, 2, 0);

  // alive in next generation
  wasm.setCellStateForNextGeneration(2, 2, 1);
  expect(wasm.getCell(2, 2)).toBe(0b10);

  // dead in next generation
  wasm.setCellStateForNextGeneration(2, 2, 0);
  expect(wasm.getCell(2, 2)).toBe(0b00);
});

test("evolveCellToNextGeneration", () => {
  // a live cell with no live neighbours dies
  setAllCells(0);
  wasm.setCell(2, 2, 1);
  wasm.evolveCellToNextGeneration(2, 2);
  expect(wasm.getCell(2, 2)).toBe(0b01);

  // a live cell with two live neighbours lives
  setAllCells(0);
  wasm.setCell(2, 2, 1);
  wasm.setCell(2, 3, 1);
  wasm.setCell(2, 1, 1);
  wasm.evolveCellToNextGeneration(2, 2);
  expect(wasm.getCell(2, 2)).toBe(0b11);

  // a dead cell with all dead neighbours stays dead
  setAllCells(0);
  wasm.evolveCellToNextGeneration(2, 2);
  expect(wasm.getCell(2, 2)).toBe(0b00);

  // a dead cell with three live neighbours comes to life
  setAllCells(0);
  wasm.setCell(2, 2, 0);
  wasm.setCell(2, 3, 1);
  wasm.setCell(2, 1, 1);
  wasm.setCell(1, 1, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(3);
  wasm.evolveCellToNextGeneration(2, 2);
  expect(wasm.getCell(2, 2)).toBe(0b10);
});

test("promoteNextGeneration", () => {
  wasm.setCell(2, 2, 0b10);
  wasm.promoteNextGeneration();
  expect(wasm.getCell(2, 2)).toBe(0b1);
});
