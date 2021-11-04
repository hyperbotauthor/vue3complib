<template>
  <div ref="cont" id="cont">
    <table>
      <tr>
        <td style="width: 220px; height: 220px">
          <img
            src="@/assets/logo.png"
            style="margin-right: 20px; margin-top: -15px"
          />
        </td>
        <td>
          <table class="infotable">
            <tr>
              <td>Artifact</td>
              <td class="artifact">Vue 3 Component Library</td>
            </tr>
            <tr>
              <td>Git Repository</td>
              <td>
                <Link href="https://github.com/hyperbotauthor/vue3complib" />
              </td>
            </tr>
            <tr>
              <td>Npm</td>
              <td>
                <Link
                  href="https://www.npmjs.com/package/@publishvue/vue3complib"
                />
              </td>
            </tr>
            <tr>
              <td>Blog Post</td>
              <td>
                <Link
                  href="https://hyperchessbotsramblings.netlify.app/vue3_component_linrary/"
                />
                <hr />
                <Link
                  href="https://lichess.org/@/hyperchessbotauthor/blog/vue-3-component-library-with-rollup-typescript-and-composition-api/zt6lzirI"
                />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <div class="comps">      
      <li>
        <Labeled label="Perscheck">
          <Perscheck id="perscheck" v-on:perscheckchanged="event"></Perscheck>
        </Labeled>
      </li>
      <li>
        <Labeled label="Perstext">
          <Perstext
            id="perstext"
            v-on:perstextchanged="event"
            :onsubmitclear="true"
            buttoncaption="Set"
          ></Perstext>
        </Labeled>
      </li>
      <li>
        <Labeled label="Perscombo" :rev="true">
          <Perscombo id="perscombo" v-on:perscombochanged="event"></Perscombo>
        </Labeled>
      </li>
      <li>
        <Labeled label="Tabpane">
          <Tabpane
            id="tabpane"
            v-on:tabpanechanged="event"
            :width="300"
            :height="100"
          >
            <div caption="Custom tab">Custom tab content.</div>
            <div>Tab 2 content.</div>
            <div>Tab 3 content.</div>
          </Tabpane>
        </Labeled>
      </li>
      <li>
        <Labeled label="Chessboard">
          <Chessboard :size="320" v-on:chessboardmoveplayed="event" />
        </Labeled>
      </li>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

import {
  Labeled,
  Perscheck,
  Perstext,
  Perscombo,
  Tabpane,
  Link,
  Chessboard,
  ChessboardExt,
} from "../dist/index.js";

/*import {
  Labeled,
  Perscheck,
  Perstext,
  Perscombo,
  Tabpane,
  Link,
  Chessboard,
} from "@publishvue/vue3complib";*/

@Options({
  components: {
    Labeled,
    Perscheck,
    Perstext,
    Perscombo,
    Tabpane,
    Link,
    Chessboard,
    ChessboardExt,
  },
  methods: {
    event(ev: any) {
      console.log(ev);
    },
  },
  mounted() {
    setTimeout(() => {
      this.$refs.cont.style.opacity = "1";
    }, 1200);
  },
})

// export app
export default class App extends Vue {}
</script>

<style>
li {
  margin-top: 3px;
}
.infotable {
  font-size: 20px;
  border-collapse: collapse;
}
.infotable td {
  border: solid 1px;
  padding: 5px;
}
.infotable td a {
  font-size: 16px;
}
.artifact {
  font-size: 25px;
  font-weight: bold;
}
.comps {
  margin-left: 210px;
  margin-top: 10px;
}
#cont {
  opacity: 0;
  transition: opacity 2s;
}
</style>
