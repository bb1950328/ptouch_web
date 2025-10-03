<template>
  <Toolbar :printer_connection_status="printerConnectionStatusStr"
           :printer_name="interfaceData.deviceType?.name ?? '?'"
           :tape_media_type="interfaceData.status?.media_type ?? null"
           :tape_width_mm="interfaceData.status?.media_width_mm ?? null"
           :tape_tape_color="interfaceData.status?.tape_color ?? null"
           :tape_text_color="interfaceData.status?.text_color ?? null"
           :print_enabled="design.elements().length>0"
           @connectPrinter="connectButtonClicked"
           @disconnectPrinter="disconnectButtonClicked"
           @connectMockPrinter="connectMockDevice"
           @showPrinterInfo="showDeviceInfoDialog"
           @print="printDesign"/>
  <main v-if="interfaceData.connected">
    <Preview :design="design"
             :px_per_mm="pxPerMM"
             :tape_width_mm="tape_info?.width_mm ?? 24"
             :tape_margin_mm="tape_info?.margins_mm ?? 3"
             :tape_length_mm="1000"
             :selected_element_ids="selected_element_ids"
             @elementClicked="onElementClicked"
             @elementsChanged="editorElementsChanged"/>

    <div class="btn-toolbar gap-1 mt-2 mb-2" role="toolbar" aria-label="Actions Toolbar">
      <div class="btn-group" role="group" aria-label="Add Element">
        <button type="button" class="btn btn-primary" v-on:click="addElementText">
          <font-awesome-icon icon="fa-solid fa-font"/>
          Text
        </button>
        <button type="button" class="btn btn-primary" v-on:click="addElementImage">
          <font-awesome-icon icon="fa-solid fa-image"/>
          Image
        </button>
        <button type="button" class="btn btn-primary" v-on:click="addElementIcon">
          <font-awesome-icon icon="fa-solid fa-star"/>
          Icon
        </button>
        <div class="btn-group" role="group">
          <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            More
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#" @click="addElementQRCode">
              <font-awesome-icon icon="fa-solid fa-qrcode"/>
              QR Code
            </a></li>
          </ul>
        </div>
      </div>

      <div class="btn-group" role="group" aria-label="Actions">
        <button type="button" class="btn btn-primary" :disabled="selected_element_ids.size==0" v-on:click="cloneSelectedElements">
          <font-awesome-icon icon="fa-solid fa-clone"/>
          Clone
        </button>
        <button type="button" class="btn btn-danger" :disabled="selected_element_ids.size==0" v-on:click="deleteSelectedElements">
          <font-awesome-icon icon="fa-solid fa-trash-can"/>
          Delete
        </button>
      </div>
    </div>

    <div class="card">
      <h5 class="card-header">Properties</h5>
      <div class="card-body">
        <p v-if="selected_element_ids.size==0">No element selected.</p>
        <div v-else>
          <EditorText v-if="shown_editor_types.has('text')" :elements="selected_elements as DesignElementText[]" @elementsChanged="editorElementsChanged"/>
          <EditorImage v-if="shown_editor_types.has('image')" :elements="selected_elements as DesignElementImage[]" @elementsChanged="editorElementsChanged"/>
          <EditorIcon v-if="shown_editor_types.has('icon')" :elements="selected_elements as DesignElementIcon[]" @elementsChanged="editorElementsChanged"/>
          <EditorQRCode v-if="shown_editor_types.has('qrcode')" :elements="selected_elements as DesignElementQRCode[]" @elementsChanged="editorElementsChanged"/>
        </div>
      </div>
    </div>

    <!-- TODO remove or hide -->
    <textarea :value="JSON.stringify(design, null, 2)" rows="20" class="form-control w-100 mt-5" id="designJsonArea" readonly/>

    <DeviceInfoModal v-if="deviceInfoData!=null" ref="deviceInfoModal" :info="deviceInfoData"/>

    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div id="errorNoWebUSB" ref="errorNoWebUSB" class="toast text-bg-danger" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">Error</strong>
          <small></small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          <p>Unfortunately, WebUSB is not supported in this browser.</p>
          <p>Please switch to a browser that <a href="https://caniuse.com/webusb">supports WebUSB</a></p>
        </div>
      </div>
      <div id="errorWhileConnecting" ref="errorWhileConnecting" class="toast text-bg-danger" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">Error</strong>
          <small></small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          <p>An error occurred while connecting to the printer:</p>
          <p>{{ printerConnectionErrorMessage }}</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts">
