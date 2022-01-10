<script lang="ts">
declare let login: any;
declare let logout: any;

import {
  Tabpane,
  Perscombo,
  Perscheck,
  Historytext,
  MarkdownEditor,
  Link,
  Iconbutton,
  Canvas,
  drawBoard,
  Target,
  Button,
  Tooltip,
  LichessBook,
} from "../index";

import {
  getLichessGames,
  VARIANTS,
  toExplorerVariant,
  toChessopsVariant,
  getGame,
} from "../lichess";

import { SvgNode } from "./SvgNode";

import * as fetchclient from "@publishvue/fetchclient";

import { setLocal, getLocal, px, uid, pause, scoreColor } from "../utils";

import { playAudio } from "../assets";

import _ from "lodash";

import { defineComponent, h, ref, onMounted, reactive } from "vue";

import {
  Game,
  Pos,
  UciEngineBrowser,
  INFINITE,
  storeKey,
  MOVE_RATINGS,
  RichLegalSan,
  DepthItem,
  AnalysisInfo,
  GameNode_,
} from "@publishvue/chessopsnpmts";

import { Chessground } from "@publishvue/chessground";

import { SmartStore } from "@publishvue/smartstore";

const sm = new SmartStore();

const ENGINE_BAR_THRESOLD = 500;

const DEFAULT_PREFS: any = {
  multipv: 5,
  selectedgameid: "",
  size: 480,
  flip: false,
  autoexport: false,
  variant: "chess",
  autonameupload: false,
  exportcoords: false,
  minanalysisdepth: 10,
  forwardanalyze: false,
  editoropen: false,
  maxgames: 100,
  toanalyzeend: false,
  trainlevel: 9,
  openingdepth: 20,
  lastloadedplayer: "",
};

let popupDiv: any;
let train: "off" | "white" | "black" = "off";
let trainRoot: any = undefined;
let analyzeLimit = INFINITE;

const DEFAULT_ID = "mainboard";

let storageId = DEFAULT_ID;

function storageKey(key: string) {
  return storageId + "/" + key;
}

function getPref(key: string) {
  return getLocal(storageKey(key), DEFAULT_PREFS[key]);
}

function getPrefInt(key: string) {
  return parseInt(getPref(key));
}

function setPref(key: string, value: any) {
  setLocal(storageKey(key), value);
}

let lichessGames: any[] = [];
let lichessUser: any = "";

let engine: any = null;

const sizes = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
  const size = 240 + i * 40;
  return {
    display: `${size} x ${size}`,
    value: size,
  };
});

