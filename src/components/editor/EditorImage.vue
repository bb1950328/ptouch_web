<template>
  <div class="row mb-3" v-if="elements.length === 1">
    <div class="col-sm-6">
      <label class="form-label" for="fileInput">Drop or upload image:</label>
      <input type="file" class="form-control col-sm-8" id="fileInput" ref="fileInput" accept="image/*" v-on:change="fileInputChanged"/>
    </div>
    <div class="col-sm-6 row">
      <label class="form-label" for="imageUrlInput">or paste image URL:</label>
      <input class="form-control" type="text" id="imageUrlInput" ref="imageUrlInput" placeholder="https://example.com/image.png" v-on:change="urlInputChanged"/>
    </div>
  </div>
  <div class="row mb-3">
    <div class="col-sm-8 row me-1">
      <label class="form-label col-sm-3" for="sliderThreshold">Threshold</label>
      <div class="col-sm-9">
        <input type="range" class="form-range" id="sliderThreshold" min="0" max="100" step="1" v-model="valueThreshold"/>
      </div>
    </div>
    <div class="col-sm-4">
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="checkboxDithering" v-model="valueDithering">
        <label class="form-check-label" for="checkboxDithering">Dithering</label>
      </div>
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="checkboxInvert" v-model="valueInvert">
        <label class="form-check-label" for="checkboxInvert">Invert</label>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {PropType} from "vue";
import {DesignElementImage} from "@/design";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import {library} from "@fortawesome/fontawesome-svg-core"
import {faUpload} from "@fortawesome/free-solid-svg-icons";
import {getSingleValue} from "@/components/editor/editor";

library.add(faUpload);

export default {
  name: "EditorImage",
  components: {"font-awesome-icon": FontAwesomeIcon},
  props: {
    elements: {type: Array as PropType<DesignElementImage[]>, required: true},
  },
  data() {
    return {
      elementsMutable: this.elements.map(e => e.clone()),
    };
  },
  emits: {
    elementsChanged(elements: DesignElementImage[]): boolean {
      return true;
    }
  },
  watch: {
    elements() {
      this.elementsMutable = this.elements.map(e => e.clone());
    }
  },
  computed: {
    valueThreshold: {
      get(): number {
        return getSingleValue(this.elementsMutable, e => e.getThreshold(), 0.5) * 100;
      },
      set(newValue: number) {
        if (newValue < 0) {
          newValue = 0;
        } else if (newValue > 100) {
          newValue = 100;
        }
        newValue /= 100;
        this.elementsMutable.forEach(e => e.setThreshold(newValue));
        this.emitElementsChanged();
      },
    },
    valueDithering: {
      get(): boolean {
        return getSingleValue(this.elementsMutable, e => e.getDithering(), false);
      },
      set(newValue: boolean) {
        this.elementsMutable.forEach(e => e.setDithering(newValue));
        this.emitElementsChanged();
      },
    },
    valueInvert: {
      get(): boolean {
        return getSingleValue(this.elementsMutable, e => e.getInvert(), false);
      },
      set(newValue: boolean) {
        this.elementsMutable.forEach(e => e.setInvert(newValue));
        this.emitElementsChanged();
      }
    }
  },
  methods: {
    emitElementsChanged() {
      this.$emit("elementsChanged", this.elementsMutable);
    },
    updateImage(image: HTMLImageElement) {
      this.elementsMutable.forEach(el => {
        el.setImage(image);
      });
      this.emitElementsChanged();
    },
    fileInputChanged(event: Event) {
      this.$refs.imageUrlInput.value = "";
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.addEventListener("load", readerEvent => {
          const image = new Image();
          image.addEventListener("load", () => {
            this.updateImage(image);
          });
          image.src = readerEvent.target?.result as string;
        });
        reader.readAsDataURL(file);
      }
    },
    urlInputChanged(event: Event) {
      this.$refs.fileInput.value = null;
      let url = (event.target as HTMLInputElement).value;
      if (url) {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.addEventListener("load", () => {
          this.updateImage(image);
        });
        image.addEventListener("error", errorEvent => {
          console.error(errorEvent);
        });
        image.src = url;
      }
    },
  }
};
</script>

<style scoped>

</style>