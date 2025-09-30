export interface WebUSBInfoData {
    vendorId: number;
    productId: number;
    manufacturerName: string|null;
    productName: string|null;
    serialNumber: string|null;
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
    active_error_masks: number[];
}

export interface DeviceInfoModalProps {
    webusb: WebUSBInfoData|null;
    devType: PTouchDeviceTypeData|null;
    status: PTouchDeviceStatusData|null;
}