'use strict';
import { commands, window, ExtensionContext, OutputChannel, ViewColumn } from 'vscode';
import * as htmlMin from 'html-minifier';

var output: OutputChannel;

function htmlToJs(html: string) {
    var minifiedHTML = htmlMin.minify(html, {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeComments: true,
        removeScriptTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
    });

    var obj = { html: minifiedHTML };

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