export default defineComponent({
  name: "ChessboardExt",
  props: {
    id: {
      type: String,
      default: DEFAULT_ID,
    },
    size: {
      type: Number,
      default: 320,
    },
  },
  setup(props, context) {
    storageId = props.id;

    DEFAULT_PREFS.size = props.size;
    let size: number = getPref("size") as number;
    setPref("size", size);

    const canvas = new Canvas(size, size);

    const game_ = Game();
    const gameJson = localStorage.getItem(storageKey("game")) || "";
    game_.parse(gameJson);

    const game = reactive(game_);

    function effMultipv(node: any) {
      const pos = Pos().setVariant(game.variant).setFen(node.fen);
      return Math.min(pos.allLegalSans().length, getPref("multipv"));
    }

    let board: any = undefined;

    let shapes: any = [];

    let shouldGo: boolean = false;
    let shouldToDepth: boolean = false;

    const setUp = _.debounce(setUpFunc, 200);
    //const setUp = setUpFunc

    function drawBoardFunc() {
      drawBoard(
        ".maplebackground",
        game.pos.pos.board,
        game.current.genUci,
        game.current.shapes,
        size,
        getFlip(),
        canvas,
        getPref("exportcoords")
      );
    }

    const debounceDrawBoard = _.debounce(drawBoardFunc, 500);

    function scrollCurrentNodeIntoView() {
      try {
        const currEl = document.getElementById(game.current.id) as any;
        currEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "start",
        });
      } catch (err) {}
    }

    const debounceScrollCurrentNodeIntoView = _.debounce(
      scrollCurrentNodeIntoView,
      500
    );

    const innerContainerRef: any = ref(0);

    type LogDisposition = "log" | "info" | "ok" | "warn" | "err";

    class LogItem_ {
      time: number = new Date().getTime();
      doneTime: number = 0;
      msg: string = "";
      disposition: LogDisposition = "log";
      parentLog: Logs = new Logs();
      id: number = 0;
      elapsed: number = 0;
      isDone() {
        return this.doneTime > 0;
      }
      setMsg(msg: string) {
        this.msg = msg;
        return this;
      }
      setDisposition(disposition?: LogDisposition) {
        this.disposition = disposition || "log";
        return this;
      }
      setParentLog(parentLog?: Logs) {
        this.parentLog = parentLog || new Logs();
        return this;
      }
      setId(id?: number) {
        this.id = id || 0;
        return this;
      }
      done(disposition?: LogDisposition) {
        const cloned = this.clone()
          .setDisposition(disposition || this.disposition)
          .setDoneTime(new Date().getTime());

        if (this.parentLog) {
          this.parentLog.logItem(cloned);
        }

        return cloned;
      }
      setTime(time?: number) {
        this.time = time || new Date().getTime();
        return this;
      }
      setDoneTime(doneTime?: number) {
        this.doneTime = doneTime || 0;
        return this;
      }
      effTime() {
        return this.isDone() ? this.doneTime : this.time;
      }
      doneStatus() {
        if (this.disposition === "ok") {
          return "done ok";
        }
        if (this.disposition === "err") {
          return "failed";
        }
        if (this.disposition === "warn") {
          return "done with warning";
        }
        return "done";
      }
      renderHtml() {
        const timeStamp = `<span class="vue3complib logmsg time">${this.effTime()}</span>`;
        const doneMsg = this.isDone()
          ? `[ <span class="vue3complib logmsg ${
              this.disposition
            }">${this.doneStatus()}, took ${this.doneTime - this.time}</span> ]`
          : "";

        return [
          `<span class="vue3complib logmsg id">${this.id}</span>`,
          ":",
          timeStamp,
          ":",
          `<span class="vue3complib logmsg ${this.disposition}">${this.msg}</span>`,
          doneMsg,
        ].join(" ");
      }
      clone() {
        return LogItem(
          this.msg,
          this.disposition,
          this.parentLog,
          this.id,
          this.time,
          this.doneTime
        );
      }
    }

    function LogItem(
      msg: string,
      disposition?: LogDisposition,
      parentLog?: Logs,
      id?: number,
      time?: number,
      doneTime?: number
    ) {
      return new LogItem_()
        .setMsg(msg)
        .setDisposition(disposition)
        .setParentLog(parentLog)
        .setId(id)
        .setTime(time)
        .setDoneTime(doneTime);
    }

    class Logs {
      buffer: LogItem_[] = [];
      capacity: number = 100;
      currentId: number = 0;
      setCapacity(capacity: number) {
        this.capacity = capacity;
        return this;
      }
      logItem(item: LogItem_) {
        this.buffer.unshift(item);
        while (this.buffer.length > this.capacity) {
          this.buffer.pop();
        }
        this.currentId++;
        return this;
      }
      log(msg: string, disposition?: LogDisposition) {
        const item = LogItem(msg, disposition, this, this.currentId);
        this.logItem(item);
        return item;
      }
      renderHtml() {
        return this.buffer.map((item) => item.renderHtml()).join("<br>");
      }
    }

    const react = reactive({
      size: 480,
      controlButtonSize: 16,
      selectedGameId: getPref("selectedgameid"),
      logs: [],
      minAnalysisDepth: getPrefInt("minanalysisdepth"),
      richLegalSans: [],
      loadedGame: undefined,
      completed: [],
      analyzedFen: "",
      state: "ready",
      lichessGames,
      pgnText: "",
      commentText: "",
      fenText: "",
      mainContainerOpacity: 0,
      markdownLink: "",
      dbInfoSize: 0,
      dbInfoCount: 0,
      avgDocSize: 0,
      markdownEditorOpen: getPref("editoropen"),
      saveTargets: ["Default"],
      selectedTarget: "Default",
      variantUpdateUid: "",
      variantUpdateSelected: "",
      showPopup: "none",
      popupMsg: "",
      popupBackground: "#eee",
      showLegals: true,
      updateAnalysisUid: uid(),
      devLogs: new Logs(),
      selectedCaption: "",
    });

    function storeSaveTargets() {
      sm.setItem(
        props.id + "/gamesavetargets",
        JSON.parse(
          JSON.stringify({
            targets: react.saveTargets,
            selected: react.selectedTarget,
          })
        )
      );
    }

    async function postDb(
      action: string,
      docId?: string,
      doc?: string
    ): Promise<any> {
      const dbClient = new fetchclient.FetchClient(window.fetch.bind(window), {
        apiBaseUrl: "/.netlify/functions",
        method: "POST",
      });

      return dbClient.fetchJson(
        "netlifyindex",
        {},
        {
          LICHESS_TOKEN: localStorage.getItem("LICHESS_TOKEN") || "",
          ACTION: action,
          DOCUMENT_ID: docId || "",
          DOCUMENT: doc || "",
        }
      );
    }

    function calcEngineBarStyle(): any {
      if (!game.current.analysis) {
        return {
          top: "0px",
          height: "0px",
          visibility: "hidden",
        };
      }

      const score: any = game.current.analysis.pvItems[1].scoreNumerical;

      let scoreNormal =
        Math.max(Math.min(score, ENGINE_BAR_THRESOLD), -ENGINE_BAR_THRESOLD) +
        ENGINE_BAR_THRESOLD;

      const turn = game.current.fen.split(" ")[1] === "w";
      const flip = getPref("flip");

      if ((turn && flip) || (!turn && !flip))
        scoreNormal = 2 * ENGINE_BAR_THRESOLD - scoreNormal;

      const height = (scoreNormal / (2 * ENGINE_BAR_THRESOLD)) * react.size;
      const top = react.size - height;

      return {
        top: `${top}px`,
        height: `${height}px`,
        visibility: "visible",
      };
    }

    function nodeStoreKey(node: any): string {
      return `gamenode__${storeKey(node.parentGame.variant, node.fen)}`;
    }

    function storeNode(node: any) {
      const blob = JSON.parse(node.stringify());
      const analysis: any = blob.analysis;
      if (analysis) {
        for (let i = 1; i < analysis.pvItems.length; i++) {
          const item = analysis.pvItems[i];
          delete item["parsedPv"];
          delete item["scoreType"];
          delete item["scoreValue"];
          item.pvUcis = _.take(item.pvUcis, 1);
        }
      }
      blob.analysis = analysis;
      const nsk = nodeStoreKey(node);
      sm.setItem(nsk, blob);
    }

    function highlightEngineMoves() {
      if (!game.current.analysis) return;
      const shapes = game.current.analysis.pvItems
        .slice(1)
        .map((item: any, i: number) => {
          const orig = item.pvUcis[0].substring(0, 2);
          const dest = item.pvUcis[0].substring(2, 4);
          const brush: any = ["green", "blue", "yellow", "red", "red"][i];
          return { orig, dest, brush };
        });
      board.setShapes(shapes);
    }

    function highlightBook() {
      const shapes = _.toPairs(game.current.weights)
        .filter((item: any) => item[1][1] > 0)
        .map((item: any) => {
          const uci = game.pos.sanToUci(item[0]) || "e2e4";
          const orig = uci.substring(0, 2);
          const dest = uci.substring(2, 4);
          const brush: any = [
            "green",
            "green",
            "green",
            "green",
            "blue",
            "blue",
            "blue",
            "red",
            "red",
            "red",
          ][10 - item[1][1]];
          return { orig, dest, brush };
        });
      board.setShapes(shapes);
    }

    function isAnalyzedToDepth(
      node: any,
      depth: number
    ): DepthItem | boolean | undefined {
      const analysis = node.analysis;

      const plies = node.id.split("_").length;
      const openingDepth = getPrefInt("openingdepth");

      if (!getPref("forwardanalyze") && shouldToDepth) {
        if (plies > openingDepth) return true;
      }

      if (
        analysis === undefined ||
        analysis.multipv < effMultipv(node) ||
        analysis.depth < depth
      ) {
        return undefined;
      }

      return analysis;
    }

    async function analyzeToDepth(node: any, depth: number): Promise<any> {
      const depthItem = await isAnalyzedToDepth(node, depth);

      if (depthItem) {
        return Promise.resolve(depthItem);
      }

      if (game.pos.allLegalSans().length === 0) {
        return Promise.resolve(true);
      }

      return new Promise((resolve: any) => {
        engine.go({
          variant: game.variant,
          fen: node.fen,
          multipv: getPref("multipv"),
          depth,
          bestmoveCallback: (info: any) => {
            resolve(info);
          },
        });
      });
    }

    function calcGameOpacity(g: any): number {
      const oppRating = g.opp.rating as number;
      const myRating = g.me.rating as number;
      const diff = myRating - oppRating;

      if (diff > 600) return 0.4;
      if (diff > 400) return 0.6;
      if (diff > 200) return 0.8;
      return 1.0;
    }

    try {
      engine = new UciEngineBrowser(
        "/stockfish/stockfish.wasm.js",
        (analysisInfo: AnalysisInfo) => {
          react.state = analysisInfo.state;
          react.analyzedFen = analysisInfo.analyzedFen;
          if (analysisInfo.state === "ready") {
            board.setShapes([]);
          }
          const highest = new DepthItem(analysisInfo.highestCompletedDepth);
          if (!highest) return;
          if (highest.depth < getPrefInt("minanalysisdepth")) return;
          const analyzedNode = _.values(game.nodes).find(
            (node) => node.fen === analysisInfo.analyzedFen
          );
          if (!analyzedNode) return;
          analyzedNode.analysis = highest;
          storeNode(analyzedNode);
          store();
          if (analysisInfo.analyzedFen !== game.current.fen) {
            board.setShapes([]);
            return;
          }
          const completed = highest.pvItems;
          react.completed = completed as any;
          if (analysisInfo.state === "running") {
            highlightEngineMoves();
          }
        }
      );
      engine.spawn();
      // browser engine does not send command while starting up
      // we have to do it manually, hack
      setTimeout(() => {
        engine.issueCommand("uci");
      }, 5000);
    } catch (err) {
      console.error(err);
    }

    function go() {
      if (analyzeLimit !== INFINITE) {
        if (isAnalyzedToDepth(game.current, analyzeLimit)) {
          return;
        }
      }

      engine.go({
        variant: game.variant,
        fen: game.current.fen,
        depth: analyzeLimit,
        multipv: getPref("multipv"),
      });
    }

    function store() {
      const json = game.stringify();
      localStorage.setItem(storageKey("game"), json);
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

    function resize(setSize: number) {
      size = parseInt(`${setSize}`);
      canvas.resize(size, size);
      react.size = size;
      react.controlButtonSize = Math.max(size / 16, 16);
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
      return getPref("flip") as boolean;
    }

    const debounceSetup = _.debounce(setUp, 500);

    function setFlip(flip: boolean) {
      board.set({
        orientation: flip ? "black" : "white",
      });
      setPref("flip", flip);

      game.props.flip = flip;

      debounceSetup();
    }

    function isTrainOppTurn() {
      if (train === "off") return false;
      const turn = game.current.fen.split(" ")[1] === "w" ? "white" : "black";
      return (
        (train === "white" && turn === "black") ||
        (train === "black" && turn === "white")
      );
    }

    function isTrainMyTurn() {
      if (train === "off") return false;
      const turn = game.current.fen.split(" ")[1] === "w" ? "white" : "black";
      return (
        (train === "black" && turn === "black") ||
        (train === "white" && turn === "white")
      );
    }

    function weightedSans() {
      const sans: string[] = [];
      for (let san in game.current.weights) {
        const weight = game.current.weights[san][1];
        if (weight > 0) {
          sans.push(san);
        }
      }
      return sans;
    }

    function checkTrain() {
      if (train === "off") return;
      if (isTrainOppTurn()) {
        const sans = weightedSans();
        if (sans.length) {
          const selectedSan = sans[Math.floor(Math.random() * sans.length)];

          game.playSan(selectedSan);
        } else {
          game.setCurrent(trainRoot);
          popup("No rated move. Line completed.", "ok");
        }
        setUp();
      }
    }

    function drawChart() {
      const e: any = document.getElementById(props.id + "/analysissvg");

      const height = size - 5;

      const mainline = game.mainLine();

      const bar = 22;

      const width = mainline.length * bar;

      while (e.firstChild) {
        e.removeChild(e.firstChild);
      }

      e.style.width = px(width);
      e.style.height = px(height);
      e.style.backgroundColor = "#eee";

      const svg = SvgNode(width, height);

      let currentX = 0;

      mainline.forEach((node, i) => {
        const x = i * bar;
        const centerY = height / 2;

        const isCurrent = node.id === game.current.id;

        if (isCurrent) currentX = x;

        const rect: any = svg.addRectangle(
          x + 2,
          0,
          bar - 4,
          height,
          node.analysis ? "#ddf" : "#eee",
          isCurrent ? "#0a0" : "#ddd"
        );
        rect.setAttributeNS(null, "nodeid", node.id);
        rect.addEventListener("click", () => {
          game.setCurrent(node);
          setUp();
        });

        let text = ((node.genSan || "*") + " ").padEnd(8, "_") + " ";

        if (node.analysis) {
          let score = node.analysis.pvItems[1].scoreNumerical;
          if (getPref("flip")) score = -score;
          if (node.fen.split(" ")[1] === "b") score = -score;
          text += `( ${score} )`;
          const logScore = Math.log10(Math.abs(score as number));
          const logHeight =
            (((logScore / 4) * height) / 2) * Math.sign(score as number);
          const color =
            score > 0
              ? `rgb(0,${(logScore / 4) * 255},0)`
              : `rgb(${(logScore / 4) * 255},0,0)`;
          const rect: any = svg.addRectangle(
            x + 2,
            score > 0 ? height / 2 - logHeight : height / 2,
            bar - 4,
            Math.abs(logHeight),
            color,
            "#000"
          );
          rect.setAttributeNS(null, "nodeid", node.id);
          rect.addEventListener("click", () => {
            game.setCurrent(node);
            setUp();
          });
        } else {
          text += "( ? )";
        }

        const textX = x + bar / 2 + 3;
        const textY = height - 5;

        const san = svg.addText(textX, textY, text);
        san.setAttributeNS(null, "transform", `rotate(-90,${textX},${textY})`);
        san.setAttributeNS(null, "font-family", "monospace");
        san.setAttributeNS(null, "font-weight", "bold");
        san.setAttributeNS(null, "stroke", node.analysis ? "#aaf" : "#aaa");
        san.setAttributeNS(null, "nodeid", node.id);
        san.addEventListener("click", () => {
          game.setCurrent(node);
          setUp();
        });
      });

      e.appendChild(svg.node);

      const scrollLeft = currentX > size / 2 ? currentX - size / 2 : 0;

      if (
        getLocal(storageKey("maintabpane"), {}).selectedTabCaption === "Chart"
      ) {
        e.parentElement.parentElement.parentElement.scrollLeft = scrollLeft;
      }
    }

    // setUp
    function setUpFunc() {
      board.set({
        fen: game.reportFen(),
      });

      drawChart();

      react.markdownLink = "";

      const nsk = nodeStoreKey(game.current);

      sm.getItem(nsk, undefined).then((storedNode: any) => {
        updateNode(game.current, storedNode);

        react.completed = (
          game.current.analysis ? game.current.analysis.pvItems : []
        ) as any;

        react.pgnText = game.reportPgn(false);
        react.commentText = game.current.comment;
        react.fenText = game.reportFen();

        board.setShapes(JSON.parse(JSON.stringify(game.current.shapes)));
        highlightMove(game.current.genUci);
        movable();

        drawable();

        if (getPref("autoexport")) debounceDrawBoard();

        debounceScrollCurrentNodeIntoView();

        react.richLegalSans = game.richLegalSans() as any;

        store();

        checkTrain();

        if (shouldGo) {
          go();
        }
      });
    }

    function setVariant(setVariant?: string) {
      const variant = setVariant || getPref("variant");
      game.setVariant(variant, undefined);
      setUp();
    }

    function storeShapes() {
      game.current.shapes = board.state.drawable.shapes;
      storeNode(game.current);
      store();
    }

    function clearShapes() {
      game.current.shapes = [];
      board.setShapes([]);
      storeNode(game.current);
      store();
      if (getPref("autoexport")) {
        drawBoardFunc();
      }
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

        if (isTrainMyTurn()) {
          const sans = weightedSans();
          if (!sans.length) {
            game.setCurrent(trainRoot);
            popup("No rated move. Line completed.", "ok");
          } else {
            let maxWeight = 0;
            for (let san of sans) {
              if (game.current.weights[san][1] > maxWeight)
                maxWeight = game.current.weights[san][1];
            }
            const bestSans = sans.filter(
              (san) => game.current.weights[san][1] === maxWeight
            );
            if (maxWeight < getPrefInt("trainlevel")) {
              game.setCurrent(trainRoot);
              popup("No strong enough move. Line completed.", "ok");
            } else {
              if (!game.current.weights[san || ""]) {
                popup("Wrong move ! Unrated.", "err");
              } else {
                const weight = game.current.weights[san || ""][1];
                if (weight < getPrefInt("trainlevel")) {
                  popup(
                    `Weak move. Rated ${weight}. Minimum required rating is ${getPrefInt(
                      "trainlevel"
                    )}.<hr> If you want to accept this move, change train level in Preferences.`,
                    "err",
                    3000
                  );
                } else {
                  if (weight < maxWeight) {
                    popup(
                      `Not the strongest possible move. Rated ${weight}. <hr> Better move(s) <b>${bestSans.join(
                        " , "
                      )}</b>. Rated ${maxWeight} .`,
                      "warn",
                      3000
                    );
                  }
                  game.playSan(san || "");
                  playAudio("tabclick");
                }
              }
            }
          }
        } else {
          game.playUci(legalUci);
          playAudio("tabclick");
        }
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

    function drawable() {
      board.set({
        drawable: {
          onChange: () => {
            if (getPref("autoexport")) {
              storeShapes();
              drawBoardFunc();
            }
          },
        },
      });
    }

    function getCurrentGameIndex(): number {
      const currentGameIndex = react.lichessGames.findIndex(
        (g: any) => g.id === react.selectedGameId
      );
      return currentGameIndex;
    }

    function updateNode(node: any, storedNode: any) {
      try {
        if (!node) return;
        if (!storedNode) return;
        storedNode.parentGame = { variant: node.parentGame.variant };
        if (nodeStoreKey(storedNode) !== nodeStoreKey(node)) return;

        node.comment = storedNode.comment;
        node.shapes = storedNode.shapes;

        node.analysis = storedNode.analysis
          ? new DepthItem(storedNode.analysis)
          : undefined;

        if (storedNode.weights)
          for (let san in storedNode.weights) {
            if (!node.weights[san]) node.weights[san] = [0, 0, 0];
            node.weights[san][1] = storedNode.weights[san][1];
            node.weights[san][2] = storedNode.weights[san][2];
          }
      } catch (err) {
        console.error("error updating node", err);
      }
    }

    function loadAnalyzedNodesLocal() {
      const nodeIds = Object.keys(game.nodes);
      const nodeStoreKeys = nodeIds.map((id) => nodeStoreKey(game.nodes[id]));
      const getPromises = nodeStoreKeys.map((key) =>
        sm.getItem(key, undefined)
      );

      const itemNodes = react.devLogs.log("getting nodes from store", "info");

      Promise.all(getPromises).then((nodes) => {
        itemNodes.done("ok");

        nodes.forEach((node) => {
          if (node) updateNode(game.nodes[node.id], node);
        });

        if (getPref("toanalyzeend")) {
          toAnalyzeEnd();
        }
      });
    }

    function loadAnalyzedNodes() {
      const nodeIds = Object.keys(game.nodes);
      const nodeStoreKeys = nodeIds.map((id) => nodeStoreKey(game.nodes[id]));
      const jointNodeStoreKeys = nodeStoreKeys.join(",");

      const itemDb = react.devLogs.log("getting nodes from db", "info");

      postDb("getmany", jointNodeStoreKeys).then((result) => {
        itemDb.done("ok");

        try {
          for (let node of result) {
            sm.setItem(node.id, node);
          }
        } catch (err) {}

        loadAnalyzedNodesLocal();
      });

      loadAnalyzedNodesLocal();
    }

    function setGame(g: any, username?: string) {
      react.loadedGame = g;
      setVariant(toChessopsVariant(g.variant));
      react.variantUpdateUid = uid();
      react.variantUpdateSelected = g.variant;
      game.playSans(g.moves);
      game.toBegin();
      react.selectedGameId = g.id;
      setPref("selectedgameid", g.id);
      setFlip(g.black.name === (username || lichessUser));
      loadAnalyzedNodes();
      react.selectedCaption = `Analysis|${Math.random()}`;
      setUp();
    }

    async function loadLichessGame(id: string, username: string) {
      const g = await getGame(id, username);

      setGame(g, username);
    }

    function stepGame(dir: number, cyclic: boolean) {
      let currentGameIndex = getCurrentGameIndex();
      const numGames = react.lichessGames.length;
      if (currentGameIndex < 0) {
        if (numGames) {
          setGame(react.lichessGames[0]);
          return true;
        } else {
          return false;
        }
      }
      currentGameIndex += dir;
      if (currentGameIndex >= numGames) {
        if (!cyclic) return false;
        setGame(react.lichessGames[0]);
        return true;
      }
      if (currentGameIndex < 0) {
        if (!cyclic) return false;
        setGame(react.lichessGames[numGames - 1]);
        return true;
      }
      setGame(react.lichessGames[currentGameIndex]);
      return true;
    }

    function toAnalyzeEnd() {
      if (game.root.isTerminal) return;
      let ptr = game.root as GameNode_;
      let ptrNext = game.root.next();
      let ok = true;
      while (ok && ptr.getMyWeight(ptrNext.genSan) !== 0) {
        ptr = ptrNext;
        if (ptr.isTerminal) {
          ok = false;
        } else {
          ptrNext = ptr.next();
        }
      }
      game.setCurrent(ptr);
      setUp();
    }

    function scrollCurrentGameIntoView() {
      try {
        const gameEl = document.querySelector(
          ".chessboardext .lichessgames .lichessgame.selected"
        ) as any;

        setTimeout(() => {
          gameEl.scrollIntoView({ block: "center" });
        }, 0);
      } catch (err) {
        console.error(err);
      }
    }

    async function loadTargets() {
      try {
        const saveTargets = (await sm.getItem(
          props.id + "/gamesavetargets",
          undefined
        )) || {
          targets: ["Default"],
          selected: "Default",
        };
        react.saveTargets = saveTargets.targets || ["Default"];
        react.selectedTarget = saveTargets.selected || "Default";
      } catch (err) {
        console.log("problem loading save targets", err);
      }
    }

    async function loadLogs() {
      try {
        const logJson = await postDb("log", "vueanalysisboard", "index");
        react.logs = logJson;
        const collSizeJson = await postDb("collsize");
        react.dbInfoSize = typeof collSizeJson === "number" ? collSizeJson : 0;
        const countDocsJson = await postDb("countdocs");
        react.dbInfoCount =
          typeof countDocsJson === "number" ? countDocsJson : 0;
        react.avgDocSize = react.dbInfoCount
          ? Math.floor(collSizeJson / react.dbInfoCount)
          : 0;
      } catch (err) {
        console.error("problem with log", err);
      }
    }

    function loadTop() {
      setGame(react.lichessGames[0]);
      playAudio("tabclick");
    }

    async function loadLichessGames(username?: string, doLoadTop?: boolean) {
      try {
        const [gotLichessUser, gotLichessGames] = await getLichessGames({
          max: getPrefInt("maxgames"),
          variant: game.variant,
          username,
        });

        lichessUser = gotLichessUser;
        setPref("lastloadedplayer", lichessUser);
        react.lichessGames = gotLichessGames;

        if (doLoadTop) loadTop();
      } catch (err) {
        console.error("could not get lichess user and games", err);
      }
    }

    function prepareBoard() {
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

      setTimeout(() => {
        setFlip(!getFlip());
        setUp();
      }, 100);

      setTimeout(() => {
        setFlip(!getFlip());
        setUp();
        react.mainContainerOpacity = 1;
      }, 1000);
    }

    function popup(msg: string, disposition?: string, delay?: number) {
      react.showPopup = "block";
      react.popupMsg = msg;
      react.popupBackground = "#eee";
      if (disposition === "ok") react.popupBackground = "#afa";
      if (disposition === "err") {
        react.popupBackground = "#faa";
        playAudio("failed");
      }
      if (disposition === "info") react.popupBackground = "#aaf";
      if (disposition === "warn") react.popupBackground = "#ffa";
      setTimeout(() => {
        react.showPopup = "none";
      }, delay || 1000);
    }

    onMounted(async () => {
      const logItem = react.devLogs.log("opening smartstore", "info");
      await sm.open();
      logItem.done("ok");

      resize(size);

      prepareBoard();

      setTimeout(() => loadTargets(), 50);

      setTimeout(() => loadLogs(), 100);

      setTimeout(() => loadLichessGames(getPref("lastloadedplayer")), 150);

      popup("Welcome to Vue Analysis Board !", "ok", 3000);
    });

    return () => {
      const innerContainer = h(
        "div",
        {
          ref: innerContainerRef,
          style: {
            width: px(react.size),
            height: px(react.size),
          },
          class: ["maplebackground", "is2d"],
        },
        []
      );

      const variantCombo = h(Tooltip, { tooltip: "Select Variant" }, () =>
        h(Perscombo, {
          id: storageKey("variant"),
          options: VARIANTS,
          updateUid: react.variantUpdateUid,
          updateSelected: react.variantUpdateSelected,
          onPerscombochanged: (event: any) => {
            setVariant(event.value);
          },
        })
      );

      const sizeCombo = h(Tooltip, { tooltip: "Select Board_Size" }, () =>
        h(Perscombo, {
          id: storageKey("size"),
          options: sizes,
          onPerscombochanged: (event: any) => {
            resize(event.value);
          },
        })
      );

      const resetButton = h(Button, {
        color: "red",
        icon: "undo",
        tooltip: "Reset game",
        class: "control",
        size: react.controlButtonSize,
        onClick: () => {
          react.loadedGame = undefined;
          setVariant();
          playAudio("failed");
        },
      });

      const openExplorerButton = h(Button, {
        color: "green",
        icon: "openfolder",
        tooltip: "Open lichess_analysis",
        class: "control",
        size: react.controlButtonSize,
        onClick: () => {
          const url = `https://lichess.org/analysis/${toExplorerVariant(
            game.variant
          )}/${game.reportFen()}`;
          playAudio("tabclick");
          window.open(url, "_blank");
        },
      });

      const flipButton = h(Button, {
        color: "green",
        icon: "spinner",
        tooltip: "Flip board",
        class: "control",
        size: react.controlButtonSize,
        onClick: () => {
          setFlip(!getFlip());
          playAudio("tabclick");
        },
      });

      const storeShapesButton = h(Button, {
        tooltip: "Store Shapes",
        caption: "Store >",
        class: ["smallbutton", "greenbutton"],
        style: {
          "margin-left": px(10),
        },
        onClick: () => {
          storeShapes();
          playAudio("tabclick");
        },
      });

      const clearShapesButton = h(Button, {
        tooltip: "Clear Shapes",
        caption: "Shapes X",
        class: ["smallbutton", "redbutton"],
        onClick: () => {
          clearShapes();
          playAudio("failed");
        },
      });

      const upperControls = h(
        "div",
        {
          class: "uppercontrols",
        },
        [openExplorerButton, flipButton, variantCombo, sizeCombo, resetButton]
      );

      const tobeginButton = h(Button, {
        color: "blue",
        icon: "tobegin",
        tooltip: "Game to_begin",
        class: "control",
        size: react.controlButtonSize,
        onClick: () => {
          if (game.toBegin()) {
            setUp();
            playAudio("tabclick");
          } else {
            playAudio("failed");
          }
        },
      });

      const backButton = h(Button, {
        color: "green",
        icon: "arrowleft",
        tooltip: "Game back",
        class: "control",
        size: react.controlButtonSize,
        onClick: () => {
          if (game.back()) {
            setUp();
            playAudio("tabclick");
          } else {
            playAudio("failed");
          }
        },
      });

      const forwardButton = h(Button, {
        color: "green",
        icon: "arrowright",
        tooltip: "Game forward",
        class: "control",
        size: react.controlButtonSize,
        onClick: () => {
          if (game.forward()) {
            setUp();
            playAudio("tabclick");
          } else {
            playAudio("failed");
          }
        },
      });

      const toendButton = h(Button, {
        color: "blue",
        icon: "toend",
        tooltip: "Game to_end",
        class: "control",
        size: react.controlButtonSize,
        onClick: () => {
          if (game.toEnd()) {
            setUp();
            playAudio("tabclick");
          } else {
            playAudio("failed");
          }
        },
      });

      const delButton = h(Button, {
        color: "red",
        icon: "cross",
        tooltip: "Delete move",
        class: "control",
        size: react.controlButtonSize,
        onClick: () => {
          if (game.del()) {
            setUp();
            playAudio("tabclick");
          } else {
            playAudio("failed");
          }
        },
      });

      const trainCombo = h(
        "select",
        {
          class: "train",
          onChange: (ev: any) => {
            train = ev.target.value;
            if (train != "off") {
              react.showLegals = false;

              trainRoot = game.current;
              setFlip(train === "black");
              checkTrain();
            } else {
              react.showLegals = true;
            }
          },
        },
        [
          h("option", { value: "off" }, ["Train Off"]),
          h("option", { value: "white" }, ["Train White"]),
          h("option", { value: "black" }, ["Train Black"]),
        ]
      );

      const lowerControls = h(
        "div",
        {
          class: ["lowercontrols"],
        },
        [
          tobeginButton,
          backButton,
          forwardButton,
          toendButton,
          delButton,
          storeShapesButton,
          clearShapesButton,
          trainCombo,
        ]
      );

      const engineBarDiv = h(
        "div",
        {
          style: calcEngineBarStyle(),
          class: {
            bar: true,
          },
        },
        []
      );

      const engineBarContDiv = h(
        "div",
        {
          style: {
            height: px(react.size),
          },
          class: {
            enginebarcont: true,
            showbar: game.current.analysis,
          },
        },
        [engineBarDiv]
      );

      const outerContainer = h(
        "div",
        {
          class: "outercontainer",
          style: {
            width: px(react.size),
            height: px(react.size),
          },
          onMouseover: () => {
            board.setShapes(JSON.parse(JSON.stringify(game.current.shapes)));
          },
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

      const boardWithBarContainer = h(
        "div",
        {
          class: "withbar",
        },
        [outerContainer, engineBarContDiv]
      );

      const fenInput = h(
        "input",
        {
          type: "text",
          style: {
            width: px(react.size),
          },
          class: {
            feninput: true,
          },
          value: react.fenText,
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

      const gameHeadingDiv = h(
        "div",
        {
          style: {
            width: px(react.size - 20),
            backgroundColor: react.loadedGame
              ? {
                  "1-0": "#dfd",
                  "1/2-1/2": "#ffa",
                  "0-1": "#faa",
                }[(react.loadedGame as any).me.result as string]
              : "#fff",
            opacity: react.loadedGame ? calcGameOpacity(react.loadedGame) : 1,
          },
          class: ["heading"],
        },
        [react.loadedGame ? (react.loadedGame as any).gameInfo : ""]
      );

      const vertContainer = h(
        "div",
        {
          class: "vertcont",
        },
        [
          upperControls,
          gameHeadingDiv,
          boardWithBarContainer,
          fenInput,
          lowerControls,
        ]
      );

      const legalSansDiv = h(
        "div",
        {
          class: ["legalsans"],
          style: {
            height: px(react.size + 50),
          },
          onMouseover: () => {
            highlightBook();
          },
          onMouseout: () => {
            board.setShapes([]);
          },
        },
        ((react.showLegals ? react.richLegalSans : []) as RichLegalSan[]).map(
          (item: RichLegalSan, i: number) =>
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
                    onClick: (ev: any) => {
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
                weightWidget(item.weights[1], (dir: number) => {
                  let newWeight = item.weights[1] + dir;
                  if (newWeight < 0) newWeight = 10;
                  if (newWeight > 10) newWeight = 0;
                  item.weights[1] = newWeight;
                  game.current.setMyWeight(item.san || "", newWeight);
                  react.richLegalSans = game.richLegalSans() as any;
                  storeNode(game.current);
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
          style: {
            height: px(react.size + 50),
          },
        },
        (react.showLegals ? game.mainLine().slice().reverse() : []).map(
          (node: any) =>
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
                      MOVE_RATINGS[node.prev().getMyWeight(node.genSan)],
                      {
                        selected: node.id === game.current.id,
                      },
                    ],
                    onClick: (ev: any) => {
                      if (ev.ctrlKey) {
                        let ptr = node;
                        let ok = true;
                        do {
                          if (ptr.isRoot) {
                            ok = false;
                          } else {
                            const genSan = ptr.genSan;
                            ptr = ptr.prev();
                            if (ptr.getMyWeight(genSan, 1) === 0) {
                              ptr.setWeight(genSan, 1, 10);
                            }
                            storeNode(ptr);
                          }
                        } while (ok);
                        return;
                      }
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
                  [
                    node.getChildNodes().length > 1
                      ? `(${node.getChildNodes().length})${node.displaySan}`
                      : node.displaySan,
                  ]
                ),
                weightWidget(
                  node.prev().getMyWeight(node.genSan),
                  (dir: number) => {
                    let newWeight = node.prev().getMyWeight(node.genSan) + dir;
                    if (newWeight < 0) newWeight = 10;
                    if (newWeight > 10) newWeight = 0;
                    node.prev().setMyWeight(node.genSan, newWeight);
                    storeNode(node.prev());
                    store();
                    react.richLegalSans = game.richLegalSans() as any;
                  }
                ),
              ]
            )
        )
      );

      const commentTextarea = h(
        "textarea",
        {
          style: {
            width: px(react.size),
            height: px(react.size - 40),
          },
          value: react.commentText,
          onInput: (ev: any) => {
            const comment = ev.target.value;
            game.current.comment = comment;
            storeNode(game.current);
            store();
          },
        },
        []
      );

      const deleteCommentButton = h(Button, {
        caption: "Delete Comment",
        tooltip: "Delete comment",
        class: "redbutton",
        onClick: () => {
          game.current.comment = "";
          storeNode(game.current);
          store();
          setUp();
        },
      });

      const commentDiv = h(
        "div",
        {
          caption: "Notes",
          class: ["comment"],
          icon: "pencil",
          tooltip: "Comment_position",
        },
        [commentTextarea, deleteCommentButton]
      );

      async function uploadBoard() {
        const href = canvas.uploadHref("png");
        const autoName =
          game.variant + "_" + game.current.id.split("_").slice(1).join("_");
        const name = getPref("autonameupload")
          ? autoName
          : window.prompt(
              "Screenshot name ( had better be something that makes valid unix filename, don't use any extension )",
              "board"
            );
        const fileName = `screenshots/${name}.png`;
        const params = {
          token: localStorage.getItem("LICHESS_TOKEN"),
          fileName,
          content: href,
        };
        const req = {
          method: "POST",
          body: JSON.stringify(params),
        };
        const resp: any = await fetch("/.netlify/functions/upload", req);
        const text = await resp.text();
        const username = (document.getElementById("showusernamediv") as any)
          .innerHTML;
        const url = `https://raw.githubusercontent.com/hyperbotauthor/blobs/main/lichess/${username}/${fileName}`;
        window.open(url, "_blank");
        react.markdownLink = `![](${url})`;
      }

      const reportPgnButton = h(Button, {
        tooltip: "Report PGN",
        caption: "PGN",
        onClick: () => {
          const pgn = game.reportPgn(true);
          react.pgnText = pgn;
        },
      });

      const exportCanvasButton = h(Button, {
        caption: "Export",
        tooltip: "Export Screenshot",
        onClick: () => {
          drawBoardFunc();
        },
      });

      const uploadCanvasButton = h(Button, {
        caption: "Upload",
        tooltip: "Upload Screenshot",
        onClick: () => {
          uploadBoard();
        },
      });

      const exportCanvasLink = h(
        Tooltip,
        { tooltip: "Download Screenshot" },
        () =>
          h(
            "a",
            {
              href: "#",
              download: "board.png",
              class: {
                exportlink: true,
              },
              onClick: (ev: any) => {
                ev.stopPropagation();
                ev.target.href = canvas.downloadHref("board", "png");
              },
            },
            ["Download"]
          )
      );

      const openEditorButton = h(Button, {
        caption: "Editor",
        tooltip: "Open Markdown_Editor",
        onClick: () => {
          react.markdownEditorOpen = true;
          setPref("editoropen", true);
        },
      });

      const canvasControlsDiv = h(
        "div",
        {
          class: ["controls"],
        },
        [
          openEditorButton,
          reportPgnButton,
          exportCanvasButton,
          exportCanvasLink,
          uploadCanvasButton,
        ]
      );

      const pgnTextArea = h(
        "textarea",
        {
          value:
            react.pgnText +
            (react.markdownLink ? "\n\n" + react.markdownLink : ""),
          onClick: (ev: any) => {
            ev.target.select();
            document.execCommand("copy");
          },
        },
        []
      );

      const pgnDiv = h(
        "div",
        {
          class: "pgn",
        },
        [pgnTextArea]
      );

      const target = h(Target, {
        targets: react.saveTargets,
        selected: react.selectedTarget,
        colorbuttons: false,
        onTargetchanged: async (ev: any) => {
          if (ev.action === "add") {
            if (ev.target) {
              (react.saveTargets as any).push(ev.target);
              react.selectedTarget = ev.target;
              storeSaveTargets();
            }
          } else if (ev.action === "remove") {
            react.saveTargets = react.saveTargets.filter(
              (name: any) => name !== ev.target
            ) as any;
            react.selectedTarget = "Default";
            storeSaveTargets();
          } else if (ev.action === "saveas") {
            game.props.flip = getPref("flip");
            sm.setItem(props.id + "/savedgames/" + ev.target, game.stringify());
          } else if (ev.action === "loadfrom") {
            const blob = await sm.getItem(
              props.id + "/savedgames/" + ev.target,
              undefined
            );
            if (blob) {
              game.parse(blob);
              setFlip(!!game.props.flip);
              store();
              setUp();
            }
          } else if (ev.action === "selected") {
            react.selectedTarget = ev.target;
            storeSaveTargets();
          }
        },
      });

      const canvasDiv = h(
        "div",
        {
          caption: "Export",
          icon: "arrowright",
          tooltip: "Export",
          class: ["canvas"],
        },
        [canvasControlsDiv, target, canvas.render()]
      );

      const analyzeButton = h(Button, {
        tooltip: "Start engine_analysis",
        caption: "<i>Analyze</i>",
        class: ["greenbutton", "largebutton"],
        onClick: () => {
          shouldGo = true;
          go();
        },
      });

      const stopAnalyzeButton = h(Button, {
        tooltip: "Stop engine_analysis",
        caption: "<i>Stop</i>",
        class: ["redbutton", "largebutton"],
        onClick: () => {
          shouldGo = false;
          shouldToDepth = false;
          analyzeLimit = INFINITE;
          engine.stop();
        },
      });

      async function analyzeToDepthThen(depth: number, forward: boolean) {
        shouldGo = false;
        shouldToDepth = forward;

        if (!isAnalyzedToDepth(game.current, depth) && shouldToDepth)
          await pause(2000);

        await analyzeToDepth(game.current, depth);

        if (forward && shouldToDepth) {
          if (game.forward()) {
            setUp();

            analyzeToDepthThen(depth, forward);
          } else {
            if (!stepGame(1, false)) {
              shouldToDepth = false;
            } else {
              game.toBegin();

              analyzeToDepthThen(depth, forward);
            }
          }
        }
      }

      function analyzeToDepthButton(depth: number, forward: boolean) {
        return h(Button, {
          tooltip: `${forward ? "Forward & " : ""}Analyze To_Depth_${depth} ${
            forward ? "<hr> +_Ctrl For_Continuous_Advance" : ""
          }`,
          class: {
            todepth: true,
            forward,
          },
          caption: `${depth}${forward ? " >" : ""}`,
          onClick: (ev: any) => {
            setPref("forwardanalyze", !ev.ctrlKey);

            if (ev.ctrlKey && !forward) {
              analyzeLimit = depth;
              shouldGo = true;
              go();
              return;
            }

            if (getPref("forwardanalyze") && forward) {
              if (!isAnalyzedToDepth(game.current, depth)) {
                analyzeToDepthThen(depth, false);
              } else if (game.forward()) {
                setUp();
                analyzeToDepthThen(depth, false);
              } else if (game.current.analysis) {
                game.playSan(game.current.analysis.pvItems[1].pvSans[0]);
                setUp();
                analyzeToDepthThen(depth, false);
              } else {
                analyzeToDepthThen(depth, false);
              }
            } else {
              analyzeToDepthThen(depth, forward);
            }
          },
        });
      }

      const analyzeTopGameButton = h(Button, {
        tooltip: "Jump_to top_game",
        caption: "T",
        class: ["bluebutton", "largebutton"],
        onClick: (ev: any) => {
          if (ev.ctrlKey) {
            loadLichessGames(getPref("lastloadedplayer"), true);
          } else {
            loadTop();
          }
        },
      });

      const analyzeBackGameButton = h(Button, {
        tooltip: "Jump_to previous_game",
        caption: "<<",
        class: ["bluebutton", "largebutton"],
        onClick: () => {
          stepGame(-1, true);
        },
      });

      const analyzeBackButton = h(Button, {
        tooltip: "Game back",
        caption: "<",
        class: ["greenbutton", "largebutton"],
        onClick: () => {
          game.back();
          setUp();
        },
      });

      const analyzeForwardButton = h(Button, {
        tooltip: "Game forward",
        caption: ">",
        class: ["greenbutton", "largebutton"],
        onClick: () => {
          game.forward();
          setUp();
        },
      });

      const analyzeForwardGameButton = h(Button, {
        tooltip: "Jump_to next_game",
        caption: ">>",
        class: ["bluebutton", "largebutton"],
        onClick: () => {
          stepGame(1, true);
        },
      });

      const toAnalyzeEndButton = h(Button, {
        tooltip: "Analyze_End<br>Jump to last analyzed position",
        caption: "AE",
        class: ["bluebutton", "largebutton"],
        onClick: () => {
          toAnalyzeEnd();
        },
      });

      const analyzeMainControlsDiv = h(
        "div",
        {
          class: "controls",
        },
        [
          analyzeButton,
          stopAnalyzeButton,
          analyzeTopGameButton,
          analyzeBackGameButton,
          analyzeBackButton,
          analyzeForwardButton,
          analyzeForwardGameButton,
          toAnalyzeEndButton,
        ]
      );

      const analyzeDepthControlsDiv = h(
        "div",
        {
          class: "controls",
        },
        [
          [10, false],
          [10, true],
          [12, false],
          [12, true],
          [14, false],
          [14, true],
          [16, false],
          [16, true],
          [18, false],
          [20, false],
          [22, false],
        ]
          .filter((item: any) => item[0] >= react.minAnalysisDepth)
          .map((item: any) => analyzeToDepthButton(item[0], item[1]))
      );

      const showAnalysisDiv = h(
        "div",
        {
          key: react.updateAnalysisUid,
          class: ["showanalysis", react.state],
        },
        [
          react.state !== "ready" && game.current.fen !== react.analyzedFen
            ? h(
                "div",
                {
                  class: {
                    other: true,
                  },
                },
                h("div", {}, [
                  "Analyzing other position.",
                  h("hr"),
                  "Please wait ...",
                ])
              )
            : h(
                "table",
                {
                  class: "analysistable",
                  onMouseover: () => {
                    highlightEngineMoves();
                  },
                  onMouseout: () => {
                    board.setShapes([]);
                  },
                },
                [
                  react.completed.slice(1).map((item: any, i: number) => [
                    h("tr", {}, [
                      h(
                        "td",
                        {
                          class: "multipv",
                        },
                        h(Tooltip, { tooltip: "MultiPV index" }, () =>
                          h("span", {}, [`${i + 1}.`])
                        )
                      ),
                      h(
                        "td",
                        {
                          class: {
                            pvmove: true,
                            next: item.pvSans[0] === game.next().genSan,
                          },
                          onClick: () => {
                            game.playSan(item.pvSans[0]);
                            playAudio("tabclick");
                            setUp();
                          },
                        },
                        h(Tooltip, { tooltip: "Principal Move" }, () =>
                          h("span", {}, [item.pvSans[0]])
                        )
                      ),
                      h(
                        "td",
                        {
                          class: "score",
                          style: {
                            color: scoreColor("text", item.scoreNumerical),
                          },
                        },
                        h(
                          Tooltip,
                          { tooltip: "Score_numerical in_centipawns" },
                          () => h("span", {}, [item.scoreNumerical])
                        )
                      ),
                      h(
                        "td",
                        {
                          class: "depth",
                        },
                        h(Tooltip, { tooltip: "Analysis Depth" }, () =>
                          h("span", {}, [item.depth])
                        )
                      ),
                    ]),
                    h("tr", {}, [
                      h(
                        "td",
                        {
                          class: "multipv",
                        },
                        []
                      ),
                      h(
                        "td",
                        {
                          colspan: 3,
                        },
                        [
                          h(Tooltip, { tooltip: "Principal Variation" }, () =>
                            h(
                              "div",
                              { class: "pvcont" },
                              item.pvSans.slice(1).map((san: any, i: number) =>
                                h(
                                  "div",
                                  {
                                    class: "pvsan",
                                    onClick: () => {
                                      game.playSans(
                                        item.pvSans.slice(0, i + 2)
                                      );
                                      playAudio("tabclick");
                                      setUp();
                                    },
                                  },
                                  [san]
                                )
                              )
                            )
                          ),
                        ]
                      ),
                    ]),
                  ]),
                ]
              ),
        ]
      );

      const analysisDiv = h(
        "div",
        {
          class: ["analysis"],
          caption: "Analysis",
          icon: "search",
          tooltip: "Analysis",
        },
        [analyzeMainControlsDiv, analyzeDepthControlsDiv, showAnalysisDiv]
      );

      function loadGamesOfPlayerFunc(loggedIn?: boolean) {
        if (loggedIn) {
          loadLichessGames();
          return;
        }
        const player = getLocal(storageKey("loadgamesof"), "DrNykterstein");

        setLocal(storageKey("player"), player);
        loadLichessGames(player);
      }

      const loadGamesOfPlayer = _.debounce(loadGamesOfPlayerFunc, 1000);

      const lichessGamesDiv = h(
        "div",
        {
          class: ["lichessgames"],
          caption: "Games",
          icon: "list",
          tooltip: "lichess_games",
        },
        [
          h(Button, {
            caption: "Load games of logged in user",
            tooltip: "Load_games of_logged_in_user",
            class: "greenbutton",
            onClick: () => {
              loadGamesOfPlayer(true);
            },
          }),
          h("hr"),
          h(Historytext, {
            style: { padding: "3px" },
            onPerstextchanged: () => {
              loadGamesOfPlayer();
            },
            id: props.id + "/loadgamesof",
          }),
          h(Button, {
            caption: "Load games of arbitrary player",
            tooltip: "Load_games of_arbitrary_player",
            class: "bluebutton",
            onClick: () => {
              loadGamesOfPlayer();
            },
          }),
        ].concat(
          react.lichessGames.map((g, i) =>
            h(
              "div",
              {
                style: {
                  opacity: calcGameOpacity(g),
                },
                class: {
                  lichessgame: true,
                  lost: g.me.result === "0-1",
                  draw: g.me.result === "1/2-1/2",
                  win: g.me.result === "1-0",
                  black: g.me.name === g.black.name,
                  selected: g.id === react.selectedGameId,
                },
                onClick: () => {
                  setGame(g);
                  playAudio("tabclick");
                },
              },
              [
                h("span", { class: "gameindex" }, [`${i + 1}. `]),
                g.gameInfo,
                h("div", { class: "openlichess" }, [
                  h(Link, {
                    href: `https://lichess.org/${g.id}`,
                    caption: "open",
                  }),
                ]),
              ]
            )
          )
        )
      );

      const multipvCombo = h(Perscombo, {
        id: storageKey("multipv"),
        options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i: number) => ({
          display: i,
          value: i,
        })),
        default: DEFAULT_PREFS["multipv"],
        onPerscombochanged: (event: any) => {},
      });

      const TrainLevelCombo = h(Perscombo, {
        id: storageKey("trainlevel"),
        options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i: number) => ({
          display: i,
          value: i,
        })),
        default: DEFAULT_PREFS["trainlevel"],
        onPerscombochanged: (event: any) => {},
      });

      const openingDepthCombo = h(Perscombo, {
        id: storageKey("openingdepth"),
        options: [
          10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100, 120, 140,
          160, 180, 200, 300, 400, 500,
        ].map((i: number) => ({
          display: i,
          value: i,
        })),
        default: DEFAULT_PREFS["openingdepth"],
        onPerscombochanged: (event: any) => {},
      });

      const autoExportCheckbox = h(Perscheck, {
        id: storageKey("autoexport"),
      });

      const autoNameUploadCheckbox = h(Perscheck, {
        id: storageKey("autonameupload"),
      });

      const exportCoordsCheckbox = h(Perscheck, {
        id: storageKey("exportcoords"),
      });

      const minAnalysisDepthCombo = h(Perscombo, {
        id: storageKey("minanalysisdepth"),
        options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(
          (i: number) => ({
            display: i,
            value: i,
          })
        ),
        default: DEFAULT_PREFS["minanalysisdepth"],
        onPerscombochanged: (event: any) => {
          react.minAnalysisDepth = parseInt(event.value);
        },
      });

      const forwardAnalyzeCheckbox = h(Perscheck, {
        id: storageKey("forwardanalyze"),
      });

      const maxGamesCombo = h(Perscombo, {
        id: storageKey("maxgames"),
        options: [
          10, 25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
        ].map((i: number) => ({
          display: i,
          value: i,
        })),
        default: DEFAULT_PREFS["maxgames"],
        onPerscombochanged: (event: any) => {},
      });

      const toAnalyzeEndCheckbox = h(Perscheck, {
        id: storageKey("toanalyzeend"),
      });

      const disableTooltiopsCheckbox = h(Perscheck, {
        id: "disabletooltips",
      });

      const PREFS = [
        ["MultiPV", multipvCombo, "Analysis MultiPV"],
        ["Auto export", autoExportCheckbox, "Auto_export screnshot"],
        [
          "Auto name upload",
          autoNameUploadCheckbox,
          "Auto_name upload by_game_moves",
        ],
        [
          "Export coords",
          exportCoordsCheckbox,
          "Show board_coordinates in_screenshot",
        ],
        ["Min analysis depth", minAnalysisDepthCombo, "Minimum analysis_depth"],
        /*[
          "Forward analyze",
          forwardAnalyzeCheckbox,
          "Game_forward_once and Analyze",
        ],*/
        ["Max games", maxGamesCombo, "Max_number of games to_download"],
        [
          "To analyze end",
          toAnalyzeEndCheckbox,
          "Jump to last analyzed_position",
        ],
        ["Disable tooltips", disableTooltiopsCheckbox, "Disable tooltips"],
        [
          "Train level",
          TrainLevelCombo,
          "Minimum_rating of_move accepted_as good_move in_training",
        ],
        [
          "Opening depth",
          openingDepthCombo,
          "Analyze_opening to_that_many_plies",
        ],
      ];

      const logsTable = h(
        "table",
        {},
        react.logs.map((item: any) =>
          h("tr", {}, [
            h("td", {}, [item.id]),
            h("td", {}, [new Date(item.time).toLocaleString()]),
            h("td", {}, [item.info]),
          ])
        )
      );

      const logsDiv = h(
        "div",
        {
          class: "logs",
        },
        [logsTable]
      );

      const clearLocalButton = h(Button, {
        caption: "Log out and clear local storage",
        tooltip: "Log out and clear_local_storage",
        class: ["redbutton"],
        onClick: () => {
          logout();
          localStorage.clear();
          indexedDB.deleteDatabase("indexeddb");
          window.alert(
            "Logged out and cleared local storage, press Ok to reload page"
          );
          document.location.reload();
        },
      });

      const dbInfo = h(Tooltip, { tooltip: "Database Usage_Info" }, () =>
        h(
          "div",
          {
            class: {
              dbinfo: true,
            },
          },
          [
            `db size = ${react.dbInfoSize} byte(s) , docs = ${react.dbInfoCount} , avg size = ${react.avgDocSize}`,
          ]
        )
      );

      const prefControlsDiv = h(
        "div",
        {
          class: "controls",
        },
        [clearLocalButton]
      );

      const prefDiv = h(
        "div",
        {
          caption: "Pref",
          icon: "preferences",
          class: "pref",
          tooltip: "Preferences",
        },
        [
          h("table", {}, [
            PREFS.map((pref: any) =>
              h("tr", {}, [
                h(
                  "td",
                  { class: "prefname" },
                  h(Tooltip, { tooltip: pref[2] }, () => h("span", {}, pref[0]))
                ),
                h("td", { class: "prefvalue" }, pref[1]),
              ])
            ),
          ]),
          prefControlsDiv,
          dbInfo,
          logsDiv,
        ]
      );

      const aboutDiv = h(
        "div",
        {
          class: "about",
          caption: "About",
          icon: "questionmark",
          tooltip: "About",
        },
        [
          h(Link, {
            href: `https://lichess.org/@/hyperchessbotauthor/blog/vue-analysis-board/SnhmQenW`,
            caption: "Lichess blog post explaining Vue Analysis Board",
          }),
          h("hr"),
          h(Link, {
            href: `https://lichess.org/forum/game-analysis/perfectly-good-atomic-move-as-inaccuracy#1`,
            caption:
              "Lichess forum post explaining merits of Vue Analysis Board analysis compared to that of lichess",
          }),
          h("hr"),
          h(Link, {
            href: `https://github.com/hyperchessbot/vue3complib/blob/main/src/components/ChessboardExt.vue#L1`,
            caption: "Source on GitHub",
          }),
        ]
      );

      const importTextareaRef: any = ref(0);

      const parsePgnButton = h(Button, {
        class: "bluebutton",
        caption: "Parse PGN",
        tooltip: "Set_game from_PGN",
        onClick: () => {
          const pgn = importTextareaRef._rawValue.value;
          game.parsePgn(pgn);
          react.variantUpdateUid = uid();
          react.variantUpdateSelected = game.variant;
          setFlip(game.headers.Black === lichessUser);
          loadAnalyzedNodes();
          setUp();
        },
      });

      const mergePgnButton = h(Button, {
        class: "greenbutton",
        caption: "Merge PGN",
        tooltip: "Merge_moves from_PGN",
        onClick: () => {
          const pgn = importTextareaRef._rawValue.value;
          game.mergePgn(pgn);
          setUp();
        },
      });

      const importTextarea = h("textarea", {
        ref: importTextareaRef,
      });

      const importControlsDiv = h("div", { class: "controls" }, [
        mergePgnButton,
        parsePgnButton,
      ]);

      const importDiv = h(
        "div",
        {
          class: "import",
          caption: "Import",
          icon: "arrowleft",
          tooltip: "Import",
        },
        [importControlsDiv, importTextarea]
      );

      const logDiv = h("div", {
        class: "log",
        caption: "Logs",
        icon: "wrench",
        tooltip: "Logs",
        innerHTML: react.devLogs.renderHtml(),
      });

      const analysisSvgDiv = h("div", {
        class: "analysissvg",
        id: props.id + "/analysissvg",
      });

      const chartDiv = h(
        "div",
        {
          class: "chart",
          caption: "Chart",
          icon: "statsbars",
          tooltip: "Analysis_Chart",
        },
        [analysisSvgDiv]
      );

      const lichessBookDiv = h(
        "div",
        {
          class: "lichessbook",
          caption: "Book",
          icon: "book",
          tooltip: "lichess_book",
        },
        [
          h(LichessBook, {
            variant: toExplorerVariant(game.variant),
            fen: game.current.fen,
            completed: react.completed,
            onLichessbookmoveclicked: (ev: any) => {
              game.playSan(ev.san);
              playAudio("tabclick");
              setUp();
            },
            onLichessbookgameclicked: (ev: any) => {
              loadLichessGame(ev.id, ev.username || lichessUser);
            },
            onLichessbookasblackchanged: (ev: any) => {
              setFlip(ev.checked);
            },
            onLichessbookgameback: (ev: any) => {
              game.back();
              setUp();
            },
            onLichessbookgameforward: (ev: any) => {
              game.forward();
              setUp();
            },
          }),
        ]
      );

      const tabpane = h(
        Tabpane,
        {
          id: storageKey("maintabpane"),
          width: Math.max(react.size, 440) + 25,
          height: react.size + 10,
          selectedCaption: react.selectedCaption,
          onTabpanechanged: (ev: any) => {
            if (ev.selectedTabCaption == "Games") scrollCurrentGameIntoView();
          },
        },
        () => [
          commentDiv,
          canvasDiv,
          importDiv,
          lichessBookDiv,
          analysisDiv,
          chartDiv,
          lichessGamesDiv,
          prefDiv,
          logDiv,
          aboutDiv,
        ]
      );

      const loginButton = h(Button, {
        caption: "Login",
        tooltip: "Log in",
        id: "loginbutton",
        onClick: () => {
          login();
        },
      });

      const logoutButton = h(Button, {
        caption: "Logout",
        tooltip: "Log out",
        id: "logoutbutton",
        onClick: () => {
          logout();
        },
      });

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
        [tabpane, loginDiv]
      );

      const horizContainer = h(
        "div",
        {
          class: ["horizcont"],
        },
        [vertContainer, legalSansDiv, histSansDiv, loginContainer]
      );

      const appDiv = h(
        "div",
        {
          id: "maincontainer",
          class: "chessboardext",
          opacity: react.mainContainerOpacity,
        },
        [
          h("div", { class: "mainvertcont" }, [
            h(
              "div",
              {
                style: {
                  display: react.markdownEditorOpen ? "none" : "block",
                },
              },
              [
                h("table", {}, [
                  h("tr", {}, [h("td", {}, [horizContainer])]),
                  h("tr", {}, [h("td", {}, [pgnDiv])]),
                ]),
              ]
            ),
            h(MarkdownEditor, {
              onClosed: () => {
                react.markdownEditorOpen = false;
                setPref("editoropen", false);
              },
              style: {
                display: react.markdownEditorOpen ? "block" : "none",
              },
            }),
          ]),
        ]
      );

      popupDiv = h("div", {
        innerHTML: react.popupMsg,
        style: {
          fontWeight: "bold",
          position: "absolute",
          padding: px(10),
          textAlign: "center",
          backgroundColor: react.popupBackground,
          fontSize: "20px",
          top: px(20),
          left: px(20),
          zIndex: 1000,
          display: react.showPopup,
        },
      });

      return h("div", { style: { position: "relative" } }, [popupDiv, appDiv]);
    };
  },
});
</script>

