<template>
  <div id="toolbar">
    <div class="section" id="section-printer">
      <font-awesome-icon icon="fa-solid fa-print"/>
      <span v-if="printer_connection_status=='disconnected'" class="status-circle bg-danger"></span>
      <span v-else-if="printer_connection_status=='mock_connected'" class="status-circle bg-warning"></span>
      <span v-else class="status-circle bg-success"></span>
      <span v-if="printer_connection_status=='disconnected'">No Printer connected</span>
      <span v-else>{{ printer_name }}</span>

      <button v-if="printer_connection_status!='disconnected'" class="btn btn-sm btn-outline-info" @click="$emit('showPrinterInfo')">
        <font-awesome-icon icon="fa-solid fa-info"/>
      </button>
      <button v-if="printer_connection_status!='disconnected'" class="btn btn-sm btn-outline-danger" @click="$emit('disconnectPrinter')">
        <font-awesome-icon icon="fa-solid fa-plug-circle-xmark"/>
      </button>
      <button v-if="printer_connection_status=='disconnected'" class="btn btn-sm btn-outline-success" @click="$emit('connectPrinter')">
        <font-awesome-icon icon="fa-brands fa-usb"/>
        Connect
      </button>
    </div>

    <template v-if="printer_connection_status!='disconnected'">
      <span class="separator"></span>
      <div class="section" id="section-tape">
        <font-awesome-icon icon="fa-solid fa-tape"/>
        <span v-if="tape_text_color" :style="{color: tape_text_color.color_on_black}">
          {{ tape_text_color.name }} Text
        </span>
        <span>on</span>
        <span v-if="tape_tape_color" class="badge" :style="{backgroundColor: tape_tape_color.color_on_black, color: 'black'}">
          {{ tape_tape_color.name }} {{ tape_media_type?.name ?? '' }}
        </span>
        <span>
          {{ tape_width_mm }}mm
        </span>
      </div>

      <span class="separator"></span>
      <div class="section" id="section-print">
        <button class="btn btn-sm btn-outline-primary" @click="$emit('print')" :disabled="!print_enabled">Print</button>
      </div>
    </template>


    <span class="spacer"></span>

    <div class="section" id="section-actions">
      <div class="dropdown">
        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <font-awesome-icon icon="fa-solid fa-gear"/>
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="#" @click="$emit('connectMockPrinter')">Connect Mock Device</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script lang="ts">

import {library} from "@fortawesome/fontawesome-svg-core"
import {faGear, faInfo, faPlugCircleXmark, faPrint, faTape} from "@fortawesome/free-solid-svg-icons";
import {faUsb} from "@fortawesome/free-brands-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {PropType} from "vue";
import {PrinterConnectionStatus} from "@/components/toolbar/toolbar";
import {PTouchMediaType, PTouchTapeColor, PTouchTextColor} from "@/ptouch/data";

library.add(faUsb, faPrint, faTape, faInfo, faPlugCircleXmark, faGear);//todo remove unused icons

export default {
  name: "Toolbar",
  components: {
    "font-awesome-icon": FontAwesomeIcon,
  },
  props: {
    printer_connection_status: {type: String as PropType<PrinterConnectionStatus>, required: true},
    printer_name: {type: String, required: true},
    tape_media_type: {type: null as unknown as PropType<PTouchMediaType | null>, default: null, required: false},
    tape_width_mm: {type: null as unknown as PropType<Number | null>, default: null, required: false},
    tape_tape_color: {type: null as unknown as PropType<PTouchTapeColor | null>, default: null, required: false},
    tape_text_color: {type: null as unknown as PropType<PTouchTextColor | null>, default: null, required: false},
    print_enabled: {type: Boolean, required: true},
  },
  emits: {
    connectPrinter: () => true,
    disconnectPrinter: () => true,
    connectMockPrinter: () => true,
    showPrinterInfo: () => true,
    print: () => true,
  },
}
</script>

<style scoped>
#toolbar {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;

  background-color: #111;
  height: 3rem;
  padding: 0.5rem;
}

.section {
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.4rem;
}

.separator {
  height: 80%;
  width: 1px;
  background-color: #666;
}

.status-circle {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
}

.spacer {
  flex-grow: 1;
}
</style>