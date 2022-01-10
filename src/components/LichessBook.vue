<script lang="ts">
const RATINGS = ["1600", "1800", "2000", "2200", "2500"];
const SPEEDS = [
  "ultraBullet",
  "bullet",
  "blitz",
  "rapid",
  "classical",
  "correspondence",
];

import _ from "lodash";

import { Game } from "@publishvue/chessopsnpmts";

import {
  Labeled,
  Perscheck,
  Historytext,
  getLocal,
  Link,
  Button,
} from "../index";

import { scoreColor } from "../utils";

import { defineComponent, h, onMounted, reactive, watchEffect } from "vue";

import { toExplorerVariant } from "../lichess";

export default defineComponent({
  name: "LichessBook",
  props: {
    id: {
      type: String,
      default: "lichessbook",
    },
    variant: {
      type: String,
      default: "standard",
    },
    fen: {
      type: String,
      default: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    },
    completed: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, context) {
    const react = reactive({
      blob: "",
      moves: [],
      topGames: [],
    });

    function checkList(id: string, list: string[]) {
      return list.filter((item) => getLocal(id + "/" + item, true)).join(",");
    }

    async function getBook(variant: string, fen: string, completed?: any) {
      const url = `https://explorer.lichess.ovh/${
        getLocal(props.id + "/ofplayer", false) ? "player" : "lichess"
      }?variant=${toExplorerVariant(variant)}&fen=${fen}&speeds=${checkList(
        props.id + "/speed",
        SPEEDS
      )}&ratings=${checkList(props.id + "/rating", RATINGS)}&modes=${[
        "rated",
        "casual",
      ]
        .filter((mode) => getLocal(props.id + "/" + mode, true))
        .join(",")}&player=${getLocal(props.id + "/player", "")}&color=${
        getLocal(props.id + "/black", false) ? "black" : "white"
      }`;

      const resp = await fetch(url);
      const blob = await resp.json();

      react.blob = JSON.stringify(blob, null, 2);

      const [onTurn, offTurn] =
        props.fen.split(" ")[1] === "w"
          ? ["white", "black"]
          : ["black", "white"];

      const scores = _.fromPairs(
        props.completed
          .slice(1)
          .map((item: any) => [item.pvSans[0], item.scoreNumerical])
      );

      react.moves = (blob.moves || []).map((move: any) => ({
        ...move,
        ...{
          whitePerf: Math.round(
            (move.white / (move.white + move.draws + move.black)) * 100
          ),
          drawPerf: Math.round(
            (move.draws / (move.white + move.draws + move.black)) * 100
          ),
          blackPerf: Math.round(
            (move.black / (move.white + move.draws + move.black)) * 100
          ),
          total: move.white + move.draws + move.black,
          turnPerfExact: move[onTurn] / (move.white + move.draws + move.black),
          score: scores[move.san] || undefined,
        },
      }));
      react.topGames = blob.topGames || blob.recentGames || [];
    }

    onMounted(() => {
      getBook(props.variant, props.fen);
    });

    watchEffect(() => {
      getBook(props.variant, props.fen, props.completed);
    });

    function checkBoxes(id: string, list: string[]) {
      return list.map((item) =>
        h(Labeled, { label: item }, () =>
          h(Perscheck, {
            id: id + "/" + item,
            default: true,
            onPerscheckchanged: () => {
              getBook(props.variant, props.fen);
            },
          })
        )
      );
    }

    return () => {
      const tableHead = h("tr", {}, [
        h(
          "td",
          {
            class: "control",
          },
          [
            h(Button, {
              caption: "<",
              tooltip: "Game_back",
              onClick: () => {
                context.emit("lichessbookgameback", {});
              },
            }),
            h(Button, {
              caption: ">",
              tooltip: "Game_forward",
              onClick: () => {
                context.emit("lichessbookgameforward", {});
              },
            }),
          ]
        ),
        h("td", { class: ["plays", "white"] }, "White Wins"),
        h("td", { class: ["plays", "draw"] }, "Draw"),
        h("td", { class: ["plays", "black"] }, "Black Wins"),
      ]);

      const tableBody = react.moves
        .slice()
        .sort((a: any, b: any) =>
          getLocal(props.id + "/sortbyperf", false)
            ? b.turnPerfExact - a.turnPerfExact
            : b.total - a.total
        )
        .map((item: any) => [
          h("tr", {}, [
            h("td", {
              class: "san",
              onClick: () => {
                context.emit("lichessbookmoveclicked", {
                  variant: props.variant,
                  fen: props.fen,
                  san: item.san,
                });
              },
              innerHTML: `${item.san}${
                item.score !== undefined
                  ? `<br><span class="score" style="color:${scoreColor(
                      "text",
                      item.score
                    )}">${item.score}</span>`
                  : ""
              }`,
            }),
            h(
              "td",
              { class: ["plays", "white"] },
              `${item.white} - ${item.whitePerf}%`
            ),
            h(
              "td",
              { class: ["plays", "draw"] },
              `${item.draws} - ${item.drawPerf}%`
            ),
            h(
              "td",
              { class: ["plays", "black"] },
              `${item.black} - ${item.blackPerf}%`
            ),
          ]),
          h("tr", {}, [
            h("td", { class: "total" }, `${item.total}`),
            h(
              "td",
              {
                colspan: 3,
                style: { backgroundColor: "#7c7", padding: "2px 1px 2px 1px" },
              },
              h("div", { class: "bar" }, [
                h("div", {
                  class: "white",
                  style: { width: `${item.whitePerf * 3.5}px` },
                }),
                h("div", {
                  class: "draw",
                  style: { width: `${item.drawPerf * 3.5}px` },
                }),
                h("div", {
                  class: "black",
                  style: { width: `${item.blackPerf * 3.5}px` },
                }),
              ])
            ),
          ]),
        ]);

      const topGames = h(
        "div",
        { class: "games" },
        h(
          "div",
          { class: "topgames" },
          h(
            "table",
            {},
            react.topGames.map((game: any) => [
              h("tr", {}, [
                h(
                  "td",
                  {
                    onClick: () => {
                      context.emit("lichessbookmoveclicked", {
                        san: Game()
                          .setVariant(props.variant, props.fen)
                          .pos.uciToSan(game.uci),
                      });
                    },
                  },
                  Game()
                    .setVariant(props.variant, props.fen)
                    .pos.uciToSan(game.uci)
                ),
                h(
                  "td",
                  {},
                  h(Link, {
                    caption: game.white.name,
                    href: `https://lichess.org/@/${game.white.name}`,
                  })
                ),
                h("td", {}, game.white.rating),
                h(
                  "td",
                  {},
                  h(Link, {
                    caption: game.black.name,
                    href: `https://lichess.org/@/${game.black.name}`,
                  })
                ),
                h("td", {}, game.black.rating),
                h("td", {}, [
                  h("div", {
                    onClick: () => {
                      context.emit("lichessbookgameclicked", {
                        id: game.id,
                        username: getLocal(props.id + "/player", ""),
                      });
                    },
                    innerHTML: `${game.month} ${game.mode} ${game.speed}`,
                  }),
                  h("hr"),
                  h("div", {
                    onClick: () => {
                      window.open(`https://lichess.org/${game.id}`, "_blank");
                    },
                    innerHTML: `<font style="color:#007;">${
                      game.winner
                        ? game.winner === "white"
                          ? "1-0"
                          : "0-1"
                        : "1/2-1/2"
                    }</font>`,
                  }),
                ]),
              ]),
            ])
          )
        )
      );

      const sortByCheckbox = h(Labeled, { label: "sort by perf" }, () =>
        h(Perscheck, {
          id: props.id + "/sortbyperf",
          onPerscheckchanged: () => {
            getBook(props.variant, props.fen);
          },
        })
      );

      const playerText = h(Labeled, { label: "player" }, () =>
        h(Historytext, {
          id: props.id + "/player",
          onPerstextchanged: () => {
            getBook(props.variant, props.fen);
          },
        })
      );

      const playerCheckbox = h(Labeled, { label: "of player" }, () =>
        h(Perscheck, {
          id: props.id + "/ofplayer",
          default: false,
          onPerscheckchanged: () => {
            getBook(props.variant, props.fen);
          },
        })
      );

      const blackCheckbox = h(Labeled, { label: "as black" }, () =>
        h(Perscheck, {
          id: props.id + "/black",
          default: false,
          onPerscheckchanged: (ev: any) => {
            getBook(props.variant, props.fen);
            context.emit("lichessbookasblackchanged", ev);
          },
        })
      );

      const ratedCheckbox = h(Labeled, { label: "rated" }, () =>
        h(Perscheck, {
          id: props.id + "/rated",
          default: true,
          onPerscheckchanged: () => {
            getBook(props.variant, props.fen);
          },
        })
      );

      const casualCheckbox = h(Labeled, { label: "casual" }, () =>
        h(Perscheck, {
          id: props.id + "/casual",
          default: true,
          onPerscheckchanged: () => {
            getBook(props.variant, props.fen);
          },
        })
      );

      return h("div", { class: ["vue3complib", "lichessbook"] }, [
        h("div", { class: "vertcont" }, [
          h("div", { class: "settings" }, [
            checkBoxes(props.id + "/rating", RATINGS),
            checkBoxes(props.id + "/speed", SPEEDS),
            sortByCheckbox,
            playerText,
            playerCheckbox,
            blackCheckbox,
            ratedCheckbox,
            casualCheckbox,
          ]),
          h("table", { class: "book" }, [tableHead, tableBody]),
          topGames,
          h("pre", {}, [
            /*react.blob*/
          ]),
        ]),
      ]);
    };
  },
});
</script>

