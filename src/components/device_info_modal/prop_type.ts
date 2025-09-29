export interface WebUSBInfoData {
    vendorId: number;
    productId: number;
    manufacturerName?: string;
    productName?: string;
    serialNumber?: string;
    usbVersion: string;
}

export interface PTouchDeviceTypeData {
    name: string;
    max_width_px: number;
    dpi: number;
}

export interface PTouchDeviceStatusData {
    model: number;
    hw_setting: number;
    media_type_name: string | null;
    media_width_mm: number;
    tape_color_name: string | null;
    text_color_name: string | null;
    status_type_name: string | null;
    phase_description: string | null;
    notification_description: string | null;
}

export interface DeviceInfoModalProps {
    webusb: WebUSBInfoData;
    devType: PTouchDeviceTypeData;
    status: PTouchDeviceStatusData;
}