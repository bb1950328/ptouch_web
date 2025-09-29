export interface PTouchTapeInfo {
    width_mm: number;
    width_px: number;
    margins_mm?: number;
}

export enum PTouchPageFlags {
    FEED_NONE	= 0x0,
    FEED_SMALL	= 0x08,
    FEED_MEDIUM	= 0x0c,
    FEED_LARGE	= 0x1a,
    AUTO_CUT	= (1 << 6),
    MIRROR		= (1 << 7),
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
    flags: PTouchDeviceTypeFlags[];
}

export const PTOUCH_TAPE_TYPES: PTouchTapeInfo[] = [
    { width_mm: 4, width_px: 24, margins_mm: 0.5 },
    { width_mm: 6, width_px: 32, margins_mm: 1.0 },
    { width_mm: 9, width_px: 52, margins_mm: 1.0 },
    { width_mm: 12, width_px: 76, margins_mm: 2.0 },
    { width_mm: 18, width_px: 120, margins_mm: 3.0 },
    { width_mm: 24, width_px: 128, margins_mm: 3.0 },
    { width_mm: 36, width_px: 192, margins_mm: 4.5 },
];

export const PTOUCH_DEVICE_TYPES: PTouchDeviceType[] = [
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2007, name: "PT-2420PC", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.RASTER_PACKBITS] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2011, name: "PT-2450PC", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.RASTER_PACKBITS] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2019, name: "PT-1950", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.RASTER_PACKBITS] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x201f, name: "PT-2700", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.HAS_PRECUT] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x202c, name: "PT-1230PC", max_width_px: 128, dpi: 180, flags: [] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x202d, name: "PT-2430PC", max_width_px: 128, dpi: 180, flags: [] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2030, name: "PT-1230PC (PLite Mode)", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.PLITE] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2031, name: "PT-2430PC (PLite Mode)", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.PLITE] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2041, name: "PT-2730", max_width_px: 128, dpi: 180, flags: [] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x205e, name: "PT-H500", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.RASTER_PACKBITS] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x205f, name: "PT-E500", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.RASTER_PACKBITS] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2061, name: "PT-P700", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.RASTER_PACKBITS, PTouchDeviceTypeFlags.P700_INIT, PTouchDeviceTypeFlags.HAS_PRECUT] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2062, name: "PT-P750W", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.RASTER_PACKBITS, PTouchDeviceTypeFlags.P700_INIT] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2064, name: "PT-P700 (PLite Mode)", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.PLITE] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2065, name: "PT-P750W (PLite Mode)", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.PLITE] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x20df, name: "PT-D410", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.USE_INFO_CMD, PTouchDeviceTypeFlags.HAS_PRECUT, PTouchDeviceTypeFlags.D460BT_MAGIC] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2073, name: "PT-D450", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.USE_INFO_CMD] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x20e0, name: "PT-D460BT", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.P700_INIT, PTouchDeviceTypeFlags.USE_INFO_CMD, PTouchDeviceTypeFlags.HAS_PRECUT, PTouchDeviceTypeFlags.D460BT_MAGIC] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x2074, name: "PT-D600", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.RASTER_PACKBITS] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x20e1, name: "PT-D610BT", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.P700_INIT, PTouchDeviceTypeFlags.USE_INFO_CMD, PTouchDeviceTypeFlags.HAS_PRECUT, PTouchDeviceTypeFlags.D460BT_MAGIC] },
    { usb_vendor_id: 0x04f9, usb_product_id: 0x20af, name: "PT-P710BT", max_width_px: 128, dpi: 180, flags: [PTouchDeviceTypeFlags.RASTER_PACKBITS, PTouchDeviceTypeFlags.HAS_PRECUT] },
];