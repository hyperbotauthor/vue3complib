import Labeled from "./components/Labeled.vue";
import Perscheck from "./components/Perscheck.vue";
import Perstext from "./components/Perstext.vue";
import Historytext from "./components/Historytext.vue";
import Perscombo from "./components/Perscombo.vue";
import Tabpane from "./components/Tabpane.vue";
import Link from "./components/Link.vue";
import Chessboard from "./components/Chessboard.vue";
import ChessboardExt from "./components/ChessboardExt.vue";
import Iconbutton from "./components/Iconbutton.vue";
import MarkdownEditor from "./components/MarkdownEditor.vue";
import Target from "./components/Target.vue";
import TargetManager from "./components/TargetManager.vue";
import * as TargetManagerTypes from "./components/TargetManager.vue";
import Button from "./components/Button.vue";
import Tooltip from "./components/Tooltip.vue";
import FontSelector from "./components/FontSelector.vue";
import Svg from "./components/Svg.vue";
import LichessBook from "./components/LichessBook.vue";

import {
  getStyle,
  DomImage,
  getelse,
  Canvas,
  uciToCoords,
  drawShapes,
  drawBoard,
} from "./canvas";

import {
  lichessClient,
  gamesOfUser,
  toExplorerVariant,
  toChessopsVariant,
  getLichessGames,
  VARIANTS,
} from "./lichess";

export {
  Labeled,
  Perscheck,
  Perstext,
  Historytext,
  Perscombo,
  Tabpane,
  Link,
  Chessboard,
  ChessboardExt,
  Iconbutton,
  MarkdownEditor,
  Target,
  TargetManager,
  TargetManagerTypes,
  Button,
  Tooltip,
  FontSelector,
  Svg,
  LichessBook,
  getStyle,
  DomImage,
  getelse,
  Canvas,
  uciToCoords,
  drawShapes,
  drawBoard,
  lichessClient,
  gamesOfUser,
  toExplorerVariant,
  getLichessGames,
  VARIANTS,
};

import {
  px,
  getLocal,
  setLocal,
  capitalizeFirstLetter,
  arrayMove,
  md2html,
  uid,
  pause,
  scoreColor,
} from "./utils";

export {
  px,
  getLocal,
  setLocal,
  capitalizeFirstLetter,
  arrayMove,
  md2html,
  uid,
  pause,
  scoreColor,
};

import type { ColorDisposition } from "./utils";

export type { ColorDisposition };
