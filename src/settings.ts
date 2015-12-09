import { workspace } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const filename = 'espruino.json';

interface EspruinoSettings {
    port?: string
    baudrate: number
}

let settings: EspruinoSettings;

let save = function(): Promise<EspruinoSettings> {
    if (!workspace.rootPath) {
        return Promise.resolve(settings);
    }

    return new Promise<EspruinoSettings>((resolve, reject) => {
        var configLocation = path.join(workspace.rootPath, filename);

        fs.writeFile(configLocation, JSON.stringify(settings, null, 2), err => {
            if (err) {
                return reject(err);
            }

            return resolve(settings);
        });
    });
};

let getSettings = function() {
    if (!workspace.rootPath) {
        if (!settings) {
            settings = {
                baudrate: 115200
            };
        }

        return Promise.resolve(settings);
    }

    return new Promise<EspruinoSettings>((resolve, reject) => {
        var configLocation = path.join(workspace.rootPath, filename);

        fs.exists(configLocation, exists => {
            if (!exists) {
                settings = {
                    baudrate: 115200
                };
                return resolve(settings);
            }

            fs.readFile(configLocation, 'utf-8', (err, data) => {
                if (err) {
                    return reject(err);
                }

                try {
                    settings = JSON.parse(data);
                } catch (e) {
                    // malformed, maybe from last time it was opened
                    // ignore the error
                }
                return resolve(settings);
            });
        });
    });
};

let setPort = function(port: string) {
    return getSettings()
        .then(settings => settings.port = port)
        .then(() => save());
};

workspace.onDidChangeTextDocument(e => {
    if (path.basename(e.document.fileName) !== filename) {
        return;
    }

    var txt = e.document.getText();
    if (!txt) {
        return;
    }

    try {
        settings = JSON.parse(txt);
    } catch (e) {
        // file isn't complete yet, ignoring
    }
});

export default {
    getSettings,
    setPort
};

export { EspruinoSettings };
