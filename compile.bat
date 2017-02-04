cd ../
call asar pack ./ui ./ui.asar
call electron-packager ./ui ui --platform=win32 --arch=x64 --version=1.4.13 --overwrite
