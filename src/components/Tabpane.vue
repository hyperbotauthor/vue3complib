<script lang="ts">
import { defineComponent, h, reactive, ref, watch } from "vue";

import { setLocal, getLocal } from "../utils";

import { playAudio } from "../assets";

import { Button } from "../index";

export default defineComponent({
  name: "Tabpane",
  props: {
    id: {
      type: String,
      required: true,
    },
    scrollBarWidth: {
      type: Number,
      default: 16,
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 200,
    },
    selectedCaption: {
      type: String,
      default: "None",
    },
  },
  setup(props, { slots, emit }) {
    const react = reactive({
      selectedTab: getLocal(props.id, { selectedTab: 0 }).selectedTab,
    });
    const scrollTops: any = {};
    const scrollLefts: any = {};
    const slotsContRef: any = ref(0);
    watch(
      () => props.selectedCaption,
      (newCaption, oldCaption) => {
        const caption = newCaption.split("|")[0];
        const index = (slots as any)
          .default()
          .findIndex((slot: any) => slot.props.caption === caption);
        if (index >= 0) {
          setLocal(props.id, {
            selectedTab: index,
            selectedTabCaption: caption,
          });
          react.selectedTab = index;
          slotsContRef._rawValue.scrollTop = scrollTops[index] || 0;
          slotsContRef._rawValue.scrollLeft = scrollLefts[index] || 0;
        }
      }
    );
    return () =>
      h("div", { class: "tabpane" }, [
        h("div", { class: ["vertcont"] }, [
          h(
            "div",
            {
              class: ["tabs"],
            },
            (slots as any).default().map((tab: any, i: number) =>
              h(
                "div",
                {
                  class: {
                    tab: true,
                    selected: i === react.selectedTab,
                  },
                  onClick: () => {
                    react.selectedTab = i;

                    const slot = (slots as any).default()[i];

                    const caption = slot.props.caption;

                    setLocal(props.id, {
                      selectedTab: i,
                      selectedTabCaption: caption,
                    });

                    playAudio("tabclick");

                    emit("tabpanechanged", {
                      event: "tabpanechanged",
                      id: props.id,
                      selectedTab: i,
                      selectedTabCaption: caption,
                    });

                    slotsContRef._rawValue.scrollTop = scrollTops[i] || 0;
                    slotsContRef._rawValue.scrollLeft = scrollLefts[i] || 0;
                  },
                },
                [
                  tab.props.icon
                    ? h(Button, {
                        icon: tab.props.icon,
                        tooltip: tab.props.tooltip,
                        color: "transparent",
                      })
                    : tab.props.caption,
                ]
              )
            )
          ),
          h(
            "div",
            {
              class: ["slotscont"],
              style: {
                width: `${props.width}px`,
                height: `${props.height}px`,
              },
              ref: slotsContRef,
              onScroll: (ev: any) => {
                scrollTops[react.selectedTab] = ev.target.scrollTop;
                scrollLefts[react.selectedTab] = ev.target.scrollLeft;
              },
            },
            (slots as any).default().map((slot: any, i: number) =>
              h(
                "div",
                {
                  class: {
                    slot: true,
                    active: react.selectedTab === i,
                  },
                  style: {
                    width: `${props.width - props.scrollBarWidth}px`,
                  },
                },
                [slot]
              )
            )
          ),
        ]),
      ]);
  },
});
</script>

<style>
.tabpane .tab.selected {
  background-color: #efe;
  border: solid 2px #afa !important;
  border-bottom: transparent !important;
}
.tabpane .tab {
  background-color: #eee;
}
.tabpane .tabs .tab {
  padding: 5px;
  margin: 2px;
  border: solid 2px #aaa;
  border-radius: 8px;
  border-bottom: transparent;
  cursor: pointer;
  user-select: none;
  transition: all 0.5s;
  color: #007;
}
.tabpane .tabs {
  display: flex;
  align-items: center;
  margin-left: 5px;
}
.tabpane .vertcont {
  display: flex;
  flex-direction: column;
  margin: 3px;
}
.tabpane .slotscont {
  position: relative;
  overflow: scroll;
  padding: 5px;
  border: solid 1px #777;
}
.tabpane .slot {
  visibility: hidden;
  position: absolute;
}
.tabpane .slot.active {
  visibility: visible;
}
</style>
