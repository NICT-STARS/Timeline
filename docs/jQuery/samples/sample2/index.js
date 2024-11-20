/******************************************************************************/
/* Sample for k2goTimeline                                                    */
/* Inoue Computer Service.                                                    */
/******************************************************************************/
/*-----* global variable *----------------------------------------------------*/
var g_intInterval     = 1000 * 60 * 10;      // 10 minutes
var g_intLabelTime    = 1000 * 60 * 60 * 12; // every 12 hours
var g_intDayCount     = 0;                   // 0:1day 1:2days 2:3days 3:4days
var g_intDayPosition  = 0;
var g_objShowDate     = new Date();
var g_aryAutoRunSteps = [
                          { level : 1, step :   1 },
                          { level : 2, step :   3 },
                          { level : 3, step :   6 },
                          { level : 4, step :  18 },
                          { level : 5, step : 144 }
                        ];
/******************************************************************************/
/* getLeftRightTime                                                           */
/******************************************************************************/
function getLeftRightTime(pDate)
{
  var objLeft  = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate(),  0,  0,  0,   0);
  var objRight = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate(), 23, 59, 59, 999);

  objLeft .setDate(objLeft .getDate() -                  g_intDayPosition );
  objRight.setDate(objRight.getDate() + (g_intDayCount - g_intDayPosition));

  var objMin = new Date(objLeft .getTime() - 1000 * 60 * 60 * 24 * 4);
  var objMax = new Date(objRight.getTime() + 1000 * 60 * 60 * 24 * 4);

  return { leftTime : objLeft, rightTime : objRight, minTime : objMin, maxTime : objMax };
}
/******************************************************************************/
/* createTimeline                                                             */
/******************************************************************************/
function createTimeline(pDate, pDuration, pCallback)
{
  var $timeline    = $("#time_controller .time_rail");
  var objLeftRight = getLeftRightTime(pDate);

  $timeline.k2goTimeline("create",
  {
    duration : pDuration,
    timeInfo :
    {
      minTime     : objLeftRight.minTime,
      maxTime     : objLeftRight.maxTime,
      startTime   : objLeftRight.leftTime,
      endTime     : objLeftRight.rightTime,
      currentTime : pDate
    },
    callback : function(pTimeInfo)
    {
      $timeline.k2goTimeline("getOptions").pickMoveEnd(pTimeInfo);
      if (typeof pCallback == "function") pCallback(pTimeInfo);
    }
  });
}
/******************************************************************************/
/* window.load                                                                */
/******************************************************************************/
$(window).on("load", function()
{
/*-----* pickadate *----------------------------------------------------------*/
  $("#date").pickadate(
  {
    selectYears: true,
    onOpen     : function()
    {
      this      .set("select", g_objShowDate);
      $("#date").css({ visibility : "hidden" });
    },
    onClose : function()
    {
      var $timeline = $("#time_controller .time_rail");
      var objDate   = new Date(this.get("select", "yyyy/mm/dd") + $timeline.k2goTimeline("formatDate", g_objShowDate, " %H:%M:%S"));

      createTimeline(objDate, 0);
      $("#date").css({ visibility : "" });
    }
  });
/*-----* timeline *-----------------------------------------------------------*/
  var objLeftRight = getLeftRightTime(g_objShowDate);
  var $timeline    = $("#time_controller .time_rail");

  $timeline.k2goTimeline(
  {
    currentTime      : g_objShowDate,
    startTime        : objLeftRight. leftTime,
    endTime          : objLeftRight.rightTime,
    minTime          : objLeftRight.  minTime,
    maxTime          : objLeftRight.  maxTime,
    minScale         : (1000 * 60 * 60 * 24) / screen.width,
    disableMoveBar   : true,
    pickLineDistance : { element : $timeline, position : "bottom" },
    timeChange       : function(pTimeInfo)
    {
      var objDate = new Date(Math.floor(pTimeInfo.startTime.getTime() / g_intLabelTime) * g_intLabelTime);
      var $label;
      var intOffset;

      objDate.setTime(objDate.getTime() + 1000 * 60 * objDate.getTimezoneOffset());
      $timeline.children(".time_label").remove();

      while (objDate.getTime() <= pTimeInfo.endTime.getTime() + 1)
      {
        if (objDate.getTime() >= pTimeInfo.startTime.getTime())
        {
          $label    = $("<div class='time_label'></div>");
          intOffset = $timeline.k2goTimeline("getOffsetFromTime", objDate);

          $label   .html   ($timeline.k2goTimeline("formatDate", objDate, objDate.getHours() == 0 ? "%y/%mm/%dd<br/>%H:%M" : "<br/>%H:%M"));
          $label   .css    ("left", intOffset + "px");
          $timeline.append ($label);
        }

        objDate.setTime(objDate.getTime() + g_intLabelTime);
      }

      if ($("body").hasClass("autorun"))
      {
        var objRangeTime   = { left : $("#autorun_range_left" ).data("date")                        , right : $("#autorun_range_right").data("date") };
        var objRangeOffset = { left : $timeline.k2goTimeline("getOffsetFromTime", objRangeTime.left), right : $timeline.k2goTimeline("getOffsetFromTime", objRangeTime.right) };
        var objOffsetLimit = { left : $("#time_controller .k2go-timeline-main").offset().left       , right : $("#time_controller .k2go-timeline-main").offset().left + $("#time_controller .k2go-timeline-main").width() };

        if (objRangeOffset.left  < objOffsetLimit.left ) objRangeOffset.left  = objOffsetLimit.left;
        if (objRangeOffset.left  > objOffsetLimit.right) objRangeOffset.left  = objOffsetLimit.right;
        if (objRangeOffset.right > objOffsetLimit.right) objRangeOffset.right = objOffsetLimit.right;

        $("#autorun_range"          ).css ({ left : objRangeOffset.left + "px", width : (objRangeOffset.right - objRangeOffset.left) + "px" });
        $("#autorun_range_left  > *").html($("#autorun_range").width() > 0 || objRangeTime.left .getTime() > pTimeInfo.endTime  .getTime() ? $timeline.k2goTimeline("formatDate", new Date(Math.floor(objRangeTime.left .getTime() / g_intInterval) * g_intInterval), "%y/%mm/%dd<br/>%H:%M") : "");
        $("#autorun_range_right > *").html($("#autorun_range").width() > 0 || objRangeTime.right.getTime() < pTimeInfo.startTime.getTime() ? $timeline.k2goTimeline("formatDate", new Date(Math.floor(objRangeTime.right.getTime() / g_intInterval) * g_intInterval), "%y/%mm/%dd<br/>%H:%M") : "");
      }

      if (!$(window).data("resize"))
      {
        if (pTimeInfo.currentTime.getTime() < pTimeInfo.startTime.getTime()) pTimeInfo.currentTime.setTime(pTimeInfo.startTime.getTime());
        if (pTimeInfo.currentTime.getTime() > pTimeInfo.  endTime.getTime()) pTimeInfo.currentTime.setTime(pTimeInfo.  endTime.getTime());
                                                                             pTimeInfo.currentTime.setTime(Math.floor(pTimeInfo.currentTime.getTime() / g_intInterval) * g_intInterval);

        $("#date").val($timeline.k2goTimeline("formatDate", pTimeInfo.currentTime, "%y/%mm/%dd %H:%M:%S"));
      }
      else
        createTimeline(g_objShowDate, 0);
    },
    pickMoveEnd : function(pTimeInfo)
    {
      if (!$(window).data("resize"))
      {
        if (pTimeInfo.currentTime.getTime() < pTimeInfo.startTime.getTime()) pTimeInfo.currentTime.setTime(pTimeInfo.startTime.getTime());
        if (pTimeInfo.currentTime.getTime() > pTimeInfo.  endTime.getTime()) pTimeInfo.currentTime.setTime(pTimeInfo.  endTime.getTime());
                                                                             pTimeInfo.currentTime.setTime(Math.floor(pTimeInfo.currentTime.getTime() / g_intInterval) * g_intInterval);

        g_objShowDate    = new Date(pTimeInfo.currentTime.getTime());
        g_intDayPosition = Math.floor((g_objShowDate.getTime() - pTimeInfo.startTime.getTime()) / (1000 * 60 * 60 * 24));
      }
      else
        $(window).removeData("resize");
    },
    zoomEnd : function(pTimeInfo)
    {
      $timeline.k2goTimeline("getOptions").pickMoveEnd(pTimeInfo);

      var intDayCount = Math.floor((pTimeInfo.endTime.getTime() - pTimeInfo.startTime.getTime()) / (1000 * 60 * 60 * 24)) - 1;

           if (g_intDayCount < intDayCount) g_intDayCount += 1;
      else if (g_intDayCount > intDayCount) g_intDayCount -= 1;

      if (g_intDayCount <                0) g_intDayCount    = 0;
      if (g_intDayCount >                3) g_intDayCount    = 3;
      if (g_intDayCount < g_intDayPosition) g_intDayPosition = g_intDayCount;

      createTimeline(g_objShowDate, 500);
    },
    railClick : function(pTimeInfo)
    {
      $timeline.k2goTimeline("getOptions").pickMoveEnd(pTimeInfo);
    }
  },
  function(pTimeInfo)
  {
    $timeline.k2goTimeline("getOptions").pickMoveEnd(pTimeInfo);
  });
});$(function(){
/******************************************************************************/
/* window.resize                                                              */
/******************************************************************************/
$(window).on("resize", function()
{
  $(window).data("resize", true);
});
/******************************************************************************/
/* body.contextmenu                                                           */
/******************************************************************************/
$("body").on("contextmenu", function()
{
  return false;
});
/******************************************************************************/
/* help.click                                                                 */
/******************************************************************************/
$("#help").on("click", function()
{
  $("body").removeClass("autorun").removeClass("reverse");
});
/******************************************************************************/
/* time_prev or next.click                                                    */
/******************************************************************************/
$.each(["touchstart", "mousedown"], function()
{
  var flgTouch = this == "touchstart" ? true : false;
/*-----* touchstart mousedown *-----------------------------------------------*/
  $("#time_controller").on(flgTouch ? "touchstart" : "mousedown", ".time_prev, .time_next", function()
  {
    var $this = $(this);

    $this.data("tapHold", setTimeout(function()
    {
      var $timeline        = $("#time_controller .time_rail");
      var objTimeInfo      = $timeline.k2goTimeline("getOptions");
      var intCurrentOffset = $timeline.k2goTimeline("getOffsetFromTime", objTimeInfo.currentTime);
      var objOffsetLimit   = { left : $("#time_controller .k2go-timeline-main").offset().left, right : $("#time_controller .k2go-timeline-main").offset().left + $("#time_controller .k2go-timeline-main").width() };
      var objOffset        = { left : intCurrentOffset - 40                                  , right : intCurrentOffset + 40 };

      if (objOffset.left  < objOffsetLimit.left ) { objOffset.left  = objOffsetLimit.left ; objOffset.right = objOffset.left  + 80; }
      if (objOffset.right > objOffsetLimit.right) { objOffset.right = objOffsetLimit.right; objOffset.left  = objOffset.right - 80; }

      var objStartTime = $timeline.k2goTimeline("getTimeFromOffset", objOffset.left );
      var objEndTime   = $timeline.k2goTimeline("getTimeFromOffset", objOffset.right);

      $this                    .data    ("cancelMouseUp", true);
      $("body"                ).addClass("autorun"            ).toggleClass("reverse", $this.hasClass("time_prev"));
      $("#autorun_panel"      ).attr    ("step_level"   ,  "1").data       ("step"   , 0);
      $("#autorun_range"      ).css     ({ left : objOffset.left + "px", width : (objOffset.right - objOffset.left) + "px" });
      $("#autorun_range_left" ).data    ("date"         , objStartTime).children().html($timeline.k2goTimeline("formatDate", new Date(Math.floor(objStartTime.getTime() / g_intInterval) * g_intInterval), "%y/%mm/%dd<br/>%H:%M"));
      $("#autorun_range_right").data    ("date"         , objEndTime  ).children().html($timeline.k2goTimeline("formatDate", new Date(Math.floor(objEndTime  .getTime() / g_intInterval) * g_intInterval), "%y/%mm/%dd<br/>%H:%M"));
      $("#autorun_speed"      ).text    ("1");
      $("#autorun_repeat"     ).text    ("on");
      $this                    .data    ("tapHold"      , null);
    }, 1000));
/*-----* touchend mouseup *---------------------------------------------------*/
    $(document).one(flgTouch ? "touchend" : "mouseup", function()
    {
      $(document).off(flgTouch ? "touchend" : "mouseup");

      if ($this.data("tapHold"      )) clearTimeout($this.data("tapHold"));
      if ($this.data("cancelMouseUp")) { $this.data("cancelMouseUp", false); return; };

      var objTimeInfo = $("#time_controller .time_rail").k2goTimeline("getOptions");
      var objDate;

      if ($this.hasClass("time_prev"))
      {
        objDate = new Date(g_objShowDate.getTime() - g_intInterval);

        if (objDate.getTime() < objTimeInfo.startTime.getTime()) g_intDayPosition = g_intDayCount;
        else                                                     g_intDayPosition = Math.floor((objDate.getTime() - objTimeInfo.startTime.getTime()) / (1000 * 60 * 60 * 24));
      }
      else
      {
        objDate = new Date(g_objShowDate.getTime() + g_intInterval);

        if (objDate.getTime() > objTimeInfo.  endTime.getTime()) g_intDayPosition = 0;
        else                                                     g_intDayPosition = Math.floor((objDate.getTime() - objTimeInfo.startTime.getTime()) / (1000 * 60 * 60 * 24));
      }

      createTimeline(objDate, 0);
    });

    return false;
  });
});
/******************************************************************************/
/* date_prev or next.click                                                    */
/******************************************************************************/
$("#time_controller").on("click", ".date_prev, .date_next", function()
{
  var objDate;

  if ($(this).hasClass("date_prev")) objDate = new Date(g_objShowDate.getTime() - 1000 * 60 * 60 * 24);
  else                               objDate = new Date(g_objShowDate.getTime() + 1000 * 60 * 60 * 24);

  createTimeline(objDate, 500);
});
/******************************************************************************/
/* autorun_prev or next.click                                                 */
/******************************************************************************/
$("#autorun_panel").on("click", "#autorun_prev, #autorun_next", function()
{
  var objTimeInfo = $("#time_controller .time_rail").k2goTimeline("getOptions");
  var $panel      = $("#autorun_panel");
  var intStep     = g_intInterval * g_aryAutoRunSteps[$panel.data("step")].step;
  var objDate;

  if ($(this).attr("id") == "autorun_prev")
  {
    objDate = new Date(g_objShowDate.getTime() - intStep);

    if (objDate.getTime() < objTimeInfo.startTime.getTime()) g_intDayPosition = g_intDayCount;
    else                                                     g_intDayPosition = Math.floor((objDate.getTime() - objTimeInfo.startTime.getTime()) / (1000 * 60 * 60 * 24));
  }
  else
  {
    objDate = new Date(g_objShowDate.getTime() + intStep);

    if (objDate.getTime() > objTimeInfo.  endTime.getTime()) g_intDayPosition = 0;
    else                                                     g_intDayPosition = Math.floor((objDate.getTime() - objTimeInfo.startTime.getTime()) / (1000 * 60 * 60 * 24));
  }

  createTimeline(objDate, 0);
});
/******************************************************************************/
/* autorun_backward or foward.click                                           */
/******************************************************************************/
$.each(["touchstart", "mousedown"], function()
{
  var flgTouch = this == "touchstart" ? true : false;
/*-----* touchstart mousedown *-----------------------------------------------*/
  $("#autorun_panel").on(flgTouch ? "touchstart" : "mousedown", "#autorun_backward, #autorun_foward", function()
  {
    var $this   = $(this);
    var $panel  = $("#autorun_panel");
    var intStep = $panel.data("step");

    $this.data("tapHold", setTimeout(function()
    {
      $this.data("cancelMouseUp", true);

      $("body").addClass("running").toggleClass("reverse", $this.attr("id") == "autorun_backward");
      $this    .addClass("active");

      var flgReverse   = $("body"           ).hasClass("reverse");
      var flgRepeat    = $("#autorun_repeat").text    (         ) == "on";
      var objRangeTime = { left : new Date(Math.floor($("#autorun_range_left").data("date").getTime() / g_intInterval) * g_intInterval), right : new Date(Math.floor($("#autorun_range_right").data("date").getTime() / g_intInterval) * g_intInterval) };

      function _startAutorun()
      {
        var objDate;

             if (objRangeTime.left .getTime() <  g_objShowDate.getTime() && g_objShowDate.getTime() <  objRangeTime.right.getTime())   objDate = new Date(g_objShowDate     .getTime());
        else if (objRangeTime.left .getTime() >= g_objShowDate.getTime() && !flgReverse                                            ) { objDate = new Date(objRangeTime.left .getTime()); g_intDayPosition =             0; }
        else if (objRangeTime.left .getTime() >= g_objShowDate.getTime() &&  flgReverse                                            ) { objDate = new Date(objRangeTime.right.getTime()); g_intDayPosition = g_intDayCount; }
        else if (objRangeTime.right.getTime() <= g_objShowDate.getTime() && !flgReverse                                            ) { objDate = new Date(objRangeTime.left .getTime()); g_intDayPosition =             0; }
        else                                                                                                                         { objDate = new Date(objRangeTime.right.getTime()); g_intDayPosition = g_intDayCount; }

        createTimeline(objDate, 500, function(pTimeInfo)
        {
          setTimeout(function _autorun()
          {
            if (!$("body").hasClass("running")) return;

            if ((objRangeTime.right.getTime() <= g_objShowDate.getTime() && !flgReverse)
            ||  (objRangeTime.left .getTime() >= g_objShowDate.getTime() &&  flgReverse))
            {
              if (flgRepeat) _startAutorun(); else $("#autorun_cover").trigger("click");
              return;
            }

            var intFps = parseInt($("#autorun_speed").text(), 10);

            if (!flgReverse) $("#autorun_next").trigger("click");
            else             $("#autorun_prev").trigger("click");

            setTimeout(_autorun, 1000 / intFps);
          }, 1000);
        });
      }

      _startAutorun();
      $this.data("tapHold", null);
    }, 1000));
/*-----* touchend mouseup *---------------------------------------------------*/
    $(document).one(flgTouch ? "touchend" : "mouseup", function()
    {
      $(document).off(flgTouch ? "touchend" : "mouseup");

      if ($this.data("tapHold"      )) clearTimeout($this.data("tapHold"));
      if ($this.data("cancelMouseUp")) { $this.data("cancelMouseUp", false); return; };

      if (( $("body").hasClass("reverse") && $this.attr("id") == "autorun_backward")
      ||  (!$("body").hasClass("reverse") && $this.attr("id") == "autorun_foward"  ))
      {
        intStep += 1;
      }

      if (intStep >= g_aryAutoRunSteps.length) intStep = 0;

      $("body").toggleClass("reverse"   , $this.attr("id") == "autorun_backward");
      $panel   .attr       ("step_level", g_aryAutoRunSteps[intStep].level      ).data("step", intStep);
    });

    return false;
  });
});
/******************************************************************************/
/* autorun_range.drag                                                         */
/******************************************************************************/
$.each(["touchstart", "mousedown"], function()
{
  var flgTouch = this == "touchstart" ? true : false;
  var flgEvent = flgTouch && "event" in window;
/*-----* touchstart mousedown *-----------------------------------------------*/
  $("#autorun_range").on(flgTouch ? "touchstart" : "mousedown", "> *", function(pEvent)
  {
    var $this            = $(this);
    var $timeline        = $("#time_controller .time_rail");
    var objTimeInfoLimit = $timeline.k2goTimeline("getOptions");
    var objOffsetLimit   = { left : $("#time_controller .k2go-timeline-main").offset().left, right : $("#time_controller .k2go-timeline-main").offset().left + $("#time_controller .k2go-timeline-main").width() };
    var intBaseX         = flgEvent ? event.changedTouches[0].pageX : flgTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX;
    var intMoveX         = 0;

         if ($this.attr("id") == "autorun_range_left" ) $("body, #autorun_range > *").css("cursor", "w-resize");
    else if ($this.attr("id") == "autorun_range_right") $("body, #autorun_range > *").css("cursor", "e-resize");
    else                                                $("body, #autorun_range > *").css("cursor", "move");
/*-----* move *---------------------------------------------------------------*/
    var fncMove = function(pEvent)
    {
      intMoveX = (flgEvent ? event.changedTouches[0].pageX : flgTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX) - intBaseX;
      intBaseX = (flgEvent ? event.changedTouches[0].pageX : flgTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX);

      var objTimeInfo = { left : $("#autorun_range_left").data("date")                        , right : $("#autorun_range_right").data("date") };
      var objOffset   = { left : $timeline.k2goTimeline("getOffsetFromTime", objTimeInfo.left), right : $timeline.k2goTimeline("getOffsetFromTime", objTimeInfo.right) };

      if ($this.attr("id") == "autorun_range_left")
      {
        objOffset.right  = objOffset.right < objOffsetLimit.right ? objOffset.right : objOffsetLimit.right;
        objOffset.left  += intMoveX;

             if (objOffset     .right - objOffset.left <                  80) objOffset.left = objOffset     .right - 80;
        else if (objOffsetLimit.right - objOffset.left <                  30) objOffset.left = objOffsetLimit.right - 30;
        else if (objOffset     .left                   < objOffsetLimit.left) objOffset.left = objOffsetLimit.left;

        objTimeInfo.left.setTime($timeline.k2goTimeline("getTimeFromOffset", objOffset.left).getTime());

        if (objTimeInfo.left.getTime() < objTimeInfoLimit.startTime.getTime()) objTimeInfo.left.setTime(objTimeInfoLimit.startTime.getTime());
      }
      else if ($this.attr("id") == "autorun_range_right")
      {
        objOffset.left   = objOffset.left > objOffsetLimit.left ? objOffset.left : objOffsetLimit.left;
        objOffset.right += intMoveX;

             if (objOffset.right - objOffset     .left <                   80) objOffset.right = objOffset     .left  + 80;
        else if (objOffset.right - objOffsetLimit.left <                   30) objOffset.right = objOffsetLimit.left  + 30;
        else if (objOffset.right                       > objOffsetLimit.right) objOffset.right = objOffsetLimit.right;

        objTimeInfo.right.setTime($timeline.k2goTimeline("getTimeFromOffset", objOffset.right).getTime());

        if (objTimeInfo.right.getTime() > objTimeInfoLimit.endTime.getTime()) objTimeInfo.right.setTime(objTimeInfoLimit.endTime.getTime());
      }
      else
      {
        objOffset.left  += intMoveX;
        objOffset.right += intMoveX;

             if (objOffsetLimit.right - objOffset     .left < 80) { objOffset.right -= objOffset.left - (objOffsetLimit.right - 80); objOffset.left  -= objOffset.left - (objOffsetLimit.right - 80); }
        else if (objOffset     .right - objOffsetLimit.left < 80) { objOffset.left  += objOffsetLimit.left + 80 - objOffset.right  ; objOffset.right += objOffsetLimit.left + 80 - objOffset.right  ; }

        objTimeInfo.left .setTime($timeline.k2goTimeline("getTimeFromOffset", objOffset.left ).getTime());
        objTimeInfo.right.setTime($timeline.k2goTimeline("getTimeFromOffset", objOffset.right).getTime());

        if (objOffset.left  < objOffsetLimit.left ) objOffset.left  = objOffsetLimit.left;
        if (objOffset.right > objOffsetLimit.right) objOffset.right = objOffsetLimit.right;
      }

      $("#autorun_range"          ).css ({ left : objOffset.left + "px", width : (objOffset.right - objOffset.left) + "px" });
      $("#autorun_range_left  > *").html($timeline.k2goTimeline("formatDate", new Date(Math.floor(objTimeInfo.left .getTime() / g_intInterval) * g_intInterval), "%y/%mm/%dd<br/>%H:%M"));
      $("#autorun_range_right > *").html($timeline.k2goTimeline("formatDate", new Date(Math.floor(objTimeInfo.right.getTime() / g_intInterval) * g_intInterval), "%y/%mm/%dd<br/>%H:%M"));
    };

    document.addEventListener(flgTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
/*-----* touchend mouseup *---------------------------------------------------*/
    $(document).one(flgTouch ? "touchend" : "mouseup", function()
    {
        document                   .removeEventListener(flgTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
      $(document                  ).off                (flgTouch ? "touchend"  : "mouseup");
      $("body, #autorun_range > *").css                ("cursor", "");
    });

    return false;
  });
});
/******************************************************************************/
/* autorun_range.click                                                        */
/******************************************************************************/
$("#autorun_range").on("touchstart mousedown", "> * > *", function()
{
  var $parent = $(this).parent();
  var objDate = new Date(Math.floor($parent.data("date").getTime() / g_intInterval) * g_intInterval);

  g_intDayPosition = $parent.attr("id") == "autorun_range_left" ? 0 : g_intDayCount;
  createTimeline(objDate, 500);
  return false;
});
/******************************************************************************/
/* autorun_speed.click                                                        */
/******************************************************************************/
$("#autorun_speed").on("click", function()
{
  var intFps = parseInt($(this).text(), 10) + 1;

  if (intFps > 10) intFps = 1;

  $(this).text(intFps.toString());
  return false;
});
/******************************************************************************/
/* autorun_repeat.click                                                       */
/******************************************************************************/
$("#autorun_repeat").on("click", function()
{
  if($(this).text() == "on") $(this).text("off");
  else                       $(this).text("on" );
});
/******************************************************************************/
/* autorun_cover.click                                                        */
/******************************************************************************/
$("#autorun_cover").on("click", function()
{
  $("body"             ).removeClass("running");
  $("#autorun_backward").removeClass("active");
  $("#autorun_foward"  ).removeClass("active");
});
});
