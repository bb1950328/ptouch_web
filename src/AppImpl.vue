<template>

</template>

<script>
import {PTouchInterface} from "@/ptouch/interface.js";

export default {
  name: 'AppImpl',
  components: {},
  data() {
    return {
      interf: new PTouchInterface(),
    }
  },
  async setup() {
    console.log("setup");
  },
  methods: {
  },
}
</script>

<style scoped>

</style>
