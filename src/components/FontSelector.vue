<script lang="ts">
import { defineComponent, h } from "vue";

import { Perscombo } from "../index";

const fontFamilies = [
  "Arial",
  "Verdana",
  "Franklin Gothic Medium",
  "Trebuchet MS",
  "Times New Roman",
  "Courier",
];
const fontSizes = [
  10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40,
];

export default defineComponent({
  name: "FontSelector",
  props: {
    id: {
      type: String,
      default: "fontselector",
    },
    defaultFamily: {
      type: String,
      default: "Arial",
    },
    defaultSize: {
      type: Number,
      default: 16,
    },
  },
  setup(props, context) {
    return () => {
      const fontFamilyCombo = h(Perscombo, {
        id: props.id + "/fontfamily",
        options: fontFamilies.map((family) => ({
          display: family,
          value: family,
        })),
        default: props.defaultFamily,
        onPerscombochanged: (ev: any) => {
          context.emit("fontselectorchanged", ev);
        },
      });

      const fontSizeCombo = h(Perscombo, {
        id: props.id + "/fontsize",
        options: fontSizes.map((size) => ({ display: size, value: size })),
        default: props.defaultSize,
        onPerscombochanged: (ev: any) => {
          context.emit("fontselectorchanged", ev);
        },
      });

      return h("div", { class: "fontselector" }, [
        h("div", { class: "controls" }, [fontFamilyCombo, fontSizeCombo]),
      ]);
    };
  },
});
</script>

<style lang="scss">
.vue3complib.fontselector {
  display: inline-block;
  .controls {
    display: flex;
    align-items: center;
  }
}
</style>