import * as bootstrap from 'bootstrap';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {library} from "@fortawesome/fontawesome-svg-core"
import {faClone, faFont, faGear, faImage, faQrcode, faStar, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {faUsb} from "@fortawesome/free-brands-svg-icons"
import DeviceInfoModal from "@/components/device_info_modal/DeviceInfoModal.vue";
import type {EditorType} from "@/components/editor/editor";

import {DeviceInfoModalProps, PTouchDeviceStatusData, PTouchDeviceTypeData, WebUSBInfoData} from "@/components/device_info_modal/prop_type";
import Preview, {PreviewElementClickedEvent} from "@/components/preview/Preview.vue";
import {Design, DesignElement, DesignElementIcon, DesignElementImage, DesignElementQRCode, DesignElementText, DesignInterface} from "@/design";
import EditorText from "@/components/editor/EditorText.vue";
import EditorImage from "@/components/editor/EditorImage.vue";
import EditorIcon from "@/components/editor/EditorIcon.vue";
import Toolbar from "@/components/toolbar/Toolbar.vue";
import {findTapeInfo, PTouchDeviceStatus, PTouchTapeInfo} from "@/ptouch/data";
import {markRaw} from "vue";
import {InterfaceManager} from "@/ptouch/interface_manager";
import {PrinterConnectionStatus} from "@/components/toolbar/toolbar";
import EditorQRCode from "@/components/editor/EditorQRCode.vue";

library.add(faUsb, faGear, faFont, faImage, faClone, faTrashCan, faStar, faQrcode);

interface InterfaceData {
  connected: boolean;
  status: PTouchDeviceStatus | null;
  deviceType: PTouchDeviceTypeData | null;
}

export default {
  name: 'AppImpl',
  components: {
    Toolbar,
    EditorImage,
    EditorText,
    Preview,
    'font-awesome-icon': FontAwesomeIcon,
    DeviceInfoModal,
    EditorIcon,
    EditorQRCode,
  },
  data() {
    const interfaceData: InterfaceData = {
      connected: false,
      status: null,
      deviceType: null,
    };
    return {
      interfaceManager: markRaw(new InterfaceManager()),
      interfaceData: interfaceData,
      interfaceStatusListenerId: 0,
      design: new Design() as DesignInterface,
      selected_element_ids: new Set<number>(),
      printerConnectionErrorMessage: "",
    }
  },
  computed: {
    printerConnectionStatusStr(): PrinterConnectionStatus {
      if (this.interfaceData?.connected) {
        return this.interfaceManager.get().is_mock() ? 'mock_connected' : 'connected';
      } else {
        return 'disconnected';
      }
    },
    pxPerMM(): number {
      const tapeInfo = this.tape_info;
      if (tapeInfo != null) {
        return tapeInfo.width_px / (tapeInfo.width_mm - 2 * tapeInfo.margins_mm);
      }
      return 8;
    },
    tape_info(): PTouchTapeInfo | null {
      const tapeWidth = this.interfaceData?.status?.media_width_mm;
      return tapeWidth != null ? findTapeInfo(tapeWidth) : null;
    },
    deviceInfoData(): DeviceInfoModalProps | null {
      if (!this.interfaceManager.get().is_connected()) {
        return null;
      }
      const st = this.interfaceData?.status;
      if (st == null) {
        return null;
      }
      const w = this.interfaceManager.get().get_webusb_device();
      const devType = this.interfaceData?.deviceType;
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
    },
    selected_elements(): DesignElement[] {
      let result = new Array<DesignElement>();
      this.selected_element_ids.forEach(id => {
        let element = this.design.get_element(id);
        result.push(element);
      });
      return result;
    },
    shown_editor_types(): Set<EditorType> {
      let result = new Set<EditorType>(["text", "image", "icon", "qrcode"]);
      if (this.selected_element_ids.size == 0) {
        result.clear();
      } else {
        this.selected_element_ids.forEach(id => {
          let element = this.design.get_element(id);
          if (!(element instanceof DesignElementText)) {
            result.delete("text");
          }
          if (!(element instanceof DesignElementImage)) {
            result.delete("image");
          }
          if (!(element instanceof DesignElementIcon)) {
            result.delete("icon");
          }
          if (!(element instanceof DesignElementQRCode)) {
            result.delete("qrcode");
          }
        });
      }
      return result;
    },
  },
  async setup() {
  },
  async mounted() {
    this.updateInterfaceData();
    this.interfaceStatusListenerId = this.interfaceManager.addDeviceStatusListener(status => {
      this.updateInterfaceData();
    });

    if (!this.interfaceManager.isWebUSBAvailable()) {
      let t = bootstrap.Toast.getOrCreateInstance(this.$refs.errorNoWebUSB as HTMLElement);
      t.show();
    }
  },
  async unmounted() {
    this.interfaceManager.removeDeviceStatusListener(this.interfaceStatusListenerId);
    this.interfaceStatusListenerId = 0;
  },
  methods: {
    updateInterfaceData() {
      console.log("updateInterfaceData");
      this.interfaceData = {
        connected: this.interfaceManager.get().is_connected(),
        status: this.interfaceManager.get().get_status(),
        deviceType: this.interfaceManager.get().get_ptouch_device_type(),
      };
    },
    async connectButtonClicked() {
      console.log("deviceButtonClicked");
      try {
        this.interfaceManager.setTypeUSB();
        await this.interfaceManager.get().connect();
      } catch (e: unknown) {
        if (typeof e === "string") {
          this.printerConnectionErrorMessage = e;
        } else if (e instanceof Error) {
          this.printerConnectionErrorMessage = e.message;
        }
        let t = bootstrap.Toast.getOrCreateInstance(this.$refs.errorWhileConnecting as HTMLElement);
        t.show();
        throw e;
      }
    },
    showDeviceInfoDialog() {
      (this.$refs.deviceInfoModal as typeof DeviceInfoModal).show();
    },
    async connectMockDevice() {
      this.interfaceManager.setTypeMock();
      await this.interfaceManager.get().connect();
    },
    disconnectButtonClicked() {
      this.interfaceManager.get().disconnect();
      this.interfaceManager.setTypeUSB();
    },
    onElementClicked(event: PreviewElementClickedEvent) {
      if (event.ctrlPressed) {
        if (event.element_id != null) {
          if (this.selected_element_ids.has(event.element_id)) {
            this.selected_element_ids.delete(event.element_id);
          } else {
            this.selected_element_ids.add(event.element_id);
          }
        }
      } else {
        this.selected_element_ids.clear();
        if (event.element_id != null) {
          this.selected_element_ids.add(event.element_id);
        }
      }
    },
    cloneSelectedElements() {
      let newIds = new Set<number>();
      this.selected_element_ids.forEach(id => {
        let original = this.design.get_element(id);
        let nextId = this.design.nextId();
        let clone = original.duplicate(nextId, this.design.rightEndMM());
        newIds.add(nextId);
        this.design.add(clone);
      });
      this.selected_element_ids = newIds;
    },
    deleteSelectedElements() {
      this.selected_element_ids.forEach(id => this.design.remove(id));
      this.selected_element_ids.clear();
    },
    addElementText() {
      let tapeWidth = this.interfaceData.status!.media_width_mm;
      let element = new DesignElementText(this.design.nextId(), "Text", this.design.rightEndMM(), tapeWidth / 4, tapeWidth / 2, "Roboto", "normal");
      this.design.add(element);
      this.selected_element_ids.clear();
      this.selected_element_ids.add(element.id());
    },
    addElementImage() {
      let tapeWidth = this.interfaceData.status!.media_width_mm;
      let element = new DesignElementImage(this.design.nextId(),
          null,
          this.design.rightEndMM(),
          tapeWidth / 8,
          tapeWidth / 4 * 3,
          tapeWidth / 4 * 3,
          true,
          false,
          0.5,
      );
      this.design.add(element);
      this.selected_element_ids.clear();
      this.selected_element_ids.add(element.id());
    },
    addElementIcon() {
      let tapeWidth = this.interfaceData.status!.media_width_mm;
      let element = new DesignElementIcon(
          this.design.nextId(),
          'star',
          this.design.rightEndMM(),
          tapeWidth / 4,
          tapeWidth / 2
      );
      this.design.add(element);
      this.selected_element_ids.clear();
      this.selected_element_ids.add(element.id());
    },
    addElementQRCode() {
      let tapeWidth = this.interfaceData.status!.media_width_mm;
      let element = new DesignElementQRCode(
          this.design.nextId(),
          this.design.rightEndMM(),
          tapeWidth / 4,
          tapeWidth / 2,
          "https://example.com",
          "M",
      );
      this.design.add(element);
      this.selected_element_ids.clear();
      this.selected_element_ids.add(element.id());
    },
    editorElementsChanged(newElements: DesignElement[]) {
      newElements.forEach(e => this.design.replace(e));
    },
    async printDesign() {
      console.log("print");
      let printCanvas = document.createElement("canvas") as HTMLCanvasElement;
      let printCtx = printCanvas.getContext("2d", {willReadFrequently: true})!;
      await this.design.renderToPrint({ctx: printCtx, px_per_mm: this.pxPerMM, canvas: printCanvas, tape_width_mm: this.tape_info!.width_mm});
      await this.interfaceManager.get().print(printCanvas, false);
    },
  },
}
</script>

<style scoped>

</style>
