/******************************************************************************/
/* Sample for k2goTimeline                                                    */
/* Inoue Computer Service.                                                    */
/******************************************************************************/
/******************************************************************************/
/* window.load                                                                */
/******************************************************************************/
$(window).on("load", function()
{
  var $timeline      = $("#timeline");
  var intMinScale    = 1000 * 60 * 15;
  var intMaxScale    = 1000 * 60 * 90;
  var objCurrentTime = new Date(); objCurrentTime.setHours(12, 0, 0, 0);

  $timeline.k2goTimeline(
  {
    minTime            : new Date(1900, 0, 1, 0, 0, 0, 0),
    maxTime            : new Date(objCurrentTime.getTime() + 1000 * 60 * 60 * 12 - 1),
    startTime          : new Date(objCurrentTime.getTime() + 1000 * 60 * 60 * 12 - 1 - $timeline.width() * intMaxScale),
    endTime            : new Date(objCurrentTime.getTime() + 1000 * 60 * 60 * 12 - 1),
    currentTime        : new Date(objCurrentTime.getTime()),
    minScale           : intMinScale,
    maxScale           : intMaxScale,
    pickLineDistance   : { element : $("#data_bar"), position : "bottom" },
    clickBarToMovePick : true,
    labelPosition      : "range",
    timeChange         : function(pTimeInfo)
    {
      var $timeline  = $("#timeline");
      var objOptions = $timeline.k2goTimeline("getOptions");
      var objDate;
      var $date;
      var intLeft;
      var intWidth;
      var intDay;

      $("#current_time"      ).text        ($timeline.k2goTimeline("formatDate", pTimeInfo.currentTime, "%y/%mm/%dd") + " (" + $Env.dayInfo[pTimeInfo.currentTime.getDay()].caption + ")");
      $("#data_bar > .center").toggleClass ("hidden", objOptions.scale > 1000 * 60 * 30);

      objDate = new Date(pTimeInfo.currentTime.getTime()); objDate.setDate (objDate.getDate () - 1); objDate.setHours(12, 0, 0, 0); $("#data_bar .prev1 button").attr("disabled", objDate.getTime() < objOptions.minTime.getTime() ? true : false);
      objDate = new Date(pTimeInfo.currentTime.getTime()); objDate.setDate (objDate.getDate () - 7); objDate.setHours(12, 0, 0, 0); $("#data_bar .prev2 button").attr("disabled", objDate.getTime() < objOptions.minTime.getTime() ? true : false);
      objDate = new Date(pTimeInfo.currentTime.getTime()); objDate.setMonth(objDate.getMonth() - 1); objDate.setHours(12, 0, 0, 0); $("#data_bar .prev3 button").attr("disabled", objDate.getTime() < objOptions.minTime.getTime() ? true : false);
      objDate = new Date(pTimeInfo.currentTime.getTime()); objDate.setDate (objDate.getDate () + 1); objDate.setHours(12, 0, 0, 0); $("#data_bar .next1 button").attr("disabled", objDate.getTime() > objOptions.maxTime.getTime() ? true : false);
      objDate = new Date(pTimeInfo.currentTime.getTime()); objDate.setDate (objDate.getDate () + 7); objDate.setHours(12, 0, 0, 0); $("#data_bar .next2 button").attr("disabled", objDate.getTime() > objOptions.maxTime.getTime() ? true : false);
      objDate = new Date(pTimeInfo.currentTime.getTime()); objDate.setMonth(objDate.getMonth() + 1); objDate.setHours(12, 0, 0, 0); $("#data_bar .next3 button").attr("disabled", objDate.getTime() > objOptions.maxTime.getTime() ? true : false);

      $("#data_bar > .center > *").each(function(pIndex, pElement)
      {
        $date    = $(pElement);
        objDate  = new Date(parseInt($date.attr("date" ), 10));
        intLeft  = $timeline.k2goTimeline("getOffsetFromTime", objDate);
        intWidth = $timeline.k2goTimeline("getOffsetFromTime", new Date(objDate.getTime() + 1000 * 60 * 60 * 24)) - intLeft;

        $date.css({ left : intLeft + "px", width : intWidth + "px" });
      });

      if ($("#data_bar > .center > *[date]").length == 0) return;

      $date   = $("#data_bar > .center > *[date]:first");
      objDate = new Date(parseInt($date.attr("date" ), 10));

      while (objDate.getTime() >= pTimeInfo.startTime.getTime())
      {
        objDate.setDate(objDate.getDate() - 1);
        intDay   = objDate.getDay();
        intLeft  = $timeline.k2goTimeline("getOffsetFromTime", objDate);
        intWidth = $timeline.k2goTimeline("getOffsetFromTime", new Date(objDate.getTime() + 1000 * 60 * 60 * 24)) - intLeft;

        $("#data_bar > .center").prepend($("<div>" + $Env.dayInfo[intDay].caption + "</div>").css({ background : $Env.dayInfo[intDay].color, left : intLeft + "px", width : intWidth + "px" }).attr({ date : objDate.getTime(), day : intDay, debug : $timeline.k2goTimeline("formatDate", objDate, "%y%mm%dd") }));
      }

      $date   = $("#data_bar > .center > *[date]:last");
      objDate = new Date(parseInt($date.attr("date" ), 10));

      while (objDate.getTime() <= pTimeInfo.endTime.getTime())
      {
        objDate.setDate(objDate.getDate() + 1);
        intDay   = objDate.getDay();
        intLeft  = $timeline.k2goTimeline("getOffsetFromTime", objDate);
        intWidth = $timeline.k2goTimeline("getOffsetFromTime", new Date(objDate.getTime() + 1000 * 60 * 60 * 24)) - intLeft;

        $("#data_bar > .center").append($("<div>" + $Env.dayInfo[intDay].caption + "</div>").css({ background : $Env.dayInfo[intDay].color, left : intLeft + "px", width : intWidth + "px" }).attr({ date : objDate.getTime(), day : intDay, debug : $timeline.k2goTimeline("formatDate", objDate, "%y%mm%dd") }));
      }

      var intMinOffset = $timeline.offset().left;
      var intMaxOffset = $timeline.width () + intMinOffset;

      $("#data_bar > .center > *").each(function(pIndex, pElement)
      {
        $element = $(pElement);
        intLeft  = $element.offset().left;
        intRight = $element.width () + intLeft;

        if (intRight < intMinOffset || intLeft > intMaxOffset)
        {
          $element.remove();
        }
      });
    },
    zoomEnd : function(pTimeInfo)
    {
      var $timeline  = $("#timeline");
      var objOptions = $timeline.k2goTimeline("getOptions");

      $("#zoom_button .in"   ).attr("disabled", objOptions.scale <= objOptions.minScale ? true : false);
      $("#zoom_button .out"  ).attr("disabled", objOptions.scale >= objOptions.maxScale ? true : false);

      objOptions.barMoveEnd(pTimeInfo);
    },
    barMoveEnd : function(pTimeInfo)
    {
      var $timeline  = $("#timeline");
      var objOptions = $timeline.k2goTimeline("getOptions");
      var objDate    = null;

      if (pTimeInfo.startTime.getTime() < objOptions.minTime.getTime() && pTimeInfo.endTime.getTime() > objOptions.maxTime.getTime())
      {
        objDate       = {};
        objDate.start = new Date(objOptions.minTime  .getTime());
        objDate.end   = new Date(objOptions.maxTime  .getTime());
      }
      else if (pTimeInfo.startTime.getTime() < objOptions.minTime.getTime())
      {
        objDate       = {};
        objDate.start = new Date(objOptions.minTime  .getTime());
        objDate.end   = new Date(pTimeInfo .endTime  .getTime() + (objOptions.minTime.getTime() - pTimeInfo.startTime.getTime()));
      }
      else if (pTimeInfo.endTime.getTime() > objOptions.maxTime.getTime())
      {
        objDate       = {};
        objDate.start = new Date(pTimeInfo .startTime.getTime() + (objOptions.maxTime.getTime() - pTimeInfo.endTime  .getTime()));
        objDate.end   = new Date(objOptions.maxTime  .getTime());
      }

      if (objDate != null)
      {
        $timeline.k2goTimeline("create",
        {
          timeInfo :
          {
            minTime     : objOptions.minTime,
            maxTime     : objOptions.maxTime,
            startTime   : objDate   .start,
            endTime     : objDate   .end,
            currentTime : pTimeInfo .currentTime
          },
          duration : 100,
          callback : function(pTimeInfo)
          {
            $("#timeline").k2goTimeline("getOptions").zoomEnd(pTimeInfo);
          }
        });
      }
    }
  },
  function(pTimeInfo)
  {
    var $timeline = $("#timeline");
    var objDate   = new Date(pTimeInfo.startTime.getFullYear(), pTimeInfo.startTime.getMonth(), pTimeInfo.startTime.getDate(), 0, 0, 0, 0);
    var intDay;
    var intLeft;
    var intWidth;

    while (objDate.getTime() <= pTimeInfo.endTime.getTime())
    {
      intDay   = objDate.getDay();
      intLeft  = $timeline.k2goTimeline("getOffsetFromTime", objDate);
      intWidth = $timeline.k2goTimeline("getOffsetFromTime", new Date(objDate.getTime() + 1000 * 60 * 60 * 24)) - intLeft;

      $("#data_bar > .center").append ($("<div>" + $Env.dayInfo[intDay].caption + "</div>").css({ background : $Env.dayInfo[intDay].color, left : intLeft + "px", width : intWidth + "px" }).attr({ date : objDate.getTime(), day : intDay, debug : $timeline.k2goTimeline("formatDate", objDate, "%y%mm%dd") }));
      objDate                 .setDate(objDate.getDate() + 1);
    }

    $timeline.k2goTimeline("getOptions").zoomEnd(pTimeInfo);
  });
});$(function() {
/******************************************************************************/
/* window.resize                                                              */
/******************************************************************************/
$(window).on("resize", function()
{
  var $timeline  = $("#timeline");
  var objOptions = $timeline.k2goTimeline("getOptions");

  objOptions.barMoveEnd(objOptions);
});
/******************************************************************************/
/* zoom in or out.click                                                       */
/******************************************************************************/
$("#zoom_button").on("click", "> button", function()
{
  $("#timeline").k2goTimeline($(this).hasClass("in") ? "zoomIn" : "zoomOut");
});
/******************************************************************************/
/* prev or next.click                                                         */
/******************************************************************************/
$("#data_bar").on("click", "button", function()
{
  var $this      = $(this).parent();
  var $timeline  = $("#timeline");
  var objOptions = $timeline.k2goTimeline("getOptions");
  var objDate    = new Date(objOptions.currentTime.getTime());
  var intDiff;
  var objStart;
  var objEnd;

       if ($this.hasClass("prev1")) objDate.setDate (objDate.getDate () - 1);
  else if ($this.hasClass("prev2")) objDate.setDate (objDate.getDate () - 7);
  else if ($this.hasClass("prev3")) objDate.setMonth(objDate.getMonth() - 1);
  else if ($this.hasClass("next1")) objDate.setDate (objDate.getDate () + 1);
  else if ($this.hasClass("next2")) objDate.setDate (objDate.getDate () + 7);
  else if ($this.hasClass("next3")) objDate.setMonth(objDate.getMonth() + 1);

  objDate.setHours(12, 0, 0, 0);

                                                                                                              intDiff = objDate           .getTime() - objOptions.currentTime.getTime();
       if ($this.hasClass("prev") && objOptions.minTime.getTime() - objOptions.startTime.getTime() > intDiff) intDiff = objOptions.minTime.getTime() - objOptions.startTime  .getTime();
  else if ($this.hasClass("next") && objOptions.maxTime.getTime() - objOptions.endTime  .getTime() < intDiff) intDiff = objOptions.maxTime.getTime() - objOptions.endTime    .getTime();

  objStart = new Date(objOptions.startTime.getTime() + intDiff);
  objEnd   = new Date(objOptions.endTime  .getTime() + intDiff);

  if (objStart.getTime() < objOptions.minTime.getTime()) objStart = new Date(objOptions.minTime.getTime());
  if (objEnd  .getTime() > objOptions.maxTime.getTime()) objEnd   = new Date(objOptions.maxTime.getTime());

  $timeline.k2goTimeline("create",
  {
    timeInfo :
    {
      minTime     : objOptions.minTime,
      maxTime     : objOptions.maxTime,
      startTime   : objOptions.endTime  .getTime() == objOptions.maxTime.getTime() && $this.hasClass("next") ? objOptions.startTime : objStart,
      endTime     : objOptions.startTime.getTime() == objOptions.minTime.getTime() && $this.hasClass("prev") ? objOptions.endTime   : objEnd,
      currentTime : objDate
    },
    duration : 500,
    callback : function(pTimeInfo)
    {
      $("#timeline").k2goTimeline("getOptions").zoomEnd(pTimeInfo);
    }
  });
});
});
