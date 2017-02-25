cd ../
call asar pack ./FlightViewer ./FlightViewer.asar
call electron-packager ./FlightViewer FlightViewer --platform=win32 --arch=x64 --version=1.4.13 --overwrite
