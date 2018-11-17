import { NeuralNetwork } from "brain.js";

/* eslint-disable no-undef,no-restricted-globals,default-case */
function DCanvas(el) {
  const ctx = el.getContext("2d");
  const pixel = 20;

  let isMouseDown = false;

  canv.width = 500;
  canv.height = 500;

  this.drawLine = (x1, y1, x2, y2, color = "gray") => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  this.drawCell = (x, y, w, h, color = "blue") => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineJoin = "miter";
    ctx.lineWidth = 1;
    ctx.rect(x, y, w, h);
    ctx.fill();
  };

  this.drawGrid = () => {
    const w = canv.width;
    const h = canv.height;

    const p = w / pixel;

    const xStep = w / p;
    const yStep = h / p;

    for (let x = 0; x < w; x += xStep) {
      this.drawLine(x, 0, x, h);
    }

    for (let y = 0; y < w; y += yStep) {
      this.drawLine(0, y, w, y);
    }
  };

  this.clear = () => {
    ctx.clearRect(0, 0, canv.width, canv.height);
  };

  this.calculate = (draw = false) => {
    const w = canv.width;
    const h = canv.height;
    const p = w / pixel;

    const xStep = w / p;
    const yStep = h / p;

    const vector = [];
    let cells = [];

    for (let x = 0; x < w; x += xStep) {
      for (let y = 0; y < h; y += yStep) {
        const imageData = ctx.getImageData(x, y, xStep, yStep);
        let nonEmptyPixelsCount = 0;
        for (let i = 0; i < imageData.data.length; i += 10) {
          const isEmpty = imageData.data[i] === 0;
          if (!isEmpty) {
            nonEmptyPixelsCount++;
          }
        }
        if (nonEmptyPixelsCount > 1 && draw) {
          cells.push({ x: x, y: y, xStep: xStep, yStep: yStep });
        }
        vector.push(nonEmptyPixelsCount > 1 ? 1 : 0);
      }
    }

    if (draw) {
      this.clear();
      this.drawGrid();
      for (let cell of cells) {
        this.drawCell(cell.x, cell.y, cell.xStep, cell.yStep);
      }
    }

    return vector;
  };

  el.addEventListener("mousedown", e => {
    isMouseDown = true;
    ctx.beginPath();
  });
  el.addEventListener("mouseup", e => {
    isMouseDown = false;
  });
  el.addEventListener("mousemove", e => {
    if (!isMouseDown) return;

    ctx.fillStyle = "red";
    ctx.strokeStyle = "red";
    ctx.lineWidth = pixel;

    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(e.offsetX, e.offsetY, pixel / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });
}

const d = new DCanvas(document.getElementById("canv"));
let vector = [];
let net = null;
let trainData = [];

document.addEventListener("keypress", e => {
  switch (e.key.toLowerCase()) {
    case "c": {
      d.clear();
      break;
    }
    case "v": {
      vector = d.calculate(true);
      // train
      if (confirm("Positive?")) {
        trainData.push({
          input: vector,
          output: { Positive: 1 }
        });
      } else {
        trainData.push({
          input: vector,
          output: { Negative: 1 }
        });
      }
      break;
    }
    case "b": {
      net = new NeuralNetwork();
      net.train(trainData, { log: true });

      const result = brain.likely(d.calculate(), net);
      alert(result);
      break;
    }
  }
});
