/******************************************************************************/
/* Sample for k2goTimeline                                                    */
/* Inoue Computer Service.                                                    */
/******************************************************************************/
/******************************************************************************/
/* window.load                                                                */
/******************************************************************************/
$(window).on("load", function()
{
  $("#timeline").k2goTimeline(
  {
    minTime          : new Date($Env.minTime    .getTime()),
    maxTime          : new Date($Env.maxTime    .getTime()),
    startTime        : new Date($Env.startTime  .getTime()),
    endTime          : new Date($Env.endTime    .getTime()),
    currentTime      : new Date($Env.currentTime.getTime()),
    pickLineDistance : { element : $("table"), position : "bottom" },
    timeChange       : function(pTimeInfo)
    {
      var $start   = { date : $("#start_time   input[type='date']"), time : $("#start_time   input[type='time']") };
      var $end     = { date : $("#end_time     input[type='date']"), time : $("#end_time     input[type='time']") };
      var $current = { date : $("#current_time input[type='date']"), time : $("#current_time input[type='time']") };

      $start  .date.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.  startTime, "%y-%mm-%dd"));
      $start  .time.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.  startTime, "%H:%M:%S"  ));
      $end    .date.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.    endTime, "%y-%mm-%dd"));
      $end    .time.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.    endTime, "%H:%M:%S"  ));
      $current.date.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%y-%mm-%dd"));
      $current.time.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%H:%M:%S"  ));
    },
    rangeChange : function(pTimeInfo)
    {
      adjustCurrentTime();

      var $start = { date : $("#range_start_time input[type='date']"), time : $("#range_start_time input[type='time']") };
      var $end   = { date : $("#range_end_time   input[type='date']"), time : $("#range_end_time   input[type='time']") };

      $start.date.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeStartTime, "%y-%mm-%dd"));
      $start.time.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeStartTime, "%H:%M:%S"  ));
      $end  .date.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.  rangeEndTime, "%y-%mm-%dd"));
      $end  .time.val($("#timeline").k2goTimeline("formatDate", pTimeInfo.  rangeEndTime, "%H:%M:%S"  ));
    },
    railClick      : function(pTimeInfo) { adjustCurrentTime(); putEventInfo("rail click"      , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    pickTapHold    : function(pTimeInfo) {                      putEventInfo("pick tap hold"   , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    pickMoveStart  : function(pTimeInfo) {                      putEventInfo("pick move start" , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    pickMove       : function(pTimeInfo) {                      putEventInfo("pick move"       , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    pickMoveEnd    : function(pTimeInfo) { adjustCurrentTime(); putEventInfo("pick move end"   , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    barMoveStart   : function(pTimeInfo) { adjustCurrentTime(); putEventInfo("bar  move start" , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    barMove        : function(pTimeInfo) { adjustCurrentTime(); putEventInfo("bar  move"       , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    barMoveEnd     : function(pTimeInfo) { adjustRangeBar   (); putEventInfo("bar  move end"   , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    zoomStart      : function(pTimeInfo) {                      putEventInfo("zoom start"      , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    zoom           : function(pTimeInfo) {                      putEventInfo("zoom"            , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    zoomEnd        : function(pTimeInfo) { adjustRangeBar   (); putEventInfo("zoom end"        , $("#timeline").k2goTimeline("formatDate", pTimeInfo.   currentTime, "%y/%mm/%dd %H:%M:%S" )                                                                                             ); },
    rangeMoveStart : function(pTimeInfo) {                      putEventInfo("range move start", $("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeStartTime, "%y/%mm/%dd %H:%M:%S ") + $("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeEndTime, "~ %y/%mm/%dd %H:%M:%S")); },
    rangeMove      : function(pTimeInfo) {                      putEventInfo("range move"      , $("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeStartTime, "%y/%mm/%dd %H:%M:%S ") + $("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeEndTime, "~ %y/%mm/%dd %H:%M:%S")); },
    rangeMoveEnd   : function(pTimeInfo)
    {
/*
      var objOptions   = $("#timeline").k2goTimeline("getOptions");
      var objStartTime = objOptions.minTime.getTime() > objOptions.startTime.getTime() ? objOptions.minTime : objOptions.startTime;
      var objEndTime   = objOptions.maxTime.getTime() < objOptions.endTime  .getTime() ? objOptions.maxTime : objOptions.endTime;
      var $start       = { date : $("#range_start_time input[type='date']"), time : $("#range_start_time input[type='time']") };
      var $end         = { date : $("#range_end_time   input[type='date']"), time : $("#range_end_time   input[type='time']") };

      if (pTimeInfo.rangeStartTime < objStartTime)
      {
        objEndTime = new Date(objStartTime.getTime() + (pTimeInfo.rangeEndTime.getTime() - pTimeInfo.rangeStartTime.getTime()));
        $("#timeline").k2goTimeline("showRangeBar", { rangeStartTime : new Date(objStartTime.getTime()), rangeEndTime : new Date(objEndTime.getTime()) });
      }
      else if (pTimeInfo.rangeEndTime > objEndTime)
      {
        objStartTime = new Date(objEndTime.getTime() - (pTimeInfo.rangeEndTime.getTime() - pTimeInfo.rangeStartTime.getTime()));
        $("#timeline").k2goTimeline("showRangeBar", { rangeStartTime : new Date(objStartTime.getTime()), rangeEndTime : new Date(objEndTime.getTime()) });
      }
      else
      {
        objStartTime = pTimeInfo.rangeStartTime;
        objEndTime   = pTimeInfo.rangeEndTime;
      }

      $start.date.val($("#timeline").k2goTimeline("formatDate", objStartTime, "%y-%mm-%dd"));
      $start.time.val($("#timeline").k2goTimeline("formatDate", objStartTime, "%H:%M:%S"  ));
      $end  .date.val($("#timeline").k2goTimeline("formatDate", objEndTime  , "%y-%mm-%dd"));
      $end  .time.val($("#timeline").k2goTimeline("formatDate", objEndTime  , "%H:%M:%S"  ));
*/
      putEventInfo("range move end", $("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeStartTime, "%y/%mm/%dd %H:%M:%S ") + $("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeEndTime, "~ %y/%mm/%dd %H:%M:%S"));
    }
  },
  function(pTimeInfo)
  {
    var objOptions        = $("#timeline").k2goTimeline("getOptions");
    var objRangeStartTime = new Date(objOptions.currentTime.getTime() - $("#timeline").width() / 16 * objOptions.scale);
    var objRangeEndTime   = new Date(objOptions.currentTime.getTime() + $("#timeline").width() / 16 * objOptions.scale);

    $("#min_time         input[type='date']").val($("#timeline").k2goTimeline("formatDate", objOptions.minTime, "%y-%mm-%dd"));
    $("#min_time         input[type='time']").val($("#timeline").k2goTimeline("formatDate", objOptions.minTime, "%H:%M:%S"  ));
    $("#max_time         input[type='date']").val($("#timeline").k2goTimeline("formatDate", objOptions.maxTime, "%y-%mm-%dd"));
    $("#max_time         input[type='time']").val($("#timeline").k2goTimeline("formatDate", objOptions.maxTime, "%H:%M:%S"  ));
    $("#range_start_time input[type='date']").val($("#timeline").k2goTimeline("formatDate", objRangeStartTime , "%y-%mm-%dd"));
    $("#range_start_time input[type='time']").val($("#timeline").k2goTimeline("formatDate", objRangeStartTime , "%H:%M:%S"  ));
    $("#range_end_time   input[type='date']").val($("#timeline").k2goTimeline("formatDate", objRangeEndTime   , "%y-%mm-%dd"));
    $("#range_end_time   input[type='time']").val($("#timeline").k2goTimeline("formatDate", objRangeEndTime   , "%H:%M:%S"  ));

    $("#timeline").k2goTimeline("setOptions", { rangeStartTime : objRangeStartTime, rangeEndTime : objRangeEndTime });

    putEventInfo("after initialize", $("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%y/%mm/%dd %H:%M:%S"));
  });
});$(function() {
/******************************************************************************/
/* window.resize                                                              */
/******************************************************************************/
$(window).on("resize", function()
{
  if (typeof $(window).data("resize") == "number")
  {
    clearTimeout($(window).data("resize"));
    $(window).removeData("resize");
  }

  $(window).data("resize", setTimeout(function()
  {
    adjustRangeBar();
    putEventInfo  ("resize", "----/--/-- --:--:--");
    $(window).removeData("resize");
  }, 300));
});
/******************************************************************************/
/* document.mousemove                                                         */
/******************************************************************************/
/*
$(document).on("mousemove", function(pEvent)
{
  var $rangeBar = $(".k2go-timeline-range-show");

  if ($rangeBar.length > 0)
  {
    var intLeft  = $rangeBar.offset().left;
    var intRight = $rangeBar.width () + intLeft;
    var flgHover = false;

    $(":hover").each(function()
    {
      if ($(this).attr("id") == "zoom_in" || $(this).attr("id") == "zoom_out")
      {
        flgHover = true;
        return false;
      }
    });

    $("#zoom_disable").prop        ("checked"   , !(intLeft <= pEvent.pageX && pEvent.pageX <= intRight) && !flgHover);
    $("#timeline"    ).k2goTimeline("setOptions", { disableZoom : $("#zoom_disable").prop("checked") });
  }
});
*/
/******************************************************************************/
/* change                                                                     */
/******************************************************************************/
$("*").on("change", function()
{
  var objOptions  = $("#timeline").k2goTimeline("getOptions");
  var objTimeInfo = {};

  objTimeInfo.minTime     = new Date(objOptions.minTime    .getTime());
  objTimeInfo.maxTime     = new Date(objOptions.maxTime    .getTime());
  objTimeInfo.startTime   = new Date(objOptions.minTime    .getTime() > objOptions.startTime.getTime() ? objOptions.minTime.getTime() : objOptions.startTime.getTime());
  objTimeInfo.endTime     = new Date(objOptions.maxTime    .getTime() < objOptions.endTime  .getTime() ? objOptions.maxTime.getTime() : objOptions.endTime  .getTime());
  objTimeInfo.currentTime = new Date(objOptions.currentTime.getTime());

       if ($(this).attr("id") == "time_zone"             ) { $("#timeline").k2goTimeline("setOptions", { timezoneOffset     : parseInt($(this).val(), 10)         }); $("#timeline").k2goTimeline("create", { timeInfo : objTimeInfo, callback : function(pTimeInfo) { putEventInfo("after create method", $("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%y/%mm/%dd %H:%M:%S")); } }); }
  else if ($(this).attr("id") == "jp_calendar"           ) { $("#timeline").k2goTimeline("setOptions", { jpCalendar         : $(this).val() == "1" ? true : false }); $("#timeline").k2goTimeline("create", { timeInfo : objTimeInfo, callback : function(pTimeInfo) { putEventInfo("after create method", $("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%y/%mm/%dd %H:%M:%S")); } }); }
  else if ($(this).attr("id") == "label_position"        ) { $("#timeline").k2goTimeline("setOptions", { labelPosition      : $(this).val()                       }); $("#timeline").k2goTimeline("create", { timeInfo : objTimeInfo, callback : function(pTimeInfo) { putEventInfo("after create method", $("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%y/%mm/%dd %H:%M:%S")); } }); }
  else if ($(this).attr("id") == "move_bar_disable"      ) { $("#timeline").k2goTimeline("setOptions", { disableMoveBar     : $(this).prop("checked") }); }
  else if ($(this).attr("id") == "zoom_disable"          ) { $("#timeline").k2goTimeline("setOptions", { disableZoom        : $(this).prop("checked") }); }
  else if ($(this).attr("id") == "sync_pick_and_bar"     ) { $("#timeline").k2goTimeline("setOptions", { syncPickAndBar     : $(this).prop("checked") }); }
  else if ($(this).attr("id") == "click_bar_to_move_pick") { $("#timeline").k2goTimeline("setOptions", { clickBarToMovePick : $(this).prop("checked") }); }
  else if ($(this).attr("id") == "realtime"              ) { $("#pps"     ).toggleClass ("disable"); $("#loop").toggleClass("disable"); }
  else if ($(this).attr("id") == "fps"                   ) { $("#stop"    ).trigger     ("click"     , true); }
  else if ($(this).attr("id") == "pps"                   ) { $("#stop"    ).trigger     ("click"     , true); }
});
/******************************************************************************/
/* click                                                                      */
/******************************************************************************/
$("input").on("click", function(pEvent, pParam)
{
/*-----* start *--------------------------------------------------------------*/
  if ($(this).attr("id") == "start")
  {
    $("[id^='time_zone'             ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='jp_calendar'           ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='label_position'        ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='zoom'                  ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='realtime'              ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='loop'                  ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id~='start'                 ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='get_time'              ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='get_offset'            ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='move_bar_disable'      ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='sync_pick_and_bar'     ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='click_bar_to_move_pick']").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("[id^='range_bar'             ]").attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });
    $("label"                         ).attr("readonly", true).css({ pointerEvents : "none", opacity : "0.5" });

    $("#timeline").k2goTimeline("start",
    {
      realTime : $("#realtime").prop("checked"),
      loop     : $("#loop"    ).prop("checked"),
      fps      : parseInt($("#fps").val(), 10),
      speed    : parseInt($("#pps").val(), 10),
      stop     : function()
      {
        if ($Env.restart)
        {
          $Env.restart = false;
          putEventInfo("restart", "----/--/-- --:--:--");
          $("#start").trigger("click");
        }
        else
        {
          $("[id^='time_zone'             ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='jp_calendar'           ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='label_position'        ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='zoom'                  ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='realtime'              ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='loop'                  ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id~='start'                 ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='get_time'              ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='get_offset'            ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='move_bar_disable'      ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='sync_pick_and_bar'     ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='click_bar_to_move_pick']").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("[id^='range_bar'             ]").attr("readonly", false).css({ pointerEvents : "", opacity : "" });
          $("label"                         ).attr("readonly", false).css({ pointerEvents : "", opacity : "" });
        }
      }
    });
  }
  else if ($(this).attr("id") == "stop")
  {
    $Env.restart = pParam == true;
    $("#timeline").k2goTimeline("stop");
  }
/*-----* get time offset *----------------------------------------------------*/
  else if ($(this).attr("id") == "get_time_button")
  {
    var objDate = $("#timeline").k2goTimeline("getTimeFromOffset", parseFloat($("#get_time input").val()));
    $("#get_time_result").text($("#timeline").k2goTimeline("formatDate", objDate, "%y/%mm/%dd %H:%M:%S"));
  }
  else if ($(this).attr("id") == "get_offset_button")
  {
    var objDate = new Date($("#get_offset input[type='date']").val() + " " + $("#get_offset input[type='time']").val());
    $("#get_offset_result").text($("#timeline").k2goTimeline("getOffsetFromTime", objDate));
  }
/*-----* show range bar *-----------------------------------------------------*/
  else if ($(this).attr("id") == "range_bar_show")
  {
/*
    $(".k2go-timeline-rail"    ).css({ pointerEvents : "none" });
    $(".k2go-timeline-rail > *").css({ pointerEvents : "auto" });
*/
    if (checkRangeBar())
    {
      $("#timeline").k2goTimeline("showRangeBar");
    }
    else
    {
      var objOptions        = $("#timeline").k2goTimeline("getOptions");
      var objStartTime      = new Date(objOptions .minTime   .getTime() > objOptions.startTime.getTime() ? objOptions.minTime.getTime() : objOptions.startTime.getTime());
      var objEndTime        = new Date(objOptions .maxTime   .getTime() < objOptions.endTime  .getTime() ? objOptions.maxTime.getTime() : objOptions.endTime  .getTime());
      var objRangeStartTime = new Date(objOptions.currentTime.getTime() - $("#timeline").width() / 16 * objOptions.scale);
      var objRangeEndTime   = new Date(objOptions.currentTime.getTime() + $("#timeline").width() / 16 * objOptions.scale);

      if (objRangeStartTime.getTime() < objStartTime.getTime())
      {
        objRangeStartTime = new Date(objStartTime.getTime());
        objRangeEndTime   = new Date(objStartTime.getTime() + $("#timeline").width() / 8 * objOptions.scale);
      }

      if (objRangeEndTime.getTime() > objEndTime.getTime())
      {
        objRangeEndTime   = new Date(objEndTime.getTime());
        objRangeStartTime = new Date(objEndTime.getTime() - $("#timeline").width() / 8 * objOptions.scale);
      }

      $("#timeline").k2goTimeline("showRangeBar", { rangeStartTime : objRangeStartTime, rangeEndTime : objRangeEndTime });
      objOptions    .rangeChange (                { rangeStartTime : objRangeStartTime, rangeEndTime : objRangeEndTime });
    }
  }
  else if ($(this).attr("id") == "range_bar_hidden")
  {
/*
    $(".k2go-timeline-rail"    ).css         ({ pointerEvents : "" });
    $(".k2go-timeline-rail > *").css         ({ pointerEvents : "" });
    $("#zoom_disable"          ).prop        ("checked"   , false);
    $("#timeline"              ).k2goTimeline("setOptions", { disableZoom : $("#zoom_disable").prop("checked") });
*/
    $("#timeline"              ).k2goTimeline("hiddenRangeBar");
  }
/*-----* other *--------------------------------------------------------------*/
  else if ($(this).attr("id") == "zoom_in" ) $("#timeline").k2goTimeline("zoomIn" );
  else if ($(this).attr("id") == "zoom_out") $("#timeline").k2goTimeline("zoomOut");
});
});
