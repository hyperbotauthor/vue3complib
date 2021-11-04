<script>
import { defineComponent, h, ref, onMounted } from "vue";

import { setLocal, getLocal } from "../utils.ts";

import { playAudio } from "../assets.ts";

export default defineComponent({
  name: "Perscombo",
  props: {
    id: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      default: [1, 2, 3].map((i) => ({
        display: `Default Option ${i}`,
        value: `defaultoption${i}`,
      })),
    },
  },
  setup(props, { emit }) {
    return () => {
      const selected = getLocal(props.id, props.default);
      return h(
        "select",
        {
          id: props.id,
          onChange: (event) => {
            const value = event.target.value;
            setLocal(props.id, value);
            const eventBlob = {
              event: "perscombochanged",
              id: props.id,
              value,
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