<style lang="scss">
.vue3complib.lichessbook {
  .vertcont {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .settings {
    text-align: center;
    font-size: 11px;
  }
  .book {
    margin-top: 10px;
    td {
      padding: 3px;
      padding-left: 10px;
      padding-right: 10px;
      border: solid 1px #077;
    }
    user-select: none;
    .total {
      font-size: 12px;
      font-family: monospace;
      color: #303;
      font-weight: bold;
    }
  }
  .san {
    color: #007;
    font-weight: bold;
    cursor: pointer;
    font-size: 20px;
    width: 50px;
    border-bottom: solid 1px transparent !important;
    .score {
      color: #770;
    }
  }
  .control {
    display: flex;
    cursor: pointer;
    text-align: center;
  }
  .plays {
    font-family: monospace;
    width: 100px;
    text-align: center;
  }
  .plays.white {
    color: #007;
  }
  .plays.draw {
    background-color: #ee0;
    color: #000;
  }
  .plays.black {
    background-color: #000;
    color: #fff;
  }
  .games {
    margin-top: 10px;
  }
  $barheight: 10px;
  $barborder: solid 2px #0aa;
  .bar {
    display: flex;
    padding-left: 3px;
    .white {
      height: $barheight;
      border: $barborder;
      background-color: #fff;
    }
    .draw {
      height: $barheight;
      border: $barborder;
      background-color: #ee0;
    }
    .black {
      height: $barheight;
      border: $barborder;
      background-color: #000;
    }
  }
  .topgames {
    text-align: center;
    font-size: 14px;
    td {
      padding: 4px;
    }
    td:nth-child(1) {
      font-weight: bold;
      font-size: 20px;
      cursor: pointer;
      text-decoration: underline;
      color: #007;
    }
    td:nth-child(2) {
      color: #070;
      font-weight: bold;
    }
    td:nth-child(3) {
      color: #007;
      font-weight: bold;
    }
    td:nth-child(4) {
      color: #700;
      font-weight: bold;
    }
    td:nth-child(5) {
      color: #007;
      font-weight: bold;
    }
    td:nth-child(6) {
      color: #770;
      font-weight: bold;
      cursor: pointer;
    }
  }
}
</style>
