export interface PTouchTapeInfo {
    width_mm: number;
    width_px: number;
    margins_mm?: number;
}

export enum PTouchPageFlags {
    FEED_NONE = 0x0,
    FEED_SMALL = 0x08,
    FEED_MEDIUM = 0x0c,
    FEED_LARGE = 0x1a,
    AUTO_CUT = (1 << 6),
    MIRROR = (1 << 7),
}

export enum PTouchDeviceTypeFlags {
    UNSUP_RASTER,
    RASTER_PACKBITS,
    PLITE,
    P700_INIT,
    USE_INFO_CMD,
    HAS_PRECUT,
    D460BT_MAGIC,
}

export interface PTouchDeviceType {
    usb_vendor_id: number;
    usb_product_id: number;
    name: string;
    max_width_px: number;
    dpi: number;
    flags: Set<PTouchDeviceTypeFlags>;
}

export interface PTouchErrorInformation {
    mask: number;
    description: string;
    can_still_print: boolean;
}

export interface PTouchPhase {
    type: number;
    number_h: number;
    number_l: number;
    description: string;
}

export interface PTouchNotification {
    code: number;
    description: string;
}

export interface PTouchDeviceStatus {
    printHeadMark: number;//0x80
    size: number;//0x20
    brotherCode: number;//"B"
    seriesCode: number;//"0"
    model: number;
    country: number;//"0"
    reserved_1: number;
    errors: Set<PTouchErrorInformation>;
    media_width_mm: number;//tape width in mm
    media_type: PTouchMediaType | null;
    ncol: number;//0
    fonts: number;//0
    jp_fonts: number;//0
    mode: number;
    density: number;//0
    media_len: number;//table length, always 0
    status_type: PTouchStatusType | null;
    phase: PTouchPhase | null;
    notification: PTouchNotification | null;
    exp: number;//0
    tape_color: PTouchTapeColor | null;
    text_color: PTouchTextColor | null;
    hw_setting: number;
    reserved_2: number;
}


export interface PTouchMediaType {
    code: number,
    name: string,
}

export interface PTouchTapeColor {
    code: number;
    name: string;
    color: string;
    color_on_white: string;
    color_on_black: string;
}

export interface PTouchTextColor {
    code: number;
    name: string;
    color: string;
    color_on_white: string;
    color_on_black: string;
}

export interface PTouchStatusType {
    code: number,
    name: string,
}

function findInstance<T extends {[key: string]: any}>(all: T[], filter: {[key: string]: any}): T|null {
    for (const i of all) {
        let ok = true;
        for (const k of Object.keys(filter)) {
            if (i[k] != filter[k]) {
                ok=false;
                break
            }
        }
        if (ok) {
            return i;
        }
    }
    return null;
}

export function findTapeInfo(width_mm: number): PTouchTapeInfo|null {
    return findInstance(PTOUCH_TAPE_INFOS, {width_mm: width_mm});
}

export function findMediaType(code: number): PTouchMediaType|null {
    return findInstance(PTOUCH_MEDIA_TYPES, {code: code});
}

export function findTapeColor(code: number): PTouchTapeColor|null {
    return findInstance(PTOUCH_TAPE_COLORS, {code: code});
}

export function findTextColor(code: number): PTouchTextColor|null {
    return findInstance(PTOUCH_TEXT_COLORS, {code: code});
}

export function findDeviceType(usb_vendor_id: number, usb_product_id: number): PTouchDeviceType|null {
    return findInstance(PTOUCH_DEVICE_TYPES, {usb_vendor_id: usb_vendor_id, usb_product_id: usb_product_id});
}

export function findErrorInformation(mask: number): PTouchErrorInformation|null {
    return findInstance(PTOUCH_ERROR_INFORMATIONS, {mask: mask});
}

export function findStatusType(code: number): PTouchStatusType|null {
    return findInstance(PTOUCH_STATUS_TYPES, {code: code});
}

export function findPhase(type: number, number_h: number, number_l: number): PTouchPhase|null {
    return findInstance(PTOUCH_PHASES, {type: type, number_h: number_h, number_l: number_l});
}

export function findNotification(code: number): PTouchNotification|null {
    return findInstance(PTOUCH_NOTIFICATIONS, {code: code});
}

//@formatter:off
export const PTOUCH_TAPE_INFOS: PTouchTapeInfo[] = [
    {width_mm: 4, width_px: 24, margins_mm: 0.5},
    {width_mm: 6, width_px: 32, margins_mm: 1.0},
    {width_mm: 9, width_px: 52, margins_mm: 1.0},
    {width_mm: 12, width_px: 76, margins_mm: 2.0},
    {width_mm: 18, width_px: 120, margins_mm: 3.0},
    {width_mm: 24, width_px: 128, margins_mm: 3.0},
    {width_mm: 36, width_px: 192, margins_mm: 4.5},
];

