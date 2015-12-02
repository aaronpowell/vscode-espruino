declare namespace serialport {
    interface Port {
        comName: string
        manufacturer: string
    }

    interface SerialPortInstance {
        new(port: string, ops: any): SerialPortInstance

        on(eventName: string, callback: (err: string, data: string) => void)

        close(callback: () => void)

        write(text: string, callback: (err: string) => void)

        drain(callback: () => void)
    }

    var SerialPort: SerialPortInstance

    var list: (callback: (err: string, ports: Port[]) => void) => void
}

declare module 'serialport' {
    export = serialport
}
