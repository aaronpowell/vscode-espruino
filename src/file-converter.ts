'use strict';
import { commands, window, ExtensionContext, OutputChannel, ViewColumn } from 'vscode';

var output: OutputChannel;

function htmlToJs(html: string) {
    var obj = { html }

    return JSON.stringify(obj);
};

export default {
    setupCommands(context: ExtensionContext) {
        var cmd = commands.registerTextEditorCommand('VSCEspruino.html-to-js', editor => {
            if (editor.document.languageId !== 'html') {
                return;
            }

            if (!output) {
                output = window.createOutputChannel('Espruino: File converter');
            }

            var html = htmlToJs(editor.document.getText());

            output.appendLine(html);
            output.show(ViewColumn.Two);
        });

        context.subscriptions.push(cmd);
    }
};
