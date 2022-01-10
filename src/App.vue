<template>
  <div ref="cont" id="cont">
    <div class="hello">
      <template v-if="welcome">
        <img width="40" src="logo.png" />
        <h1>Hello from hyperchessbotauthor !!</h1>
        <h2>Welcome to my Vue JS Chessboard ...</h2>
        <h3>
          Log into lichess, make moves, draw circles and arrows, change board
          size and flip if necessary, when ready press Export to create a
          screenshot, then either press Download to save the screenshot locally
          or Upload to get a GitHub share link
        </h3>
      </template>

      <template v-if="test">
        <!--<TargetManager :targetmanager="targetmanager"></TargetManager>-->
        Svg
        <Svg></Svg>
      </template>

      <template v-else>
        <ChessboardExt
          :size="480"
          v-on:chessboardmoveplayed="event"
        ></ChessboardExt>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import {
  ChessboardExt,
  TargetManager,
  TargetManagerTypes,
  getLocal,
  setLocal,
  Svg,
} from "../dist/index.js";

class MyTargetManagerFunctionality
  implements TargetManagerTypes.CanManageTargets
{
  // mock implementation of storeState
  storeState(tms: TargetManagerTypes.TargetManagerState) {
    setLocal("targetmanager", tms);
  }
  // mock implementation of getState
  getState(def: TargetManagerTypes.TargetManagerState) {
    return Promise.resolve(getLocal("targetmanager", undefined) || def);
  }
  // mock implementation of save
  save(target: string) {
    window.alert(`My Saved ${target}!`);
  }
  // mock implementation of load
  load(target: string) {
    window.alert(`My Loaded ${target}!`);
  }
  // mock implementation of delete
  delete(target: string) {
    window.alert(`My Deleted ${target}!`);
  }
}

const MyTargetManager = TargetManagerTypes.EquipWithTargetManagerBase(
  MyTargetManagerFunctionality
);

@Options({
  components: {
    ChessboardExt,
    TargetManager,
    Svg,
  },
  methods: {
    event(ev: any) {
      console.log(ev);
    },
  },
  data() {
    return {
      welcome: document.location.href.match("showwelcome"),
      test: document.location.href.match("test"),
      targetmanager: new MyTargetManager(),
    };
  },
  mounted() {
    setTimeout(() => {
      this.$refs.cont.style.opacity = "1";
    }, 0);
  },
})

// export app
export default class App extends Vue {}
</script>
<style scoped>
h1 {
  color: #007;
  font-size: 35px;
  margin-top: 10px;
  margin-bottom: 0px;
  text-align: center;
}
h2 {
  color: #070;
  font-size: 30px;
  margin-bottom: 0px;
  text-align: center;
}
h3 {
  color: #770;
  font-size: 20px;
  text-align: center;
}
.hello {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
#cont {
  opacity: 0;
  transition: opacity 2s;
}
</style>
