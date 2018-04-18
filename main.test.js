const { readFileSync } = require("fs");

const instantiate = async () => {
  const buffer = readFileSync("./main.wasm");
  const module = await WebAssembly.compile(buffer);
  const instance = await WebAssembly.instantiate(module);
  return instance.exports;
};

test("hello world returns 42", async done => {
  const wasm = await instantiate();
  expect(wasm.helloWorld()).toBe(42);
  done();
});
