const build = require("./build/index")

const inputWat = "main.wat";
const outputWasm = "main.wasm";

build(inputWat, outputWasm);