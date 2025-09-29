import {PTOUCH_DEVICE_TYPES, PTouchDeviceType} from "./data";

function findDeviceType(device: USBDevice) {
    for (let dt of PTOUCH_DEVICE_TYPES) {
        if (dt.usb_vendor_id == device.vendorId && dt.usb_product_id == device.productId) {
            return dt;
        }
    }
    return null;
}

export class PTouchInterface {
    private device: USBDevice | null = null;
    private deviceType: PTouchDeviceType | null = null;

    async connect() {
        this.device = await navigator.usb.requestDevice({
            filters: PTOUCH_DEVICE_TYPES.map(device => ({ vendorId: device.usb_vendor_id, productId: device.usb_product_id }))
        });

        if (this.device) {
            this.deviceType = findDeviceType(this.device);
        }
    }

    is_connected() {
        return !!this.device;
    }

    is_webusb_available() {
        return !!navigator.usb;
    }

    get_device_name() {
        return this.deviceType?.name ?? "?";
    }

    get_webusb_device() {
        return this.device;
    }

    get_ptouch_device_type() {
        return this.deviceType;
    }
}