const { readFileSync } = require("fs");
const build = require("./scripts/build/index");

const instantiate = async () => {
  const buffer = readFileSync("./main.wasm");
  const module = await WebAssembly.compile(buffer);
  const instance = await WebAssembly.instantiate(module);
  return instance.exports;
};

beforeAll(() => {
  build("main.wat", "main.wasm");
});

test("offsetFromCoordinate", async done => {
  const wasm = await instantiate();

  expect(wasm.offsetFromCoordinate(0, 0)).toBe(0);
  expect(wasm.offsetFromCoordinate(49, 0)).toBe(49);
  expect(wasm.offsetFromCoordinate(10, 2)).toBe(10 + 2 * 50);

  done();
});
