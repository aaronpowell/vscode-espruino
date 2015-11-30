import { window, ViewColumn } from 'vscode';
import { SerialPort } from 'serialport';

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
            connection = new SerialPort(port, { baudrate });

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
    }
};
