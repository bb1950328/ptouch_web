import {PTouchInterface} from "./interface";
import {
    findDeviceType,
    findMediaType,
    findNotification,
    findPhase,
    findStatusType, findTapeColor, findTextColor,
    PTouchDeviceStatus, PTouchDeviceType,
    PTouchErrorInformation
} from "./data";

export class PTouchInterfaceMock implements PTouchInterface {
    private connected = false;
    async connect() {
        this.connected = true;
    }

    async disconnect() {
        this.connected = false;
    }

    async update_status() {
    }

    get_status(): PTouchDeviceStatus {
        return {
            printHeadMark: 0x80,
            size: 0x20,
            brotherCode: 'B'.charCodeAt(0),
            seriesCode: '0'.charCodeAt(0),
            model: 103,
            country: '0'.charCodeAt(0),
            reserved_1: 0x0,
            errors: new Set<PTouchErrorInformation>(),
            media_width_mm: 24,
            media_type: findMediaType(0x01),
            ncol: 0,
            fonts: 0,
            jp_fonts: 0,
            mode: 0x00,
            density: 0,
            media_len: 0,
            status_type: findStatusType(0x00),
            phase: findPhase(0x00, 0x00, 0x00),
            notification: findNotification(0x00),
            exp: 0,
            tape_color: findTapeColor(0x01),
            text_color: findTextColor(0x08),
            hw_setting: 0x00000000,
            reserved_2: 0x00,
        }
    }

    is_connected(): boolean {
        return this.connected;
    }

    is_webusb_available(): boolean {
        return true;
    }

    get_device_name(): string {
        return this.get_ptouch_device_type()!.name;
    }

    get_webusb_device(): USBDevice | null {
        return null;
    }

    get_ptouch_device_type(): PTouchDeviceType | null {
        return findDeviceType(0x04f9, 0x2061);
    }

    require_connected(): void {
        if (!this.connected) {
            throw new Error("Not connected");
        }
    }
}