const { readFileSync } = require("fs");
const ctx = require("axel");

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

const rand = () => Math.floor(Math.random() * 50);

const run = async () => {
  const game = await instantiate();

  const render = () => {
    ctx.clear();
    ctx.bg(0, 128, 255);
    const memory = new Uint32Array(game.memory.buffer, 0, 50 * 50);
    for (let y = 0; y < 30; y++) {
      for (let x = 0; x < 50; x++) {
        if (game.getCell(x, y) > 0) {
          ctx.point(x, y);
        }
      }
    }
    ctx.cursor.restore();
  };

  for (let i = 0; i < 400; i++) {
    game.setCell(rand(), rand(), 1);
  }

  setInterval(() => {
    game.tick();
    render();
  }, 100);
};

run();
