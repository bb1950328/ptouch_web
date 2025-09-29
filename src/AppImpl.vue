<template>
  <button type="button" class="btn btn-primary" @click="deviceButtonClicked" :disabled="!interf.is_webusb_available()">
    <span v-if="!interf.is_connected()"><font-awesome-icon icon="fa-brands fa-usb"/>Connect</span>
    <span v-else>{{ interf.get_device_name() }}</span>
  </button>

  <div class="dropdown">
    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      <font-awesome-icon icon="fa-solid fa-gear"/>
    </button>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" href="#" @click="showDeviceInfoDialog">Device Info</a></li>
    </ul>
  </div>

  <DeviceInfoModal v-if="deviceInfoData!=null" ref="deviceInfoModal" :info="deviceInfoData"/>

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

<script lang="ts">
import {PTouchInterface} from "@/ptouch/interface.js";
import * as bootstrap from 'bootstrap';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {library} from "@fortawesome/fontawesome-svg-core"
import {faGear} from "@fortawesome/free-solid-svg-icons";
import {faUsb} from "@fortawesome/free-brands-svg-icons"
import DeviceInfoModal from "@/components/device_info_modal/DeviceInfoModal.vue";

import {DeviceInfoModalProps} from "@/components/device_info_modal/prop_type"

library.add(faUsb, faGear);

export default {
  name: 'AppImpl',
  components: {
    'font-awesome-icon': FontAwesomeIcon,
    DeviceInfoModal,
  },
  data() {
    return {
      interf: new PTouchInterface(),
    }
  },
  computed: {
    deviceInfoData(): DeviceInfoModalProps | null {
      if (!this.interf.is_connected()) return null;
      const w = this.interf.get_webusb_device();
      const devType = this.interf.get_ptouch_device_type();
      const st = this.interf.get_status();
      if (st == null) {
        return null;
      }
      const activeMasks = Array.from(st.errors ?? []).map(e => e.mask);
      return {
        webusb: {
          vendorId: w.vendorId,
          productId: w.productId,
          manufacturerName: w.manufacturerName,
          productName: w.productName,
          serialNumber: w.serialNumber,
          usbVersion: `${w.usbVersionMajor}.${w.usbVersionMinor}.${w.usbVersionSubminor}`,
        },
        devType: {
          name: devType.name,
          max_width_px: devType.max_width_px,
          dpi: devType.dpi,
        },
        status: {
          model: st.model,
          hw_setting: st.hw_setting,
          media_type_name: st.media_type?.name ?? null,
          media_width_mm: st.media_width_mm,
          tape_color_name: st.tape_color?.name ?? null,
          text_color_name: st.text_color?.name ?? null,
          status_type_name: st.status_type?.name ?? null,
          phase_description: st.phase?.description ?? null,
          notification_description: st.notification?.description ?? null,
          active_error_masks: activeMasks,
        }
      };
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
    showDeviceInfoDialog() {
      this.$refs.deviceInfoModal?.show();
    }
  },
}
</script>

<style scoped>

</style>
