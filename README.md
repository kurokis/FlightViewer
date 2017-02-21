
# フライトデータ表示アプリ

## 概要

マルチコプターのログを解析し可視化するアプリケーション。Pythonの数値計算ライブラリを用いた強力な解析機能と、直観的なログ表示機能の両立を目指す。将来的には異常検知などの機能を追加することを想定している。

現状ではWindows限定としている。これはPythonがインストールされていないマシンでも利用可能にするために、pythonファイルをexe化してパッケージングしているからである。Python(+numpy,pandas)環境が整ったマシンに対してはクロスプラットフォームアプリとして提供することも可能である。

アプリ開発にあたってはElectronを利用している。Electronを使うメリット・デメリットを以下にまとめる。

- メリット
  * クロスプラットフォームのデスクトップアプリとして配布可能
  * Web技術(Node.js + html + CSS)を基本とした開発のため、豊富なJavascript APIが利用できる
    * 3D: WebGL (Three.js)
    * 地図: OpenStreetMap (Leaflet API)
  * 綺麗なUIが作れる
    * Bootstrapのテンプレートを用いる (SBAdmin2)
    * Bootstrapスライダー (bootstrap-slider)
    * インタラクティブなプロット用ライブラリ (Flot)
- デメリット
  * Javascriptは重い計算に向かない
    * PythonコードをPyinstallerによりexe化して使用している。(Windows限定)
    * C++のコードをnative addonとして利用できる模様(未実装)

## インストール手順(Windows 64 bit)
* Node.jsの最新の64ビット用msiをダウンロードし、インストール。https://nodejs.org/download/ → release/ → latest/ → node-v7.4.0-x64.msi
* Electronをインストール。npm –g install electron-prebuilt
* 配布可能なアプリを作るためにはアプリケーションのアーカイブ化とパッケージングを行う。そのためにはさらに以下をインストールする。
  * asar： npm install -g asar
  * electron-packager: npm i electron-packager -g

参考：http://qiita.com/nyanchu/items/15d514d9b9f87e5c0a29

## 実行手順
例としてディレクトリ名がsampleの場合の手順を示す。
* ディレクトリ内に移動。　``cd ./sample``
* Electronを実行。 ``electron ./``
  * 代替コマンドとして ``npm start``でもよい。

## 配付手順
* アプリのあるディレクトリの一つ上の階層に移動。 ``cd ../``
* アーカイブ化する。 ``asar pack ./sample ./sample.asar``
* パッケージングする。 ``electron-packager ./sample sample --platform=win32 --arch=x64 --version=1.4.13``
  * platform: all, linux, win32, darwin
  * arch: all, ia32, x64
  * version: Electronのバージョン
* 配付可能なアプリが出力される。次のコマンドで実行。``./sample-win32-x64/sample.exe``

## プログラム構造
Electronで書くプログラムは、アプリ全体を制御するメインプロセスと個々の機能を実行するレンダラープロセスに分けられる。

- メインプロセス：main.js
- レンダラープロセス：readfile.js, animationcontrol.js, modelviewer.js, ...

メインプロセスはウィンドウ管理を行うほか、グローバル変数の格納・呼び出しとプロセス間通信(inter-process communication, ipc)を管理している。
メインプロセスとレンダラープロセスの間でデータをやり取りする方法はremoteとipcの2種類あり、以下のような使い分けをしている。

### remote: レンダラープロセスからメインプロセスのデータや関数にアクセス
レンダラープロセスは、remoteによりメインプロセスで定義されたデータや関数にアクセスできる。メインプロセスに格納したグローバル変数は直接アクセスすることもできるが、方針としてアクセス関数を用いて取得することにする。
アクセス関数を作成するためには、main.js内で次のように関数を定義すればよい。
```js
exports.getNFrames = function(){
  return global.sharedObject.nframes;
}
```

- メインプロセスのデータを直接取得する方法(非推奨)
```js
var remote = require('electron');
...
var nframes = remote.getGlobal('sharedObject').nframes;
```
- メインプロセスのデータをアクセス関数経由で取得する方法(推奨)
```js
var remote = require('electron');
const main = remote.require("./main");
...
var nframes = main.getNFrames();
```


### ipc: レンダラープロセス間で通信
方針として、レンダラープロセス間でデータのやり取りをしたい場合には、必ずipcによりメインプロセスを経由して行うことにする。
これはプログラムの拡張性を考えたときに、各機能をなるべく疎結合に保つことが望ましいからである。
すなわち、レンダラープロセスA→メインプロセス→レンダラープロセスBの順で通信する。



例：スライダーによりモデル表示を更新

レンダラープロセスA(animationcontrol.js)：IPCでメインプロセスにイベント発火要請のメッセージを送る

```js
  ipcRenderer.send('fireFrameUpdate',-1);
```

メインプロセス(main.js)：IPCを受け、(全ての)レンダラープロセスに'frameUpdate'イベントを発生させる

```js
// 表示するフレームが変わったときのイベント
ipcMain.on('fireFrameUpdate', (event, arg) => { // animationcontrol.js
  event.sender.send('frameUpdate', null)
})
```

レンダラープロセスB(modelviewer.js)：'frameUpdate'イベントが発生したことを受け、イベントハンドラを実行する

```js
// ipc handler
ipcRenderer.on('frameUpdate', (event, arg) => {
 setAttitude();
})
```
