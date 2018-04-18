const { readFileSync, writeFileSync } = require("fs");
const wabt = require("wabt");
const path = require("path");

const inputWat = "main.wat";
const outputWasm = "main.wasm";

const wasmModule = wabt.parseWat(inputWat, readFileSync(inputWat, "utf8"));
const { buffer } = wasmModule.toBinary({});

writeFileSync(outputWasm, new Buffer(buffer));
