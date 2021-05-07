const inputWat = "main.wat";
const outputWasm = "main.wasm";

require("./build").then((builder) => builder(inputWat, outputWasm));
