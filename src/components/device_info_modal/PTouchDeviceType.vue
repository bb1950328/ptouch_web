<template>
  <div>
    <div class="row mb-3">
      <div class="col-12">
        <label for="ptTouchDeviceName" class="form-label">Device Name</label>
        <input class="form-control" id="ptTouchDeviceName" type="text" :value="devType.name" readonly>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-6">
        <label for="ptTouchMaxWidthPx" class="form-label">Max Width (px)</label>
        <input class="form-control" id="ptTouchMaxWidthPx" type="text" :value="devType.max_width_px" readonly>
      </div>
      <div class="col-6">
        <label for="ptTouchDPI" class="form-label">DPI</label>
        <input class="form-control" id="ptTouchDPI" type="text" :value="devType.dpi" readonly>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {PTouchDeviceTypeData} from "@/components/device_info_modal/prop_type";
import {PropType} from "vue";

export default {
  name: 'PTouchDeviceType',
  props: {
    devType: {type: Object as PropType<PTouchDeviceTypeData>, required: true},
  },
}
</script>

<style scoped>
</style>
