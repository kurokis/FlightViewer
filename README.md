
# フライトデータ表示アプリ

[//]: # (Image References)
[demo]: ./readme_images/demo.gif "Demo"

## 概要

![alt text][demo]

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

## インストール手順(Windows 64-bitの場合)

インストールはNode.jsのインストール→Electronのインストールの順番になっている。ここではWindows 64-bitマシンでのインストール手順を示す。

* Node.jsの最新の64ビット用msiをダウンロードし、インストール（https://nodejs.org/download/ → release/ → latest/ → node-v7.4.0-x64.msi）。Node.jsをインストールすることによりnpm(node package manager)が利用できるようになる。デフォルト設定で環境変数にnpmが追加されるはずである。
* Electronをインストール。コマンドプロンプトで次のコマンドを実行する。``npm –g install electron-prebuilt``
* 配布可能なアプリを作るためにはアプリケーションのアーカイブ化とパッケージングを行う。そのためにはさらに以下をインストールする。
  * asar： ``npm install -g asar``
  * electron-packager: ``npm i electron-packager -g``
* FlightViewer本体をダウンロードする。Git利用の場合は次のコマンドを実行。``git clone https://github.com/kurokis/FlightViewer``
Gitが入っていない場合はhttps://github.com/kurokis/FlightViewer からzipファイルでダウンロードしてもよい。

以上でインストールは完了である。

参考：http://qiita.com/nyanchu/items/15d514d9b9f87e5c0a29

## 実行手順
例としてデスクトップにFlightViewerをダウンロードした場合の手順を示す。

* FlightViewerディレクトリに移動。例えばデスクトップにダウンロードした場合は、次のようにする（< User Name >はWindowsで使用しているユーザー名）。　``cd C:\Users\<User Name>\Desktop\FlightViewer``
* Electronを実行。 ``electron ./``
  * 代替コマンドとして ``npm start``でもよい。
* log_samples/logdji3.csvがDJIログファイルのサンプルであるので、これを使って各種機能を試すことができる。

## 配付手順
FlightViewerを配布可能なアプリとしてビルドする方法を説明する。完成したアプリはElectronを必要とせず、誰でも利用可能である。

* FlightViewerの一つ上の階層に移動。 ``cd ..``
* アーカイブ化する。 ``asar pack ./FlightViewer ./FlightViewer.asar``
* パッケージングする。 ``electron-packager ./FlightViewer FlightViewer --platform=win32 --arch=x64 --version=1.4.13``
  * platform: all, linux (Linux), win32 (Windows), darwin (Mac)
  * arch: all, ia32 (32-bit), x64 (64-bit)
  * version: インストールされているElectronのバージョン。``electron -v``で確認できる。
* 配付可能なアプリが出力される。64-bit Windows用にビルドした場合は、FlightViewer-win32-x64ディレクトリが作成される。FlightViewer.exeをダブルクリックするか、次のコマンドを打てばアプリが実行できる。``./FlightViewer-win32-x64/FlightViewer.exe``

## プログラム説明

### ファイル構成

#### 独自機能(Javascript, Electronのレンダラープロセス)

| ファイル | 機能 | 依存 |
|:--------|:-----|:----|
| js/altitudeplot.js | 高度の時系列プロット | jQuery, Flot |
| js/animationcontrol.js | 表示時刻の管理と関連UI(ナビゲーションバーの右側)の制御 | jQuery, bootstrap-slider (node module) |
| js/attitudeplot.js | 姿勢(Euler角)の時系列プロット | jQuery, Flot |
| js/mapviewer.js | OpenStreetMapの表示 | Leaflet (node module) |
| js/modelviewer.js | 3次元マップの表示 | jQuery, Three.js (+ OrbitControls) |
| js/pagetransfer.js | ページを移動したときにナビゲーションバーなどの再読み込みを行う | jQuery |
| js/positionxyplot.js | 緯度経度のプロット | jQuery, Flot |
| js/readfile.js | ファイル読み込みと関連UI(ナビゲーションバーの左側)の制御　|　fs, csv (node module) |

#### 独自機能(Python)

| ファイル | 機能 | 依存 |
|:--------|:-----|:----|
| py/decodeDJI.py | DJIのログファイルの解析プログラム。ビューワですぐに読み込めるファイルを出力する（例：logdji.csv→logdji_out.csv）。将来的にはこのファイルでカルマンフィルタや異常検知を実行する。 | numpy, pandas|
| py/dist/decodeDJI.exe | 実際には上記pythonファイルではなくこのexeファイルを実行している。これはdecodeDJI.pyをPyinstallerによりexe化したもの。|-|

#### 外部ライブラリ（単体）

| ファイル | 機能 | URL |
|:--------|:-----|:----|
| lib/jquery.flot.js | Flot: jQueryを利用してインタラクティブなグラフを作成できる | http://www.flotcharts.org/ |
| lib/jquery_after.js | ElectronでjQueryを利用できるようにするためのファイル。jQueryを読み込む行の直後でこれを読み込んで利用する。 |http://qiita.com/nariyu/items/7cce7b8efdf7ca1c567d |
| lib/jquery-3.1.1.min.js | jQueryの本体。jQueryはjavascriptのコーディングを大幅に簡略化できるライブラリで、イベント処理などが楽にできる。 | http://api.jquery.com/ |
| lib/three.js | WebGLを簡単に利用するためのAPIで、3Dモデルの読み込み、表示ができる。 | https://threejs.org/ |
| lib/OrbitControls.js | three.jsの拡張機能で、orbit controlsを有効にする。これによりカメラの上方向を保ったまま、ドラッグして物体を見る向きを変えることができる。 | https://threejs.org/ |

#### Node.jsモジュール
node moduleはnpm経由でインストールできる。
例:``npm install leaflet``

| ファイル | 機能 |インストール方法| URL |
|:--------|:-----|:-------------|:----|
| node_modules/bootstrap-slider | bootstrapの拡張機能で、スライダーのUIを定義する |``npm install bootstrap-slider`` | https://github.com/seiyria/bootstrap-slider |
| node_modules/csv,csv-generate,csv-parse,csv-stringify,stream-transform,lodash.get | csvファイルの読み書き | ``npm install csv`` | https://github.com/wdavidw/node-csv |
| node_modules/leaflet | OpenStreetMapを利用するためのAPI | ``npm install leaflet`` | http://leafletjs.com/index.html |


### プログラムの構造
Electronで書くプログラムは、アプリ全体を制御するメインプロセスと個々の機能を実行するレンダラープロセスに分けられる。

- メインプロセス：main.js
- レンダラープロセス：readfile.js, animationcontrol.js, modelviewer.js, ...

メインプロセスはウィンドウ管理を行うほか、グローバル変数の格納・呼び出しとプロセス間通信(inter-process communication, ipc)を管理している。
メインプロセスとレンダラープロセスの間でデータをやり取りする方法はremoteとipcの2種類あり、以下のような使い分けをしている。

#### remote: レンダラープロセスからメインプロセスのデータや関数にアクセス
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

#### ipc: レンダラープロセス間で通信
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
