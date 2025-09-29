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

export interface PTouchDeviceStatus {
    printHeadMark: number;//0x80
    size: number;//0x20
    brotherCode: number;//"B"
    seriesCode: number;//"0"
    model: number;
    country: number;//"0"
    reserved_1: number;
    error: number;//table 1 and 2
    media_width: number;//tape width in mm
    media_type: number;//table 4
    ncol: number;//0
    fonts: number;//0
    jp_fonts: number;//0
    mode: number;
    density: number;//0
    media_len: number;//table length, always 0
    status_type: number;//table 5
    phase_type: number;
    phase_number: number;//table 6
    notif_number: number;
    exp: number;//0
    tape_color: number;//table 8
    text_color: number;//table 9
    hw_setting: number;
    reserved_2: number;
}


export interface PTouchMediaType {
    code: number,
    name: string,
}

export interface PTouchTapeColor {
    code: number,
    name: string,
}

export interface PTouchTextColor {
    code: number,
    name: string,
}

//@formatter:off
export const PTOUCH_TAPE_TYPES: PTouchTapeInfo[] = [
    {width_mm: 4, width_px: 24, margins_mm: 0.5},
    {width_mm: 6, width_px: 32, margins_mm: 1.0},
    {width_mm: 9, width_px: 52, margins_mm: 1.0},
    {width_mm: 12, width_px: 76, margins_mm: 2.0},
    {width_mm: 18, width_px: 120, margins_mm: 3.0},
    {width_mm: 24, width_px: 128, margins_mm: 3.0},
    {width_mm: 36, width_px: 192, margins_mm: 4.5},
];

export const PTOUCH_MEDIA_TYPES: PTouchMediaType[] = [
    {code: 0x00, name: "No Media"},
    {code: 0x01, name: "Laminated Tape"},
    {code: 0x03, name: "Non-Laminated Tape"},
    {code: 0x04, name: "Fabric Tape"},
    {code: 0x11, name: "Heat Shrink Tube"},
    {code: 0x13, name: "Fle Tape"},
    {code: 0x14, name: "Flexible ID Tape"},
    {code: 0x15, name: "Satin Tape"},
    {code: 0xff, name: "Incompatible Tape"},
];

export const PTOUCH_TAPE_COLORS: PTouchTapeColor[] = [
    {code: 0x01, name: "White"},
    {code: 0x02, name: "Other"},
    {code: 0x03, name: "Clear"},
    {code: 0x04, name: "Red"},
    {code: 0x05, name: "Blue"},
    {code: 0x06, name: "Yellow"},
    {code: 0x07, name: "Green"},
    {code: 0x08, name: "Black"},
    {code: 0x09, name: "Clear"},
    {code: 0x20, name: "Matte White"},
    {code: 0x21, name: "Matte Clear"},
    {code: 0x22, name: "Matte Silver"},
    {code: 0x23, name: "Satin Gold"},
    {code: 0x24, name: "Satin Silver"},
    {code: 0x30, name: "Blue (TZe-5[345]5)"},
    {code: 0x31, name: "Red (TZe-435)"},
    {code: 0x40, name: "Fluorescent Orange"},
    {code: 0x41, name: "Fluorescent Yellow"},
    {code: 0x50, name: "Berry Pink (TZe-MQP35)"},
    {code: 0x51, name: "Light Gray (TZe-MQL35)"},
    {code: 0x52, name: "Lime Green (TZe-MQG35)"},
    {code: 0x60, name: "Yellow"},
    {code: 0x61, name: "Pink"},
    {code: 0x62, name: "Blue"},
    {code: 0x70, name: "Heat-shrink Tube"},
    {code: 0x90, name: "White(Flex. ID)"},
    {code: 0x91, name: "Yellow(Flex. ID)"},
    {code: 0xf0, name: "Cleaning"},
    {code: 0xf1, name: "Stencil"},
    {code: 0xff, name: "Incompatible"},
];


export const PTOUCH_TEXT_COLORS: PTouchTextColor[] = [
    {code: 0x01, name: "White"},
    {code: 0x02, name: "Other"},
    {code: 0x04, name: "Red"},
    {code: 0x05, name: "Blue"},
    {code: 0x08, name: "Black"},
    {code: 0x0a, name: "Gold"},
    {code: 0x62, name: "Blue(F)"},
    {code: 0xf0, name: "Cleaning"},
    {code: 0xf1, name: "Stencil"},
    {code: 0xff, name: "Incompatible"},
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
//@formatter:on