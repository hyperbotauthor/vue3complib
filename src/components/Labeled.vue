<script lang="ts">
import { defineComponent, h } from "vue";

export default defineComponent({
  name: "Labeled",
  props: {
    label: {
      type: String,
      required: true,
    },
    rev: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    return () => {
      const label = h(
        "div",
        {
          class: ["label"],
        },
        [props.label]
      );

      const content = h(
        "div",
        {
          class: ["content"],
        },
        slots
      );

      const order = [label, content];
      if (props.rev) order.reverse();

      const inner = [
        h(
          "div",
          {
            class: ["cont"],
          },
          order
        ),
      ];

      const outer = [
        h(
          "div",
          {
            class: ["labeled", "outercont"],
          },
          inner
        ),
      ];

      return outer;
    };
  },
});
</script>

<style>
.labeled.outercont {
  display: inline-block;
  margin: 1px;
  box-shadow: 2px 2px #777;
}
.labeled .cont {
  display: flex;
  align-items: center;
  padding: 2px;
  border: solid 1px;
  background-color: #eee;
}
.labeled .label {
  color: #00a;
  font-style: italic;
  margin-left: 4px;
  margin-right: 4px;
}
.labeled .content {
  border: solid 1px #777;
  padding: 2px;
}
</style>
