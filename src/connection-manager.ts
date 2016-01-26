'use strict';
import { window, ViewColumn, QuickPickItem } from 'vscode';

var output = window.createOutputChannel('Espruino');

export default {
    disconnect() {
        Espruino.Core.Serial.close();
    },

    connect(port: string, baudrate: number) {
        return new Promise((resolve, reject) => {
            let Serial = Espruino.Core.Serial;

            Serial.startListening(data => {
                let parsedData = '';

                if (data.constructor === ArrayBuffer) {
                    var bufView = new Uint8Array(data as ArrayBuffer);
                    var encodedString = String.fromCharCode.apply(null, bufView);
                    parsedData = decodeURIComponent(encodedString);

                } else {
                    parsedData = data as string;
                }

                if (parsedData) {
                    output.appendLine(parsedData);
                }
            });

            Espruino.Config.BAUD_RATE = baudrate;

            Serial.open(port, status => {
                output.show(ViewColumn.Two);
                output.appendLine(`Connected: ${status}`)
                resolve(status);
            },
            () => {
                output.appendLine('Disconnected');
            });
        });
    },

    isConnected() {
        return Espruino.Core.Serial.isConnected();
    },

    getPorts() {
        return new Promise<QuickPickItem[]>((resolve, reject) => {
            Espruino.Core.Serial.getPorts((ports: string[]) => {
                resolve(ports.map(p => {
                    return { label: p, description: p };
                }));
            });
        });
    },

    run(text: string) {
        output.show(ViewColumn.Two);
        output.appendLine('Sending...');
        return new Promise((resolve, reject) => {
           Espruino.callProcessor(
               'transformForEspruino',
                text,
                code => Espruino.Core.CodeWriter.writeToEspruino(code, () => resolve())
            );
        });
    },

    reset() {
        return new Promise((resolve, reject) => {
           Espruino.Core.Serial.write("\x03reset();\n", () => resolve());
        });
    }
};