export const PTOUCH_MEDIA_TYPES: PTouchMediaType[] = [
    ////table 4, page 27
    {code: 0x00, name: "No Media"},
    {code: 0x01, name: "Laminated Tape"},
    {code: 0x03, name: "Non-Laminated Tape"},
    {code: 0x04, name: "Fabric Tape"},
    {code: 0x11, name: "Heat Shrink Tube (HS 2:1)"},
    {code: 0x13, name: "Fle Tape"},
    {code: 0x14, name: "Flexible ID Tape"},
    {code: 0x15, name: "Satin Tape"},
    {code: 0x17, name: "Heat Shrink Tube (HS 3:1)"},
    {code: 0xff, name: "Incompatible Tape"},
];

export const PTOUCH_TAPE_COLORS: PTouchTapeColor[] = [
    //table 8, page 29
    {code: 0x01, name: "White", color: "#fff", color_on_white: "#000", color_on_black: "#fff"},
    {code: 0x02, name: "Other", color: "#333", color_on_white: "#333", color_on_black: "#ddd"},
    {code: 0x03, name: "Clear", color: "#999", color_on_white: "#333", color_on_black: "#fff"},
    {code: 0x04, name: "Red", color: "#f00", color_on_white: "#f00", color_on_black: "#f00"},
    {code: 0x05, name: "Blue", color: "#00f", color_on_white: "#00f", color_on_black: "#00f"},
    {code: 0x06, name: "Yellow", color: "#ff0", color_on_white: "#ff0", color_on_black: "#ff0"},
    {code: 0x07, name: "Green", color: "#008024", color_on_white: "#008024", color_on_black: "#008024"},
    {code: 0x08, name: "Black", color: "#000", color_on_white: "#000", color_on_black: "#fff"},
    {code: 0x09, name: "Clear", color: "#999", color_on_white: "#333", color_on_black: "#fff"},
    {code: 0x20, name: "Matte White", color: "#eee", color_on_white: "#111", color_on_black: "#eee"},
    {code: 0x21, name: "Matte Clear", color: "#999", color_on_white: "#333", color_on_black: "#fff"},
    {code: 0x22, name: "Matte Silver", color: "#ccc", color_on_white: "#555", color_on_black: "#ccc"},
    {code: 0x23, name: "Satin Gold", color: "#cba135", color_on_white: "#cba135", color_on_black: "#cba135"},
    {code: 0x24, name: "Satin Silver", color: "#ccc", color_on_white: "#555", color_on_black: "#ccc"},
    {code: 0x30, name: "Blue (TZe-5[345]5)", color: "#00f", color_on_white: "#00f", color_on_black: "#00f"},
    {code: 0x31, name: "Red (TZe-435)", color: "#f00", color_on_white: "#f00", color_on_black: "#f00"},
    {code: 0x40, name: "Fluorescent Orange", color: "#ff8300", color_on_white: "#ff8300", color_on_black: "#ff8300"},
    {code: 0x41, name: "Fluorescent Yellow", color: "#fff9a0", color_on_white: "#fff9a0", color_on_black: "#fff9a0"},
    {code: 0x50, name: "Berry Pink (TZe-MQP35)", color: "#e93965", color_on_white: "#e93965", color_on_black: "#e93965"},
    {code: 0x51, name: "Light Gray (TZe-MQL35)", color: "#ccc", color_on_white: "#666", color_on_black: "#ccc"},
    {code: 0x52, name: "Lime Green (TZe-MQG35)", color: "#dce01a", color_on_white: "#dce01a", color_on_black: "#dce01a"},
    {code: 0x60, name: "Yellow", color: "#ff0", color_on_white: "#ff0", color_on_black: "#ff0"},
    {code: 0x61, name: "Pink", color: "#fc74fd", color_on_white: "#fc74fd", color_on_black: "#fc74fd"},
    {code: 0x62, name: "Blue", color: "#00f", color_on_white: "#00f", color_on_black: "#00f"},
    {code: 0x70, name: "Heat-shrink Tube", color: "#fff", color_on_white: "#000", color_on_black: "#fff"},
    {code: 0x90, name: "White(Flex. ID)", color: "#fff", color_on_white: "#000", color_on_black: "#fff"},
    {code: 0x91, name: "Yellow(Flex. ID)", color: "#ff0", color_on_white: "#ff0", color_on_black: "#ff0"},
    {code: 0xf0, name: "Cleaning", color: "#fff", color_on_white: "#333", color_on_black: "#fff"},
    {code: 0xf1, name: "Stencil", color: "#fff", color_on_white: "#333", color_on_black: "#fff"},
    {code: 0xff, name: "Incompatible", color: "#91403d", color_on_white: "#91403d", color_on_black: "#91403d"},
];


