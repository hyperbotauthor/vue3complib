<script lang="ts">
import { Perstext, getLocal, setLocal } from "../index";

import { defineComponent, h, onMounted, reactive, watchEffect } from "vue";

export default defineComponent({
  props: {
    id: {
      type: String,
      default: "historytext",
    },
  },
  setup(props, context) {
    const react = reactive({
      showPopup: false,
      history: getLocal(props.id + "/history", []),
      key: 0,
    });

    return () => {
      const perstext = h(Perstext, {
        ...props,
        ...{
          onPerstextchanged: (ev: any) => {
            context.emit("perstextchanged", ev);
          },
        },
      });

      const popupDiv = h(
        "div",
        {
          class: "popup",
          style: { display: react.showPopup ? "block" : "none" },
        },
        [
          h(
            "div",
            {
              class: "cancel",
              onClick: () => {
                react.showPopup = false;
              },
            },
            ["Cancel"]
          ),
          react.history.map((item: any) =>
            h(
              "div",
              {
                class: "histitem",
                onClick: () => {
                  setLocal(props.id, item);
                  react.key++;
                  react.showPopup = false;
                  context.emit("perstextchanged", { value: item });
                },
              },
              [
                item,
                h(
                  "button",
                  {
                    class: "del",
                    onClick: (ev: any) => {
                      ev.stopPropagation();
                      ev.preventDefault();
                      const hist: any = getLocal(props.id + "/history", []);
                      const newHist = hist.filter(
                        (testItem: any) => testItem !== item
                      );
                      setLocal(props.id + "/history", newHist);
                      react.history = newHist;
                    },
                  },
                  "x"
                ),
              ]
            )
          ),
        ]
      );

      return h(
        "div",
        { class: ["vue3complib", "historytext"], key: react.key },
        h("div", { class: "cont" }, [
          perstext,
          h(
            "button",
            {
              onClick: () => {
                react.showPopup = !react.showPopup;
              },
            },
            ">"
          ),
          h(
            "button",
            {
              onClick: () => {
                const hist: any = getLocal(props.id + "/history", []);
                const add = getLocal(props.id, "");
                if (add) {
                  const newHist = hist.filter((item: any) => item !== add);
                  newHist.unshift(add);
                  setLocal(props.id + "/history", newHist);
                  react.history = newHist;
                  context.emit("historytextadd", { add });
                }
              },
            },
            "+"
          ),
          popupDiv,
        ])
      );
    };
  },
});
</script>

<style lang="scss">
.vue3complib.historytext {
  display: inline-block;
  .cont {
    position: relative;
    display: flex;
    align-items: center;
  }
  .popup {
    position: absolute;
    display: none;
    padding: 3px;
    max-height: 200px;
    overflow-y: scroll;
    background-color: #fff;
    z-index: 1000;
    font-size: 14px;
    top: 20px;
    left: 10px;
    border: solid 2px #777;
    border-radius: 5px;
    min-width: 100px;
  }
  .histitem {
    color: #007;
    cursor: pointer;
    padding: 1px;
    margin: 2px;
    border: solid 1px #777;
    padding-left: 5px;
    padding-right: 5px;
    font-weight: bold;
    text-align: center;
    cursor: pointer;
  }
  .cancel {
    background-color: #ffa;
    border: solid 1px #700;
    text-align: center;
    cursor: pointer;
  }
  .del {
    margin-left: 5px;
    background-color: #fee;
    font-size: 10px;
  }
}
</style>
