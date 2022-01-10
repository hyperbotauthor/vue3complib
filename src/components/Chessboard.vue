<template>
  <div :style="contStyle">
    <div ref="board" :style="contStyle" class="maplebackground is2d"></div>
  </div>
</template>

<script>
import { playAudio } from "../assets.ts";
import "../assets/chessground.css";
import { Pos } from "@publishvue/chessopsnpmts";
import { Chessground } from "@publishvue/chessground";

export default {
  name: "Chessboard",
  methods: {
    highlightMove(uci) {
      if (!uci) {
        this.board.set({ lastMove: undefined });
      } else {
        this.board.set({
          lastMove: [uci.substring(0, 2), uci.substring(2, 4)],
        });
      }
    },
    movePlayed(orig, dest) {
      const uci = `${orig}${dest}`;
      let san = null;
      const legals = this.pos.legalsForUci(uci);
      const isLegal = legals.length > 0;
      let legalUci = null;
      if (isLegal) {
        legalUci = legals[0];
        san = this.pos.uciToSan(legalUci);
        this.pos.playUci(legalUci);
        this.lastHiglightedMove = legalUci;
        playAudio("tabclick");
      } else {
        this.highlightMove(this.lastHiglightedMove);
        playAudio("failed");
      }
      this.board.set({ fen: this.pos.reportFen() });
      this.$emit("chessboardmoveplayed", {
        event: "chessboardmoveplayed",
        orig,
        dest,
        uci,
        san,
        legalUci,
        legals,
        isLegal,
      });
    },
  },
  props: {
    fen: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 480,
    },
  },
  data() {
    const contStyle = `width: ${this.size}px; height: ${this.size}px`;
    const pos = Pos();
    const board = null;
    const lastHiglightedMove = null;

    return {
      contStyle,
      pos,
      board,
      lastHiglightedMove,
    };
  },
  watch() {
    fen: (oldValue, newValue) => {
      this.board.set({ fen: newValue });
    };
  },
  mounted() {
    this.board = Chessground(this.$refs.board, {
      fen: this.pos.reportFen(),
    });

    this.board.set({
      movable: {
        events: { after: (orig, dest) => this.movePlayed(orig, dest) },
      },
    });
  },
};
</script>
