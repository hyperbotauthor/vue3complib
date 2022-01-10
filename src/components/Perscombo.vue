<script>
import { defineComponent, h, ref, onMounted, watchEffect, reactive } from "vue";

import { setLocal, getLocal, uid } from "../utils.ts";

import { playAudio } from "../assets.ts";

export default defineComponent({
  name: "Perscombo",
  props: {
    id: {
      type: String,
      required: true,
    },
    default: {},
    options: {
      type: Array,
      default: [1, 2, 3].map((i) => ({
        display: `Default Option ${i}`,
        value: `defaultoption${i}`,
      })),
    },
    updateUid: {
      type: String,
      default: uid(),
    },
    updateSelected: {
      type: String,
      default: "",
    },
  },
  setup(props, { emit }) {
    let selected = getLocal(props.id, props.default);
    function setSelected(value) {
      selected = value;
      setLocal(props.id, selected);
    }
    let oldUpdateUid = props.updateUid;
    watchEffect(() => {
      if (props.updateUid !== oldUpdateUid) {
        oldUpdateUid = props.updateUid;
        setSelected(props.updateSelected);
      }
    });
    return () => {
      return h(
        "select",
        {
          id: props.id,
          key: uid() + props.updateUid,
          onChange: (event) => {
            setSelected(event.target.value);
            const eventBlob = {
              event: "perscombochanged",
              id: props.id,
              value: selected,
            };
            emit("perscombochanged", eventBlob);
            playAudio("tabclick");
          },
        },
        props.options.map((option, i) =>
          h(
            "option",
            {
              value: option.value,
              selected: `${option.value}` === `${selected}` ? true : undefined,
            },
            [option.display]
          )
        )
      );
    };
  },
});
</script>

<style></style>
