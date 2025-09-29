<template>
  <div>
    <div class="row mb-3">
      <div class="col-6">
        <label for="ptStatusModelCode" class="form-label">Model code</label>
        <input class="form-control" id="ptStatusModelCode" type="number" :value="status.model" readonly>
      </div>
      <div class="col-6">
        <label for="ptStatusHardwareSettings" class="form-label">Hardware settings</label>
        <input class="form-control" id="ptStatusHardwareSettings" type="text" :value="'0x'+status.hw_setting.toString(16)" readonly>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-6">
        <label for="ptStatusMediaType" class="form-label">Media type</label>
        <input class="form-control" id="ptStatusMediaType" type="text" :value="status.media_type_name ?? '?'" readonly>
      </div>
      <div class="col-6">
        <label for="ptStatusMediaWidth" class="form-label">Media width (mm)</label>
        <input class="form-control" id="ptStatusMediaWidth" type="number" :value="status.media_width_mm" readonly>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-6">
        <label for="ptStatusTapeColor" class="form-label">Tape color</label>
        <input class="form-control" id="ptStatusTapeColor" type="text" :value="status.tape_color_name ?? '?'" readonly>
      </div>
      <div class="col-6">
        <label for="ptStatusTextColors" class="form-label">Text color</label>
        <input class="form-control" id="ptStatusTextColors" type="text" :value="status.text_color_name ?? '?'" readonly>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-6">
        <div class="form-check" v-for="et in PTOUCH_ERROR_INFORMATIONS()" :key="et.mask">
          <input class="form-check-input" type="checkbox" :id="'errorInfo'+et.mask" :checked="status.active_error_masks.includes(et.mask)" disabled>
          <label class="form-check-label" :for="'errorInfo'+et.mask">{{ et.description }}</label>
        </div>
      </div>
      <div class="col-6">
        <div class="row mb-3">
          <label for="ptStatusType" class="form-label">Type</label>
          <input class="form-control" id="ptStatusType" type="text" :value="status.status_type_name ?? '?'" readonly>
        </div>
        <div class="row mb-3">
          <label for="ptStatusPhase" class="form-label">Phase</label>
          <input class="form-control" id="ptStatusPhase" type="text" :value="status.phase_description ?? '?'" readonly>
        </div>
        <div class="row mb-3">
          <label for="ptStatusNotification" class="form-label">Notification</label>
          <input class="form-control" id="ptStatusNotification" type="text" :value="status.notification_description ?? '?'" readonly>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {PTouchDeviceStatusData} from "@/components/device_info_modal/prop_type";

import {PTOUCH_ERROR_INFORMATIONS} from "@/ptouch/data.ts";
import {PropType} from "vue";

export default {
  name: 'PTouchDeviceStatus',
  props: {
    status: {type: Object as PropType<PTouchDeviceStatusData>, required: true},
  },
  methods: {
    PTOUCH_ERROR_INFORMATIONS() {
      return PTOUCH_ERROR_INFORMATIONS
    }
  }
}
</script>

<style scoped>
</style>
