<script>
import { defineComponent, h, onMounted, onUpdated, ref } from "vue";

import { setLocal, getLocal } from "../utils.ts";

import { playAudio } from "../assets.ts";

export default defineComponent({
  name: "Tabpane",
  props: {
    id: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      default: 600,
    },
    height: {
      type: Number,
      default: 400,
    },
  },
  setup(props, { slots, emit }) {
    const slotElements = slots.default();

    const tabs = slotElements.map((e, i) =>
      e.props && e.props.caption ? e.props.caption : `Tab ${i + 1}`
    );

    const tabRefs = tabs.map((_) => ref(0));

    const setSelected = (i) => {
      if (typeof i !== "undefined") {
        setLocal(props.id, {
          selectedTab: i,
          selectedTabCaption: tabs[i],
        });
      }

      const selectedTab = getLocal(props.id, { selectedTab: 0 }).selectedTab;

      tabRefs.forEach((tabRef, i) => {
        const e = tabRef._rawValue;

        e.classList.remove("selected");

        if (i === selectedTab) e.classList.add("selected");

        const s = slotElements[i].el;

        s.classList.add("slot");

        s.classList.remove("active");

        if (i === selectedTab) s.classList.add("active");
      });
    };

    onMounted(() => {
      setSelected();
    });

    onUpdated(() => {
      setSelected();
    });

    return () => {
      const tabDivs = h(
        "div",
        {
          class: ["tabs"],
        },
        tabs.map((tab, i) =>
          h(
            "div",
            {
              ref: tabRefs[i],
              class: ["tab"],
              onClick: () => {
                playAudio("tabclick");
                setSelected(i);
                emit("tabpanechanged", {
                  event: "tabpanechanged",
                  id: props.id,
                  selectedTab: i,
                  selectedTabCaption: tabs[i],
                });
              },
            },
            [tab]
          )
        )
      );

      const contentDiv = h(
        "div",
        {
          style: `width: ${props.width}px; height: ${props.height}px;`,
          class: ["slotscont"],
        },
        slots
      );

      const vertCont = h(
        "div",
        {
          class: ["vertcont"],
        },
        [tabDivs, contentDiv]
      );

      return h(
        "div",
        {
          class: ["tabpane"],
          id: props.id,
        },
        vertCont
      );
    };
  },
});
</script>

<style>
.tabppane {
}
.tabpane .tab.selected {
  background-color: #ffa;
  border: solid 2px #0f0 !important;
  border-bottom: transparent !important;
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
.slotscont {
  position: relative;
  overflow: scroll;
  padding: 5px;
  border: solid 1px #777;
}
.slot {
  visibility: hidden;
  position: absolute;
}
.slot.active {
  visibility: visible;
}
</style>
