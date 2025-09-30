<template>
  <div class="modal" tabindex="-1" ref="modalEl" aria-labelledby="deviceInfoModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="deviceInfoModalLabel">Device Info</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="info">
            <div v-if="info.webusb">
              <h4>WebUSB</h4>
              <WebUSBInfo :webusb="info.webusb"/>
            </div>

            <div v-if="info.devType">
              <h4>P-Touch Device Type</h4>
              <PTouchDeviceType :devType="info.devType"/>
            </div>

            <div v-if="info.status">
              <h4>P-Touch Device Status</h4>
              <PTouchDeviceStatus :status="info.status"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as bootstrap from 'bootstrap';
import WebUSBInfo from './WebUSBInfo.vue';
import PTouchDeviceType from './PTouchDeviceType.vue';
import PTouchDeviceStatus from './PTouchDeviceStatus.vue';

import {PropType} from "vue";
import {DeviceInfoModalProps} from "@/components/device_info_modal/prop_type";

export default {
  name: 'DeviceInfoModal',
  props: {
    info: {type: Object as PropType<DeviceInfoModalProps>, required: false},
  },
  components: {WebUSBInfo, PTouchDeviceType, PTouchDeviceStatus},
  data() {
    return {
      _modal: null as bootstrap.Modal | null,
    }
  },
  mounted() {
    this._modal = bootstrap.Modal.getOrCreateInstance(this.$refs.modalEl as HTMLDivElement);
  },
  methods: {
    show() {
      if (!this._modal) {
        this._modal = bootstrap.Modal.getOrCreateInstance(this.$refs.modalEl as HTMLDivElement);
      }
      this._modal.show();
    }
  }
}
</script>

<style scoped>
</style>
