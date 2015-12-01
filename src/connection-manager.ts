import { window, ViewColumn, QuickPickItem } from 'vscode';
import * as serialport from 'serialport';

let connected = false;
let connection;
var output = window.createOutputChannel('Espruino');

export default {
    disconnect() {
        return new Promise((resolve, reject) => {
            connection.close(() => {
                connected = false;
                resolve();
            });
        });
    },

    connect(port: string, baudrate: number) {
        return new Promise((resolve, reject) => {
            connection = new serialport.SerialPort(port, { baudrate });

            connection.on('data', data => {
               if (data) {
                   output.appendLine(data);
               }
            });

            connection.on('open', (err, data) => {
                if (err) {
                    reject(err);
                }
                output.show(ViewColumn.Two);
                output.appendLine(`Connection established to ${port}`);
                if (data) {
                    output.appendLine(data);
                }
                resolve();
            });
            connected = true;
        });
    },

    isConnected() {
        return connected;
    },

    getPorts() {
        return new Promise<QuickPickItem[]>((resolve, reject) => {
            serialport.list((err, ports) => {
               if (err) {
                   return reject(err);
               }
                resolve(ports.map(p => {
                    return {
                        label: p.comName,
                        description: `${p.comName} (${p.manufacturer})`
                    } as QuickPickItem;
                }));
            });
        });
    },

    run(text: string) {
        output.appendLine('Sending...');
        connection.write(text, err => {
            if (err) {
                output.appendLine('Error:');
                output.appendLine(err);
                return;
            }

            connection.drain(() => output.appendLine('Sent...'));
        });
    }
};
