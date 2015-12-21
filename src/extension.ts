import { ExtensionContext, QuickPickItem, QuickPickOptions, StatusBarAlignment, window, commands, workspace } from 'vscode';
import connectionManager from './connection-manager';
import settingsManager from './settings';
import * as espruino from 'espruino';

export function activate(context: ExtensionContext) {
    var connectionStatus = window.createStatusBarItem(StatusBarAlignment.Right);
    espruino.init(async () => {
        console.log('Congratulations, your extension "vscode-espruino" is now active!');
        var disposable = commands.registerCommand('VSCEspruino.listPorts', async () => {
            var opts: QuickPickOptions = {
                matchOnDescription: true,
                placeHolder: 'Select a port to connect to'
            };

            var promise = connectionManager.getPorts();

            var selection = await window.showQuickPick(promise, opts);
            var settings = await settingsManager.setPort(selection.label);
            connectionStatus.text = `${connectionManager.isConnected() ? 'Connected' : 'Disconnected'}: ${settings.port}`;
        });
        context.subscriptions.push(disposable);

        disposable = commands.registerCommand('VSCEspruino.connect-disconnect', async () => {
            var settings = await settingsManager.getSettings();

            var opts = {
                matchOnDescription: true,
                placeHolder: `${connectionManager.isConnected() ? 'Disconnect' : 'Connect'} port ${settings.port}`
            };
            var selection = await window.showQuickPick(
                ['Yes', 'No'],
                opts
            );

            if (selection === 'No') {
                return;
            }

            if (connectionManager.isConnected()) {
                connectionManager.disconnect();
                connectionStatus.text = `Disconnected: ${settings.port}`;
            } else {
                await connectionManager.connect(settings.port, settings.baudrate);
                connectionStatus.text = `Connected: ${settings.port}`;
            }
        });
        context.subscriptions.push(disposable);

        disposable = commands.registerCommand('VSCEspruino.run-file', () => {
            if (!connectionManager.isConnected()) {
                window.showErrorMessage('You must connect before running code.');
                return;
            }

            var text = window.activeTextEditor.document.getText();

            connectionManager.run(text);
        });

        var settings = await settingsManager.getSettings();
        connectionStatus.text = `Disconnected: ${settings.port || 'No port'}`;
        connectionStatus.show();
    });
};
