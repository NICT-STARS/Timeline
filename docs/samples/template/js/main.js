/******************************************************************************/
/* Sample for k2goTimeline                                                    */
/* halloweenjack inc.                                                         */
/******************************************************************************/
/******************************************************************************/
/* window.load                                                                */
/******************************************************************************/
$(window).on("load", function()
{
/*-----* view url *-----------------------------------------------------------*/
if (window.location.search.length > 1)
{
  
  var objGetQueryString = getQueryString(window.location.search);
  
  if ( typeof objGetQueryString.st == "string" && objGetQueryString.st.match(/^[\d\-]+$/) ) $Env.startTime  .setTime(parseInt(objGetQueryString.st, 10));
  if ( typeof objGetQueryString.et == "string" && objGetQueryString.et.match(/^[\d\-]+$/) ) $Env.endTime    .setTime(parseInt(objGetQueryString.et, 10));
  if ( typeof objGetQueryString.ct == "string" && objGetQueryString.ct.match(/^[\d\-]+$/) ) $Env.currentTime.setTime(parseInt(objGetQueryString.ct, 10));
  
};
/*-----* initialize *---------------------------------------------------------*/
  $("#panel-conf" ).draggable({ containment: "content", scroll: false });
  $("#panel-conf" ).addClass ("active");
  $("#button_conf").addClass ("active");

  $("#play-span"  ).attr("max",   $Env.playSpanTable.length );
  $("#play-span"  ).attr("value", $Env.playSpanTableDefault );
  $("#play-speed" ).attr("max",   $Env.playTable    .length );
  $("#play-speed" ).attr("value", $Env.playTableDefault     );

  setTimeout(function()
  {
    $("#play-span"  ).trigger("change");
    $("#play-speed" ).trigger("change");
  }, 100);
/*-----* timeline *-----------------------------------------------------------*/
  $("#lockWindow").addClass("show");

  $("#timeline").k2goTimeline(
  {
    minTime          : new Date($Env.minTime    .getTime()),
    maxTime          : new Date($Env.maxTime    .getTime()),
    startTime        : new Date($Env.startTime  .getTime()),
    endTime          : new Date($Env.endTime    .getTime()),
    currentTime      : new Date($Env.currentTime.getTime()),
    pickLineDistance : { element : $("#main"), position : "bottom" },
    syncPickAndBar   : true,
    timeChange       : function(pTimeInfo)
    {
      $("#date"             ).html($("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%y-%mm-%dd %H:%M:%S.%N"));
      $("#current_time span").html($("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%y-%mm-%dd %H:%M:%S"   ));
      $("#start_time   span").html($("#timeline").k2goTimeline("formatDate", pTimeInfo.startTime  , "%y-%mm-%dd %H:%M:%S"   ));
      $("#end_time     span").html($("#timeline").k2goTimeline("formatDate", pTimeInfo.endTime    , "%y-%mm-%dd %H:%M:%S"   ));

      if ($("#time-btn").hasClass("timeNow"))
      {
        $("#time-btn").removeClass("timeNow"    );
        $("#time-btn").addClass   ("timeCurrent");

        clearTimeout($("#time-btn").data("removeTimeNow"));
      }
    },
    rangeChange : function(pTimeInfo)
    {
      adjustCurrentTime();

      $("#range_start_time span").html($("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeStartTime, "%y-%mm-%dd %H:%M:%S"));
      $("#range_end_time   span").html($("#timeline").k2goTimeline("formatDate", pTimeInfo.rangeEndTime  , "%y-%mm-%dd %H:%M:%S"));
    },
    railClick      : function(pTimeInfo) { adjustCurrentTime(); putEventInfo("rail click"      ); },
    pickTapHold    : function(pTimeInfo) {                      putEventInfo("pick tap hold"   ); },
    pickMoveStart  : function(pTimeInfo) {                      putEventInfo("pick move start" ); },
    pickMove       : function(pTimeInfo) {                      putEventInfo("pick move"       ); },
    pickMoveEnd    : function(pTimeInfo) { adjustCurrentTime(); putEventInfo("pick move end"   ); },
    barMoveStart   : function(pTimeInfo) { adjustCurrentTime(); putEventInfo("bar  move start" ); },
    barMove        : function(pTimeInfo) {                      putEventInfo("bar  move"       ); },
    barMoveEnd     : function(pTimeInfo) { adjustRangeBar   (); putEventInfo("bar  move end"   ); },
    zoomStart      : function(pTimeInfo) {                      putEventInfo("zoom start"      ); },
    zoom           : function(pTimeInfo) {                      putEventInfo("zoom"            ); },
    zoomEnd        : function(pTimeInfo) { adjustRangeBar   (); putEventInfo("zoom end"        ); },
    rangeMoveStart : function(pTimeInfo) {                      putEventInfo("range move start"); },
    rangeMove      : function(pTimeInfo) {                      putEventInfo("range move"      ); },
    rangeMoveEnd   : function(pTimeInfo)
    {
      var objOptions   = $("#timeline").k2goTimeline("getOptions");
      var objStartTime = objOptions.minTime.getTime() > objOptions.startTime.getTime() ? objOptions.minTime : objOptions.startTime;
      var objEndTime   = objOptions.maxTime.getTime() < objOptions.endTime  .getTime() ? objOptions.maxTime : objOptions.endTime;

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

      $("#range_start_time span").html($("#timeline").k2goTimeline("formatDate", objStartTime, "%y-%mm-%dd %H:%M:%S"));
      $("#range_end_time   span").html($("#timeline").k2goTimeline("formatDate", objEndTime  , "%y-%mm-%dd %H:%M:%S"));

      putEventInfo("range move end");
    }
  },
  function(pTimeInfo)
  {
    var objOptions        = $("#timeline").k2goTimeline("getOptions");
    var objRangeStartTime = new Date(objOptions.currentTime.getTime() - $("#timeline").width() / 16 * objOptions.scale);
    var objRangeEndTime   = new Date(objOptions.currentTime.getTime() + $("#timeline").width() / 16 * objOptions.scale);

    $("#min_time         span").html($("#timeline").k2goTimeline("formatDate", objOptions.minTime, "%y-%mm-%dd %H:%M:%S"));
    $("#max_time         span").html($("#timeline").k2goTimeline("formatDate", objOptions.maxTime, "%y-%mm-%dd %H:%M:%S"));
    $("#range_start_time span").html($("#timeline").k2goTimeline("formatDate", objRangeStartTime , "%y-%mm-%dd %H:%M:%S"));
    $("#range_end_time   span").html($("#timeline").k2goTimeline("formatDate", objRangeEndTime   , "%y-%mm-%dd %H:%M:%S"));
    $("#zoom-range"           ).attr("max", $Env.zoomTable.length - 1);

    $("#timeline").k2goTimeline("setOptions", { rangeStartTime : objRangeStartTime, rangeEndTime : objRangeEndTime });
    $(window     ).trigger     ("resize");

    $("#lockWindow").removeClass ("show");
    putEventInfo("after initialize");
  });
/*-----* pickadate *----------------------------------------------------------*/
  $("header #date_box #cal").pickadate(
  {
    selectYears : true,
    clear       : false,
    onOpen      : function()
    {
      var objOptions = $("timeline").k2goTimeline("getOptions");

      this.set("min"   , new Date(objOptions.minTime    .getTime()    ));
      this.set("max"   , new Date(objOptions.maxTime    .getTime() - 1));
      this.set("select", new Date(objOptions.currentTime.getTime()    ));
    },
    onClose : function()
    {
      var objOptions = $("timeline").k2goTimeline("getOptions");
      var objDate    = new Date(this.get("select", "yyyy/mm/dd") + $("#timeline").k2goTimeline("formatDate", objOptions.currentTime, " %H:%M:%S"));

      objDate.setMilliseconds(objOptions.currentTime.getMilliseconds());

      if(objOptions.currentTime.getTime() != objDate.getTime())
      {
        var objTimeInfo = {};

        objTimeInfo.minTime     = new Date(objOptions.minTime    .getTime());
        objTimeInfo.maxTime     = new Date(objOptions.maxTime    .getTime());
        objTimeInfo.startTime   = new Date(objOptions.minTime    .getTime() > objOptions.startTime.getTime() ? objOptions.minTime.getTime() : objOptions.startTime.getTime());
        objTimeInfo.endTime     = new Date(objOptions.maxTime    .getTime() < objOptions.endTime  .getTime() ? objOptions.maxTime.getTime() : objOptions.endTime  .getTime());
        objTimeInfo.currentTime = new Date(objOptions.currentTime.getTime());

        var intDiff1 = objTimeInfo.currentTime.getTime() - objTimeInfo.startTime  .getTime();
        var intDiff2 = objTimeInfo.endTime    .getTime() - objTimeInfo.currentTime.getTime();

        objTimeInfo.currentTime.setTime(objDate.getTime());
        objTimeInfo.startTime  .setTime(objDate.getTime() - intDiff1);
        objTimeInfo.endTime    .setTime(objDate.getTime() + intDiff2);

        if (objOptions.minTime.getTime() > objTimeInfo.startTime.getTime()) objTimeInfo.startTime.setTime(objOptions.minTime.getTime());
        if (objOptions.maxTime.getTime() < objTimeInfo.endTime  .getTime()) objTimeInfo.endTime  .setTime(objOptions.maxTime.getTime());

        $Env.creating = true;
        $("#lockWindow").addClass("show");

        $("#timeline").k2goTimeline("create",
        {
          timeInfo : objTimeInfo,
          callback : function(pTimeInfo)
          {
            adjustRangeBar();
            $Env.creating = false;
            putEventInfo("select picker date");
            $("#lockWindow").removeClass("show");
          }
        });
      }
    }
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

    $("#timeline").k2goTimeline("setOptions", { maxScale : $Env.zoomTable[0].value / $("#timeline").width(), minScale : $Env.zoomTable[$Env.zoomTable.length - 1].value / $("#timeline").width() });

    putEventInfo("resize");
    $(window).removeData("resize");
  }, 300));
});
/******************************************************************************/
/* document.mousemove                                                         */
/******************************************************************************/
$(document).on("mousemove", function(pEvent)
{
  var $rangeBar = $(".k2go-timeline-range-show");

  if ($rangeBar.length > 0)
  {
    var intLeft  = $rangeBar.offset().left;
    var intRight = $rangeBar.width () + intLeft;

    $("#timeline").k2goTimeline("setOptions", { disableZoom : !(intLeft <= pEvent.pageX && pEvent.pageX <= intRight) });
  }
});
/******************************************************************************/
/* time-btn.click                                                             */
/******************************************************************************/
$("#time-btn").on("click", function()
{
  var $this = $(this);
/*-----* time current *-------------------------------------------------------*/
  if($this.hasClass("timeCurrent"))
  {
    var objOptions  = $("timeline").k2goTimeline("getOptions");
    var objTimeInfo = {};

    objTimeInfo.minTime     = new Date(objOptions.minTime    .getTime());
    objTimeInfo.maxTime     = new Date(objOptions.maxTime    .getTime());
    objTimeInfo.startTime   = new Date(objOptions.minTime    .getTime() > objOptions.startTime.getTime() ? objOptions.minTime.getTime() : objOptions.startTime.getTime());
    objTimeInfo.endTime     = new Date(objOptions.maxTime    .getTime() < objOptions.endTime  .getTime() ? objOptions.maxTime.getTime() : objOptions.endTime  .getTime());
    objTimeInfo.currentTime = new Date(objOptions.currentTime.getTime());

    var intDiff1 = objTimeInfo.currentTime.getTime() - objTimeInfo.startTime  .getTime();
    var intDiff2 = objTimeInfo.endTime    .getTime() - objTimeInfo.currentTime.getTime();

    objTimeInfo.currentTime.setTime(Date.now());
    objTimeInfo.startTime  .setTime(objTimeInfo.currentTime.getTime() - intDiff1);
    objTimeInfo.endTime    .setTime(objTimeInfo.currentTime.getTime() + intDiff2);

    if (objOptions.minTime.getTime() > objTimeInfo.startTime.getTime()) objTimeInfo.startTime.setTime(objOptions.minTime.getTime());
    if (objOptions.maxTime.getTime() < objTimeInfo.endTime  .getTime()) objTimeInfo.endTime  .setTime(objOptions.maxTime.getTime());

    $Env.creating = true;
    $("#lockWindow").addClass("show");

    $("#timeline").k2goTimeline("create",
    {
      timeInfo : objTimeInfo,
      callback : function(pTimeInfo)
      {
        $this.data("removeTimeNow", setTimeout(function()
        {
           $this.removeClass("timeNow"    );
           $this.addClass   ("timeCurrent");
        }, 5000));
        
        $this.addClass   ("timeNow"    );
        $this.removeClass("timeCurrent");

        $Env.creating = false;
        adjustRangeBar();
        putEventInfo("change time now");
        $("#lockWindow").removeClass("show");
      }
    });
  }
/*-----* time now *-----------------------------------------------------------*/
  else if ($this.hasClass("timeNow"))
  {
    clearTimeout($("#time-btn").data("removeTimeNow"));
    
    $this.addClass   ("timeNowPlay");
    $this.removeClass("timeNow"    );

    $("#cal"         ).addClass("disable2");
    $("#play_box"    ).addClass("disable2");
    $("#slider"      ).addClass("disable2");
    $("#button_range").addClass("disable2");

    $("#timeline").k2goTimeline("start",
    {
      fps      : 10,
      realTime : true,
      stop     : function()
      {
        $("#cal"         ).removeClass("disable2"   );
        $("#play_box"    ).removeClass("disable2"   );
        $("#slider"      ).removeClass("disable2"   );
        $("#button_range").removeClass("disable2"   );
        $("#lockWindow"  ).removeClass("show"       );
        $this             .addClass   ("timeCurrent");
        $this             .removeClass("timeNowPlay");
        $this             .trigger    ("click"      );
        adjustRangeBar();
      }
    });
  }
/*-----* time now play *------------------------------------------------------*/
  else
  {
    $("#lockWindow").addClass    ("show");
    $("#timeline"  ).k2goTimeline("stop");
  }
});
/******************************************************************************/
/* view_url event                                                             */
/******************************************************************************/
/*-----* button_view_url.click *----------------------------------------------*/
$("#button_view_url").on("click", function()
{
  var objOptions  = $("#timeline").k2goTimeline("getOptions");

  var strUurl = window.location.origin + window.location.pathname + "?" + "st=" + objOptions.startTime.getTime() + "&et=" + objOptions.endTime.getTime() + "&ct=" + objOptions.currentTime.getTime();
  $("#view_url_input"    ).val    (strUurl);
  $("#view_url_input"    ).attr   ("aria-label" , strUurl );
  $("#view_url"          ).css    ("display" , "block");
  $(".input_group_button").trigger("click");
});
/*-----* input_group_button.click *--------------------------------------------*/
$(".input_group_button").on("click", function()
{
  $("#view_url_input").select();
  document.execCommand("Copy");
});
/*-----* view_url_box_close.click *-------------------------------------------*/
$(".view_url_box_close").on("click", function()
{
  $("#view_url").css("display" , "none");
});

/******************************************************************************/
/* play_box.click                                                             */
/******************************************************************************/
$("#button_stop").on("click", function ()
{
  $("#button_play"        ).removeClass("play_frame");
  $("#button_play_reverse").removeClass("play_frame_rev");
  clearTimeout($Env.timeoutIdFwd);
  clearTimeout($Env.timeoutIdBack);
  $("#form-title-play-speed-title").removeClass("fx");
  $("#cal"         ).removeClass("disable2");
  $("#time-btn"    ).removeClass("disable2");
  $("#slider"      ).removeClass("disable2");
  $("#button_range").removeClass("disable2");
  $("#timeline"    ).removeClass("disable2");

});
/*-----* button_play *--------------------------------------------------------*/
$("#button_play").on("click", function()
{
  $("#form-title-play-speed-title").removeClass("fx");
  setTimeout(function() { $("#form-title-play-speed-title").addClass("fx")}, 100);

  clearTimeout($Env.timeoutIdBack);

  $("#button_play_reverse").removeClass("play_frame_rev");
  $("#button_play"        ).addClass   ("play_frame");

  $("#cal"         ).addClass("disable2");
  $("#time-btn"    ).addClass("disable2");
  $("#slider"      ).addClass("disable2");
  $("#button_range").addClass("disable2");
  $("#timeline"    ).addClass("disable2");

  $Env.timeoutIdFwd = setTimeout(function _loop()
  {
    if (!$("#button_play").hasClass("play_frame")) return;

    var objOptions  = $("#timeline").k2goTimeline("getOptions");

    if ($("#button_range").hasClass("active"))
    {
      if (objOptions.currentTime.getTime() < objOptions.rangeEndTime.getTime())
      {
        $("#button_fwd").trigger("click", true);
        $Env.timeoutIdFwd = setTimeout(_loop, $Env.playInterval * 1000);
      }
      else
      {
        if ($("#button_loop").hasClass("active"))
        {
          $("#button_back_edge").trigger("click");
          $Env.timeoutIdFwd = setTimeout(_loop, $Env.playInterval * 1000);
        }
        else
          $("#button_stop").trigger("click");
      }
    }
    else
    {
      if (objOptions.endTime.getTime() < objOptions.maxTime.getTime())
      {
        $("#button_fwd").trigger("click", true);
        $Env.timeoutIdFwd = setTimeout(_loop, $Env.playInterval * 1000);
      }
      else
        $("#button_stop").trigger("click");
    }
  }, 1);
});
/*-----* button_play_rev *----------------------------------------------------*/
$("#button_play_reverse").on("click", function()
{
  $("#form-title-play-speed-title").removeClass("fx");
  setTimeout(function() { $("#form-title-play-speed-title").addClass("fx")}, 100);

  clearTimeout($Env.timeoutIdFwd);

  $("#button_play"        ).removeClass("play_frame");
  $("#button_play_reverse").   addClass("play_frame_rev");

  $("#cal"         ).addClass("disable2");
  $("#time-btn"    ).addClass("disable2");
  $("#slider"      ).addClass("disable2");
  $("#button_range").addClass("disable2");
  $("#timeline"    ).addClass("disable2");

  $Env.timeoutIdBack = setTimeout(function _loop()
  {
    if (!$("#button_play_reverse").hasClass("play_frame_rev")) return;

    var objOptions  = $("#timeline").k2goTimeline("getOptions");

    if ($("#button_range").hasClass("active"))
    {
      if (objOptions.currentTime.getTime() > objOptions.rangeStartTime.getTime())
      {
        $("#button_back").trigger("click", true);
        $Env.timeoutIdBack = setTimeout(_loop, $Env.playInterval * 1000);
      }
      else
      {
        if ($("#button_loop").hasClass("active"))
        {
          $("#button_fwd_edge").trigger("click");
          $Env.timeoutIdBack = setTimeout(_loop, $Env.playInterval * 1000);
        }
        else
          $("#button_stop").trigger("click");
      }
    }
    else
    {
      if (objOptions.startTime.getTime() > objOptions.minTime.getTime())
      {
        $("#button_back").trigger("click", true);
        $Env.timeoutIdBack = setTimeout(_loop, $Env.playInterval * 1000);
      }
      else
        $("#button_stop").trigger("click");
    }
  }, 1);
});
/*-----* button_fwd (Frame Play) *-------------------------------------------*/
$("#button_fwd").on("click", function(pEvent, pExtra)
{
  if (!pExtra)
  {
    $("#form-title-play-span-title").addClass("fx");
    setTimeout(function() { $("#form-title-play-span-title").removeClass("fx")}, 400);
  }

  var objOptions  = $("#timeline").k2goTimeline("getOptions");
  var objTimeInfo = {};

  objTimeInfo.minTime = new Date(objOptions.minTime.getTime());
  objTimeInfo.maxTime = new Date(objOptions.maxTime.getTime());
  
  if ($("#button_range").hasClass("active"))
  {
    objTimeInfo.startTime   = new Date(objOptions.startTime  .getTime());
    objTimeInfo.endTime     = new Date(objOptions.endTime    .getTime());
    objTimeInfo.currentTime = new Date(objOptions.currentTime.getTime() + $Env.frameInterval);

    if (objOptions.rangeEndTime.getTime() < objTimeInfo.currentTime.getTime()) objTimeInfo.currentTime = new Date(objOptions.rangeEndTime.getTime());
  }
  else
  {
    objTimeInfo.startTime   = new Date(objOptions.startTime  .getTime() + $Env.frameInterval);
    objTimeInfo.endTime     = new Date(objOptions.endTime    .getTime() + $Env.frameInterval);
    objTimeInfo.currentTime = new Date(objOptions.currentTime.getTime() + $Env.frameInterval);

    var intDiff1 = objTimeInfo.endTime.getTime() - objTimeInfo.  startTime.getTime();
    var intDiff2 = objTimeInfo.endTime.getTime() - objTimeInfo.currentTime.getTime();

    if (objOptions.maxTime.getTime() < objTimeInfo.endTime.getTime())
    {
      objTimeInfo.endTime     = new Date(objOptions.maxTime.getTime());
      objTimeInfo.startTime   = new Date(objOptions.endTime.getTime() - intDiff1);
      objTimeInfo.currentTime = new Date(objOptions.endTime.getTime() - intDiff2);
    }
  }

  $("#timeline").k2goTimeline("create", { timeInfo : objTimeInfo });
});
/*-----* button_Fwd_Edge (to Edge) *--------------------------------------------*/
$("#button_fwd_edge").on("click", function()
{
  var objOptions  = $("#timeline").k2goTimeline("getOptions");
  var objTimeInfo = {};

  objTimeInfo.startTime = new Date(objOptions.startTime.getTime());
  objTimeInfo.  endTime = new Date(objOptions.endTime.  getTime());
  objTimeInfo.  minTime = new Date(objOptions.minTime.  getTime());
  objTimeInfo.  maxTime = new Date(objOptions.maxTime.  getTime());

  if ($("#button_range").hasClass("active")) objTimeInfo.currentTime = new Date(objOptions.rangeEndTime.getTime());
  else                                       objTimeInfo.currentTime = new Date(objOptions.     endTime.getTime());

  $("#timeline").k2goTimeline("create", { timeInfo : objTimeInfo });
});
/*-----* button_back (Frame Play) *------------------------------------------*/
$("#button_back").on("click", function(pEvent, pExtra)
{
  if (!pExtra)
  {
    $("#form-title-play-span-title").addClass("fx");
    setTimeout(function() { $("#form-title-play-span-title").removeClass("fx")}, 400);
  }

  var objOptions  = $("#timeline").k2goTimeline("getOptions");
  var objTimeInfo = {};

  objTimeInfo.minTime = new Date(objOptions.minTime.getTime());
  objTimeInfo.maxTime = new Date(objOptions.maxTime.getTime());
  
  if ($("#button_range").hasClass("active"))
  {
    objTimeInfo.startTime   = new Date(objOptions.startTime  .getTime());
    objTimeInfo.endTime     = new Date(objOptions.endTime    .getTime());
    objTimeInfo.currentTime = new Date(objOptions.currentTime.getTime() - $Env.frameInterval);

    if (objOptions.rangeStartTime.getTime() > objTimeInfo.currentTime.getTime()) objTimeInfo.currentTime = new Date(objOptions.rangeStartTime.getTime());
  }
  else
  {
    objTimeInfo.startTime   = new Date(objOptions.startTime  .getTime() - $Env.frameInterval);
    objTimeInfo.endTime     = new Date(objOptions.endTime    .getTime() - $Env.frameInterval);
    objTimeInfo.currentTime = new Date(objOptions.currentTime.getTime() - $Env.frameInterval);

    var intDiff1 = objTimeInfo.endTime.    getTime() - objTimeInfo.startTime.getTime();
    var intDiff2 = objTimeInfo.currentTime.getTime() - objTimeInfo.startTime.getTime()

    if (objOptions.minTime.getTime() > objTimeInfo.startTime.getTime())
    {
      objTimeInfo.startTime   = new Date(objOptions.minTime.getTime());
      objTimeInfo.endTime     = new Date(objOptions.startTime.getTime() + intDiff1);
      objTimeInfo.currentTime = new Date(objOptions.startTime.getTime() + intDiff2);
    }
  }

  $("#timeline").k2goTimeline("create", { timeInfo : objTimeInfo });
});
/*-----* button_back_Edge (to Edge) *----------------------------------------*/
$("#button_back_edge").on("click", function()
{
  var objOptions  = $("#timeline").k2goTimeline("getOptions");
  var objTimeInfo = {};

  objTimeInfo.startTime = new Date(objOptions.startTime.getTime());
  objTimeInfo.  endTime = new Date(objOptions.endTime.  getTime());
  objTimeInfo.  minTime = new Date(objOptions.minTime.  getTime());
  objTimeInfo.  maxTime = new Date(objOptions.maxTime.  getTime());

  if ($("#button_range").hasClass("active")) objTimeInfo.currentTime = new Date(objOptions.rangeStartTime.getTime());
  else                                       objTimeInfo.currentTime = new Date(objOptions.     startTime.getTime());

  $("#timeline").k2goTimeline("create", { timeInfo : objTimeInfo });
});
/*-----* loop *---------------------------------------------------------------*/
$("#button_loop").on("click", function()
{
  $("#button_loop").toggleClass("active");
});
/******************************************************************************/
/* panel-conf                                                                 */
/******************************************************************************/
/*-----* play-speed *---------------------------------------------------------*/
$("#play-speed").on("input change", function() 
{
  $("#display1").html($Env.playTable[$(this).val() - 1] + " Sec");
  $Env.playInterval = $Env.playTable[Math.round($(this).val()) - 1];
});
/*-----* play-span *----------------------------------------------------------*/
$("#play-span").on("input change", function()
{
  $("#display2").html(makeTime(Math.floor($Env.playSpanTable[Math.round($(this).val()) - 1])));
  $Env.frameInterval = $Env.playSpanTable[Math.round($(this).val()) - 1];
});
/*-----* panel-conf action *-------------------------------------------------*/
$("#button_conf").on("click", function()
{
  if ($("#button_conf").hasClass("active"))
  {
    $("#button_conf").removeClass("active")
    $("#panel-conf" ).removeClass("active");
  }
  else
  {
    $("#button_conf").addClass("active")
    $("#panel-conf" ).addClass("active");
  }
});

$("#panel-conf-close").on("click", function()
{
  $("#panel-conf ").removeClass("active");
  $("#button_conf").removeClass("active");
});
/******************************************************************************/
/* zoom-range event                                                           */
/******************************************************************************/
/*-----* zoom-range.input *---------------------------------------------------*/
$("#zoom-range").on("input", function()
{
  changeZoomLevel()
  
  if (!$Env.creating)
  {
    
    var intValue = parseInt($(this).val(), 10);

    if (intValue != getZoomLevel())
    {
      $Env.creating = true;

      var objOptions         = $("#timeline").k2goTimeline("getOptions");
      var objZoomInfo        = $Env.zoomTable[intValue];
      var objOffsetPixelInfo = {}; // ピクセルサイズを格納
      var objTimeInfo        = {}; // Date オブジェクト格納
      var intPixelSize;
      
      objOffsetPixelInfo.startTime   = $("#timeline").k2goTimeline("getOffsetFromTime", objOptions.minTime.getTime() > objOptions.startTime.getTime() ? objOptions.minTime : objOptions.startTime);
      objOffsetPixelInfo.endTime     = $("#timeline").k2goTimeline("getOffsetFromTime", objOptions.maxTime.getTime() < objOptions.endTime  .getTime() ? objOptions.maxTime : objOptions.endTime  );
      objOffsetPixelInfo.currentTime = $("#timeline").k2goTimeline("getOffsetFromTime", objOptions.currentTime);
      
      intPixelSize = objZoomInfo.value / (objOffsetPixelInfo.endTime - objOffsetPixelInfo.startTime);

      objTimeInfo.minTime      = new Date(objOptions.minTime    .getTime());
      objTimeInfo.maxTime      = new Date(objOptions.maxTime    .getTime());
      objTimeInfo.currentTime  = new Date(objOptions.currentTime.getTime());
      objTimeInfo.startTime    = new Date(objOptions.currentTime.getTime() - intPixelSize * (objOffsetPixelInfo.currentTime - objOffsetPixelInfo.startTime  ));
      objTimeInfo.endTime      = new Date(objOptions.currentTime.getTime() + intPixelSize * (objOffsetPixelInfo.endTime     - objOffsetPixelInfo.currentTime));
      
      if( objTimeInfo.startTime.getTime() < objTimeInfo.minTime.getTime() ) objTimeInfo.startTime.setTime(objTimeInfo.minTime.getTime()) ;
      if( objTimeInfo.endTime  .getTime() > objTimeInfo.maxTime.getTime() ) objTimeInfo.endTime  .setTime(objTimeInfo.maxTime.getTime()) ;

      $("#timeline").k2goTimeline("create",
      {
        timeInfo : objTimeInfo,
        callback : function(pTimeInfo)
        {
          $Env.creating = false;
          $("#zoom-range").trigger("input");
        }
      });
    }
  }
});
/*-----* zoom-range.change *--------------------------------------------------*/
$("#zoom-range").on("change", function()
{
  adjustRangeBar();
});
/*-----* plus or minus.click *------------------------------------------------*/
$("#slider").on("click", "> a", function()
{
  var intValue = parseInt($("#zoom-range").val(), 10);

  if ($(this).attr("id") == "button_minus") intValue --; 
  else                                      intValue ++;                  

  $("#zoom-range").val(intValue)
  $("#zoom-range").trigger("input" );
  $("#zoom-range").trigger("change");
});
/******************************************************************************/
/* button_range.click                                                         */
/******************************************************************************/
$("#button_range").on("click", function()
{
  $(this).toggleClass("active");
  
  if ($(this).hasClass("active"))
  {
    $(".k2go-timeline-rail"    ).css     ({ pointerEvents : "none"   });
    $(".k2go-timeline-rail > *").css     ({ pointerEvents : "auto"   });
    $("#button_loop"           ).css     ({ visibility    : "visible"}); 
    $("#cal"                   ).addClass("disable1");
    $("#time-btn"              ).addClass("disable1");

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
  else
  {
    $("#timeline"              ).k2goTimeline("hiddenRangeBar");
    $("#timeline"              ).k2goTimeline("setOptions", { disableZoom : false });
    $(".k2go-timeline-rail"    ).css         ({ pointerEvents  : "" });
    $(".k2go-timeline-rail > *").css         ({ pointerEvents  : "" });
    $("#button_loop"           ).css         ({ visibility: "hidden"}); 
    $("#button_loop"           ).removeClass ("active"); 
    $("#cal"                   ).removeClass ("disable1");
    $("#time-btn"              ).removeClass ("disable1");

    $Env.loop = false;
  }
});
});
