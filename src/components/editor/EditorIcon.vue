<template>
  <div class="row mb-3">
    <div class="col-8 position-relative">
      <label for="editorIconName" class="form-label">Icon</label>
      <input
          class="form-control"
          id="editorIconName"
          type="text"
          v-model="valueIconName"
          placeholder="Type to search (e.g., star, gear, github)"
          @focus="showDropdown = true"
          @input="onInput"
          @keydown.down.prevent="moveSelection(1)"
          @keydown.up.prevent="moveSelection(-1)"
          @keydown.enter.prevent="applyHighlighted"
          @blur="onBlur"
      />
      <ul v-if="showDropdown && filteredNames.length > 0" class="dropdown-menu show w-100 mt-1" style="max-height: 300px; overflow: auto;">
        <li v-for="(name, idx) in filteredNames" :key="name">
          <button
              class="dropdown-item d-flex align-items-center gap-2"
              :class="{active: idx === highlightedIndex}"
              type="button"
              @mousedown.prevent="selectIcon(name)"
          >
            <span class="icon-preview">
              <svg v-if="iconDefs[name]" :viewBox="`0 0 ${iconDefs[name].icon[0]} ${iconDefs[name].icon[1]}`" width="16" height="16" aria-hidden="true">
                <template v-if="isPathString(iconDefs[name].icon[4])">
                  <path :d="iconDefs[name].icon[4] as string" fill="currentColor"></path>
                </template>
                <template v-else>
                  <path v-for="(d, i) in (iconDefs[name].icon[4] as string[])" :key="i" :d="d" fill="currentColor"></path>
                </template>
              </svg>
            </span>
            <span class="flex-grow-1">{{ name }}</span>
            <span class="badge bg-secondary">{{ iconDefs[name]?.prefix }}</span>
          </button>
        </li>
      </ul>
      <div class="form-text">Source and copyright: <a href="https://fontawesome.com/search?ip=brands%2Cclassic&ic=free&o=r">FontAwesome</a></div>
    </div>
    <div class="col-4">
      <label for="editorIconSize" class="form-label">Height (mm)</label>
      <input class="form-control" id="editorIconSize" type="number" min="1" step="0.5" v-model="valueSizeMM"/>
    </div>
  </div>
</template>
<script lang="ts">
import {PropType} from "vue";
import {DesignElementIcon} from "@/design";
import {getSingleValue} from "@/components/editor/editor";
import type {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {findIconByName, getAllIconNames} from "@/icons";

export default {
  name: "EditorIcon",
  props: {
    elements: {type: Array as PropType<DesignElementIcon[]>, required: true},
  },
  data() {
    const allNames = getAllIconNames();
    const defs: Record<string, IconDefinition> = {};
    // Lazy populate on demand; start with none
    return {
      elementsMutable: this.elements.map(e => e.clone()),
      allNames,
      iconDefs: defs as Record<string, IconDefinition>,
      showDropdown: false as boolean,
      highlightedIndex: -1 as number,
      lastFilter: "" as string,
    };
  },
  emits: {
    elementsChanged(elements: DesignElementIcon[]): boolean {
      return true;
    }
  },
  watch: {
    elements() {
      this.elementsMutable = this.elements.map(e => e.clone());
    }
  },
  computed: {
    valueIconName: {
      get(): string {
        return getSingleValue(this.elementsMutable, e => e.getIconName(), "");
      },
      set(newValue: string) {
        this.elementsMutable.forEach(e => e.setIconName(newValue));
        this.emitElementsChanged();
      }
    },
    valueSizeMM: {
      get(): number {
        return getSingleValue(this.elementsMutable, e => e.getSizeMM(), 0);
      },
      set(newValue: number) {
        if (newValue < 1) newValue = 1;
        this.elementsMutable.forEach(e => e.setSizeMM(newValue));
        this.emitElementsChanged();
      }
    },
    filteredNames(): string[] {
      const q = (this.valueIconName || "").toLowerCase().trim();
      const base = q.length === 0 ? this.allNames : this.allNames.filter(n => n.includes(q));
      const list = base.slice(0, 50);
      // Ensure defs available for previews
      for (const name of list) {
        if (!this.iconDefs[name]) {
          const def = findIconByName(name);
          if (def) this.iconDefs[name] = def;
        }
      }
      if (q !== this.lastFilter) {
        this.highlightedIndex = -1;
        this.lastFilter = q;
      }
      return list;
    },
  },
  methods: {
    emitElementsChanged() {
      this.$emit("elementsChanged", this.elementsMutable);
    },
    onInput() {
      this.showDropdown = true;
    },
    onBlur() {
      // Delay hiding to allow mousedown selection
      setTimeout(() => this.showDropdown = false, 150);
    },
    selectIcon(name: string) {
      this.valueIconName = name;
      this.showDropdown = false;
    },
    isPathString(p: string | string[]): boolean {
      return typeof p === 'string';
    },
    moveSelection(delta: number) {
      if (!this.showDropdown || this.filteredNames.length === 0) return;
      const len = this.filteredNames.length;
      let idx = this.highlightedIndex + delta;
      if (idx < 0) idx = len - 1;
      if (idx >= len) idx = 0;
      this.highlightedIndex = idx;
    },
    applyHighlighted() {
      if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredNames.length) {
        this.selectIcon(this.filteredNames[this.highlightedIndex]);
      }
    }
  }
};
</script>

<style scoped>
.icon-preview {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
