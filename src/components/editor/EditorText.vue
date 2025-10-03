<template>
  <div class="row mb-3">
    <label for="editorText" class="form-label">Text</label>
    <textarea class="form-control" id="editorText" rows="4" v-model="valueText"></textarea>
  </div>
  <div class="row mb-3">
    <div class="col-4">
      <label for="editorFontSize" class="form-label">Font Size</label>
      <input class="form-control" id="editorFontSize" type="number" v-model="valueFontSize"/>
    </div>
    <div class="col-4">
      <label for="editorFontFamily" class="form-label">Font Family</label>
      <select class="form-select" id="editorFontFamily" v-model="valueFontFamily">
        <option v-for="family in fontFamilies" :key="family" :value="family">{{ family }}</option>
      </select>
    </div>
    <div class="col-4">
      <label for="editorFontStyle" class="form-label">Font Style</label>
      <select class="form-select" id="editorFontStyle" v-model="valueFontStyle">
        <option v-for="style in fontStyles" :key="style" :value="style">{{ style }}</option>
      </select>
    </div>
    <div class="form-text">Font source and copyright: <a href="https://fontsource.org/">FontSource</a></div>
  </div>
</template>
<script lang="ts">
import {PropType} from "vue";
import {DesignElementText, DesignElementTextFont, DesignElementTextStyle} from "@/design";
import {getSingleValue} from "@/components/editor/editor";

export default {
  name: "EditorText",
  props: {
    elements: {type: Array as PropType<DesignElementText[]>, required: true},
  },
  data() {
    return {
      elementsMutable: this.elements.map(e => e.clone()),
    };
  },
  emits: {
    elementsChanged(elements: DesignElementText[]): boolean {
      return true;
    }
  },
  watch: {
    elements() {
      this.elementsMutable = this.elements.map(e => e.clone());
    }
  },
  computed: {
    valueText: {
      get(): string {
        return getSingleValue(this.elementsMutable, e => e.getText(), "");
      },
      set(newValue: string) {
        this.elementsMutable.forEach(e => e.setText(newValue));
        this.emitElementsChanged();
      },
    },
    valueFontSize: {
      get(): number {
        return getSingleValue(this.elementsMutable, e => e.getFontSize(), 0);
      },
      set(newValue: number) {
        this.elementsMutable.forEach(e => e.setFontSize(newValue));
        this.emitElementsChanged();
      },
    },
    valueFontFamily: {
      get(): DesignElementTextFont {
        return getSingleValue(this.elementsMutable, e => e.getFont(), DesignElementTextFont.ROBOTO);
      },
      set(newValue: DesignElementTextFont) {
        this.elementsMutable.forEach(e => e.setFont(newValue));
        this.emitElementsChanged();
      },
    },
    valueFontStyle: {
      get(): DesignElementTextStyle {
        return getSingleValue(this.elementsMutable, e => e.getStyle(), DesignElementTextStyle.NORMAL);
      },
      set(newValue: DesignElementTextStyle) {
        this.elementsMutable.forEach(e => e.setStyle(newValue));
        this.emitElementsChanged();
      },
    },

    fontFamilies(): string[] {
      return Object.keys(DesignElementTextFont).map(k => DesignElementTextFont[k as keyof typeof DesignElementTextFont]) as string[];
    },
    fontStyles(): string[] {
      return Object.keys(DesignElementTextStyle).map(k => DesignElementTextStyle[k as keyof typeof DesignElementTextStyle]) as string[];
    },
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