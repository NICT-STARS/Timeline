/******************************************************************************/
/* Sample for k2goTimeline                                                    */
/* Inoue Computer Service.                                                    */
/******************************************************************************/
/******************************************************************************/
/* adjustCurrentTime                                                          */
/******************************************************************************/
function adjustCurrentTime()
{
/*
  var objOptions  = $("#timeline").k2goTimeline("getOptions");

  if ($(".k2go-timeline-range-show").length > 0)
  {
    if (objOptions.startTime.getTime() > objOptions.rangeEndTime.getTime() ||  objOptions.endTime  .getTime() < objOptions.rangeStartTime.getTime())
    {
      return;
    }
    else if (objOptions.currentTime.getTime() < objOptions.rangeStartTime.getTime())
    {
      var objTimeInfo = {};

      objTimeInfo.minTime     = new Date(objOptions .minTime    .getTime());
      objTimeInfo.maxTime     = new Date(objOptions .maxTime    .getTime());
      objTimeInfo.startTime   = new Date(objOptions .minTime    .getTime() > objOptions.startTime     .getTime() ? objOptions.minTime.getTime() : objOptions.startTime     .getTime());
      objTimeInfo.endTime     = new Date(objOptions .maxTime    .getTime() < objOptions.endTime       .getTime() ? objOptions.maxTime.getTime() : objOptions.endTime       .getTime());
      objTimeInfo.currentTime = new Date(objOptions .endTime    .getTime() < objOptions.rangeStartTime.getTime() ? objOptions.endTime.getTime() : objOptions.rangeStartTime.getTime());
      $Env       .currentTime = new Date(objTimeInfo.currentTime.getTime());
      $Env       .creating    = true;

      $("#timeline").k2goTimeline("create", { timeInfo : objTimeInfo, callback : function() { $Env.creating = false; } });
    }
    else if (objOptions.currentTime.getTime() > objOptions.rangeEndTime.getTime())
    {
      var objTimeInfo = {};

      objTimeInfo.minTime     = new Date(objOptions .minTime    .getTime());
      objTimeInfo.maxTime     = new Date(objOptions .maxTime    .getTime());
      objTimeInfo.startTime   = new Date(objOptions .minTime    .getTime() > objOptions.startTime   .getTime() ? objOptions.minTime  .getTime() : objOptions.startTime   .getTime());
      objTimeInfo.endTime     = new Date(objOptions .maxTime    .getTime() < objOptions.endTime     .getTime() ? objOptions.maxTime  .getTime() : objOptions.endTime     .getTime());
      objTimeInfo.currentTime = new Date(objOptions .startTime  .getTime() > objOptions.rangeEndTime.getTime() ? objOptions.startTime.getTime() : objOptions.rangeEndTime.getTime());
      $Env       .currentTime = new Date(objTimeInfo.currentTime.getTime());
      $Env       .creating    = true;

      $("#timeline").k2goTimeline("create", { timeInfo : objTimeInfo, callback : function() { $Env.creating = false; } });
    }
    else
      $Env.currentTime = new Date(objOptions.currentTime.getTime());
  }
  else
    $Env.currentTime = new Date(objOptions.currentTime.getTime());
*/
}
/******************************************************************************/
/* checkRangeBar                                                              */
/******************************************************************************/
function checkRangeBar()
{
  var objOptions = $("#timeline").k2goTimeline("getOptions");

  return   objOptions.startTime     .getTime() <= objOptions.rangeStartTime.getTime() && objOptions.rangeEndTime.getTime() <= objOptions.endTime     .getTime()
       &&  objOptions.rangeStartTime.getTime() <= objOptions.currentTime   .getTime() && objOptions.currentTime .getTime() <= objOptions.rangeEndTime.getTime()
       && (objOptions.rangeEndTime  .getTime() -  objOptions.rangeStartTime.getTime()) / objOptions.scale >= $(".k2go-timeline-pick").width() * 3;
}
/******************************************************************************/
/* adjustRangeBar                                                             */
/******************************************************************************/
function adjustRangeBar()
{
/*
  setTimeout(function _sleep()
  {
    if ($Env.creating)
    {
      setTimeout(_sleep, 10);
      return;
    }

    var objOptions = $("#timeline").k2goTimeline("getOptions");

    if ($(".k2go-timeline-range-show").length > 0)
    {
      if (checkRangeBar())
      {
        $Env.startTime   = new Date(objOptions.minTime    .getTime() > objOptions.startTime.getTime() ? objOptions.minTime.getTime() : objOptions.startTime.getTime());
        $Env.endTime     = new Date(objOptions.maxTime    .getTime() < objOptions.endTime  .getTime() ? objOptions.maxTime.getTime() : objOptions.endTime  .getTime());
        $Env.currentTime = new Date(objOptions.currentTime.getTime());
      }
      else
      {
        var objTimeInfo = {};

        objTimeInfo.minTime     = new Date($Env.minTime    .getTime());
        objTimeInfo.maxTime     = new Date($Env.maxTime    .getTime());
        objTimeInfo.startTime   = new Date($Env.startTime  .getTime());
        objTimeInfo.endTime     = new Date($Env.endTime    .getTime());
        objTimeInfo.currentTime = new Date($Env.currentTime.getTime());

        $Env.creating = true;

        $("#timeline").k2goTimeline("create",
        {
          timeInfo : objTimeInfo,
          duration : 500,
          callback : function(pTimeInfo)
          {
            $Env.creating = false;
            putEventInfo("after create method", $("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%y/%mm/%dd %H:%M:%S"));
          }
        });
      }
    }
    else
    {
      $Env.startTime   = new Date(objOptions.minTime    .getTime() > objOptions.startTime.getTime() ? objOptions.minTime.getTime() : objOptions.startTime.getTime());
      $Env.endTime     = new Date(objOptions.maxTime    .getTime() < objOptions.endTime  .getTime() ? objOptions.maxTime.getTime() : objOptions.endTime  .getTime());
      $Env.currentTime = new Date(objOptions.currentTime.getTime());
    }
  }, 1);
*/
}
/******************************************************************************/
/* putEventInfo                                                               */
/******************************************************************************/
function putEventInfo(pEvent, pDate)
{
  $("#event_info").html(pEvent + "<br/>[" + pDate + "]");
  console.log("[" + (new Date()).toISOString() + "]" + pEvent);
}
