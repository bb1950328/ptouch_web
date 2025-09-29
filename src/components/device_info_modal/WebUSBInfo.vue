<template>
  <div>
    <div class="row mb-3">
      <div class="col-6">
        <label for="usbVendorId" class="form-label">Vendor ID</label>
        <input class="form-control" id="usbVendorId" type="text" :value="'0x'+webusb.vendorId.toString(16)" readonly>
      </div>
      <div class="col-6">
        <label for="usbProductId" class="form-label">Product ID</label>
        <input class="form-control" id="usbProductId" type="text" :value="'0x'+webusb.productId.toString(16)" readonly>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-6">
        <label for="usbManufacturerName" class="form-label">Manufacturer Name</label>
        <input class="form-control" id="usbManufacturerName" type="text" :value="webusb.manufacturerName" readonly>
      </div>
      <div class="col-6">
        <label for="usbProductName" class="form-label">Product Name</label>
        <input class="form-control" id="usbProductName" type="text" :value="webusb.productName" readonly>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-6">
        <label for="usbSerialNumber" class="form-label">Serial Number</label>
        <input class="form-control" id="usbSerialNumber" type="text" :value="webusb.serialNumber" readonly>
      </div>
      <div class="col-6">
        <label for="usbVersion" class="form-label">USB Version</label>
        <input class="form-control" id="usbVersion" type="text" :value="webusb.usbVersion" readonly>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {WebUSBInfoData} from "@/components/device_info_modal/prop_type";
import {PropType} from "vue";

export default {
  name: 'WebUSBInfo',
  props: {
    webusb: {type: Object as PropType<WebUSBInfoData>, required: true},
  },
}
</script>

<style scoped>
</style>
