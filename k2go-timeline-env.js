var Env =
{
startTime       : new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate(),  0,  0,  0,   0),
endTime         : new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate(), 23, 59, 59, 999),
currentTime     : new Date(),
minTime         : new Date((new Date()).getFullYear() - 100,                       0,                      1),
maxTime         : new Date((new Date()).getFullYear() + 100,                       0,                      1),
rangeStartTime  : undefined,
rangeEndTime    : undefined,
timezoneOffset  : (new Date()).getTimezoneOffset() * -1,
jpCalendar      : false,
minScale        : 1,
maxScale        : 1000 * 60 * 60 * 24 * 60,
labelPosition   : "point",
pickLineDistance: "body",
pickLinePosition: "top",
creating    : false,
zoomTable   :
  [
    { name : "100 year", value : 1000 * 60 * 60 * 24 * 365 * 100 },
    { name : "50 year" , value : 1000 * 60 * 60 * 24 * 365 * 50  },
    { name : "10 year" , value : 1000 * 60 * 60 * 24 * 365 * 10  },
    { name : " 5 year" , value : 1000 * 60 * 60 * 24 * 365 *  5  },
    { name : " 1 year" , value : 1000 * 60 * 60 * 24 * 365       },
    { name : " 6 month", value : 1000 * 60 * 60 * 24 *  30 *  6  },
    { name : " 3 month", value : 1000 * 60 * 60 * 24 *  30 *  3  },
    { name : " 1 month", value : 1000 * 60 * 60 * 24 *  30       },
    { name : "15 day"  , value : 1000 * 60 * 60 * 24 *  15       },
    { name : " 7 day"  , value : 1000 * 60 * 60 * 24 *   7       },
    { name : " 1 day"  , value : 1000 * 60 * 60 * 24             },
    { name : "12 hour" , value : 1000 * 60 * 60 * 12             },
    { name : " 6 hour" , value : 1000 * 60 * 60 *  6             },
    { name : " 1 hour" , value : 1000 * 60 * 60                  },
    { name : "30 min"  , value : 1000 * 60 * 30                  },
    { name : "15 min"  , value : 1000 * 60 * 15                  },
    { name : " 1 min"  , value : 1000 * 60                       },
    { name : "30 sec"  , value : 1000 * 30                       },
    { name : " 1 sec"  , value : 1000 * 1                        }
  ],
  playTable             : [0.5, 1, 2, 3, 4, 5],
  playTableDefault      : 2,
  playSpanTable         : 
  [
    1000 * 1, 
    1000 * 30,
    1000 * 60,
    1000 * 60 * 10,
    1000 * 60 * 30,
    1000 * 60 * 60,
    1000 * 60 * 60 * 12,
    1000 * 60 * 60 * 24
  ],
  playSpanTableDefault  : 3,
  playInterval          : 1,
  frameInterval         : 1,
  timeoutIdFwd          : null,
  timeoutIdBack         : null,
  // ヘッダ部品表示設定（true:表示, false:非表示）
  enableHeaderBar       : true,
  // 再生機能部品表示設定（true:表示, false:非表示）
  enableFunctionBar     : true,
  // ヘッダ部品時刻表示設定（true:timelineのデフォルト処理, false:timeline外の処理）
  enableHeaderDate      : true,
  // 現在日時取得設定（true:timelineのデフォルト処理, false:timeline外の処理）
  enableNowtime         : true,
  // 連動式のリアルタイム取得設定（true:timelineのデフォルト処理, false:timeline外の処理）
  enableRealtime        : true,
  // ViewURL追加パラメータ設定（true:取得しない, false:timeline外から値を取得）
  disableViewURL        : false,
  // 西暦・和暦表示切替（true:和暦表示, false:西暦表示）
  jpCalendar            : false,
  // 時間軸ドラック制御設定（true:ドラッグ不可, false:ドラッグ可）
  disableMoveBar        : false,
  // ズーム抑制設定（true:抑制, false:非抑制）
  disableZoom           : false,
  // 時間軸ドラック時ピック連動設定（true:連動, false:非連動）
  syncPickAndBar        : true,
  // 時間軸ドラック時ピック移動設定（true:マウスカーソルの位置まで移動, false:ピック移動制御）
  clickBarToMovePick    : false,
  // ポインタをダブルクリック（ダブルタップ）（true:ズーム処理, false:マウスボタンの情報取得）
  pickDoubleTap         : true,
};
