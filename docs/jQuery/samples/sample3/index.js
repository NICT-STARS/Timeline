/******************************************************************************/
/* Sample for k2goTimeline                                                    */
/* Inoue Computer Service.                                                    */
/******************************************************************************/
/******************************************************************************/
/* window.load                                                                */
/******************************************************************************/
$(window).on("load", function()
{
  for (var i01 = 0; i01 < $Env.data.length; i01++)
  {
    $Env.data[i01].color = $Env.color[i01 % $Env.color.length];
  }

  var $timeline = $("#timeline");
  var intWidth  = $timeline.width();
  var objEnd    = new Date($Env.data[$Env.data.length - 1].end.getTime());
  var objStart  = new Date(objEnd.getTime() - 5184000000 * intWidth);

  if (objStart.getTime() < $Env.data[0].start.getTime())
  {
    objStart = new Date($Env.data[0].start.getTime());
  }

  $timeline.k2goTimeline(
  {
    minTime          : new Date($Env.data[0                   ].start.getTime()),
    maxTime          : new Date($Env.data[$Env.data.length - 1].end  .getTime()),
    startTime        : objStart,
    endTime          : objEnd,
    currentTime      : new Date(objStart.getTime() + (objEnd.getTime() - objStart.getTime()) / 2),
    timezoneOffset   : 540,
    pickLineDistance : { element : $("#time_controller"), position : "top" },
    timeChange       : function(pTimeInfo)
    {
      var $timeline = $("#timeline");
      var objData;
      var intLeft;
      var intWidth;

      $("#data_bar > *").remove();

      for (var i01 = 0; i01 < $Env.data.length; i01++)
      {
        objData = $Env.data[i01];

        if ((pTimeInfo.startTime.getTime() <= objData.start.getTime() && objData.start.getTime() <= pTimeInfo.  endTime.getTime())
        ||  (pTimeInfo.startTime.getTime() <= objData.end  .getTime() && objData.end  .getTime() <= pTimeInfo.  endTime.getTime())
        ||  (pTimeInfo.startTime.getTime() >  objData.start.getTime() && objData.end  .getTime() >  pTimeInfo.  endTime.getTime()))
        {
          intLeft  = $timeline.k2goTimeline("getOffsetFromTime", objData.start.getTime() > pTimeInfo.startTime.getTime() ? objData.start : pTimeInfo.startTime);
          intWidth = $timeline.k2goTimeline("getOffsetFromTime", objData.end  .getTime() < pTimeInfo.  endTime.getTime() ? objData.end   : pTimeInfo.  endTime) - intLeft;

          $("#data_bar").append($("<div></div>").css({ background : objData.color, left : intLeft + "px", width : intWidth + "px" }));

          if (objData.start.getTime() <= pTimeInfo.currentTime.getTime() && pTimeInfo.currentTime.getTime() <= objData.end.getTime())
          {
            $Env.currentData = i01;
            $("#current_time"         ).html($timeline.k2goTimeline("formatDate", pTimeInfo.currentTime, "<span>%jp年</span><br/><span>%y年%mm月%dd日%H時%M分%S秒</span>", 540)).css({ background : objData.color });
            $("#time_controller .prev").attr("disabled", i01 <=                    0 ? true : false);
            $("#time_controller .next").attr("disabled", i01 >= $Env.data.length - 1 ? true : false);
          }

          if (objData.end.getTime() > pTimeInfo.endTime.getTime()) break;
        }
      }
    },
    zoomEnd : function(pTimeInfo)
    {
      var $timeline  = $("#timeline");
      var objOptions = $timeline.k2goTimeline("getOptions");

      $("#zoom_button .in" ).attr("disabled", objOptions.scale <= objOptions.minScale ? true : false);
      $("#zoom_button .out").attr("disabled", objOptions.scale >= objOptions.maxScale ? true : false);

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
    $("#timeline").k2goTimeline("getOptions").zoomEnd(pTimeInfo);
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
$("#time_controller").on("click", "> button", function()
{
  var $this      = $(this);
  var $timeline  = $("#timeline");
  var objOptions = $timeline.k2goTimeline("getOptions");
  var objData    = $Env.data[$this.hasClass("prev") ? $Env.currentData - 1 : $Env.currentData + 1];
  var intDiff    = objData.start.getTime() - objOptions.currentTime.getTime();
  var objStart;
  var objEnd;

       if ($this.hasClass("prev") && objOptions.minTime.getTime() - objOptions.startTime.getTime() > intDiff) intDiff = objOptions.minTime.getTime() - objOptions.startTime.getTime();
  else if ($this.hasClass("next") && objOptions.maxTime.getTime() - objOptions.endTime  .getTime() < intDiff) intDiff = objOptions.maxTime.getTime() - objOptions.endTime  .getTime();

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
      currentTime : objData.start
    },
    duration : 500,
    callback : function(pTimeInfo)
    {
      $("#timeline").k2goTimeline("getOptions").zoomEnd(pTimeInfo);
    }
  });
});
});
