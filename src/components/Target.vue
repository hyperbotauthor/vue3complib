<script lang="ts">
import { h, defineComponent } from "vue";

import "../lib.scss";

import { Button, Tooltip } from "../index";

export default defineComponent({
  name: "Target",
  props: {
    targets: {
      type: Array,
      default: () => ["Default"],
    },
    selected: {
      type: String,
      default: "Default",
    },
    colorbuttons: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, context) {
    return () => {
      const addTargetButton = h(Button, {
        caption: "Add Target",
        tooltip: "Add Save_Target",
        class: props.colorbuttons ? "greenbutton" : "",
        onClick: () => {
          const name = window.prompt("Target Name", "Default");
          if (name) {
            context.emit("targetchanged", {
              action: "add",
              target: name,
            });
          }
        },
      });

      const removeTargetButton = h(Button, {
        caption: "Remove Target",
        tooltip: "Remove Save_Target",
        class: props.colorbuttons ? "redbutton" : "",
        onClick: () => {
          if (props.selected === "Default") return;
          context.emit("targetchanged", {
            action: "remove",
            target: props.selected,
          });
        },
      });

      const saveAsButton = h(Button, {
        caption: "Save As",
        tooltip: "Save To_Target",
        class: props.colorbuttons ? "yellowbutton" : "",
        onClick: () => {
          context.emit("targetchanged", {
            action: "saveas",
            target: props.selected,
          });
        },
      });

      const loadFromButton = h(Button, {
        caption: "Load From",
        tooltip: "Load From_Target",
        class: props.colorbuttons ? "bluebutton" : "",
        onClick: () => {
          context.emit("targetchanged", {
            action: "loadfrom",
            target: props.selected,
          });
        },
      });

      const saveTargetsCombo = h(
        Tooltip,
        { tooltip: "Select Save_Target" },
        () =>
          h(
            "select",
            {
              onChange: (ev: any) => {
                const name = ev.target.value;
                context.emit("targetchanged", {
                  action: "selected",
                  target: name,
                });
              },
            },
            (props.targets as string[]).map((name) =>
              h(
                "option",
                {
                  value: name,
                  selected: name === props.selected ? true : undefined,
                },
                [name]
              )
            )
          )
      );

      const controlsCont = h("div", { class: "controls" }, [
        saveTargetsCombo,
        addTargetButton,
        removeTargetButton,
        saveAsButton,
        loadFromButton,
      ]);

      const mainCont = h(
        "div",
        {
          class: ["vue3complib", "target"],
        },
        [controlsCont]
      );

      return mainCont;
    };
  },
});
</script>

<style lang="scss">
.vue3complib.target {
  display: inline-block;
  .controls {
    display: flex;
    align-items: center;
  }
}
</style>
