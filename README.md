# ptouch_web

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

# Stop `usblp` claiming the usb device

If you get an error "cannot claim interface" or something similar on Linux, it is possible that the `usblp` kernel module is claiming the device before your browser can.  
You can check that by running `lsusb -t | grep Printer`. If it says "Driver=usblp", you can add the following udev rules to stop that from happening:

File `/etc/udev/rules.d/91-usb-ptouch-unbind.rules`:

```
ACTION=="add", SUBSYSTEM == "usb", ATTRS{idVendor} == "04f9", ATTRS{idProduct} == "2007|2011|2019|201f|202c|202d|2041|205e|205f|2061|2062|2073|2074|20af|20df|20e0|20e1", MODE="0660", TAG+="uaccess" RUN+="/bin/sh -c 'echo -n $kernel:1.0 > /sys/bus/usb/drivers/usblp/unbind'"
```

After that, you have to reload the rules with `sudo udevadm control --reload-rules`, unplug and replug the device and it should work.