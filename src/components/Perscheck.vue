<script lang="ts">
import { defineComponent, h, ref, onMounted } from "vue";

import { setLocal, getLocal } from "../utils";

import { playAudio } from "../assets";

export default defineComponent({
  name: "Perscheck",
  props: {
    id: {
      type: String,
      required: true,
    },
    default: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const cref: any = ref(0);

    onMounted(() => {
      const checked = getLocal(props.id, props.default);
      cref._rawValue.checked = checked;
    });

    return () => {
      return h(
        "input",
        {
          type: "checkbox",
          ref: cref,
          id: props.id,
          onChange: (event: any) => {
            const checked = event.target.checked;
            setLocal(props.id, checked);
            emit("perscheckchanged", {
              event: "perscheckchanged",
              id: props.id,
              checked,
            });
            playAudio("tabclick");
          },
        },
        []
      );
    };
  },
});
</script>

<style></style>
