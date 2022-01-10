<script lang="ts">
import { h, defineComponent, reactive, onMounted } from "vue";
import { getLocal, setLocal } from "../utils";

import "../lib.scss";

export type Constructor<T = {}> = new (...args: any[]) => T;

export interface CanManageTargets {
  save(target: string): void;
  load(target: string): void;
  delete(target: string): void;
  getState(def: TargetManagerState): Promise<TargetManagerState>;
  storeState(tms: TargetManagerState): void;
}

export type TargetManagerState = {
  targets: string[];
  selected: string;
};

export function EquipWithTargetManagerBase<
  TBase extends Constructor<CanManageTargets>
>(Base: TBase) {
  return class extends Base {
    state: TargetManagerState = reactive({
      targets: ["Default"],
      selected: "Default",
    });
    async initState() {
      const state = await this.getState(this.state);
      this.state.targets = state.targets;
      this.state.selected = state.selected;
    }
    update() {
      this.storeState(JSON.parse(JSON.stringify(this.state)));
    }
    remove(target: string, force?: boolean): boolean {
      if (target === "Default" && !force) return false;
      this.state.targets = this.state.targets.filter(
        (testTarget) => testTarget !== target
      );
      this.state.selected = "Default";
      this.update();
      return true;
    }
    add(target: string) {
      this.remove(target, true);
      this.state.targets.push(target);
      this.state.selected = target;
      this.update();
    }
    select(target: string) {
      this.state.selected = target;
      this.update();
    }
  };
}

export class MockTargetManagerFunctionality {
  // mock implementation of storeState
  storeState(tms: TargetManagerState) {
    setLocal("targetmanager", tms);
  }
  // mock implementation of getState
  getState(def: TargetManagerState) {
    return Promise.resolve(getLocal("targetmanager", undefined) || def);
  }
  // mock implementation of save
  save(target: string) {
    window.alert(`Saved ${target}!`);
  }
  // mock implementation of load
  load(target: string) {
    window.alert(`Loaded ${target}!`);
  }
  // mock implementation of delete
  delete(target: string) {
    window.alert(`Deleted ${target}!`);
  }
}

export const TargetManager = EquipWithTargetManagerBase(
  MockTargetManagerFunctionality
);

export default defineComponent({
  name: "TargetManager",
  props: {
    colorbuttons: {
      type: Boolean,
      default: true,
    },
    targetmanager: {
      type: TargetManager,
      default: () => new TargetManager(),
    },
  },
  setup(props, context) {
    const tm = props.targetmanager;

    onMounted(() => {
      tm.initState();
    });

    return () => {
      const addTargetButton = h(
        "button",
        {
          class: props.colorbuttons ? "greenbutton" : "",
          onClick: () => {
            const name = window.prompt("Target Name", "Default");
            if (name) {
              tm.add(name);
              context.emit("targetchanged", {
                action: "add",
                target: name,
              });
            }
          },
        },
        ["Add Target"]
      );

      const removeTargetButton = h(
        "button",
        {
          class: props.colorbuttons ? "redbutton" : "",
          onClick: () => {
            const selected = tm.state.selected;
            if (tm.remove(selected)) {
              context.emit("targetchanged", {
                action: "remove",
                target: selected,
              });
            }
          },
        },
        ["Remove Target"]
      );

      const saveAsButton = h(
        "button",
        {
          class: props.colorbuttons ? "yellowbutton" : "",
          onClick: () => {
            tm.save(tm.state.selected);
            context.emit("targetchanged", {
              action: "saveas",
              target: tm.state.selected,
            });
          },
        },
        ["Save As"]
      );

      const loadFromButton = h(
        "button",
        {
          class: props.colorbuttons ? "bluebutton" : "",
          onClick: () => {
            tm.load(tm.state.selected);
            context.emit("targetchanged", {
              action: "loadfrom",
              target: tm.state.selected,
            });
          },
        },
        ["Load From"]
      );

      const deleteTargetButton = h(
        "button",
        {
          class: props.colorbuttons ? "redbutton" : "",
          onClick: () => {
            tm.delete(tm.state.selected);
            context.emit("targetchanged", {
              action: "delete",
              target: tm.state.selected,
            });
          },
        },
        ["Delete Target"]
      );

      const saveTargetsCombo = h(
        "select",
        {
          onChange: (ev: any) => {
            const name = ev.target.value;
            tm.select(name);
            context.emit("targetchanged", {
              action: "selected",
              target: name,
            });
          },
        },
        tm.state.targets.map((name) =>
          h(
            "option",
            {
              value: name,
              selected: name === tm.state.selected ? true : undefined,
            },
            [name]
          )
        )
      );

      const controlsCont = h("div", { class: "controls" }, [
        saveTargetsCombo,
        addTargetButton,
        removeTargetButton,
        deleteTargetButton,
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
