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
    minTime            : new Date($Env.videoInfo.  startTime.getTime()),
    maxTime            : new Date($Env.videoInfo.    endTime.getTime()),
    startTime          : new Date($Env.videoInfo.  startTime.getTime()),
    endTime            : new Date($Env.videoInfo.    endTime.getTime()),
    currentTime        : new Date($Env.videoInfo.currentTime.getTime()),
    disableMoveBar     : true,
    disableZoom        : true,
    clickBarToMovePick : true,
    pickLineDistance   : { element : $("footer"), position : "top" },
    timeChange         : function(pTimeInfo)
    {
      if (pTimeInfo.endTime.getTime() != $Env.videoInfo.endTime.getTime())
      {
        if (typeof $(window).data("timeChange") == "number") clearTimeout($(window).data("timeChange"));

        $(window).data("timeChange", setTimeout(function()
        {
          $("#timeline").k2goTimeline("create",
          {
            timeInfo :
            {
              minTime     : new Date($Env.videoInfo.  startTime.getTime()),
              maxTime     : new Date($Env.videoInfo.    endTime.getTime()),
              startTime   : new Date($Env.videoInfo.  startTime.getTime()),
              endTime     : new Date($Env.videoInfo.    endTime.getTime()),
              currentTime : new Date($Env.videoInfo.currentTime.getTime())
            }
          });

          $(window).removeData("timeChange");
        }, 100));
      }
      else
        $("#date").text($("#timeline").k2goTimeline("formatDate", pTimeInfo.currentTime, "%y/%mm/%dd %H:%M:%S"));
    },
    pickMoveStart : function(pTimeInfo)
    {
      if (!$("#video").get(0).paused)
      {
        $("#video"   ).get(0).pause();
        $("#timeline").data("playing", true);
      }
      else
        $("#timeline").removeData("playing");
    },
    pickMove : function(pTimeInfo)
    {
      $Env.videoInfo.currentTime.setTime(pTimeInfo.currentTime.getTime());
      $("#video").get(0).currentTime = ($Env.videoInfo.currentTime.getTime() - $Env.videoInfo.startTime.getTime()) / $Env.videoInfo.sampling / 1000;
    },
    pickMoveEnd : function(pTimeInfo)
    {
      if ($("#timeline").data("playing")) $("#video").get(0).play();
    },
    barMoveStart : function(pTimeInfo)
    {
      $("#timeline").k2goTimeline("getOptions").pickMoveStart(pTimeInfo);
      $("#timeline").k2goTimeline("getOptions").pickMove     (pTimeInfo);
      $("#timeline").k2goTimeline("getOptions").pickMoveEnd  (pTimeInfo);
    },
    railClick : function(pTimeInfo)
    {
      $("#timeline").k2goTimeline("getOptions").barMoveStart(pTimeInfo);
    }
  },
  function()
  {
    $("#video")       .attr   ("src", $Env.videoInfo.source);
    $("#video").get(0).load   ();
    $(window  )       .trigger("resize");
  });
});$(function() {
/******************************************************************************/
/* window.resize                                                              */
/******************************************************************************/
$(window).on("resize", function()
{
  $("#main"      ).css("height"   , $(window).height() - $("header").height() - $("footer").height() + "px");
  $("#main video").css("maxHeight", $(window).height() - $("header").height() - $("footer").height() + "px");
});
/******************************************************************************/
/* video.loadeddata                                                           */
/******************************************************************************/
$("#video").on("loadeddata", function()
{
  $Env.videoInfo.duration = $(this).get(0).duration * 1000;
  $Env.videoInfo.sampling = ($Env.videoInfo.endTime.getTime() - $Env.videoInfo.startTime.getTime()) / $Env.videoInfo.duration;
});
/******************************************************************************/
/* video.play                                                                 */
/******************************************************************************/
$("#video").on("play"   , function() { $("#play_box").css("pointerEvents", "none"); $("#timeline").css("pointerEvents", "none"); });
$("#video").on("playing", function() { $("#play_box").css("pointerEvents", ""    ); $("#timeline").css("pointerEvents", ""    ); $("#button_play").addClass("play"); });
/******************************************************************************/
/* video.seek                                                                 */
/******************************************************************************/
$("#video").on("seeking", function() { $("#message").   addClass("show"); });
$("#video").on("seeked" , function() { $("#message").removeClass("show"); });
/******************************************************************************/
/* video.timeupdate                                                           */
/******************************************************************************/
$("#video").on("timeupdate", function()
{
  var $this = $(this).get(0);

  if (!$this.paused)
  {
    $Env.videoInfo.currentTime.setTime($Env.videoInfo.startTime.getTime() + $Env.videoInfo.sampling * $this.currentTime * 1000);

    $("#timeline").k2goTimeline("create",
    {
      timeInfo :
      {
        minTime     : new Date($Env.videoInfo.  startTime.getTime()),
        maxTime     : new Date($Env.videoInfo.    endTime.getTime()),
        startTime   : new Date($Env.videoInfo.  startTime.getTime()),
        endTime     : new Date($Env.videoInfo.    endTime.getTime()),
        currentTime : new Date($Env.videoInfo.currentTime.getTime())
      }
    });
  }
});
/******************************************************************************/
/* video.pause                                                                */
/******************************************************************************/
$("#video").on("pause", function()
{
  $("#button_play").removeClass("play");
});
/******************************************************************************/
/* video.ended                                                                */
/******************************************************************************/
$("#video").on("ended", function()
{
  $("#timeline").k2goTimeline("create",
  {
    timeInfo :
    {
      minTime     : new Date($Env.videoInfo.startTime.getTime()),
      maxTime     : new Date($Env.videoInfo.  endTime.getTime()),
      startTime   : new Date($Env.videoInfo.startTime.getTime()),
      endTime     : new Date($Env.videoInfo.  endTime.getTime()),
      currentTime : new Date($Env.videoInfo.  endTime.getTime())
    }
  });

  $("#button_play").removeClass("play");
});
/******************************************************************************/
/* video.debug                                                                */
/******************************************************************************/
$("#video").on("loadstart"     , function() { console.log((new Date()).toISOString() + " loadstart"     ); });
/*
$("#video").on("progress"      , function() { console.log((new Date()).toISOString() + " progress"      ); });
$("#video").on("suspend"       , function() { console.log((new Date()).toISOString() + " suspend"       ); });
*/
$("#video").on("abort"         , function() { console.log((new Date()).toISOString() + " abort"         ); });
$("#video").on("error"         , function() { console.log((new Date()).toISOString() + " error"         ); });
$("#video").on("emptied"       , function() { console.log((new Date()).toISOString() + " emptied"       ); });
$("#video").on("stalled"       , function() { console.log((new Date()).toISOString() + " stalled"       ); });
$("#video").on("loadedmetadata", function() { console.log((new Date()).toISOString() + " loadedmetadata"); });
$("#video").on("loadeddata"    , function() { console.log((new Date()).toISOString() + " loadeddata"    ); });
$("#video").on("canplay"       , function() { console.log((new Date()).toISOString() + " canplay"       ); });
$("#video").on("canplaythrough", function() { console.log((new Date()).toISOString() + " canplaythrough"); });
$("#video").on("playing"       , function() { console.log((new Date()).toISOString() + " playing"       ); });
$("#video").on("waiting"       , function() { console.log((new Date()).toISOString() + " waiting"       ); });
$("#video").on("seeking"       , function() { console.log((new Date()).toISOString() + " seeking"       ); });
$("#video").on("seeked"        , function() { console.log((new Date()).toISOString() + " seeked"        ); });
$("#video").on("ended"         , function() { console.log((new Date()).toISOString() + " ended"         ); });
$("#video").on("durationchange", function() { console.log((new Date()).toISOString() + " durationchange"); });
/*
$("#video").on("timeupdate"    , function() { console.log((new Date()).toISOString() + " timeupdate"    ); });
*/
$("#video").on("play"          , function() { console.log((new Date()).toISOString() + " play"          ); });
$("#video").on("pause"         , function() { console.log((new Date()).toISOString() + " pause"         ); });
$("#video").on("ratechange"    , function() { console.log((new Date()).toISOString() + " ratechange"    ); });
$("#video").on("volumechange"  , function() { console.log((new Date()).toISOString() + " volumechange"  ); });
/******************************************************************************/
/* play_box.click                                                             */
/******************************************************************************/
$("#play_box").on("click", "> *", function()
{
/*-----* variable *-----------------------------------------------------------*/
  var $this     = $(this);
  var $timeline = $("#timeline");
  var $video    = $("#video"   ).get(0);
  var $playBox  = $("#play_box");
  var strButton = $this.attr("id");
/*-----* mutex *--------------------------------------------------------------*/
  if ($playBox.data("mutex")) return; else $playBox.data("mutex", true);
  setTimeout(function() { $playBox.removeData("mutex"); }, 200);
/*-----* loop *---------------------------------------------------------------*/
  if (strButton == "button_loop")
  {
    $this.toggleClass("loop");
    $video.loop = $this.hasClass("loop");
  }
/*-----* button_back1 *-------------------------------------------------------*/
  else if (strButton == "button_back1")
  {
    $Env.videoInfo.currentTime.setTime($Env.videoInfo.startTime.getTime());
    $video.currentTime = 0;

    if ($video.paused)
    {
      $timeline.k2goTimeline("create",
      {
        timeInfo :
        {
          minTime     : new Date($Env.videoInfo.  startTime.getTime()),
          maxTime     : new Date($Env.videoInfo.    endTime.getTime()),
          startTime   : new Date($Env.videoInfo.  startTime.getTime()),
          endTime     : new Date($Env.videoInfo.    endTime.getTime()),
          currentTime : new Date($Env.videoInfo.currentTime.getTime())
        }
      });
    }
  }
/*-----* button_back2 *-------------------------------------------------------*/
  else if (strButton == "button_back2")
  {
                                                                                   $Env.videoInfo.currentTime.setTime($Env.videoInfo.currentTime.getTime() - (($Env.videoInfo.endTime.getTime() - $Env.videoInfo.startTime.getTime()) * 0.01));
    if ($Env.videoInfo.currentTime.getTime() < $Env.videoInfo.startTime.getTime()) $Env.videoInfo.currentTime.setTime($Env.videoInfo.  startTime.getTime());

    $video.currentTime = ($Env.videoInfo.currentTime.getTime() - $Env.videoInfo.startTime.getTime()) / $Env.videoInfo.sampling / 1000;

    if ($video.paused)
    {
      $timeline.k2goTimeline("create",
      {
        timeInfo :
        {
          minTime     : new Date($Env.videoInfo.  startTime.getTime()),
          maxTime     : new Date($Env.videoInfo.    endTime.getTime()),
          startTime   : new Date($Env.videoInfo.  startTime.getTime()),
          endTime     : new Date($Env.videoInfo.    endTime.getTime()),
          currentTime : new Date($Env.videoInfo.currentTime.getTime())
        }
      });
    }
  }
/*-----* button_stop *--------------------------------------------------------*/
  else if (strButton == "button_stop")
  {
    $video.pause();
  }
/*-----* button_play *--------------------------------------------------------*/
  else if (strButton == "button_play")
  {
    if ($video.paused) { $video.playbackRate = 1;                                $video.play(); }
    else                 $video.playbackRate = $video.playbackRate == 1 ? 2 : 1;

    $this.children().text($video.playbackRate);
  }
/*-----* button_fwd2 *--------------------------------------------------------*/
  else if (strButton == "button_fwd2")
  {
                                                                                 $Env.videoInfo.currentTime.setTime($Env.videoInfo.currentTime.getTime() + (($Env.videoInfo.endTime.getTime() - $Env.videoInfo.startTime.getTime()) * 0.01));
    if ($Env.videoInfo.currentTime.getTime() > $Env.videoInfo.endTime.getTime()) $Env.videoInfo.currentTime.setTime($Env.videoInfo.    endTime.getTime());

    $video.currentTime = ($Env.videoInfo.currentTime.getTime() - $Env.videoInfo.startTime.getTime()) / $Env.videoInfo.sampling / 1000;

    if ($video.paused)
    {
      $timeline.k2goTimeline("create",
      {
        timeInfo :
        {
          minTime     : new Date($Env.videoInfo.  startTime.getTime()),
          maxTime     : new Date($Env.videoInfo.    endTime.getTime()),
          startTime   : new Date($Env.videoInfo.  startTime.getTime()),
          endTime     : new Date($Env.videoInfo.    endTime.getTime()),
          currentTime : new Date($Env.videoInfo.currentTime.getTime())
        }
      });
    }
  }
/*-----* button_fwd1 *--------------------------------------------------------*/
  else if (strButton == "button_fwd1")
  {
    $Env.videoInfo.currentTime.setTime($Env.videoInfo.endTime.getTime());
    $video.currentTime = $Env.videoInfo.duration / 1000;

    if ($video.paused)
    {
      $timeline.k2goTimeline("create",
      {
        timeInfo :
        {
          minTime     : new Date($Env.videoInfo.  startTime.getTime()),
          maxTime     : new Date($Env.videoInfo.    endTime.getTime()),
          startTime   : new Date($Env.videoInfo.  startTime.getTime()),
          endTime     : new Date($Env.videoInfo.    endTime.getTime()),
          currentTime : new Date($Env.videoInfo.currentTime.getTime())
        }
      });
    }
  }
});
});
