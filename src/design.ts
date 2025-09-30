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
}

export interface DesignElement {
    bbox(): BBox;
    update(info: UpdateInfo): void;
    render(info: RenderInfo): void;
}

export interface BaseInfo {
    ctx: CanvasRenderingContext2D;
    px_per_mm: number;
}

export interface UpdateInfo extends BaseInfo{
}

export interface RenderInfo extends BaseInfo{
    fg_color: string;
    bg_color: string;
}

export class DesignElementText implements DesignElement {
    private _text: string;
    private _x: number;
    private _y: number;
    private _size_mm: number;

    private _calculatedWidth: number|null = null;
    private _calculatedHeight: number|null = null;

    constructor(text: string, x: number, y: number, size: number) {
        this._text = text;
        this._x = x;
        this._y = y;
        this._size_mm = size;
    }

    update(info: UpdateInfo) {
        this.initCtx(info);
        let text_metrics = info.ctx.measureText(this._text);
        this._calculatedWidth = text_metrics.actualBoundingBoxLeft + text_metrics.actualBoundingBoxRight;
        this._calculatedHeight = text_metrics.fontBoundingBoxAscent + text_metrics.fontBoundingBoxDescent;
    }

    private initCtx(info: BaseInfo) {
        let size_px = this._size_mm * info.px_per_mm;
        info.ctx.font = `${size_px}px sans-serif`;
        info.ctx.textAlign = "start";
        info.ctx.textBaseline = "top";
    }

    bbox(): BBox {
        return new BBox(this._x, this._y, this._x + this._calculatedWidth!, this._y + this._calculatedHeight!);
    }
    render(info: RenderInfo) {
        this.initCtx(info);
        info.ctx.fillStyle = info.fg_color;
        info.ctx.fillText(this._text, this._x, this._y);
    }
}

export interface DesignSettings {
    horizontal_padding_px: number;
}

export interface DesignInterface {
    add(element: DesignElement): void;

    elements(): DesignElement[];

    settings(): DesignSettings;
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
        this._elements.push(element);
    }

    elements(): DesignElement[] {
        return this._elements;
    }

    settings(): DesignSettings {
        return this._settings;
    }
}
