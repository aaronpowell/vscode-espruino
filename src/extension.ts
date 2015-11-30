import { ExtensionContext, QuickPickItem, QuickPickOptions, StatusBarAlignment, window, commands, workspace } from 'vscode';
import * as serialport from 'serialport';
import * as path from 'path';
import * as fs from 'fs';
import connectionManager from './connection-manager';

interface EspruinoSettings {
    port?: string;
    baudrate?: number
}

let settings: EspruinoSettings = {
    port: undefined,
    baudrate: 115200
};

export function activate(context: ExtensionContext) {
    console.log('Congratulations, your extension "vscode-espruino" is now active!');

    var disposable = commands.registerCommand('VSCEspruino.listPorts', () => {
        var opts: QuickPickOptions = {
            matchOnDescription: true,
            placeHolder: 'Select a port to connect to'
        };

        var promise = new Promise<QuickPickItem[]>((resolve, reject) => {
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

        window.showQuickPick(promise, opts)
            .then(selection => {
                settings.port = selection.label;
                connectionStatus.text = `${connectionManager.isConnected() ? 'Connected' : 'Disconnected' }: ${settings.port}`;
                if (!workspace.rootPath) {
                    window.showWarningMessage(`There is no opened workspace so the selection is transient`);
                    return;
                }

                workspace.findFiles('espruino.json', '\node_modules**', 1)
                    .then((files) => {
                        if (!files || !files.length) {
                            window.showInformationMessage('No espruino.json found, creating at project root');
                            fs.writeFile(
                                path.join(workspace.rootPath, 'espruino.json'),
                                JSON.stringify(settings),
                                (err) => err ? window.showErrorMessage('Failed to create espruino.json: ' + JSON.stringify(err)) : window.showInformationMessage('Created espruino.json')
                            );
                        }
                    });
            });
    });
    context.subscriptions.push(disposable);

    disposable = commands.registerCommand('VSCEspruino.connect-disconnect', () => {
        window.showQuickPick(['Yes', 'No'], { matchOnDescription: true, placeHolder: `${connectionManager.isConnected() ? 'Disconnect' : 'Connect'} port ${settings.port}` })
            .then(selection => {
                if (selection === 'No') {
                    return;
                }

                if (connectionManager.isConnected()) {
                    connectionManager.disconnect()
                        .then(() => {
                            connectionStatus.text = `Disconnected: ${settings.port}`;
                        });
                } else {
                    connectionManager.connect(settings.port, settings.baudrate)
                        .then(() => {
                            connectionStatus.text = `Connected: ${settings.port}`;
                        });
                }
            });
    });
    context.subscriptions.push(disposable);

    var connectionStatus = window.createStatusBarItem(StatusBarAlignment.Right);
    connectionStatus.text = 'Disconnected';
    connectionStatus.show();
};
