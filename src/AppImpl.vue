<template>
  <Toolbar :printer_connection_status="!interf.is_connected()?'disconnected':(interf.is_mock() ? 'mock_connected' : 'connected')"
           :printer_name="interf?.get_device_name()"
           :tape_media_type="interf.get_status()?.media_type"
           :tape_width_mm="interf.get_status()?.media_width_mm"
           :tape_tape_color="interf.get_status()?.tape_color"
           :tape_text_color="interf.get_status()?.text_color"
           @connectPrinter="connectButtonClicked"
           @disconnectPrinter="disconnectButtonClicked"
           @connectMockPrinter="connectMockDevice"
           @showPrinterInfo="showDeviceInfoDialog"/>

  <main>
    <Preview :design="design" :px_per_mm="8" :tape_width_mm="24" :tape_length_mm="1000" :selected_element_ids="selected_element_ids" @elementClicked="onElementClicked"
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
        </div>
      </div>
    </div>

    <!-- TODO remove or hide -->
    <textarea :value="JSON.stringify(design, null, 2)" rows="20" class="form-control w-100 mt-5" readonly/>

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
import {PTouchInterface, PTouchInterfaceUSB} from "@/ptouch/interface"
import * as bootstrap from 'bootstrap';
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {library} from "@fortawesome/fontawesome-svg-core"
import {faClone, faFont, faGear, faImage, faStar, faTrashCan} from "@fortawesome/free-solid-svg-icons";
import {faUsb} from "@fortawesome/free-brands-svg-icons"
import DeviceInfoModal from "@/components/device_info_modal/DeviceInfoModal.vue";
import type {EditorType} from "@/components/editor/editor";

import {DeviceInfoModalProps, PTouchDeviceStatusData, PTouchDeviceTypeData, WebUSBInfoData} from "@/components/device_info_modal/prop_type";
import {PTouchInterfaceMock} from "@/ptouch/mock_interface";
import Preview, {PreviewElementClickedEvent} from "@/components/preview/Preview.vue";
import {Design, DesignElement, DesignElementIcon, DesignElementImage, DesignElementText, DesignInterface} from "@/design";
import EditorText from "@/components/editor/EditorText.vue";
import EditorImage from "@/components/editor/EditorImage.vue";
import EditorIcon from "@/components/editor/EditorIcon.vue";
import Toolbar from "@/components/toolbar/Toolbar.vue";

library.add(faUsb, faGear, faFont, faImage, faClone, faTrashCan, faStar);

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
  },
  data() {
    return {
      interf: new PTouchInterfaceUSB() as PTouchInterface,
      design: new Design() as DesignInterface,
      selected_element_ids: new Set<number>(),
      printerConnectionErrorMessage: "",
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
      let result = new Set<EditorType>(["text", "image", "icon"]);
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
        });
      }
      return result;
    },
  },
  async setup() {
    console.log("setup");
  },
  async mounted() {
    if (!this.interf.is_webusb_available()) {
      let t = bootstrap.Toast.getOrCreateInstance(this.$refs.errorNoWebUSB as HTMLElement);
      t.show();
    }
  },
  methods: {
    async connectButtonClicked() {
      console.log("deviceButtonClicked");
      try {
        await this.interf.connect();
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
      this.interf = new PTouchInterfaceMock();
      await this.interf.connect();
    },
    disconnectButtonClicked() {
      this.interf.disconnect();
      this.interf = new PTouchInterfaceUSB();
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
      let tapeWidth = this.interf.get_status().media_width_mm;
      let element = new DesignElementText(this.design.nextId(), "Text", this.design.rightEndMM(), tapeWidth / 4, tapeWidth / 2);
      this.design.add(element);
      this.selected_element_ids.clear();
      this.selected_element_ids.add(element.id());
    },
    addElementImage() {
      let tapeWidth = this.interf.get_status().media_width_mm;
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
      let tapeWidth = this.interf.get_status().media_width_mm;
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
    editorElementsChanged(newElements: DesignElement[]) {
      newElements.forEach(e => this.design.replace(e));
    }
  },
}
</script>

<style scoped>

</style>
