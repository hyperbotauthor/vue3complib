import { h, ref } from "vue";

export function getStyle(className: string): string {
  let cssText = "";
  for (let si = 0; si < document.styleSheets.length; si++) {
    let classes: any =
      document.styleSheets[si].rules || document.styleSheets[0].cssRules;
    for (let x = 0; x < classes.length; x++) {
      if (classes[x].selectorText == className) {
        cssText += classes[x].cssText || classes[x].style.cssText;
      }
    }
  }
  return cssText;
}

export class DomImage {
  img: any;

  constructor(width: number, height: number) {
    this.img = document.createElement("img");
    this.img.setAttribute("width", width);
    this.img.setAttribute("height", height);
  }

  set src(url: any) {
    this.img.src = url;
  }

  get naturalWidth(): number {
    return this.img.naturalWidth();
  }

  get naturalHeight(): number {
    return this.img.naturalHeight();
  }

  fromStyle(selector: string) {
    return new Promise((resolve: any) => {
      const style: any = getStyle(selector);
      const imgurlMatch = style.match(/url\(['"](.*?)['"]/);
      if (!imgurlMatch) {
        console.error("url for css selector", selector, "not found in", style);
        return;
      }
      this.img.onload = () => resolve(this.img);
      this.img.src = imgurlMatch[1];
    });
  }
}

export function getelse(obj: any, prop: any, def: any): any {
  if (typeof obj[prop] !== "undefined") {
    return obj[prop];
  }
  return def;
}

export class Canvas {
  width: number;
  height: number;
  ref: any;

  arrow(from: any, to: any, argsopt: any) {
    let diff: any = { x: to.x - from.x, y: to.y - from.y };
    let l = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
    let rot = Math.asin((to.y - from.y) / l);
    if (to.x < from.x) rot = Math.PI - rot;
    let args = argsopt || {};
    let scalefactor = getelse(args, "scalefactor", 1);
    let auxscalefactor = getelse(args, "auxscalefactor", 1);
    let linewidth =
      getelse(args, "linewidth", 16) * scalefactor * auxscalefactor;
    let halflinewidth = linewidth / 2;
    let pointheight =
      getelse(args, "pointheight", 40) * scalefactor * auxscalefactor;
    let pointwidth =
      getelse(args, "pointwidth", 30) * scalefactor * auxscalefactor;
    let halfpointwidth = pointwidth / 2;
    let color = getelse(args, "color", "#ff0");
    let opacity = getelse(args, "opacity", 1);
    let lineheight = l - pointheight;
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(from.x, from.y);
    this.ctx.rotate(rot);
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, halflinewidth);
    this.ctx.lineTo(lineheight, halflinewidth);
    this.ctx.lineTo(lineheight, halflinewidth + halfpointwidth);
    this.ctx.lineTo(l, 0);
    this.ctx.lineTo(lineheight, -(halflinewidth + halfpointwidth));
    this.ctx.lineTo(lineheight, -halflinewidth);
    this.ctx.lineTo(0, -halflinewidth);
    this.ctx.lineTo(0, 0);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  uploadHref(kind: string) {
    const href = this.ref._rawValue.toDataURL("image/" + kind);
    const b64 = href.replace(/data:image\/png;base64,/, "");
    return b64;
  }

  downloadHref(name: string, kind: string) {
    let dt: any = this.ref._rawValue.toDataURL("image/" + kind);
    dt = dt.replace(/^data:image\/[^;]*/, "data:application/octet-stream");
    dt = dt.replace(
      /^data:application\/octet-stream/,
      "data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=" +
        name +
        "." +
        kind
    );
    return dt;
  }

  drawImage(img: any, x: number, y: number, width: number, height: number) {
    this.ctx.drawImage(img, x, y, width, height);
  }

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ref = ref(0);
  }

  get ctx(): any {
    return this.ref._rawValue.getContext("2d");
  }

  draw() {
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(200, 100);
    this.ctx.stroke();
  }

  render(): any {
    return h(
      "canvas",
      {
        width: this.width,
        height: this.height,
        ref: this.ref,
      },
      []
    );
  }

  resize(width: number, height: number): Canvas {
    this.width = width;
    this.height = height;
    this.ref._rawValue.setAttribute("width", this.width);
    this.ref._rawValue.setAttribute("height", this.height);
    return this;
  }
}

export function uciToCoords(uci: string, size: number, flip: boolean): any {
  let file = uci.substring(0, 1).charCodeAt(0) - "a".charCodeAt(0);
  let rank = 7 - (uci.substring(1, 2).charCodeAt(0) - "1".charCodeAt(0));
  if (flip) {
    file = 7 - file;
    rank = 7 - rank;
  }
  return { x: (file * size) / 8, y: (rank * size) / 8 };
}

export function drawShapes(
  genUci: string,
  shapes: any,
  size: number,
  flip: boolean,
  canvas: any
) {
  if (genUci) {
    for (let uci of [genUci.substring(0, 2), genUci.substring(2, 4)]) {
      const coords = uciToCoords(uci, size, flip);
      canvas.ctx.fillStyle = "rgba(192, 255, 0, 0.3)";
      canvas.ctx.fillRect(coords.x, coords.y, size / 8, size / 8);
    }
  }
  for (let shape of shapes) {
    const orig: any = (shape as any).orig;
    const dest: any = (shape as any).dest;
    const brush: any = (shape as any).brush;

    const coords = uciToCoords(orig as string, size, flip);

    canvas.ctx.strokeStyle =
      brush === "green" ? "rgba(0, 128, 0, 0.8)" : "rgba(192, 0, 0, 0.8)";

    if (dest) {
      const coordsTo = uciToCoords(dest as string, size, flip);
      coords.x += size / 16;
      coords.y += size / 16;
      coordsTo.x += size / 16;
      coordsTo.y += size / 16;
      canvas.arrow(coords, coordsTo, {
        scalefactor: 0.5,
        auxscalefactor: size / 320,
        color: brush === "green" ? "#080" : "#a00",
        opacity: 0.6,
      });
    } else {
      canvas.ctx.globalAlpha = 1;
      canvas.ctx.beginPath();
      canvas.ctx.arc(
        coords.x + size / 16,
        coords.y + size / 16,
        size / 16,
        0,
        2 * Math.PI
      );
      canvas.ctx.lineWidth = 3;
      canvas.ctx.stroke();
    }
  }
}

export async function drawBoard(
  backgroundStyle: string,
  board: any,
  genUci: string,
  shapes: any,
  size: number,
  flip: boolean,
  canvas: any,
  exportcoords: boolean
) {
  const img = new DomImage(size, size);

  const background = await img.fromStyle(backgroundStyle);

  canvas.drawImage(background, 0, 0, size, size);

  const pieceSize = size / 8;

  if (exportcoords) {
    canvas.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";

    for (let nomI = 0; nomI < 64; nomI++) {
      const i = flip ? nomI : 63 - nomI;
      const x = i % 8;
      const y = (i - x) / 8;

      canvas.ctx.font = `bold ${size / 8 / 3}px serif`;
      const uci =
        String.fromCharCode("a".charCodeAt(0) + 7 - x) +
        String.fromCharCode("1".charCodeAt(0) + y);
      canvas.ctx.fillText(
        uci,
        (flip ? x : 7 - x) * pieceSize + pieceSize / 8,
        (flip ? y : 7 - y) * pieceSize - pieceSize / 8 + pieceSize
      );
    }
  }

  for (let nomI = 0; nomI < 64; nomI++) {
    const i = flip ? nomI : 63 - nomI;
    const x = i % 8;
    const y = (i - x) / 8;

    const boardPiece = board.get(nomI);

    if (boardPiece) {
      const piece = new DomImage(pieceSize, pieceSize);

      const img = await piece.fromStyle(
        `.${boardPiece.role}.${boardPiece.color}`
      );

      canvas.drawImage(
        img,
        (7 - x) * pieceSize,
        y * pieceSize,
        pieceSize,
        pieceSize
      );
    }
  }

  drawShapes(genUci, shapes, size, flip, canvas);
}
