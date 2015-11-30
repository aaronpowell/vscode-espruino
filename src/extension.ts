import { ExtensionContext, QuickPickItem, QuickPickOptions, window, commands, workspace } from 'vscode';
import * as serialport from 'serialport';
import * as path from 'path';
import * as fs from 'fs';

interface EspruinoSettings {
    port?: string;
    baudrate?: number
}

let settings: EspruinoSettings = {
    port: undefined,
    baudrate: 115200
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-espruino" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
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
                if (!workspace.rootPath) {
                    window.showWarningMessage(`There is no opened workspace so the selection is transient`);
                    settings.port = selection.label;
                    return;
                }

                workspace.findFiles('electron.json', '\node_modules**', 1)
                    .then((files) => {
                        if (!files || !files.length) {
                            window.showInformationMessage('No espruino.json found, creating at project root');
                            fs.writeFile(
                                path.join(workspace.rootPath, 'espruino.json'),
                                JSON.stringify({ port: selection.label, baudrate: 115200 }),
                                (err) => err ? window.showErrorMessage('Failed to create espruino.json: ' + JSON.stringify(err)) : window.showInformationMessage('Created espruino.json')
                            );
                        }
                    });
            });
    });

    context.subscriptions.push(disposable);
}