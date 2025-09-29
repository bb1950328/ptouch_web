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

  <div class="modal" tabindex="-1" id="deviceInfoModal" aria-labelledby="deviceInfoModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="deviceInfoModalLabel">Device Info</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="interf.is_connected()">
            <h4>WebUSB</h4>
            <div class="row mb-3">
              <div class="col-6">
                <label for="usbVendorId" class="form-label">Vendor ID</label>
                <input class="form-control" id="usbVendorId" type="text"
                       :value="'0x'+interf.get_webusb_device().productId.toString(16)" readonly>
              </div>
              <div class="col-6">
                <label for="usbProductId" class="form-label">Product ID</label>
                <input class="form-control" id="usbProductId" type="text"
                       :value="'0x'+interf.get_webusb_device().productId.toString(16)" readonly>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <label for="usbManufacturerName" class="form-label">Manufacturer Name</label>
                <input class="form-control" id="usbManufacturerName" type="text"
                       :value="interf.get_webusb_device().manufacturerName" readonly>
              </div>
              <div class="col-6">
                <label for="usbProductName" class="form-label">Product Name</label>
                <input class="form-control" id="usbProductName" type="text"
                       :value="interf.get_webusb_device().productName" readonly>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <label for="usbSerialNumber" class="form-label">Serial Number</label>
                <input class="form-control" id="usbSerialNumber" type="text"
                       :value="interf.get_webusb_device().serialNumber" readonly>
              </div>
              <div class="col-6">
                <label for="usbVersion" class="form-label">USB Version</label>
                <input class="form-control" id="usbVersion" type="text"
                       :value="interf.get_webusb_device().usbVersionMajor+'.'+interf.get_webusb_device().usbVersionMinor+'.'+interf.get_webusb_device().usbVersionSubminor"
                       readonly>
              </div>
            </div>
            <h4>PT-Touch</h4>
            <div class="row mb-3">
              <div class="col-12">
                <label for="ptTouchDeviceName" class="form-label">Device Name</label>
                <input class="form-control" id="ptTouchDeviceName" type="text"
                       :value="interf.get_ptouch_device_type().name" readonly>
              </div>
            </div>
            <div class="row mb-3">
              <div class="col-6">
                <label for="ptTouchMaxWidthPx" class="form-label">Max Width (px)</label>
                <input class="form-control" id="ptTouchMaxWidthPx" type="text"
                       :value="interf.get_ptouch_device_type().max_width_px" readonly>
              </div>
              <div class="col-6">
                <label for="ptTouchDPI" class="form-label">DPI</label>
                <input class="form-control" id="ptTouchDPI" type="text" :value="interf.get_ptouch_device_type().dpi"
                       readonly>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

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
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {library} from "@fortawesome/fontawesome-svg-core"
import {faGear} from "@fortawesome/free-solid-svg-icons";
import {faUsb} from "@fortawesome/free-brands-svg-icons"

library.add(faUsb, faGear);

export default {
  name: 'AppImpl',
  components: {
    'font-awesome-icon': FontAwesomeIcon,
  },
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
    showDeviceInfoDialog() {
      let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deviceInfoModal'));
      modal.show();
    }
  },
}
</script>

<style scoped>

</style>
