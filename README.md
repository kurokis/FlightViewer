
# フライトデータ表示アプリ（Electronで開発）

メリット
* クロスプラットフォームのデスクトップアプリとして配布可能
* Web技術(Node.js + html + CSS)を基本とした開発のため、豊富なJavascript APIが利用できる
  * 3D: WebGL
  * 地図: GoogleMaps API
* 綺麗なUIが作れる
  * Bootstrapのテンプレートを用いる
  * Flotなどのインタラクティブなプロット用ライブラリが使える

デメリット
* Javascriptは重い計算に向かない
  * ただしC++のコードをnative addonとして利用できる模様

## インストール手順(Windows 64 bit)
* Node.jsの最新の64ビット用msiをダウンロードし、インストール。https://nodejs.org/download/ → release/ → latest/ → node-v7.4.0-x64.msi
* Electronをインストール。npm –g install electron-prebuilt
* 配布可能なアプリを作るためにはアプリケーションのアーカイブ化とパッケージングを行う。そのためにはさらに以下をインストールする。
  * asar： npm install -g asar
  * electron-packager: npm i electron-packager -g

参考：http://qiita.com/nyanchu/items/15d514d9b9f87e5c0a29

## 実行手順
* アプリのあるディレクトリで次のコマンドを実行: electron ./

## 配付手順
* アプリのあるディレクトリの一つ上の階層に移動
* アーカイブ化する。 asar pack ./sample ./sample.asar
* パッケージングする。 electron-packager ./sample sample --platform=win32 --arch=x64 --version=1.4.13
  * platform: all, linux, win32, darwin
  * arch: all, ia32, x64
  * version: Electronのバージョン
* 配付可能なアプリが出力される。./sample-win32-x64/sample.exe
