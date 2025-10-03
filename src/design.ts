import {hexToRgb} from "@/util";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {findIconByName} from "@/icons";

import * as QRCode from 'qrcode'
import {QRCodeRenderersOptions} from 'qrcode'

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

    update(info: UpdateInfo): Promise<boolean>;

    render(info: RenderInfo): Promise<void>;

    clone(): this;

    duplicate(newId: number, x1_mm: number): this;
}

export interface MovableDesignElement extends DesignElement {
    /**Returns current anchor coordinates in millimeters*/
    getAnchor(): [number, number];

    /**Moves the element so that its anchor is set to the given coordinates (in millimeters)*/
    moveAnchor(x: number, y: number): void;
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

export interface PrintInfo extends BaseInfo {
    canvas: HTMLCanvasElement;
    tape_width_mm: number;
}

export class DesignElementText implements MovableDesignElement {
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

    clone(): this {
        return new DesignElementText(this._id, this._text, this._x_mm, this._y_mm, this._size_mm) as this;
    }

    duplicate(newId: number, x1_mm: number): this {
        return new DesignElementText(newId, this._text, x1_mm, this._y_mm, this._size_mm) as this;
    }

    id(): number {
        return this._id;
    }

    async update(info: UpdateInfo): Promise<boolean> {
        const old_calculated_with = this._calculated_width_mm;
        const old_calculated_height = this._calculated_height_mm;

        this.initCtx(info);
        let text_metrics = info.ctx.measureText(this._text);
        this._calculated_width_mm = (text_metrics.actualBoundingBoxLeft + text_metrics.actualBoundingBoxRight) / info.px_per_mm;
        this._calculated_height_mm = (text_metrics.fontBoundingBoxAscent + text_metrics.fontBoundingBoxDescent) / info.px_per_mm;

        return old_calculated_with !== this._calculated_width_mm || old_calculated_height !== this._calculated_height_mm;
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

    async render(info: RenderInfo): Promise<void> {
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

    getAnchor(): [number, number] {
        return [this._x_mm, this._y_mm];
    }

    moveAnchor(x: number, y: number): void {
        this._x_mm = x;
        this._y_mm = y;
    }
}

export class DesignElementImage implements MovableDesignElement {
    private readonly _id: number;
    private _image: HTMLImageElement | null;
    private _x_mm: number;
    private _y_mm: number;
    private _width_mm: number;
    private _height_mm: number;

    private _dithering: boolean;
    private _invert: boolean;
    private _threshold: number;

    private static _processed_images: Map<number, ImageData> = new Map();

    constructor(id: number,
                image: HTMLImageElement | null = null,
                x_mm: number = 0,
                y_mm: number = 0,
                width_mm: number = 0,
                height_mm: number = 0,
                dithering: boolean = false,
                invert: boolean = false,
                threshold: number = 0.5) {
        this._id = id;
        this._image = image;
        this._x_mm = x_mm;
        this._y_mm = y_mm;
        this._width_mm = width_mm;
        this._height_mm = height_mm;
        this._dithering = dithering;
        this._invert = invert;
        this._threshold = threshold;
    }

    clone(): this {
        return new DesignElementImage(this._id,
            this._image,
            this._x_mm,
            this._y_mm,
            this._width_mm,
            this._height_mm,
            this._dithering,
            this._invert,
            this._threshold) as this;
    }

    duplicate(newId: number, x1_mm: number): this {
        return new DesignElementImage(newId,
            this._image,
            x1_mm,
            this._y_mm,
            this._width_mm,
            this._height_mm,
            this._dithering,
            this._invert,
            this._threshold) as this;
    }

    id(): number {
        return this._id;
    }

    bbox(): BBox {
        return new BBox(this._x_mm,
            this._y_mm,
            this._x_mm + this._width_mm,
            this._y_mm + this._height_mm);
    }

    async update(info: UpdateInfo): Promise<boolean> {
        //nothing to do
        return false;
    }

    async render(info: RenderInfo): Promise<void> {
        this.processImage(info);
        if (DesignElementImage._processed_images.has(this._id)) {
            info.ctx.putImageData(DesignElementImage._processed_images.get(this._id)!, this._x_mm * info.px_per_mm, this._y_mm * info.px_per_mm);
        } else {
            //todo draw something else instead so that the element is visible
            //info.ctx.fillStyle = info.fg_color;
            /*!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.*/
            //let iconPath = new Path2D("M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm64 80a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM272 224c8.4 0 16.1 4.4 20.5 11.5l88 144c4.5 7.4 4.7 16.7 .5 24.3S368.7 416 360 416L88 416c-8.9 0-17.2-5-21.3-12.9s-3.5-17.5 1.6-24.8l56-80c4.5-6.4 11.8-10.2 19.7-10.2s15.2 3.8 19.7 10.2l26.4 37.8 61.4-100.5c4.4-7.1 12.1-11.5 20.5-11.5z");
            //info.ctx.fill(iconPath);
            info.ctx.setLineDash([5, 5]);
            info.ctx.strokeStyle = info.fg_color;
            info.ctx.strokeRect(this._x_mm * info.px_per_mm, this._y_mm * info.px_per_mm, this._width_mm * info.px_per_mm, this._height_mm * info.px_per_mm);
            return;
        }
    }

    getImage(): HTMLImageElement | null {
        return this._image;
    }

    setImage(image: HTMLImageElement) {
        this.clearProcessedImage();
        this._image = image;
    }

    getWidthMM(): number {
        return this._width_mm;
    }

    setWidthMM(width_mm: number) {
        this.clearProcessedImage();
        this._width_mm = width_mm;
    }

    getHeightMM(): number {
        return this._height_mm;
    }

    setHeightMM(height_mm: number) {
        this.clearProcessedImage();
        this._height_mm = height_mm;
    }

    getDithering(): boolean {
        return this._dithering;
    }

    setDithering(dithering: boolean) {
        this.clearProcessedImage();
        this._dithering = dithering;
        console.log(dithering);
    }

    getInvert(): boolean {
        return this._invert;
    }

    setInvert(invert: boolean) {
        this.clearProcessedImage();
        this._invert = invert;
    }

    getThreshold(): number {
        return this._threshold;
    }

    setThreshold(threshold: number) {
        this.clearProcessedImage();
        this._threshold = threshold;
    }

    private processImage(info: RenderInfo): void {
        console.log("process image");
        this.clearProcessedImage();
        if (this._image == null) {
            return;
        }
        let canvas = document.createElement("canvas");
        canvas.width = this._width_mm * info.px_per_mm;
        canvas.height = this._height_mm * info.px_per_mm;
        let ctx = canvas.getContext("2d")!;
        ctx.drawImage(this._image, 0, 0, this._image.width, this._image.height, 0, 0, canvas.width, canvas.height);
        let processedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = processedImageData.data;
        DesignElementImage._processed_images.set(this._id, processedImageData);

        const fgColor = hexToRgb(info.fg_color);
        const bgColor = hexToRgb(info.bg_color);
        if (!this._dithering) {
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];//todo also consider alpha channel here
                const color = ((gray < (this._threshold * 255)) !=/*XOR*/ this._invert) ? fgColor : bgColor;
                data[i] = color.r;
                data[i + 1] = color.g;
                data[i + 2] = color.b;
                data[i + 3] = 255;
            }
        } else {
            // Floyd-Steinberg dithering
            const width = canvas.width;
            const height = canvas.height;

            // Convert to grayscale first
            const gray = new Float32Array(width * height);
            for (let i = 0; i < data.length; i += 4) {
                gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            }

            // Apply dithering
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = y * width + x;
                    const oldPixel = gray[idx];
                    const newPixel = (oldPixel >= (this._threshold * 255)) ? 255 : 0;
                    gray[idx] = newPixel;
                    const err = oldPixel - newPixel;

                    if (x + 1 < width) gray[idx + 1] += err * 7 / 16;
                    if (y + 1 < height) {
                        if (x > 0) gray[idx + width - 1] += err * 3 / 16;
                        gray[idx + width] += err * 5 / 16;
                        if (x + 1 < width) gray[idx + width + 1] += err * 1 / 16;
                    }
                }
            }

