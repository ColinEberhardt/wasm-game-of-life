const { readFileSync } = require("fs");
const build = require("./scripts/build/index");

const instantiate = async () => {
  const buffer = readFileSync("./main.wasm");
  const module = await WebAssembly.compile(buffer);
  const instance = await WebAssembly.instantiate(module);
  return instance.exports;
};

let wasm;

beforeAll(async done => {
  build("main.wat", "main.wasm");
  wasm = await instantiate();
  done();
});

test("offsetFromCoordinate", () => {
  expect(wasm.offsetFromCoordinate(0, 0)).toBe(0);
  expect(wasm.offsetFromCoordinate(49, 0)).toBe(49);
  expect(wasm.offsetFromCoordinate(10, 2)).toBe(10 + 2 * 50);
});

test("get / set cell", () => {
  wasm.setCell(2, 2, 1);
  expect(wasm.getCell(2, 2)).toBe(1);
});
