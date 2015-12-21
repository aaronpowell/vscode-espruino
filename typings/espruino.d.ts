declare namespace espruino {
    var init: (fn: () => void) => void
}

declare module 'espruino' {
    export = espruino;
}

interface Core {
    Serial: Serial

    CodeWriter: CodeWriter
}

interface Config {
    BAUD_RATE: number
}

interface Serial {
    close: () => void

    open: (port: string, fn: ((status: string) => void)) => void

    isConnected: () => boolean

    getPorts: (fn: (ports: string[]) => void) => void

    startListening:(fn: (data: string) => void) => void
}

interface CodeWriter {
    writeToEspruino: (code: string, callback: () => void) => void
}

declare var Espruino: {
    Core: Core

    Config: Config

    callProcessor: (processorName: string, code: string, callback: (code: string) => void) => void
}
