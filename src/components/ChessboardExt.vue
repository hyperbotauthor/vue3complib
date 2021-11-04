<script lang="ts">
declare let login: any;
declare let logout: any;

import { defineComponent, h, ref, onMounted, reactive } from "vue";

import { Game } from "@publishvue/chessopsnpmts";
import { Chessground } from "@publishvue/chessground";

import { Perscombo } from "../index";

import { setLocal, getLocal } from "../utils";

import { playAudio } from "../assets";

import _ from "lodash";

const variants = [
  { display: "Standard", value: "chess" },
  { display: "Atomic", value: "atomic" },
  { display: "Horde", value: "horde" },
  { display: "Racing Kings", value: "racingkings" },
];

import { MOVE_RATINGS } from "@publishvue/chessopsnpmts";

const sizes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
  const size = 120 + i * 40;
  return {
    display: `${size} x ${size}`,
    value: size,
  };
});

function getStyle(className: string): string {
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

  fromStyle(selector: string, onload: any) {
    const style: any = getStyle(selector);
    const imgurlMatch = style.match(/url\(['"](.*?)['"]/);
    if (!imgurlMatch) {
      console.error("url for css selector", selector, "not found in", style);
      return;
    }
    this.img.onload = () => onload(this.img);
    this.img.src = imgurlMatch[1];
  }
}

function getelse(obj: any, prop: any, def: any): any {
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

export default defineComponent({
  name: "ChessboardExt",
  props: {
    id: {
      type: String,
      default: "mainboard",
    },
    size: {
      type: Number,
      default: 320,
    },
  },
  setup(props, context) {
    getStyle(".maplebackground");
    const canvas = new Canvas(props.size, props.size);

    function store() {
      const json = game.stringify();
      localStorage.setItem(props.id + "/game", json);
    }

    function weightWidget(weight: any, stepRating: any) {
      return h(
        "div",
        {
          class: "weightwidget",
        },
        [
          h("button", { onClick: () => stepRating(-1) }, ["-"]),
          h("div", { class: "weight" }, [weight < 10 ? `${weight}` : "!"]),
          h("button", { onClick: () => stepRating(1) }, ["+"]),
        ]
      );
    }

    let size = getLocal(props.id + "/size", props.size);

    setLocal(props.id + "/size", size);

    const game_ = Game();
    const json = localStorage.getItem(props.id + "/game") || "";
    game_.parse(json);

    const game = reactive(game_);

    const legalSansRef: any = ref(0);
    const histSansRef: any = ref(0);
    const outerContainerRef: any = ref(0);
    const innerContainerRef: any = ref(0);
    const fenInputRef: any = ref(0);
    const commentTextareaRef: any = ref(0);

    let board: any = undefined;

    function resize(setSize: number) {
      size = setSize;
      outerContainerRef._rawValue.style.width = `${size}px`;
      outerContainerRef._rawValue.style.height = `${size}px`;
      innerContainerRef._rawValue.style.width = `${size}px`;
      innerContainerRef._rawValue.style.height = `${size}px`;
      legalSansRef._rawValue.style.height = `${size}px`;
      histSansRef._rawValue.style.height = `${size}px`;
      fenInputRef._rawValue.style.width = `${size - 10}px`;
      commentTextareaRef._rawValue.style.height = `${size - 10}px`;
      canvas.resize(size, size);
    }

    function highlightMove(uci?: string) {
      if (!uci) {
        board.set({ lastMove: undefined });
      } else {
        board.set({
          lastMove: [uci.substring(0, 2), uci.substring(2, 4)],
        });
      }
    }

    function getFlip(): boolean {
      return getLocal(props.id + "/flip", false) as boolean;
    }

    function setFlip(flip: boolean) {
      board.set({
        orientation: flip ? "black" : "white",
      });
      setLocal(props.id + "/flip", flip);
    }

    function setUp() {
      board.set({
        fen: game.reportFen(),
      });
      highlightMove(game.current.genUci);
      localStorage.setItem(props.id + "/game", game.stringify());
      fenInputRef._rawValue.value = game.reportFen();
      try {
        (document.getElementById(game.current.id) as any).scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
      } catch (err) {}
      board.setShapes(game.current.shapes);
      movable();
      commentTextareaRef._rawValue.value = game.current.comment;
    }

    function setVariant(setVariant?: string) {
      const variant = setVariant || getLocal(props.id + "/variant", "chess");
      game.setVariant(variant, undefined);
      setUp();
    }

    let shapes: any = [];

    function storeShapes() {
      game.current.shapes = board.state.drawable.shapes;
      store();
    }

    function clearShapes() {
      game.current.shapes = [];
      board.setShapes([]);
      store();
    }

    function movePlayed(orig: string, dest: string) {
      const uci = `${orig}${dest}`;
      let san = null;
      const legals = game.pos.legalsForUci(uci);
      const isLegal = legals.length > 0;
      let legalUci = null;
      if (isLegal) {
        legalUci = legals[0];
        san = game.pos.uciToSan(legalUci);
        game.playUci(legalUci);
        playAudio("tabclick");
      } else {
        playAudio("failed");
      }
      setUp();
      context.emit("chessboardmoveplayed", {
        event: "chessboardmoveplayed",
        orig,
        dest,
        uci,
        san,
        legalUci,
        legals,
        isLegal,
      });
    }

    function movable() {
      const dests = game.chessgroundDests();
      const turnColor = game.pos.pos.turn;
      board.set({
        turnColor,
        movable: {
          dests,
          color: turnColor,
          showDests: true,
        },
      });
    }

    onMounted(() => {
      resize(size);

      board = Chessground(innerContainerRef._rawValue, {});

      board.set({
        movable: {
          events: {
            after: (orig: string, dest: string) => movePlayed(orig, dest),
          },
        },
      });

      setUp();

      setFlip(getFlip());
    });

    return () => {
      const innerContainer = h(
        "div",
        {
          ref: innerContainerRef,
          class: ["maplebackground", "is2d"],
        },
        []
      );

      const variantCombo = h(Perscombo, {
        id: props.id + "/variant",
        options: variants,
        onPerscombochanged: (event: any) => {
          setVariant(event.value);
        },
      });

      const sizeCombo = h(Perscombo, {
        id: props.id + "/size",
        options: sizes,
        onPerscombochanged: (event: any) => {
          resize(event.value);
        },
      });

      const resetButton = h(
        "button",
        {
          onClick: () => {
            setVariant();
            playAudio("failed");
          },
        },
        ["Reset"]
      );

      const flipButton = h(
        "button",
        {
          onClick: () => {
            setFlip(!getFlip());
            playAudio("tabclick");
          },
        },
        ["Flip"]
      );

      const storeShapesButton = h(
        "button",
        {
          onClick: () => {
            storeShapes();
            playAudio("tabclick");
          },
        },
        ["Store Shapes"]
      );

      const clearShapesButton = h(
        "button",
        {
          onClick: () => {
            clearShapes();
            playAudio("failed");
          },
        },
        ["Clear Shapes"]
      );

      const upperControls = h("div", {}, [
        flipButton,
        variantCombo,
        sizeCombo,
        resetButton,
      ]);

      const tobeginButton = h(
        "button",
        {
          onClick: () => {
            if (game.toBegin()) {
              setUp();
              playAudio("tabclick");
            } else {
              playAudio("failed");
            }
          },
        },
        ["|<"]
      );

      const backButton = h(
        "button",
        {
          onClick: () => {
            if (game.back()) {
              setUp();
              playAudio("tabclick");
            } else {
              playAudio("failed");
            }
          },
        },
        ["<"]
      );

      const forwardButton = h(
        "button",
        {
          onClick: () => {
            if (game.forward()) {
              setUp();
              playAudio("tabclick");
            } else {
              playAudio("failed");
            }
          },
        },
        [">"]
      );

      const toendButton = h(
        "button",
        {
          onClick: () => {
            if (game.toEnd()) {
              setUp();
              playAudio("tabclick");
            } else {
              playAudio("failed");
            }
          },
        },
        [">|"]
      );

      const delButton = h(
        "button",
        {
          onClick: () => {
            if (game.del()) {
              setUp();
              playAudio("tabclick");
            } else {
              playAudio("failed");
            }
          },
        },
        ["X"]
      );

      const lowerControls = h("div", {}, [
        tobeginButton,
        backButton,
        forwardButton,
        toendButton,
        delButton,
        storeShapesButton,
        clearShapesButton,
      ]);

      const outerContainer = h(
        "div",
        {
          ref: outerContainerRef,
          onWheel: (ev: any) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (ev.deltaY < 0) {
              if (game.forward()) playAudio("tabclick");
              else playAudio("failed");
            } else {
              if (game.back()) playAudio("tabclick");
              else playAudio("failed");
            }
            setUp();
          },
        },
        [innerContainer]
      );

      const fenInput = h(
        "input",
        {
          type: "text",
          ref: fenInputRef,
          class: ["feninput"],
          onFocus: (ev: any) => {
            ev.target.select();
          },
          onKeyup: (ev: any) => {
            if (ev.keyCode === 13) {
              game.setVariant(game.variant, ev.target.value);
              playAudio("failed");
              setUp();
            }
          },
        },
        []
      );

      const vertContainer = h("div", {}, [
        upperControls,
        outerContainer,
        fenInput,
        lowerControls,
      ]);

      const richLegalSans = game.richLegalSans();

      const legalSansDiv = h(
        "div",
        {
          class: ["legalsans"],
          ref: legalSansRef,
        },
        richLegalSans.map((item: any, i: number) =>
          h(
            "div",
            {
              class: "legalsancont",
            },
            [
              h(
                "div",
                {
                  class: item.class,
                  onClick: () => {
                    if (game.playSan(item.san || "")) {
                      playAudio("tabclick");
                    } else {
                      playAudio("failed");
                    }
                    setUp();
                  },
                },
                [item.san]
              ),
              weightWidget(item.weights[0], (dir: number) => {
                const node: any = game.nodeForSan(item.san, true);
                let newWeight = item.weights[0] + dir;
                if (newWeight < 0) newWeight = 10;
                if (newWeight > 10) newWeight = 0;
                node.weights[0] = newWeight;
                store();
              }),
            ]
          )
        )
      );

      const histSansDiv = h(
        "div",
        {
          class: ["legalsans", "hist"],
          ref: histSansRef,
        },
        game
          .mainLine()
          .slice()
          .reverse()
          .map((node: any) =>
            h(
              "div",
              {
                class: "legalsancont",
              },
              [
                h(
                  "div",
                  {
                    id: node.id,
                    class: [
                      "richlegalsan",
                      MOVE_RATINGS[node.weights[0]],
                      {
                        selected: node.id === game.current.id,
                      },
                    ],
                    onClick: () => {
                      const id = game.current.id;
                      if (node.id === id) {
                        playAudio("failed");
                      } else {
                        game.selectId(node.id);
                        playAudio("tabclick");
                      }
                      setUp();
                    },
                  },
                  [node.displaySan]
                ),
                weightWidget(node.weights[0], (dir: number) => {
                  let newWeight = node.weights[0] + dir;
                  if (newWeight < 0) newWeight = 10;
                  if (newWeight > 10) newWeight = 0;
                  node.weights[0] = newWeight;
                  store();
                }),
              ]
            )
          )
      );

      const commentTextarea = h(
        "textarea",
        {
          ref: commentTextareaRef,
          onInput: (ev: any) => {
            const comment = ev.target.value;
            game.current.comment = comment;
            _.debounce(store, 500);
          },
        },
        []
      );

      const deleteCommentButton = h(
        "button",
        {
          onClick: () => {
            game.current.comment = "";
            _.debounce(store, 500);
            setUp();
          },
        },
        ["Delete Comment"]
      );

      const commentDiv = h(
        "div",
        {
          class: ["comment"],
        },
        [commentTextarea, deleteCommentButton]
      );

      function uciToCoords(uci: string, size: number, flip: boolean): any {
        let file = uci.substring(0, 1).charCodeAt(0) - "a".charCodeAt(0);
        let rank = 7 - (uci.substring(1, 2).charCodeAt(0) - "1".charCodeAt(0));
        if (flip) {
          file = 7 - file;
          rank = 7 - rank;
        }
        return { x: (file * size) / 8, y: (rank * size) / 8 };
      }

      function drawShapes() {
        const genUci = game.current.genUci;
        if (genUci) {
          for (let uci of [genUci.substring(0, 2), genUci.substring(2, 4)]) {
            const coords = uciToCoords(uci, size, getFlip());
            canvas.ctx.fillStyle = "rgba(192, 255, 0, 0.3)";
            canvas.ctx.fillRect(coords.x, coords.y, size / 8, size / 8);
          }
        }
        for (let shape of board.state.drawable.shapes) {
          const orig: any = (shape as any).orig;
          const dest: any = (shape as any).dest;
          const brush: any = (shape as any).brush;

          const coords = uciToCoords(orig as string, size, getFlip());

          canvas.ctx.strokeStyle =
            brush === "green" ? "rgba(0, 128, 0, 0.8)" : "rgba(192, 0, 0, 0.8)";

          if (dest) {
            const coordsTo = uciToCoords(dest as string, size, getFlip());
            coords.x += size / 16;
            coords.y += size / 16;
            coordsTo.x += size / 16;
            coordsTo.y += size / 16;
            canvas.arrow(coords, coordsTo, {
              scalefactor: 0.4,
              color: brush === "green" ? "#0a0" : "#a00",
            });
          } else {
            canvas.ctx.beginPath();
            canvas.ctx.arc(
              coords.x + size / 16,
              coords.y + size / 16,
              size / 16,
              0,
              2 * Math.PI
            );
            canvas.ctx.lineWidth = 2;
            canvas.ctx.stroke();
          }
        }
      }

      async function uploadBoard() {
        const href = canvas.uploadHref("png");
        console.log(href);
        const params = {
          token: localStorage.getItem("LICHESS_TOKEN"),
          fileName: "screenshots/board.png",
          content: href,
        };
        const req = {
          method: "POST",
          body: JSON.stringify(params),
        };
        console.log("req", req);
        const resp: any = await fetch("/.netlify/functions/upload", req);
        console.log("upload resp", resp);
        const text = await resp.text();
        console.log("upload text", text);
        const username = (document.getElementById("showusernamediv") as any)
          .innerHTML;
        console.log("username", username);
        const url = `https://raw.githubusercontent.com/hyperbotauthor/blobs/main/lichess/${username}/screenshots/board.png`;
        window.open(url, "_blank");
      }

      function drawBoard() {
        const img = new DomImage(size, size);
        img.fromStyle(".maplebackground", (img: any) => {
          canvas.drawImage(img, 0, 0, size, size);

          drawShapes();

          const board: any = game.pos.pos.board;

          const pieceSize = size / 8;

          for (let nomI = 0; nomI < 64; nomI++) {
            const i = getFlip() ? nomI : 63 - nomI;
            const x = i % 8;
            const y = (i - x) / 8;

            const boardPiece = board.get(nomI);

            if (boardPiece) {
              const piece = new DomImage(pieceSize, pieceSize);
              piece.fromStyle(
                `.${boardPiece.role}.${boardPiece.color}`,
                (img: any) => {
                  canvas.drawImage(
                    img,
                    (7 - x) * pieceSize,
                    y * pieceSize,
                    pieceSize,
                    pieceSize
                  );
                }
              );
            }
          }
        });
      }

      const exportCanvasButton = h(
        "button",
        {
          onClick: () => {
            drawBoard();
          },
        },
        ["Export"]
      );

      const uploadCanvasButton = h(
        "button",
        {
          onClick: () => {
            uploadBoard();
          },
        },
        ["Upload"]
      );

      const exportLinkRef: any = ref(0);

      const exportCanvasLink = h(
        "a",
        {
          href: "#",
          download: "board.png",
          ref: exportLinkRef,
          class: ["exportlink"],
          onClick: (ev: any) => {
            ev.stopPropagation();
            exportLinkRef._rawValue.href = canvas.downloadHref("board", "png");
          },
        },
        ["Download"]
      );

      const canvasControlsDiv = h(
        "div",
        {
          class: ["controls"],
        },
        [exportCanvasButton, exportCanvasLink, uploadCanvasButton]
      );

      const canvassDiv = h(
        "div",
        {
          class: ["canvas"],
        },
        [canvas.render(), canvasControlsDiv]
      );

      const horizContainer = h(
        "div",
        {
          class: ["horizcont"],
        },
        [vertContainer, legalSansDiv, histSansDiv, commentDiv, canvassDiv]
      );

      const loginButton = h(
        "button",
        {
          id: "loginbutton",
          onClick: () => {
            login();
          },
        },
        ["Log in"]
      );

      const logoutButton = h(
        "button",
        {
          id: "logoutbutton",
          onClick: () => {
            logout();
          },
        },
        ["Log out"]
      );

      const showUsernameDiv = h(
        "div",
        {
          id: "showusernamediv",
        },
        [""]
      );

      const loginDiv = h(
        "div",
        {
          class: "login",
        },
        [loginButton, logoutButton, showUsernameDiv]
      );

      const loginContainer = h(
        "div",
        {
          class: "logincont",
        },
        [horizContainer, loginDiv]
      );

      return h("div", { class: ["chessboardext"] }, [loginContainer]);
    };
  },
});
</script>

<style>
.chessboardext {
  padding: 2px;
  border: solid 1px;
}
.chessboardext .horizcont {
  display: flex;
  align-items: center;
}
.chessboardext .legalsans {
  padding: 3px;
  overflow-y: scroll;
  user-select: none;
}
.chessboardext .legalsans.hist {
  margin-left: 5px;
}
.chessboardext .richlegalsan {
  padding: 3px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  color: #007;
  width: 70px;
  border: solid 2px transparent;
  margin: 1px;
}
.chessboardext .richlegalsan.selected {
  border: solid 2px #7f7;
}
.chessboardext .richlegalsan.forcedwin {
  background-color: #afa;
}
.chessboardext .richlegalsan.winning {
  background-color: #ada;
}
.chessboardext .richlegalsan.exclam {
  background-color: #9b9;
}
.chessboardext .richlegalsan.good {
  background-color: #7a7;
}
.chessboardext .richlegalsan.promising {
  background-color: #77f;
  color: #fff;
}
.chessboardext .richlegalsan.stable {
  background-color: #33d;
  color: #fff;
}
.chessboardext .richlegalsan.experimental {
  background-color: #007;
  color: #fff;
}
.chessboardext .richlegalsan.bad {
  background-color: #700;
  color: #fff;
}
.chessboardext .richlegalsan.losing {
  background-color: #a77;
  color: #fff;
}
.chessboardext .richlegalsan.forcedloss {
  background-color: #f00;
  color: #fff;
}
.chessboardext .richlegalsan.mainline {
  border: solid 2px #7e7;
}
.chessboardext .richlegalsan.variation {
  border: solid 2px #aaf;
}
.feninput {
  font-size: 10px;
}
.legalsancont {
  display: flex;
  align-items: center;
}
.weightwidget {
  display: flex;
  align-items: center;
  font-family: monospace;
  margin-left: 6px;
  margin-right: 2px;
}
.weightwidget button {
  height: 18px;
  width: 12px;
  font-size: 10px;
  padding: 1px;
}
.weight {
  color: #00a;
  margin-left: 3px;
  margin-right: 3px;
}
.chessboardext .comment {
  margin-left: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chessboardext .comment button {
  margin-top: 3px;
}
.chessboardext .comment textarea {
  width: 300px;
  padding: 5px;
  font-size: 16px;
}
.chessboardext .canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 5px;
}
.chessboardext .canvas .controls {
  margin-top: 5px;
}
.chessboardext .canvas button {
  margin-left: 5px;
  margin-right: 5px;
}
.chessboardext .canvas .exportlink {
  margin-left: 5px;
  margin-right: 5px;
}
.chessboardext .logincont {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chessboardext .login {
  display: flex;
  flex-direction: row;
  align-items: center;
  border: none;
  padding: 3px;
  background-color: #ccc;
  padding-left: 10px;
  padding-right: 12px;
}
.chessboardext .login button {
  margin-right: 10px;
}
</style>
