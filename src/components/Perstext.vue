<template>
  <span>
    <input ref="text" v-on:input="input" v-on:keyup.enter="enter" type="text" />
    <button v-if="buttoncaption" v-on:click="buttonpressed">
      {{ buttoncaption }}
    </button>
  </span>
</template>

<script>
import { setLocal, getLocal } from "../utils.ts";

import { playAudio } from "../assets.ts";

export default {
  name: "Perstext",
  props: {
    id: {
      type: String,
      required: true,
    },
    default: {
      type: String,
      default: "",
    },
    onsubmitclear: {
      type: Boolean,
      default: false,
    },
    buttoncaption: {
      type: String,
      default: "",
    },
  },
  methods: {
    perstextchanged(submit) {
      const value = this.$refs.text.value;

      this.$emit("perstextchanged", {
        event: "perstextchanged",
        id: this.id,
        value,
        submit,
      });

      if (submit && this.onsubmitclear) this.setValue("");
    },
    buttonpressed() {
      this.perstextchanged(true);
      playAudio("tabclick");
    },
    setValue(value) {
      setLocal(this.id, value);
      this.$refs.text.value = value;
    },
    input() {
      const value = this.$refs.text.value;
      setLocal(this.id, value);

      this.perstextchanged();
    },
    enter() {
      this.perstextchanged(true);
      playAudio("tabclick");
    },
  },
  mounted() {
    const text = getLocal(this.id, this.default);

    this.$refs.text.value = text;
  },
};
</script>

<style></style>
