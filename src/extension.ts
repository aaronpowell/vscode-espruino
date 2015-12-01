import { ExtensionContext, QuickPickItem, QuickPickOptions, StatusBarAlignment, window, commands, workspace } from 'vscode';
import connectionManager from './connection-manager';
import settingsManager from './settings';

export function activate(context: ExtensionContext) {
    console.log('Congratulations, your extension "vscode-espruino" is now active!');

    var disposable = commands.registerCommand('VSCEspruino.listPorts', () => {
        var opts: QuickPickOptions = {
            matchOnDescription: true,
            placeHolder: 'Select a port to connect to'
        };

        var promise = connectionManager.getPorts();

        window.showQuickPick(promise, opts)
            .then(selection => settingsManager.setPort(selection.label))
            .then(settings => connectionStatus.text = `${connectionManager.isConnected() ? 'Connected' : 'Disconnected' }: ${settings.port}`);
    });
    context.subscriptions.push(disposable);

    disposable = commands.registerCommand('VSCEspruino.connect-disconnect', () => {
        settingsManager.getSettings()
            .then(settings =>
                window.showQuickPick(['Yes', 'No'], { matchOnDescription: true, placeHolder: `${connectionManager.isConnected() ? 'Disconnect' : 'Connect'} port ${settings.port}` })
                    .then(selection => {
                        return { settings, selection };
                    })
            )
            .then(({ settings, selection }) => {
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

    disposable = commands.registerCommand('VSCEspruino.run-file', () => {
       var text = window.activeTextEditor.document.getText();

       connectionManager.run(text);
    });

    var connectionStatus = window.createStatusBarItem(StatusBarAlignment.Right);
    connectionStatus.text = 'Disconnected';
    connectionStatus.show();
};
