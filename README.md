# Espruino for VS Code

This is a plugin that allows you to write and deploy code to your Espruino micro controller.

# How to use it

Once installed into VS Code you'll find a bunch of new commands prefixed with `Espruino` that you can run.

# Installing

Once you install the extension from the marketplace you will run into an issue with it not firing up properly. This is due to the fact that it relies on a couple of native Node.js extensions, but due to [this vscode issue](https://github.com/Microsoft/vscode/issues/658) there is a manual install step.

## Getting the native modules

### Windows

If you're using Windows I have precompiled the `contextify` and `serialport` modules, which you'll find in the `.native-prebuilt` folder. Copy these into the folders for these two modules.

### Non-Windows

You'll need to rebuild the native modules yourself, to do that you can use the `electron-rebuild` Node.js package. Once that is installed you then need to:

* Install Node.js 4.1.1 (which is what VS Code/Electron uses)
** I'd recommend using `nvm` to install multiple versions
* Run `electron-rebuild` with `0.34.5` as the Electron version

You may need to move the folder which `serialport` compiles to, I did on Windows, but am unsure about other OSes.

If you do get a non-Windows OS up and running I'd appreciate you sending me the binaries so I can include them.
