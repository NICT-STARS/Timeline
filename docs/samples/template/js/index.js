/******************************************************************************/
/* K2goTimeline Web Components Sample App                                     */
/* main.js                                                                    */
/******************************************************************************/
document.addEventListener("DOMContentLoaded", () => {
  const timeline = document.querySelector("k2go-timeline");
  const tlHeader = document.querySelector("k2go-timelineheader");
  /******************************************************************************/
  /* timeline.create                                                            */
  /******************************************************************************/
  document.querySelector("k2go-timeline").addEventListener("create", () =>
  {
    document.getElementById("event_info").innerHTML = `create`;
  });
  document.querySelector("k2go-timeline").addEventListener("afterCreateMethod", () =>
  {
    document.getElementById("event_info").innerHTML = `after create method`;
  });
  /******************************************************************************/
  /* timeline.change                                                            */
  /******************************************************************************/
  /*-----* change *-------------------------------------------------------------*/
  document.querySelector("k2go-timeline").addEventListener("change", () =>
  {
    document.querySelector("#min_time     span").innerHTML     = timeline.formatDate(timeline.       minTime, "%y-%mm-%dd %H:%M:%S");
    document.querySelector("#max_time     span").innerHTML     = timeline.formatDate(timeline.       maxTime, "%y-%mm-%dd %H:%M:%S");
    document.querySelector("#start_time   span").innerHTML     = timeline.formatDate(timeline.     startTime, "%y-%mm-%dd %H:%M:%S");
    document.querySelector("#end_time     span").innerHTML     = timeline.formatDate(timeline.       endTime, "%y-%mm-%dd %H:%M:%S");
    document.querySelector("#current_time span").innerHTML     = timeline.formatDate(timeline.   currentTime, "%y-%mm-%dd %H:%M:%S");

    document.getElementById("event_info").innerHTML = `change`;
  });
  document.querySelector("k2go-timeline").addEventListener("rangeChange", () =>
  {
    document.querySelector("#range_start_time span").innerHTML = timeline.formatDate(timeline.rangeStartTime, "%y-%mm-%dd %H:%M:%S");
    document.querySelector("#range_end_time   span").innerHTML = timeline.formatDate(timeline.  rangeEndTime, "%y-%mm-%dd %H:%M:%S");

    document.getElementById("event_info").innerHTML = `rangeChange`;
  });
  document.querySelector("k2go-timeline").addEventListener("mainSingleTap", () =>
  {
    document.getElementById("event_info").innerHTML = `mainSingleTap`;
  });
  document.querySelector("k2go-timeline").addEventListener("mainDoubleTap0", () =>
  {
    document.getElementById("event_info").innerHTML = `mainDoubleTap0`;
  });
  document.querySelector("k2go-timeline").addEventListener("mainDoubleTap2", () =>
  {
    document.getElementById("event_info").innerHTML = `mainDoubleTap2`;
  });
  document.querySelector("k2go-timeline").addEventListener("mainUpWheel", () =>
  {
    document.getElementById("event_info").innerHTML = `mainUpWheel`;
  });
  document.querySelector("k2go-timeline").addEventListener("mainDownWheel", () =>
  {
    document.getElementById("event_info").innerHTML = `mainDownWheel`;
  });
  document.querySelector("k2go-timeline").addEventListener("pickMoveStart", () =>
  {
    document.getElementById("event_info").innerHTML = `pickMoveStart`;
  });
  document.querySelector("k2go-timeline").addEventListener("pickMove", () =>
  {
    document.getElementById("event_info").innerHTML = `pickMove`;
  });
  document.querySelector("k2go-timeline").addEventListener("pickMoveEnd", () =>
  {
    document.getElementById("event_info").innerHTML = `pickMoveEnd`;
  });
  document.querySelector("k2go-timeline").addEventListener("pickDoubleTap", (e) =>
  {
    console.log(e);
    document.getElementById("event_info").innerHTML = `pickDoubleTap`;
  });
  document.querySelector("k2go-timeline").addEventListener("pickTapHold", () =>
  {
    document.getElementById("event_info").innerHTML = `pickTapHold`;
  });

  document.querySelector("k2go-timeline").addEventListener("barMoveStart", () =>
  {
    document.getElementById("event_info").innerHTML = `barMoveStart`;
  });
  document.querySelector("k2go-timeline").addEventListener("barMove", () =>
  {
    document.getElementById("event_info").innerHTML = `barMove`;
  });
  document.querySelector("k2go-timeline").addEventListener("barMoveEnd", () =>
  {
    document.getElementById("event_info").innerHTML = `barMoveEnd`;
  });
  /******************************************************************************/
  /* time_zone.zoom                                                             */
  /******************************************************************************/
  document.querySelector("k2go-timeline").addEventListener("zoomStart", () =>
  {
    document.getElementById("event_info").innerHTML = `zoomStart`;
  });
  document.querySelector("k2go-timeline").addEventListener("zoom", () =>
  {
    document.getElementById("event_info").innerHTML = `zoom`;
  });
  document.querySelector("k2go-timeline").addEventListener("zoomEnd", () =>
  {
    document.getElementById("event_info").innerHTML = `zoomEnd`;
  });

  document.querySelector("k2go-timeline").addEventListener("railClick", () =>
  {
    document.getElementById("event_info").innerHTML = `railClick`;
  });
  document.querySelector("k2go-timeline").addEventListener("timeChange", () =>
  {
    document.getElementById("event_info").innerHTML = `timeChange`;
  });
  document.querySelector("k2go-timeline").addEventListener("resize", () =>
  {
    document.getElementById("event_info").innerHTML = `resize`;
  });
  /******************************************************************************/
  /* range.drag                                                                 */
  /******************************************************************************/
  document.querySelector("k2go-timeline").addEventListener("rangeMoveStart", () =>
  {
    document.getElementById("event_info").innerHTML = `rangeMoveStart`;
  });
  document.querySelector("k2go-timeline").addEventListener("rangeMove", () =>
  {
    document.getElementById("event_info").innerHTML = `rangeMove`;
  });
  document.querySelector("k2go-timeline").addEventListener("rangeMoveEnd", () =>
  {
    document.getElementById("event_info").innerHTML = `rangeMoveEnd`;
  });
  /******************************************************************************/
  /* calender button click                                                           */
  /******************************************************************************/
  document.querySelector("k2go-timeline").addEventListener("openCalendar", (e) => {
    let currentTime = timeline.currentTime;
    let startTime   = timeline.startTime;
    let endTime     = timeline.endTime;
    let minTime     = timeline.minTime;
    let maxTime     = timeline.maxTime;
    let tzOffset    = timeline.timezoneOffset;

    let calendar = document.createElement("input");
    calendar.setAttribute("type", "date");
    calendar.setAttribute("value", timeline.formatDate(currentTime, "%y-%mm-%dd", tzOffset));
    calendar.setAttribute("min",   timeline.formatDate(minTime,     "%y-%mm-%dd", tzOffset));
    calendar.setAttribute("max",   timeline.formatDate(maxTime,     "%y-%mm-%dd", tzOffset));
    calendar.style.visibility = 'hidden';

    calendar.addEventListener('change', (event) => {
      let objDate    = new Date(event.target.value + " " + timeline.formatDate(currentTime, "%H:%M:%S", tzOffset));
      objDate.setMilliseconds(currentTime.getMilliseconds());

      if(currentTime != objDate) {
        let objTimeInfo = {};
  
        objTimeInfo.minTime     = minTime;
        objTimeInfo.maxTime     = maxTime
        objTimeInfo.startTime   = minTime    > startTime ? minTime : startTime;
        objTimeInfo.endTime     = maxTime    < endTime   ? maxTime : endTime  ;
        objTimeInfo.currentTime = currentTime;

        let intDiff1 = objTimeInfo.currentTime - objTimeInfo.startTime;
        let intDiff2 = objTimeInfo.endTime     - objTimeInfo.currentTime;

        objTimeInfo.currentTime.setTime(objDate);
        objTimeInfo.startTime  .setTime(objDate - intDiff1);
        objTimeInfo.endTime    .setTime(new Date (objDate.getTime() + intDiff2));

        if (minTime > objTimeInfo.startTime) objTimeInfo.startTime.setTime(minTime);
        if (maxTime < objTimeInfo.endTime  ) objTimeInfo.endTime  .setTime(maxTime);

        Env.creating = true;
        document.querySelector("#lockWindow").classList.add("show");

        timeline.create(
          objTimeInfo,
          function callback(pTimeInfo) {
            setTimeout(function() {
              Env.creating = false;
              timeline.adjustRangeBar();
              document.querySelector("#lockWindow").classList.remove("show");
            });
          }
        )
      }     
    }, false);

    e.detail.firstChild ? e.detail.removeChild(e.detail.firstChild) : "";
    e.detail.appendChild(calendar);
    calendar.showPicker();
  });

  /******************************************************************************/
  /* selectData.click                                                           */
  /******************************************************************************/
  document.querySelector("k2go-timeline").addEventListener("selectData", () =>
  {
    // select dataリンクを押下した時に実行される処理を追加。
  });
  /******************************************************************************/
  /* help.click                                                                 */
  /******************************************************************************/
  document.querySelector("k2go-timeline").addEventListener("help", () =>
  {
    // helpリンクを押下した時に実行される処理を追加。
  });
  document.querySelector("k2go-timeline").addEventListener("setCustomData", () => 
  {
    document.querySelector("k2go-timeline").setCustom({
      customTimeString: function(){ return timeline.formatDate(timeline.currentTime, "%y-%mm-%dd %H:%M") + ":00"; }, // ユーザが実装するヘッダに表示する時刻
      appLatestTime:    function(){ return new Date(); }, // ユーザが実装するアプリ最新時刻
      customViewURL:    function(){ return "&testkey=testvalue"; }, // ユーザが追加するViewURL文字列
    });
  });
});
