import type {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import * as solid from "@fortawesome/free-solid-svg-icons";
import * as brands from "@fortawesome/free-brands-svg-icons";

const iconCache: Map<string, IconDefinition> = new Map();

function collect(from: Record<string, any>) {
    for (const [key, val] of Object.entries(from)) {
        if (!val || typeof val !== 'object') {
            // Skip non-icon exports (e.g., prefix constants, types)
            continue;
        }
        const maybe = val as Partial<IconDefinition> & { icon?: any };
        if (!maybe.icon) continue;
        const name: string = (maybe as IconDefinition).iconName;

        if (!iconCache.has(name)) {
            // Prefer the first seen icon; avoid overwriting if duplicate names exist across packs
            iconCache.set(name, maybe as IconDefinition);
        }
    }
}

collect(solid as any);
collect(brands as any);

export function findIconByName(name: string): IconDefinition | null {
    return iconCache.get(name) ?? null;
}

export function getAllIconNames(): string[] {
    return Array.from(iconCache.keys()).sort();
}

export function getAllIcons(): IconDefinition[] {
    return Array.from(iconCache.values());
}