<style>
.chessboardext {
  display: inline-block;
}
.chessboardext .mainvertcont {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chessboardext table {
  border-collapse: collapse;
}
.chessboardext td {
  padding: 2px;
  border: solid 1px;
}
.chessboardext .horizcont {
  display: flex;
  align-items: center;
  margin-left: 2px;
}
.chessboardext .legalsans {
  padding: 3px;
  overflow-y: scroll;
  user-select: none;
  min-width: 150px;
}
.chessboardext .legalsans.hist {
  margin-left: 5px;
  min-width: 150px;
}
.chessboardext .richlegalsan {
  padding: 3px;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  color: #007;
  width: 70px;
  margin: 1px;
}
.chessboardext .richlegalsan.selected {
  box-shadow: 3px 3px #cc6;
  border: solid 1px #cc6;
  margin-top: 3px;
  margin-bottom: 3px;
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
  box-shadow: 3px 3px #cc6;
  border: solid 1px #cc6;
  margin-top: 3px;
  margin-bottom: 3px;
}
.chessboardext .richlegalsan.variation {
  box-shadow: 1px 1px #770;
  border: solid 1px #770;
}
.feninput {
  font-size: 10px;
  margin-top: 3px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chessboardext .comment button {
  margin-top: 3px;
}
.chessboardext .comment textarea {
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
  margin-bottom: 5px;
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
.chessboardext .login a {
  margin-left: 10px;
}
.chessboardext .login input {
  margin-left: 10px;
  font-family: monospace;
  font-size: 10px;
}
.chessboardext .outercontainer {
}
.chessboardext .vertcont {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chessboardext .smallbutton {
  font-size: 10px;
}
.chessboardext .greenbutton {
  background-color: #dfd;
}
.chessboardext .redbutton {
  background-color: #fdd;
}
.chessboardext .bluebutton {
  background-color: #ddf;
}
.chessboardext .lowercontrols {
  display: flex;
  align-items: center;
  margin-top: 3px;
}
.chessboardext button {
  margin-left: 1px;
  margin-right: 1px;
}
.chessboardext .analysis {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}
.chessboardext .analysis .controls {
  margin-top: 5px;
}
.chessboardext .analysis .controls .todepth {
  margin-left: 4px;
  background-color: #afa;
}
.chessboardext .analysis .controls .todepth.forward {
  margin-left: 4px;
  background-color: #ffa;
}
.chessboardext .showanalysis {
  margin-top: 10px;
}
.chessboardext .showanalysis.running {
  background-color: #afa;
}
.chessboardext .showanalysis.stopping {
  background-color: #ffa;
}
.chessboardext .showanalysis.ready {
  background-color: #fff;
}
.chessboardext .showanalysis .analysistable {
  font-size: 20px;
  border-collapse: collapse;
  margin: 5px;
}
.chessboardext .showanalysis td {
  border: solid 1px #777;
  padding: 3px;
}
.chessboardext .showanalysis .multipv {
  width: 40px;
  color: #007;
  text-align: center;
}
.chessboardext .showanalysis .pvcont {
  margin-left: 5px;
  display: flex;
  align-items: center;
  color: #077;
  padding-left: 10px;
  font-weight: bold;
}
.chessboardext .showanalysis .pvcont .pvsan {
  margin-left: 3px;
  margin-right: 3px;
  cursor: pointer;
}
.chessboardext .showanalysis .pvmove {
  width: 100px;
  color: #077;
  font-size: 25px;
  padding-left: 15px;
  font-weight: bold;
  cursor: pointer;
}
.chessboardext .showanalysis .pvmove.next {
  background-color: #ffa;
}
.chessboardext .showanalysis .score {
  width: 90px;
  color: #007;
  font-size: 25px;
  text-align: center;
  font-weight: bold;
}
.chessboardext .showanalysis .depth {
  width: 40px;
  text-align: center;
  color: #700;
}
.chessboardext .lichessgames {
  user-select: none;
}
.chessboardext .lichessgames .lichessgame {
  margin: 3px;
  cursor: pointer;
  padding: 3px;
  background-color: #fff;
  color: #000;
  border: solid 3px #777;
}
.chessboardext .lichessgames .lichessgame .openlichess {
  display: inline-block;
  margin-left: 10px;
}
.chessboardext .lichessgames .lichessgame.black .openlichess a {
  color: #fff;
}
.chessboardext .lichessgames .lichessgame .openlichess a {
  color: #000;
}
.chessboardext .lichessgames .lichessgame.lost {
  border: solid 3px #f00;
  margin-top: 10px;
  margin-bottom: 10px;
}
.chessboardext .lichessgames .lichessgame.draw {
  border: solid 3px #ff0;
}
.chessboardext .lichessgames .lichessgame.win {
  border: solid 3px #afa;
}
.chessboardext .lichessgames .lichessgame.selected {
  box-shadow: 10px 10px #0ff;
  margin-top: 10px;
  margin-bottom: 15px;
}
.chessboardext .lichessgames .lichessgame.black {
  background-color: #000;
  color: #fff;
}
.iconbutton.control {
  margin-left: 1px;
  margin-right: 1px;
}
.chessboardext .uppercontrols {
  display: flex;
  align-items: center;
}
.chessboardext .uppercontrols .control {
  margin-left: 2px;
  margin-right: 2px;
}
.chessboardext .uppercontrols select {
  margin-left: 2px;
  margin-right: 2px;
}
.chessboardext .pref {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 10px;
}
.chessboardext .pref table {
  border-collapse: collapse;
}
.chessboardext .pref td {
  border: solid 1px;
}
.chessboardext .pref td:nth-child(1) {
  background-color: #ffd;
  padding: 3px;
  font-weight: bold;
  color: #070;
  padding-left: 10px;
  padding-right: 10px;
}
.chessboardext .pref td:nth-child(2) {
  background-color: #ddf;
  padding: 3px;
  padding-left: 5px;
  padding-right: 5px;
}
.chessboardext .pref td:nth-child(3) {
  background-color: #eee;
  padding: 3px;
  padding-left: 5px;
  padding-right: 5px;
}
.chessboardext .pgn {
  padding: 1px;
}
.chessboardext .pgn textarea {
  padding: 5px;
  width: calc(100% - 12px);
  height: 60px;
  margin-bottom: -4px;
}
.chessboardext .prefname {
}
.chessboardext .prefvalue {
  text-align: center;
}
.chessboardext .logs {
  font-family: monospace;
  margin-top: 5px;
}
#maincontainer {
  transition: opacity 1s;
}
.chessboardext .largebutton {
  font-size: 20px;
  margin: 3px;
}
.chessboardext .heading {
  color: #070;
  font-weight: bold;
  margin-top: 2px;
  padding-left: 10px;
  padding-right: 10px;
  text-align: center;
}
.chessboardext .pref .controls {
  padding: 5px;
  margin: 5px;
  margin-top: 15px;
  margin-bottom: 10px;
  background-color: #eee;
}
.chessboardext .pref .dbinfo {
  text-align: center;
  background-color: #eee;
  color: #007;
  font-family: monospace;
  display: inline-block;
  padding: 3px 10px 3px 10px;
  border: solid 1px;
  margin-bottom: 10px;
}
.chessboardext .enginebarcont {
  width: 15px;
  position: relative;
  background-color: #eee;
}
.chessboardext .enginebarcont.showbar {
  background-color: #d77;
}
.chessboardext .enginebarcont .bar {
  position: absolute;
  background-color: #7d7;
  width: 100%;
}
.chessboardext .withbar {
  display: flex;
}
.chessboardext .showanalysis .other {
  padding: 20px;
  font-size: 25px;
  font-weight: bold;
  text-align: center;
}
.chessboardext .gameindex {
  font-size: 18px;
  font-weight: bold;
}
#showusernamediv {
  font-family: monospace;
  color: #007;
}
.chessboardext .about {
  padding: 10px;
  font-size: 18px;
}
.chessboardext .import {
  width: calc(100%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chessboardext .import textarea {
  width: calc(100% - 10px);
  height: 200px;
}
.chessboardext .import .controls {
  background-color: #eee;
  margin-bottom: 5px;
}
.chessboardext .import .controls button {
  margin: 3px;
}
.chessboardext .train {
  margin-left: 10px;
}
.chessboardext .chart .analysissvg {
  cursor: pointer;
}
.vue3complib.logmsg.info {
  color: #007;
}
.vue3complib.logmsg.ok {
  color: #070;
}
.vue3complib.logmsg.time {
  color: #077;
  font-family: monospace;
}
.vue3complib.logmsg.id {
  color: #707;
  font-family: monospace;
}
</style>
