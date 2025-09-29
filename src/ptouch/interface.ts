import {PTOUCH_DEVICE_TYPES} from "./data";

export class PTouchInterface {
    private device?: USBDevice;

    async ptouch_open() {
        this.device = await navigator.usb.requestDevice({
            filters: PTOUCH_DEVICE_TYPES.map(device => ({ vendorId: device.usb_vendor_id, productId: device.usb_product_id }))
        });
    }

}