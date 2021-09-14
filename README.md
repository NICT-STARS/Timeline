# Timeline
### 概要
Webページに時間軸バーを簡単に組み込む事が出来るjqueryプラグインです。

------------

### Webサイト
https://www.k2go.jp/public/Timeline/

------------

### 変更履歴

- 2021年01月26日 バージョン1.8.0リリース

  - 摘み（ポインタ）上でマウスホイール操作をした際、currentTimeが変わらないようになりました。
  - disableZoomをtrueに設定した際、 ズーム操作時（ダブルクリックやマウスホイール操作時）にcurrentTimeが変わらないようになりました。
  
- 2020年08月05日 バージョン1.7.0リリース

  - オプションにpickDoubleTapが追加され、摘み（ポインタ）をダブルクリック（ダブルタップ）した際に呼び出されるコールバック関数を指定出来るようになりました。
  
- 2020年07月30日 バージョン1.6.0リリース

  - オプションにpickTapHoldが追加され、摘み（ポインタ）を長押しした際に呼び出されるコールバック関数を指定出来るようになりました。
  - オプションのrangeMoveStart、rangeMove、rangeMoveEnd、rangeChangeの各コールバック関数の引数オブジェクトの中身が、startTime、endTimeからrangeStartTime、rangeEndTimeに変わりました。

------------
