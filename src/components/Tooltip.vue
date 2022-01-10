<script lang="ts">
import { defineComponent, h, ref } from "vue";

import { Iconbutton, getLocal } from "../index";

export default defineComponent({
  name: "Tooltip",
  props: ["tooltip"],
  setup(props, { slots }) {
    const render = () => {
      const btn = (slots as any).default();

      const tooltipContRef: any = ref(0);

      const arrow = h("div", {
        class: ["arrow"],
      });

      const tooltip = h("div", {
        class: ["tooltip"],
        innerHTML: props.tooltip
          ? props.tooltip.replaceAll("_", "&nbsp;")
          : undefined,
      });

      const tooltipCont = h(
        "div",
        {
          ref: tooltipContRef,
          class: ["tooltipcont"],
        },
        [arrow, tooltip]
      );

      return h(
        "div",
        {
          class: ["vue3complib", "btncont"],
          onMouseover: () => {
            if (!props.tooltip) return;
            if (getLocal("disabletooltips", false)) return;
            tooltipContRef._rawValue.style.visibility = "visible";
            tooltipContRef._rawValue.style.transform = "scale(1)";
          },
          onMouseout: () => {
            tooltipContRef._rawValue.style.visibility = "hidden";
            tooltipContRef._rawValue.style.transform = "scale(0)";
          },
        },
        [btn, tooltipCont]
      );
    };

    return render;
  },
});
</script>

<style lang="scss">
.vue3complib.btncont {
  display: inline-block;
  position: relative;
  .tooltipcont {
    position: absolute;
    z-index: 1000;
    transform: scale(0);
    visibility: hidden;
    transition: transform 0.3s;
    padding-top: 5px;
  }
  .tooltip {
    position: absolute;
    background-color: #000;
    color: #fff;
    padding: 3px;
    padding-left: 5px;
    padding-right: 5px;
    margin: 3px;
    border-radius: 5px;
    text-align: center;
    z-index: 1010;
  }
  .arrow {
    position: absolute;
    background-color: #000;
    left: 10px;
    width: 15px;
    height: 15px;
    transform: rotate(45deg);
    z-index: 1005;
  }
  .smallbutton {
    font-size: 10px;
  }
  .greenbutton {
    background-color: #dfd;
  }
  .redbutton {
    background-color: #fdd;
  }
  .bluebutton {
    background-color: #ddf;
  }
  .yellowbutton {
    background-color: #ffd;
  }
}
</style>
