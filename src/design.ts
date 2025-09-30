export class BBox {
    private readonly _x1: number;
    private readonly _y1: number;
    private readonly _x2: number;
    private readonly _y2: number;

    constructor(x1: number, y1: number, x2: number, y2: number) {
        this._x1 = x1;
        this._y1 = y1;
        this._x2 = x2;
        this._y2 = y2;
    }

    x1(): number {
        return this._x1;
    }

    y1(): number {
        return this._y1;
    }

    x2(): number {
        return this._x2;
    }

    y2(): number {
        return this._y2;
    }

    width(): number {
        return this._x2 - this._x1;
    }

    height(): number {
        return this._y2 - this._y1;
    }

    containsPoint(x: number, y: number): boolean {
        return x >= this._x1 && x <= this._x2 && y >= this._y1 && y <= this._y2;
    }
}

export interface DesignElement {
    id(): number;

    bbox(): BBox;

    update(info: UpdateInfo): void;

    render(info: RenderInfo): void;

    clone(newId: number): this;
}

export interface BaseInfo {
    ctx: CanvasRenderingContext2D;
    px_per_mm: number;
}

export interface UpdateInfo extends BaseInfo {
}

export interface RenderInfo extends BaseInfo {
    fg_color: string;
    bg_color: string;
}

export class DesignElementText implements DesignElement {
    private readonly _id: number;
    private _text: string;
    private _x_mm: number;
    private _y_mm: number;
    private _size_mm: number;

    private _calculated_width_mm: number | null = null;
    private _calculated_height_mm: number | null = null;

    constructor(id: number, text: string, x: number, y: number, size: number) {
        this._id = id;
        this._text = text;
        this._x_mm = x;
        this._y_mm = y;
        this._size_mm = size;
    }

    clone(newId: number): this {
        return new DesignElementText(newId, this._text, this._x_mm + 1, this._y_mm + 1, this._size_mm) as this;
    }

    id(): number {
        return this._id;
    }

    update(info: UpdateInfo) {
        this.initCtx(info);
        let text_metrics = info.ctx.measureText(this._text);
        this._calculated_width_mm = (text_metrics.actualBoundingBoxLeft + text_metrics.actualBoundingBoxRight) / info.px_per_mm;
        this._calculated_height_mm = (text_metrics.fontBoundingBoxAscent + text_metrics.fontBoundingBoxDescent) / info.px_per_mm;
    }

    private initCtx(info: BaseInfo) {
        let size_px = this._size_mm * info.px_per_mm;
        info.ctx.font = `${size_px}px sans-serif`;
        info.ctx.textAlign = "start";
        info.ctx.textBaseline = "top";
    }

    bbox(): BBox {
        return new BBox(this._x_mm, this._y_mm, this._x_mm + this._calculated_width_mm!, this._y_mm + this._calculated_height_mm!);
    }

    render(info: RenderInfo) {
        this.initCtx(info);
        info.ctx.fillStyle = info.fg_color;
        info.ctx.fillText(this._text, this._x_mm * info.px_per_mm, this._y_mm * info.px_per_mm);
    }

    getText(): string {
        return this._text;
    }

    setText(text: string) {
        this._text = text;
    }

    getFontSize(): number {
        return this._size_mm;
    }

    setFontSize(size: number) {
        this._size_mm = size;
    }
}

export interface DesignSettings {
    horizontal_padding_px: number;
}

export interface DesignInterface {
    add(element: DesignElement): void;

    remove(id: number): void;

    elements(): DesignElement[];

    get_element(id: number): DesignElement;

    settings(): DesignSettings;

    nextId(): number;
}

export class Design implements DesignInterface {
    private readonly _elements: DesignElement[];
    private _settings: DesignSettings;

    constructor() {
        this._elements = [];
        this._settings = {
            horizontal_padding_px: 10,
        };
    }

    add(element: DesignElement) {
        if (element.id() < this.nextId()) {
            throw new Error(`Element ID must be greater than ${this.nextId()}`);
        }
        this._elements.push(element);
    }

    remove(id: number): void {
        let idx = this.binarySearch(id);
        if (idx === null) {
            throw new Error(`Element with ID ${id} not found`);
        }
        this._elements.splice(idx, 1);
    }

    elements(): DesignElement[] {
        return this._elements;
    }

    get_element(id: number): DesignElement {
        let idx = this.binarySearch(id);
        if (idx === null) {
            throw new Error(`Element with ID ${id} not found`);
        }
        return this._elements[idx];
    }

    settings(): DesignSettings {
        return this._settings;
    }

    nextId(): number {
        return this._elements.length > 0
            ? this._elements[this._elements.length - 1].id() + 1
            : 1;
    }

    private binarySearch(id: number): number | null {
        let start = 0;
        let end = this._elements.length - 1;

        while (start <= end) {
            let middle = Math.floor((start + end) / 2);

            let middleElement = this._elements[middle];
            if (middleElement.id() === id) {
                return middle;
            } else if (middleElement.id() < id) {
                start = middle + 1;
            } else {
                end = middle - 1;
            }
        }
        return null;
    }
}