            // Apply colors
            for (let i = 0; i < gray.length; i++) {
                const color = ((gray[i] > 127) !=/*XOR*/ this._invert) ? bgColor : fgColor;
                data[i * 4] = color.r;
                data[i * 4 + 1] = color.g;
                data[i * 4 + 2] = color.b;
            }
        }
    }

    private clearProcessedImage() {
        DesignElementImage._processed_images.delete(this._id);
    }

    getAnchor(): [number, number] {
        return [this._x_mm, this._y_mm];
    }

    moveAnchor(x: number, y: number): void {
        this._x_mm = x;
        this._y_mm = y;
    }
}

export interface DesignSettings {
    horizontal_padding_px: number;
}

export interface DesignInterface {
    add(element: DesignElement): void;

    remove(id: number): void;

    replace(element: DesignElement): void;

    elements(): DesignElement[];

    get_element(id: number): DesignElement;

    settings(): DesignSettings;

    nextId(): number;

    rightEndMM(): number;

    renderToPrint(info: PrintInfo): Promise<void>;
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

    replace(element: DesignElement): void {
        let idx = this.binarySearch(element.id());
        if (idx === null) {
            throw new Error(`Element with ID ${element.id()} not found`);
        }
        this._elements[idx] = element;
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

    rightEndMM(): number {
        let right = 0;
        for (let element of this._elements) {
            let bbox = element.bbox();
            if (bbox.x2() > right) {
                right = bbox.x2();
            }
        }
        return right;
    }

    async renderToPrint(info: PrintInfo): Promise<void> {
        info.canvas.height = info.tape_width_mm * info.px_per_mm;
        info.canvas.width = this.rightEndMM() * info.px_per_mm;

        for (let el of this._elements) {
            info.ctx.save();
            await el.update({ctx: info.ctx, px_per_mm: info.px_per_mm});
            info.ctx.restore();
        }

        info.ctx.save();
        info.ctx.fillStyle = "#ffffff";
        info.ctx.fillRect(0, 0, info.canvas.width, info.canvas.height);
        info.ctx.restore();

        for (let el of this._elements) {
            info.ctx.save();
            await el.render({ctx: info.ctx, px_per_mm: info.px_per_mm, bg_color: "#ffffff", fg_color: "#000000"});
            info.ctx.restore();
        }
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


export class DesignElementIcon implements MovableDesignElement {
    private readonly _id: number;
    private _icon_name: string;
    private _x_mm: number;
    private _y_mm: number;
    private _size_mm: number;

    private _calculated_width_mm: number | null = null;


    constructor(id: number, icon_name: string, x_mm: number, y_mm: number, size_mm: number) {
        this._id = id;
        this._icon_name = icon_name;
        this._x_mm = x_mm;
        this._y_mm = y_mm;
        this._size_mm = size_mm;
    }

    clone(): this {
        return new DesignElementIcon(this._id, this._icon_name, this._x_mm, this._y_mm, this._size_mm) as this;
    }

    duplicate(newId: number, x1_mm: number): this {
        return new DesignElementIcon(newId, this._icon_name, x1_mm, this._y_mm, this._size_mm) as this;
    }

    id(): number {
        return this._id;
    }

    bbox(): BBox {
        const w = this._calculated_width_mm ?? this._size_mm; // fallback square
        return new BBox(this._x_mm, this._y_mm, this._x_mm + w, this._y_mm + this._size_mm);
    }

    async update(info: UpdateInfo): Promise<boolean> {
        const old_with = this._calculated_width_mm;
        const def = this.getIconDef();
        if (!def) {
            this._calculated_width_mm = this._size_mm;
        } else {
            const width = def.icon[0];
            const height = def.icon[1];

            this._calculated_width_mm = this._size_mm * (width / height);
        }
        return old_with !== this._calculated_width_mm;
    }

    async render(info: RenderInfo): Promise<void> {
        const def = this.getIconDef();
        if (!def) {
            return;
        }
        const height = def.icon[1];
        const svgPathData = def.icon[4];
        const scale = (this._size_mm * info.px_per_mm) / height;

        let _path: Path2D;
        if (typeof svgPathData === 'string') {
            _path = new Path2D(svgPathData);
        } else {
            const p = new Path2D();
            for (const d of svgPathData) {
                p.addPath(new Path2D(d));
            }
            _path = p;
        }

        info.ctx.save();
        info.ctx.translate(this._x_mm * info.px_per_mm, this._y_mm * info.px_per_mm);
        info.ctx.scale(scale, scale);
        info.ctx.fillStyle = info.fg_color;
        info.ctx.fill(_path);
        info.ctx.restore();
    }

    private getIconDef(): IconDefinition | null {
        return findIconByName(this._icon_name);
    }

    getIconName(): string {
        return this._icon_name;
    }

    setIconName(name: string) {
        this._icon_name = name;
    }

    getSizeMM(): number {
        return this._size_mm;
    }

    setSizeMM(size_mm: number) {
        this._size_mm = size_mm;
    }

    getAnchor(): [number, number] {
        return [this._x_mm, this._y_mm];
    }

    moveAnchor(x: number, y: number): void {
        this._x_mm = x;
        this._y_mm = y;
    }
}

export type DesignElementQRCodeErrorCorrection = "L" | "M" | "Q" | "H";

export class DesignElementQRCode implements MovableDesignElement {
    private readonly _id: number;
    private _x_mm: number;
    private _y_mm: number;
    private _size_mm: number;
    private _data: string;
    private _error_correction: DesignElementQRCodeErrorCorrection;

    private _calculated_large_enough: boolean | null = null;

    constructor(id: number, x_mm: number, y_mm: number, size_mm: number, data: string, error_correction: DesignElementQRCodeErrorCorrection) {
        this._id = id;
        this._x_mm = x_mm;
        this._y_mm = y_mm;
        this._size_mm = size_mm;
        this._data = data;
        this._error_correction = error_correction;
    }

    id(): number {
        return this._id;
    }

    getAnchor(): [number, number] {
        return [this._x_mm, this._y_mm];
    }

    moveAnchor(x: number, y: number): void {
        this._x_mm = x;
        this._y_mm = y;
    }

    bbox(): BBox {
        return new BBox(this._x_mm, this._y_mm, this._x_mm + this._size_mm, this._y_mm + this._size_mm);
    }

    async update(info: UpdateInfo): Promise<boolean> {
        const old_large_enough = this._calculated_large_enough;

        let renderOptions = this.getRenderOptions(info);
        renderOptions.width = undefined;
        renderOptions.scale = 1;
        let tmpCanvas = await QRCode.toCanvas(this._data, renderOptions);
        let size_px = this._size_mm * info.px_per_mm;
        this._calculated_large_enough = tmpCanvas.width <= size_px;

        return old_large_enough !== this._calculated_large_enough;
    }

    async render(info: RenderInfo): Promise<void> {
        const size_px = this._size_mm * info.px_per_mm;
        let renderOptions = this.getRenderOptions(info);
        renderOptions.color = {
            dark: info.fg_color,
            light: info.bg_color,
        }
        const tmpCanvas = await QRCode.toCanvas(this._data, renderOptions);
        if (tmpCanvas.width > size_px || tmpCanvas.height > size_px) {
            info.ctx.fillRect(this._x_mm * info.px_per_mm, this._y_mm * info.px_per_mm, size_px, size_px);
        } else {
            info.ctx.drawImage(tmpCanvas, 0, 0, size_px, size_px, this._x_mm * info.px_per_mm, this._y_mm * info.px_per_mm, size_px, size_px);
        }
    }

    private getRenderOptions(info: BaseInfo): QRCodeRenderersOptions {
        let size_px = this._size_mm * info.px_per_mm;
        return {
            margin: 0,
            width: size_px,
            errorCorrectionLevel: this._error_correction,
        };
    }

    clone(): this {
        return new DesignElementQRCode(this._id, this._x_mm, this._y_mm, this._size_mm, this._data, this._error_correction) as this;
    }

    duplicate(newId: number, x1_mm: number): this {
        return new DesignElementQRCode(newId, x1_mm, this._y_mm, this._size_mm, this._data, this._error_correction) as this;
    }

    isCalculatedLargeEnough(): boolean {
        return this._calculated_large_enough ?? true;
    }

    getData(): string {
        return this._data;
    }

    setData(data: string) {
        this._data = data;
    }

    getSizeMM(): number {
        return this._size_mm;
    }

    setSizeMM(size_mm: number) {
        this._size_mm = size_mm;
    }

    getErrorCorrection(): DesignElementQRCodeErrorCorrection {
        return this._error_correction;
    }

    setErrorCorrection(error_correction: DesignElementQRCodeErrorCorrection) {
        this._error_correction = error_correction;
    }
}