<template>
  <button type="button" class="btn btn-primary" @click="deviceButtonClicked" :disabled="interf!=null && !interf.is_webusb_available()">
    <span v-if="!interf.is_connected()"><font-awesome-icon icon="fa-brands fa-usb"/>Connect</span>
    <span v-else>{{ interf.get_device_name() }}</span>
  </button>

  <div class="dropdown">
    <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
      <font-awesome-icon icon="fa-solid fa-gear"/>
    </button>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" href="#" @click="showDeviceInfoDialog">Device Info</a></li>
      <li><a class="dropdown-item" href="#" @click="connnectMockDevice">Connect Mock Device</a></li>
    </ul>
  </div>

  <Preview :design="design" :px_per_mm="8" :tape_width_mm="24" :tape_length_mm="1000" :selected_element_ids="selected_element_ids" @elementClicked="onElementClicked"/>

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
import {PTouchInterface, PTouchInterfaceUSB} from "@/ptouch/interface"
import * as bootstrap from 'bootstrap';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {library} from "@fortawesome/fontawesome-svg-core"
import {faGear} from "@fortawesome/free-solid-svg-icons";
import {faUsb} from "@fortawesome/free-brands-svg-icons"
import DeviceInfoModal from "@/components/device_info_modal/DeviceInfoModal.vue";

import {DeviceInfoModalProps, PTouchDeviceStatusData, PTouchDeviceTypeData, WebUSBInfoData} from "@/components/device_info_modal/prop_type";
import {PTouchInterfaceMock} from "@/ptouch/mock_interface";
import Preview, {PreviewElementClickedEvent} from "@/components/preview/Preview.vue";
import {Design, DesignElementText, DesignInterface} from "@/design";

library.add(faUsb, faGear);

export default {
  name: 'AppImpl',
  components: {
    Preview,
    'font-awesome-icon': FontAwesomeIcon,
    DeviceInfoModal,
  },
  data() {
    return {
      interf: new PTouchInterfaceUSB() as PTouchInterface,
      design: new Design() as DesignInterface,
      selected_element_ids: new Set<number>(),
    }
  },
  computed: {
    deviceInfoData(): DeviceInfoModalProps | null {
      if (this.interf == null || !this.interf.is_connected()) {
        return null;
      }
      const w = this.interf.get_webusb_device();
      const devType = this.interf.get_ptouch_device_type();
      const st = this.interf.get_status();
      if (st == null) {
        return null;
      }
      const activeMasks = Array.from(st.errors ?? []).map(e => e.mask);
      let rWebusb: WebUSBInfoData | null = w == null
          ? null
          : {
            vendorId: w.vendorId,
            productId: w.productId,
            manufacturerName: w.manufacturerName,
            productName: w.productName,
            serialNumber: w.serialNumber,
            usbVersion: `${w.usbVersionMajor}.${w.usbVersionMinor}.${w.usbVersionSubminor}`,
          };
      let rDevType: PTouchDeviceTypeData | null = devType == null
          ? null
          : {
            name: devType.name,
            max_width_px: devType.max_width_px,
            dpi: devType.dpi,
          };
      let rStatus: PTouchDeviceStatusData = {
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
      };
      return {
        webusb: rWebusb,
        devType: rDevType,
        status: rStatus
      };
    }
  },
  async setup() {
    console.log("setup");
  },
  async mounted() {
    if (!this.interf.is_webusb_available()) {
      let toast = document.getElementById("errorNoWebUSB")!;
      let t = bootstrap.Toast.getOrCreateInstance(toast);
      t.show();
    }

    this.design.add(new DesignElementText(this.design.nextId(), "Hello World", 10, 10, 3));
    this.design.add(new DesignElementText(this.design.nextId(), "Hello World", 10, 30, 3));
  },
  methods: {
    async deviceButtonClicked() {
      console.log("deviceButtonClicked");
      await this.interf.connect();
    },
    showDeviceInfoDialog() {
      (this.$refs.deviceInfoModal as typeof DeviceInfoModal).show();
    },
    connnectMockDevice() {
      this.interf = new PTouchInterfaceMock();
      this.interf.connect();
    },
    onElementClicked(event: PreviewElementClickedEvent) {
      if (event.ctrlPressed && event.element_id != null) {
        if (this.selected_element_ids.has(event.element_id)) {
          this.selected_element_ids.delete(event.element_id);
        } else {
          this.selected_element_ids.add(event.element_id);
        }
      } else if (event.element_id != null && !this.selected_element_ids.has(event.element_id)) {
        this.selected_element_ids.add(event.element_id);
      } else {
        this.selected_element_ids.clear();
      }
    }
  },
}
</script>

<style scoped>

</style>
