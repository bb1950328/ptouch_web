<template>
  <div class="row mb-3">
    <label for="editorData" class="form-label">Text</label>
    <textarea class="form-control" id="editorData" rows="4" v-model="valueData"></textarea>
  </div>
  <div class="row mb-3">
    <div class="col-6">
      <label for="editorSize" class="form-label">Size</label>
      <input class="form-control" id="editorSize" type="number" v-model="valueSize" min="1"/>
    </div>
    <div class="col-6">
      <label for="editorErrorCorrection" class="form-label">Error Correction</label>
      <select class="form-select" id="editorErrorCorrection" v-model="valueErrorCorrection">
        <option value="L">Low (~7%)</option>
        <option value="M">Medium (~15%)</option>
        <option value="Q">Quartile (~25%)</option>
        <option value="H">High (~30%)</option>
      </select>
    </div>
  </div>
  <div v-if="showSizeWarning" class="alert alert-warning" role="alert">
    This QR code is probably too small to fit the text entered. Try increasing its size or reducing the error correction level.
  </div>
</template>
<script lang="ts">
import {PropType} from "vue";
import {DesignElementQRCode, DesignElementQRCodeErrorCorrection} from "@/design";
import {getSingleValue} from "@/components/editor/editor";

export default {
  name: "EditorText",
  props: {
    elements: {type: Array as PropType<DesignElementQRCode[]>, required: true},
  },
  data() {
    return {
      elementsMutable: this.elements.map(e => e.clone()),
    };
  },
  emits: {
    elementsChanged(elements: DesignElementQRCode[]): boolean {
      return true;
    }
  },
  watch: {
    elements() {
      this.elementsMutable = this.elements.map(e => e.clone());
    }
  },
  computed: {
    valueData: {
      get(): string {
        return getSingleValue(this.elementsMutable, e => e.getData(), "");
      },
      set(newValue: string) {
        this.elementsMutable.forEach(e => e.setData(newValue));
        this.emitElementsChanged();
      }
    },
    valueSize: {
      get(): number {
        return getSingleValue(this.elementsMutable, e => e.getSizeMM(), 0);
      },
      set(newValue: number) {
        this.elementsMutable.forEach(e => e.setSizeMM(newValue));
        this.emitElementsChanged();
      }
    },
    valueErrorCorrection: {
      get(): DesignElementQRCodeErrorCorrection {
        return getSingleValue(this.elementsMutable, e => e.getErrorCorrection(), "M");
      },
      set(newValue: DesignElementQRCodeErrorCorrection) {
        this.elementsMutable.forEach(e => e.setErrorCorrection(newValue));
        this.emitElementsChanged();
      }
    },
    showSizeWarning(): boolean {
      return this.elementsMutable.some(e => !e.isCalculatedLargeEnough());
    }
  },
  methods: {
    emitElementsChanged() {
      this.$emit("elementsChanged", this.elementsMutable);
    }
  }
};
</script>

<style scoped>

</style>