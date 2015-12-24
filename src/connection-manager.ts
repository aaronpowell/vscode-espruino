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
                console.log(data);
            });

            Espruino.Config.BAUD_RATE = baudrate;

            Serial.open(port, status => {
                console.log('Connected: ', status);
                resolve(status);
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
        output.appendLine('Sending...');
        return new Promise((resolve, reject) => {
           Espruino.callProcessor(
               'transformForEspruino',
                text,
                code => Espruino.Core.CodeWriter.writeToEspruino(code, () => resolve())
            );
        });
    }
};