export const PTOUCH_TEXT_COLORS: PTouchTextColor[] = [
    //table 10, page 30
    {code: 0x01, name: "White", color: "#fff", color_on_white: "#000", color_on_black: "#fff"},
    {code: 0x02, name: "Other", color: "#ddd", color_on_white: "#333", color_on_black: "#ddd"},
    {code: 0x04, name: "Red", color: "#f00", color_on_white: "#f00", color_on_black: "#f00"},
    {code: 0x05, name: "Blue", color: "#00f", color_on_white: "#00f", color_on_black: "#00f"},
    {code: 0x08, name: "Black", color: "#000", color_on_white: "#000", color_on_black: "#fff"},
    {code: 0x0a, name: "Gold", color: "#cfa959", color_on_white: "#cfa959", color_on_black: "#cfa959"},
    {code: 0x62, name: "Blue(F)", color: "#00f", color_on_white: "#00f", color_on_black: "#00f"},
    {code: 0xf0, name: "Cleaning", color: "#fff", color_on_white: "#333", color_on_black: "#fff"},
    {code: 0xf1, name: "Stencil", color: "#fff", color_on_white: "#333", color_on_black: "#fff"},
    {code: 0xff, name: "Incompatible", color: "#91403d", color_on_white: "#91403d", color_on_black: "#91403d"},
];

export const PTOUCH_DEVICE_TYPES: PTouchDeviceType[] = [
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2007, name: "PT-2420PC", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.RASTER_PACKBITS]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2011, name: "PT-2450PC", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.RASTER_PACKBITS]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2019, name: "PT-1950", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.RASTER_PACKBITS]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x201f, name: "PT-2700", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.HAS_PRECUT]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x202c, name: "PT-1230PC", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x202d, name: "PT-2430PC", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2030, name: "PT-1230PC (PLite Mode)", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.PLITE]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2031, name: "PT-2430PC (PLite Mode)", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.PLITE]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2041, name: "PT-2730", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x205e, name: "PT-H500", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.RASTER_PACKBITS]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x205f, name: "PT-E500", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.RASTER_PACKBITS]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2061, name: "PT-P700", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.RASTER_PACKBITS, PTouchDeviceTypeFlags.P700_INIT, PTouchDeviceTypeFlags.HAS_PRECUT]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2062, name: "PT-P750W", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.RASTER_PACKBITS, PTouchDeviceTypeFlags.P700_INIT]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2064, name: "PT-P700 (PLite Mode)", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.PLITE]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2065, name: "PT-P750W (PLite Mode)", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.PLITE]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x20df, name: "PT-D410", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.USE_INFO_CMD, PTouchDeviceTypeFlags.HAS_PRECUT, PTouchDeviceTypeFlags.D460BT_MAGIC]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2073, name: "PT-D450", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.USE_INFO_CMD]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x20e0, name: "PT-D460BT", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.P700_INIT, PTouchDeviceTypeFlags.USE_INFO_CMD, PTouchDeviceTypeFlags.HAS_PRECUT, PTouchDeviceTypeFlags.D460BT_MAGIC]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2074, name: "PT-D600", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.RASTER_PACKBITS]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x20e1, name: "PT-D610BT", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.P700_INIT, PTouchDeviceTypeFlags.USE_INFO_CMD, PTouchDeviceTypeFlags.HAS_PRECUT, PTouchDeviceTypeFlags.D460BT_MAGIC]) },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x20af, name: "PT-P710BT", max_width_px: 128, dpi: 180, flags: new Set<PTouchDeviceTypeFlags>([PTouchDeviceTypeFlags.RASTER_PACKBITS, PTouchDeviceTypeFlags.HAS_PRECUT]) },
];


export const PTOUCH_ERROR_INFORMATIONS: PTouchErrorInformation[] = [
    //table 1, page 26
    {mask: 0x01, description: "No media", can_still_print: false},
    {mask: 0x4, description: "Cutter Jam", can_still_print: false},
    {mask: 0x8, description: "Weak Batteries", can_still_print: true},
    {mask: 0x40, description: "High Voltage Adapter", can_still_print: true},

    //table 2, page 26
    {mask: 0x01<<8, description: "Replace media", can_still_print: false},
    {mask: 0x10<<8, description: "Cover open", can_still_print: false},
    {mask: 0x20<<8, description: "Overheating", can_still_print: false},
];

export const PTOUCH_STATUS_TYPES: PTouchStatusType[] = [
    //table 5, page 28
    {code: 0x00, name: "Reply to status request"},
    {code: 0x01, name: "Printing completed"},
    {code: 0x02, name: "Error occurred"},
    {code: 0x03, name: "Exit IF mode"},
    {code: 0x04, name: "Turned off"},
    {code: 0x05, name: "Notification"},
    {code: 0x06, name: "Phase change"},
]

export const PTOUCH_PHASES: PTouchPhase[] = [
    //table 6, page 28
    {type: 0x00, number_h: 0x00, number_l: 0x00, description: "Editing state (reception possible)"},
    {type: 0x00, number_h: 0x00, number_l: 0x01, description: "Feed"},
    {type: 0x01, number_h: 0x00, number_l: 0x00, description: "Printing"},
    {type: 0x01, number_h: 0x00, number_l: 0x14, description: "Cover open while receiving"},
]

export const PTOUCH_NOTIFICATIONS: PTouchNotification[] = [
    //table 7, page 29
    {code: 0x00, description: "Not available"},
    {code: 0x01, description: "Cover open"},
    {code: 0x02, description: "Cover closed"},
]
//@formatter:on