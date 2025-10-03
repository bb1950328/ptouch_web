import {PTouchInterface, PTouchInterfaceUSB} from "@/ptouch/interface";
import {PTouchDeviceStatus} from "@/ptouch/data";
import {PTouchInterfaceMock} from "@/ptouch/mock_interface";

export class InterfaceManager {
    private interf: PTouchInterface;
    private listeners: Map<number, ((status: PTouchDeviceStatus) => void)>;

    constructor() {
        this.setInterface(new PTouchInterfaceUSB());
        this.listeners = new Map();
    }

    private setInterface(interf: PTouchInterfaceUSB) {
        this.interf = interf;
        this.interf.set_status_callback(() => this.callDeviceStatusListeners());
    }

    public get(): PTouchInterface {
        return this.interf;
    }

    public setTypeUSB() {
        this.setInterface(new PTouchInterfaceUSB());
    }

    public setTypeMock() {
        this.setInterface(new PTouchInterfaceMock());
    }

    public isWebUSBAvailable() {
        return !!navigator.usb;
    }

    public addDeviceStatusListener(listener: (status: PTouchDeviceStatus) => void): number {
        const newKey = this.listeners.size == 0 ? 1 : Math.max(...this.listeners.keys()) + 1;
        this.listeners.set(newKey, listener);
        return newKey;
    }

    public removeDeviceStatusListener(listenerId: number) {
        this.listeners.delete(listenerId);
    }

    private callDeviceStatusListeners() {
        this.listeners.forEach(listener => listener(this.interf.get_status()));
    }
}