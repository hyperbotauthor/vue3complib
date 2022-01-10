<script>
import { defineComponent, h, ref, onMounted } from "vue";

export default defineComponent({
  name: "Link",
  props: {
    href: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
  },
  setup(props, {}) {
    return () => {
      return h(
        "a",
        {
          href: props.href,
          target: "_blank",
          rel: "noopener noreferrer",
        },
        [props.caption ? props.caption : props.href]
      );
    };
  },
});
</script>

<style></style>
