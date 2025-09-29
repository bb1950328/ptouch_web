<template>
  <button type="button" class="btn btn-primary" @click="deviceButtonClicked" :disabled="!interf.is_webusb_available()">
    <span v-if="!interf.is_connected()">Connect</span>
    <span v-else>{{ interf.get_device_name() }}</span>
  </button>

  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div id="errorNoWebUSB" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">Bootstrap</strong>
        <small>11 mins ago</small>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        <p>Unfortunately, WebUSB is not supported in this browser.</p>
        <p>Please switch to a browser that <a href="https://caniuse.com/webusb">supports WebUSB</a></p>
      </div>
    </div>
  </div>
</template>

<script>
import {PTouchInterface} from "@/ptouch/interface.js";
import * as bootstrap from 'bootstrap';

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
  async mounted() {
    if (!this.interf.is_webusb_available()) {
      let toast = document.getElementById("errorNoWebUSB");
      let t = bootstrap.Toast.getOrCreateInstance(toast);
      t.show();
    }
  },
  methods: {
    async deviceButtonClicked() {
      console.log("deviceButtonClicked");
      await this.interf.connect();
    },
  },
}
</script>

<style scoped>

</style>
