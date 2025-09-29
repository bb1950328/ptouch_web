import {
    PTOUCH_DEVICE_TYPES,
    PTOUCH_ERROR_INFORMATIONS,
    PTOUCH_MEDIA_TYPES,
    PTOUCH_NOTIFICATIONS,
    PTOUCH_PHASES,
    PTOUCH_STATUS_TYPES,
    PTOUCH_TAPE_COLORS,
    PTOUCH_TAPE_TYPES,
    PTOUCH_TEXT_COLORS,
    PTouchDeviceStatus,
    PTouchDeviceType,
    PTouchDeviceTypeFlags,
    PTouchErrorInformation,
    PTouchMediaType,
    PTouchNotification,
    PTouchPhase,
    PTouchStatusType,
    PTouchTapeColor,
    PTouchTextColor
} from "./data";
import {sleep} from "../util";

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
    private deviceStatus: PTouchDeviceStatus | null = null;
    private outEndpointNr = 0x02;
    private inEndpointNr = 0x81;

    async connect() {
        await this.open();
        await this.init();
        await this.update_status();
    }

    async disconnect() {
        if (!this.device) {
            return;
        }
        await this.device.close();
        this.device = null;
        this.deviceType = null;
    }

    async update_status() {
        this.deviceStatus = await this.getstatus();
    }

    get_status() {
        return this.deviceStatus!;
    }

    private async open() {
        this.device = await navigator.usb.requestDevice({
            filters: PTOUCH_DEVICE_TYPES.map(device => ({
                vendorId: device.usb_vendor_id,
                productId: device.usb_product_id
            }))
        });

        if (!this.device) {
            return;
        }
        this.deviceType = findDeviceType(this.device);

        await this.device.open();
        await this.device.selectConfiguration(1);
        await this.device.claimInterface(0);
        for (let ep of this.device.configuration!.interfaces[0].alternate.endpoints) {
            switch (ep.direction) {
                case "out":
                    this.outEndpointNr = ep.endpointNumber;
                    break;
                case "in":
                    this.inEndpointNr = ep.endpointNumber;
                    break;
            }
        }
    }

    private async send(data: Uint8Array) {
        this.require_connected();
        await this.device!.transferOut(this.outEndpointNr, data);
    }

    private async init() {
        /* first invalidate, then send init command */
        let cmd = new Uint8Array(102).fill(0);
        cmd[100] = 0x1b;/* ESC */
        cmd[101] = 0x40;/* @ */
        await this.send(cmd);
    }

    /** Sends some magic commands to enable chaining on the PT-D460BT.
     * These should go out right before magic commands.
     * */
    async send_d460bt_chain() {
        await this.send(new Uint8Array([0x1b, 0x69, 0x4b, 0x00, 0x00]));
    }

    /** Sends some magic commands to make prints work on the PT-D460BT.
     * These should go out after info_cmd and right before the raster data.
     * */
    async send_d460bt_magic() {
        /* 1B 69 64 {n1} {n2} {n3} {n4} */
        /* n1 and n2 are the length margin/spacing, in px? (uint16_t value, little endian) */
        /* A value of 0x06 is equivalent to the width margin on 6mm tape */
        /* The default for P-Touch software is 0x0e */
        /* n3 must be 0x4D or the print gets corrupted! */
        /* n4 seems to be ignored or reserved. */
        await this.send(new Uint8Array([0x1b, 0x69, 0x64, 0x0e, 0x00, 0x4d, 0x00]));
    }

    async enable_packbits() {
        await this.send(new Uint8Array([0x4d, 0x02]));
    }

    async info_cmd(size_x: number) {
        /* 1B 69 7A {n1} {n2} {n3} {n4} {n5} {n6} {n7} {n8} {n9} {n10} */
        let cmd = new Uint8Array([0x1b, 0x69, 0x7a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

        /* {n3}: Media width (mm)
	       {n4}: Media length (mm)
	       For the media of width 24 mm, specify as n3 = 18h and n4 = 00h.
	       n4 is normally 00h, regardless of the paper length. */
        cmd[5] = this.deviceStatus!.media_width_mm;

        /* {n5} -{n8}: Raster number
	       n8*256*256*256 + n7*256*256 + n6*256 + n5 */
        cmd[7] = size_x & 0xff;
        cmd[8] = (size_x >> 8) & 0xff;
        cmd[9] = (size_x >> 16) & 0xff;
        cmd[10] = (size_x >> 24) & 0xff;
        if (this.deviceType!.flags.has(PTouchDeviceTypeFlags.D460BT_MAGIC)) {
            /* n9 is set to 2 in order to feed the last of the label and properly stop printing. */
            cmd[11] = 0x02;
        }
        await this.send(cmd);
    }

    /** If set, printer will prompt to cut blank tape before finishing the print.
     * If not set, printer will print normally with a big blank space on the label.
     * The printer ignores this value if the print is very short. */
    async send_precut_cmd(precut: boolean) {
        /* 0x80 horizontally mirrors the print */
        let cmd = new Uint8Array([0x1b, 0x69, 0x4d, 0x00]);
        if (precut) {
            cmd[3] = 0x40;
        }
        await this.send(cmd);
    }

    async rasterstart() {
        let cmd: Uint8Array<ArrayBuffer>;
        if (this.deviceType!.flags.has(PTouchDeviceTypeFlags.P700_INIT)) {
            /* 1B 69 61 01 = switch mode (0=esc/p, 1=raster mode) */
            cmd = new Uint8Array([0x1b, 0x4d, 0x62, 0x00]);
        } else {
            /* 1B 69 52 01 = Select graphics transfer mode = Raster */
            cmd = new Uint8Array([0x1b, 0x4d, 0x52, 0x01]);
        }
        await this.send(cmd);
    }

    /** print an empty line */
    async lf() {
        await this.send(new Uint8Array([0x5a]));
    }

    /** print and advance tape, but do not cut */
    async ff() {
        await this.send(new Uint8Array([0x0c]));
    }

    /** finish print and either cut or leave tape in machine */
    async finalize(chain: boolean) {
        let cmd: Uint8Array<ArrayBuffer>;
        if (chain && !this.deviceType!.flags.has(PTouchDeviceTypeFlags.D460BT_MAGIC)) {
            cmd = new Uint8Array([0x1a]);/* Print command with feeding */
        } else {
            cmd = new Uint8Array([0x0c]);/* Print command (no cut) */
        }
        await this.send(cmd);
    }

    private async getstatus(): Promise<PTouchDeviceStatus | null> {
        let cmd = new Uint8Array([0x1b, 0x69, 0x53]);/* 1B 69 53 = ESC i S = Status info request */
        await this.send(cmd);

        let tx = 0;
        let tries = 0;
        let buf: DataView<ArrayBuffer> | null = null;
        while (tx == 0 && tries < 10) {
            await sleep(100);
            let transferResult = await this.device!.transferIn(this.inEndpointNr, 32);
            if (transferResult.status != "ok") {
                throw new Error("Failed to read status. Transfer result: " + transferResult.status);

            }
            buf = transferResult.data!;
            tx = buf.byteLength;
        }
        if (tx == 0 || buf == null) {
            throw new Error("Failed to read status. Timeout");
        }

        if (buf.byteLength == 32) {
            if (buf.getUint8(0) == 0x80 && buf.getUint8(1) == 0x20) {
                let error_int = buf.getUint16(9, false);
                let error_set = new Set<PTouchErrorInformation>();
                for (let ei of PTOUCH_ERROR_INFORMATIONS) {
                    if (ei.mask & error_int) {
                        error_set.add(ei);
                    }
                }

                let media_type_int = buf.getUint8(12);
                let media_type: PTouchMediaType | null = null;
                for (let mt of PTOUCH_MEDIA_TYPES) {
                    if (mt.code == media_type_int) {
                        media_type = mt;
                        break;
                    }
                }

                let status_type_int = buf.getUint8(18);
                let status_type: PTouchStatusType | null = null;
                for (let st of PTOUCH_STATUS_TYPES) {
                    if (st.code == status_type_int) {
                        status_type = st;
                        break;
                    }
                }

                let phase_type_int = buf.getUint8(19);
                let phase_num_h = buf.getUint8(20);
                let phase_num_l = buf.getUint8(21);
                let phase: PTouchPhase | null = null;
                for (let p of PTOUCH_PHASES) {
                    if (p.type == phase_type_int && p.number_h == phase_num_h && p.number_l == phase_num_l) {
                        phase = p;
                        break;
                    }
                }

                let notif_int = buf.getUint8(22);
                let notif: PTouchNotification | null = null;
                for (let n of PTOUCH_NOTIFICATIONS) {
                    if (n.code == notif_int) {
                        notif = n;
                        break;
                    }
                }

                let tape_color_int = buf.getUint8(24);
                let tape_color: PTouchTapeColor | null = null;
                for (let tc of PTOUCH_TAPE_COLORS) {
                    if (tc.code == tape_color_int) {
                        tape_color = tc;
                        break;
                    }
                }

                let text_color_int = buf.getUint8(25);
                let text_color: PTouchTextColor | null = null;
                for (let tc of PTOUCH_TEXT_COLORS) {
                    if (tc.code == text_color_int) {
                        text_color = tc;
                        break;
                    }
                }

                return {
                    printHeadMark: buf.getUint8(0),
                    size: buf.getUint8(1),
                    brotherCode: buf.getUint8(3),
                    seriesCode: buf.getUint8(4),
                    model: buf.getUint8(5),
                    country: buf.getUint8(6),
                    reserved_1: buf.getUint16(7),
                    errors: error_set,
                    media_width_mm: buf.getUint8(11),
                    media_type: media_type,
                    ncol: buf.getUint8(12),
                    fonts: buf.getUint8(13),
                    jp_fonts: buf.getUint8(14),
                    mode: buf.getUint8(15),
                    density: buf.getUint8(16),
                    media_len: buf.getUint8(17),
                    status_type: status_type,
                    phase: phase,
                    notification: notif,
                    exp: buf.getUint8(23),
                    tape_color: tape_color,
                    text_color: text_color,
                    hw_setting: buf.getUint32(26),
                    reserved_2: buf.getUint16(30),
                };
            }
        }
        if (buf.byteLength == 16) {
            throw new Error("got only 16 bytes... wondering what they are:");
        }
        if (buf.byteLength != 32) {
            throw new Error("got " + buf.byteLength + " bytes... expecting 32");
        }
        console.warn("Strange status: ", buf);
        console.info("trying to flush junk");
        await this.device!.transferIn(this.inEndpointNr, 32);
        return null;
    }

    get_tape_info() {
        for (let ti of PTOUCH_TAPE_TYPES) {
            if (ti.width_mm == this.deviceStatus!.media_width_mm) {
                return ti;
            }
        }
        return null;
    }

    async sendraster(data: Uint8Array) {
        let rc: number;
        if (data.length > this.deviceType!.max_width_px / 8) {

            throw new Error("Data too long");
        }
        if (this.deviceType!.flags.has(PTouchDeviceTypeFlags.RASTER_PACKBITS)) {
            /* Fake compression by encoding a single uncompressed run */
            let buf = new Uint8Array(data.length + 4);
            buf[0] = 0x47;
            buf[1] = data.length + 1;
            buf[2] = 0x00;
            buf[3] = data.length - 1;
            buf.set(data, 4);
            await this.send(buf);
        } else {
            let buf = new Uint8Array(data.length + 3);
            buf[0] = 0x47;
            buf[1] = data.length;
            buf[2] = 0x00;
            buf.set(data, 3);
        }
    }

    is_connected() {
        return !!this.device;
    }

    check_support(): string | null {
        if (!this.is_connected() || this.deviceType == null) {
            return null;
        }
        if (this.deviceType.flags.has(PTouchDeviceTypeFlags.PLITE)) {
            return "Printer is in P-Lite Mode, which is unsupported. Turn off P-Lite mode by changing switch from position EL to position E or by pressing the PLite button for ~ 2 seconds (or consult the manual)";
        }
        if (this.deviceType.flags.has(PTouchDeviceTypeFlags.UNSUP_RASTER)) {
            return "Unfortunately, that printer currently is unsupported (it has a different raster data transfer)";
        }
        return null;
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

    private require_connected() {
        if (!this.is_connected()) {
            throw new Error("Not connected");
        }
    }
}