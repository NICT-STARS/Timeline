/******************************************************************************/
/* K2goTimeline Web Components                                                */
/* Version 2.0.0                                                              */
/* Copyright (c) k2go. All rights reserved.                                   */
/* See License.txt for the license information.                               */
/******************************************************************************/
// import { sample } from "./main.js";

class K2goTimeline extends HTMLElement
{
  /*-----* properties *---------------------------------------------------------*/
  #startTime          =  new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate(),  0,  0,  0,   0);
  #endTime            =  new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate(), 23, 59, 59, 999);
  #currentTime        =  new Date();
  #minTime            =  new Date((new Date()).getFullYear() - 100, (new Date()).getMonth(), (new Date()).getDate(), (new Date()).getHours(), (new Date()).getMinutes(), (new Date()).getSeconds(), (new Date()).getMilliseconds());
  #maxTime            =  new Date((new Date()).getFullYear() + 100, (new Date()).getMonth(), (new Date()).getDate(), (new Date()).getHours(), (new Date()).getMinutes(), (new Date()).getSeconds(), (new Date()).getMilliseconds());
  #rangeStartTime     =  undefined;
  #rangeEndTime       =  undefined;
  #timezoneOffset     = Env.timezoneOffset;
  #jpCalendar         = Env.jpCalendar;
  #minScale           = Env.minScale;
  #maxScale           = Env.maxScale;
  #enableHeaderDate   = Env.enableHeaderDate;
  #enableNowtime      = Env.enableNowtime;
  #enableRealtime     = Env.enableRealtime;
  #disableViewURL     = Env.disableViewURL;
  #enableHeaderBar    = Env.enableHeaderBar;
  #enableFunctionBar  = Env.enableFunctionBar;
  #disableMoveBar     = Env.disableMoveBar;
  #disableZoom        = Env.disableZoom;
  #syncPickAndBar     = Env.syncPickAndBar;
  #clickBarToMovePick = Env.clickBarToMovePick;
  #labelPosition      = Env.labelPosition;
  #pickLineDistance   = Env.pickLineDistance;
  #pickLinePosition   = Env.pickLinePosition;
  #scale;
  #scaleInterval;
  #flgTouch           = "ontouchstart"            in window;
  #flgEvent           = this.#flgTouch && "event" in window;
  #strMouseWheel      = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
  #rangeCurrentTime;
  #loop;
  #objRangeTime;
  #thread                 = 0;
  #lock                   = false;
  #cancelAttributeChanged = false;
  
  /* timeline */
  #mainElement;
  #barElement;
  #railElement;
  #pickElement;
  #pickKnobElement;
  #pickLineElement;
  #rangeElement;
  #rangeLeftElement;
  #rangeRightElement;
  #rangebuttonElement;
  /* header */
  #headerElement;
  #timebtnElement;
  #calendarbtnElement;
  #calendardate;
  #functionbarElement;
  #buttonConfElement;
  #panelConfElement;
  #panelConfCloseElement;
  /* function */
  #playspeedElement;
  #playspanElement;
  #display1Element;
  #display2Element;
  /* zoomrange */
  #zoomrangeElement;
  #buttonminusElement;
  #buttonplusElement;
  #sliderElement;
  #sliderlabelElement;
  /* selectData */
  #selectDataElement;
  /* viewURL */
  #buttonviewurlElement;
  #viewurlinputElement;
  #viewurlElement;
  #inputgroupbuttonElement;
  #viewurlboxcloseElement;
  #lockwindowElement;
  /* help */
  #helpElement;
  /* playbutton */
  #formtitleplayspeedtitleElement;
  #formtitleplayspantitleElement;
  #buttonloopElement;
  #playboxElement;
  #buttonbackedgeElement;
  #buttonbackElement;
  #buttonplayreverseElement;
  #buttonstopElement;
  #buttonplayElement;
  #buttonfwdElement;
  #buttonfwdedgeElement;

  get startTime     ()  { return new Date(this.#startTime     .getTime()); }
  get endTime       ()  { return new Date(this.#endTime       .getTime()); }
  get currentTime   ()  { return new Date(this.#currentTime   .getTime()); }
  get minTime       ()  { return new Date(this.#minTime       .getTime()); }
  get maxTime       ()  { return new Date(this.#maxTime       .getTime()); }
  get rangeStartTime()  { return new Date(this.#rangeStartTime.getTime()); }
  get rangeEndTime  ()  { return new Date(this.#rangeEndTime  .getTime()); }
  get timezoneOffset()  { return this.#timezoneOffset;                     }
  /******************************************************************************/
  /* constructor                                                                */
  /******************************************************************************/
  constructor()
  {
    super();
  /*-----* shadow dom *---------------------------------------------------------*/
    const objShadowRoot = this.attachShadow({ mode:"open" });
    const objStyle      = document.createElement("style");
    const objTemplate   = document.createElement("template");

    objStyle.textContent =
    `
      [part="k2go-button_range"]               { display: block; width: 60px; height: 50px; position: absolute; top: 20px; left: 8px; cursor: pointer; user-select: none; -webkit-user-select: none; -moz-user-select: none; }
      [part="k2go-button_range"]::after        { content: ""; display: inline-block; background: url(img/ic_range.svg) no-repeat center 0px; width: 60px; height: 50px; background-size: 40px auto; }
      [part="k2go-button_range"] span          { color: #888; font-size: 11px; font-family: Monda, sans-serif; font-weight: 200; display: block; position: absolute; bottom: 0%; left: 50%; transform: translate(-50%, 0%); }
      [part="k2go-button_range"].active span   { color: #fc3; }
      [part="k2go-button_range"].active::after { content: ""; display: inline-block; background: url(img/ic_range_active.svg) no-repeat center 0px; width: 60px; height: 50px; background-size: 40px auto; }
      [part="k2go-button_range"].disable1      { pointer-events: none; }
      [part="k2go-button_range"].disable1 span { opacity: 0.5; }
      [part="k2go-button_range"].disable1::after { opacity: 0.3; pointer-events: none; }
      [part="k2go-button_range"].disable2      { pointer-events: none; }
      [part="k2go-button_range"].disable2::after { pointer-events: none; }
      [part="k2go-timeline"]                   { position: fixed; bottom: 0px; left: 80px; width: calc(100% - 160px); }
      [part="k2go-timeline-main"]              { position:absolute; width:100%; height:90px; }
      [part="k2go-timeline-main"].disable2     { pointer-events: none; }
      [part="k2go-timeline-bar"]               { position:absolute; left:0px; top   : 0px; width:100%; height:45px; cursor:pointer; overflow: hidden; }
      [part="k2go-timeline-rail"]              { position:absolute; left:0px; top   :60px; width:100%; height:8px; cursor:pointer; background:rgba(126, 160, 199, 0.5); border-radius:1px; box-shadow: none; }
      [part="k2go-timeline-scale"]             { position:absolute; top:0px; width:1px; height:3px; background:#cbcbcb; pointer-events:none; }
      [part="k2go-timeline-scale"].long        { height:10px; }
      [part="k2go-timeline-label"]             { position:absolute; top:10px; color:#8a8a8a; font-size:12px; text-align:center; white-space:nowrap; }
      [part="k2go-timeline-range"]             { display:none; }
      [part="k2go-timeline-range"].show        { display:flex;  position:absolute; top:0px; height:11px; background:#fc3; border-radius:4px;}
      [part="k2go-timeline-range"].k2go-timeline-range-show { display: flex; position: absolute; top: 0px; height: 7px; background: #fc3; border-radius: 4px; }
      [part="k2go-timeline-range-left"]        { flex: 0 0 40px; height: 40px; margin: -14px 0px 0px -20px; cursor: w-resize; }
      [part="k2go-timeline-range-right"]       { flex: 0 0 40px; height: 40px; margin: -14px -20px 0px 0px; cursor: e-resize; }
      [part="k2go-timeline-range-center"]      { flex: auto; height: 40px; margin: -14px 0px 0px 0px; cursor: move; }
      [part="k2go-timeline-pick"]              { width: 30px; position: absolute; left: 0px; bottom: -15px; height: 40px; }
      [part="k2go-timeline-pick-line"]         { position:absolute; left: 15px; bottom: 38px; width: 1px; height: 0px; background: #7da2cc; }
      [part="k2go-timeline-pick-knob"]         { position:absolute; left: 0px; bottom: 4px; width: 30px; height: 30px; background: #fff; border-radius: 50%; box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3); }
      @media screen and (max-width: 820px)     { [part="k2go-button_range"] { width: 40px; height: 40px; top: 20px; left: 20px; } [part="k2go-button_range"] span { display: none; } [part="k2go-button_range"]::after { width: 40px; height: 40px; background-size: 30px auto; } [part="k2go-button_range"].active::after { width: 40px; height: 40px; background-size: 30px auto; } }
      @media screen and (max-width: 700px)     { [part="k2go-button_range"] { left: 10px; } }
      @media screen and (max-width: 550px) { [part="k2go-button_range"] { width: 40px; height: 40px; top: 20px; left: 0px; } }
    `;

    objTemplate.innerHTML = 
    `
      <div part="k2go-button_range">
        <span>RangeBar</span>
      </div>
      <div part="k2go-timeline">
        <div part="k2go-timeline-main">
          <div part="k2go-timeline-bar" ></div>
          <div part="k2go-timeline-rail">
            <div part="k2go-timeline-range">
              <div part="k2go-timeline-range-left"  class="k2go-timeline-range-left" ></div>
              <div part="k2go-timeline-range-center" class="k2go-timeline-range-center" ></div>
              <div part="k2go-timeline-range-right" class="k2go-timeline-range-right" ></div>
            </div>
            <div part="k2go-timeline-pick" class="k2go-timeline-pick">
              <div part="k2go-timeline-pick-line"></div>
              <div part="k2go-timeline-pick-knob"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    objShadowRoot.appendChild(objStyle);
    objShadowRoot.appendChild(objTemplate.content.cloneNode(true));

    this.#mainElement        = this.shadowRoot.querySelector("[part='k2go-timeline-main']");
    this.#barElement         = this.shadowRoot.querySelector("[part='k2go-timeline-bar']");
    this.#railElement        = this.shadowRoot.querySelector("[part='k2go-timeline-rail']");
    this.#pickElement        = this.shadowRoot.querySelector("[part='k2go-timeline-pick']");
    this.#pickKnobElement    = this.shadowRoot.querySelector("[part='k2go-timeline-pick-knob']");
    this.#pickLineElement    = this.shadowRoot.querySelector("[part='k2go-timeline-pick-line']");
    this.#rangeElement       = this.shadowRoot.querySelector("[part='k2go-timeline-range']");
    this.#rangebuttonElement = this.shadowRoot.querySelector("[part='k2go-button_range']");
    this.#rangeLeftElement   = this.shadowRoot.querySelector("[part='k2go-timeline-range-left']");
    this.#rangeRightElement  = this.shadowRoot.querySelector("[part='k2go-timeline-range-right']");

    /*-----* shadow dom header *--------------------------------------------------------------*/
    if (this.#enableHeaderBar)
    {
      const headerShadow        = document.querySelector("k2go-timelineheader");
      const headerShadowRoot    = headerShadow.attachShadow({ mode: 'open' });
      const objHeaderStyle      = document.createElement("style");
      const objHeaderTemplate   = document.createElement("template");

      objHeaderStyle.textContent = 
      `
        [part="k2go-head-top-bar"]              { width: 100%; background: #1b1e2b; height: 76px; border-top: solid 1px rgba(0, 0, 0, 0.8); border-bottom: solid 1px rgba(0, 0, 0, 0.8); display: grid; grid-template-columns: 160px 1fr 160px; align-items: center; z-index : 9; }
        [part="k2go-head-center"]               { margin: 13px auto 13px; display: block; height: 50px; }
        [part="k2go-head-date-box"]             { background: #292d3e; border-radius: 6px; color: #7da2cc; font-family: Monda, sans-serif; display: grid; grid-template-columns: 40px 260px 40px; align-items: center; justify-content: space-between; gap: 5px; width: 350px; text-align: center; box-sizing: border-box; }
        [part="k2go-head-cal"]                  { display: block; background: url(img/ic_cal.svg) no-repeat center center; background-size: 26px 26px; width: 40px; height: 40px; cursor: pointer; }
        [part="k2go-head-cal"].disable1         { opacity: 0.2; pointer-events: none; }
        [part="k2go-head-cal"].disable2         { pointer-events: none; }
        [part="k2go-head-cal"]:active           { transform: scale(0.9); opacity: 0.6; }
        [part="k2go-head-date"]                 { font-size: 21px; letter-spacing: 2px; display: inline-block; line-height: 50px; width: 258px; margin: 0 auto 0; user-select: none; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: clip; -webkit-text-overflow: clip; -o-text-overflow: clip; }
        [part="k2go-head-date"].expansion       { font-size: 17px; }
        [part="k2go-head-time-btn"]             { width: 40px; height: 40px; cursor: pointer; display: block; }
        [part="k2go-head-time-btn"].disable1    { opacity: 0.2; pointer-events: none; }
        [part="k2go-head-time-btn"].disable2    { pointer-events: none; }
        [part="k2go-head-time-btn"]:active      { transform: scale(0.9); opacity: 0.6; }
        [part="k2go-head-time-btn"].timeCurrent { background: url(img/ic_current_time.svg) no-repeat center center; background-size: 24px 24px; }
        [part="k2go-head-time-btn"].timeNow     { background: url(img/ic_current_time_active.svg) no-repeat center center; background-size: 24px 24px; }
        [part="k2go-head-time-btn"].timeNowPlay { background: url(img/ic_current_time_active.svg) no-repeat center center; background-size: 24px 24px; animation: blink 1s linear infinite; }
        [part="k2go-head-right"]                { padding: 0 20px 0 0; display: block; }
        @keyframes blink                        { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        @media screen and (max-width: 700px) { [part="k2go-head-top-bar"] { grid-template-columns: 1fr; align-items: center; } [part="k2go-head-left"] { display: none; } }
        @keyframes blink                                                        { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; }}
        .picker                                                                 { font-size: 16px; text-align: left;line-height: 1.2; color: #7da2cc; position: absolute; z-index: 10000; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; outline: none; }
        .picker__input                                                          { cursor: default; }
        .picker__input .picker__input--active                                   { border-color: #0089ec; }
        .picker__holder                                                         { width: 100%; overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .picker__holder, .picker__frame                                         { top: 0; bottom: 0; left: 0; right: 0; -ms-transform: translateY(100%); transform: translateY(100%); }
        .picker__holder                                                         { position: fixed; transition: background 0.15s ease-out, transform 0s 0.15s; -webkit-backface-visibility: hidden;}
        .picker__frame                                                          { position: absolute; margin: 0 auto; min-width: 256px; max-width: 666px; width: 100%; -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"; filter: alpha(opacity=0); -moz-opacity: 0; opacity: 0; transition: all 0.15s ease-out; }
        @media (min-height: 33.875em){.picker__frame                            { overflow: visible; top: auto; bottom: -100%; max-height: 80%; }}
        @media (min-height: 40.125em){.picker__frame                            { margin-bottom: 7.5%; }}
        .picker__wrap                                                           { display: table; width: 100%; height: 100%; }
        @media (min-height: 33.875em){.picker__wrap                             { display: block; }}
        .picker__box                                                            { background: #fff; display: table-cell; vertical-align: middle; }
        @media (min-height: 26.5em){.picker__box                                { font-size: 1.25em; }}
        @media (min-height: 33.875em){.picker__box                              { display: block; font-size: 1.33em; border: 1px solid #777; border-top-color: #898989; border-bottom-width: 0; border-radius: 5px 5px 0 0; box-shadow: 0 12px 36px 16px rgba(0, 0, 0, 0.24); }}
        @media (min-height: 40.125em){.picker__box                              { font-size: 1.5em; border-bottom-width: 1px; border-radius: 5px; }}
        .picker--opened .picker__holder                                         { -ms-transform: translateY(0); transform: translateY(0); background: transparent; -ms-filter: "progid:DXImageTransform.Microsoft.gradient(startColorstr=#1E000000,endColorstr=#1E000000)"; zoom: 1; background: rgba(0, 0, 0, 0.32); transition: background 0.15s ease-out; }
        .picker--opened .picker__frame                                          { -ms-transform: translateY(0); transform: translateY(0); -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=100)"; filter: alpha(opacity=100); -moz-opacity: 1; opacity: 1; }
        @media (min-height: 33.875em){.picker--opened .picker__frame            { top: auto; bottom: 0; }}
        .picker__box                                                                { padding: 0 1em; font-family: "Monda", sans-serif; }
        .picker__header                                                             { text-align: center; position: relative; margin-top: .75em; }
        .picker__month, .picker__year                                               { font-weight: 500; display: inline-block; margin-left: .25em; margin-right: .25em; color : #000 }
        .picker__year                                                               { color: #999; font-size: .8em;  }
        .picker__select--month, .picker__select--year                               { border: 1px solid #b7b7b7; height: 2em; padding: .5em; margin-left: .25em; margin-right: .25em; }
        @media (min-width: 24.5em){.picker__select--month, .picker__select--year    { margin-top: -0.5em; }}
        .picker__select--month                                                      { width: 35%; }
        .picker__select--year                                                       { width: 22.5%; height: auto; }
        .picker__select--month:focus, .picker__select--year:focus                   { border-color: #0089ec; }
        .picker__nav--prev, .picker__nav--next                                      { position: absolute; padding: .5em 1.25em; width: 1em; height: 1em; box-sizing: content-box; top: -0.25em; }
        @media (min-width: 24.5em){.picker__nav--prev, .picker__nav--next           { op: -0.33em; }}
        .picker__nav--prev                                                          { left: -1em; padding-right: 1.25em; }
        @media (min-width: 24.5em){.picker__nav--prev                               { padding-right: 1.5em; }}
        .picker__nav--next                                                          { right: -1em; padding-left: 1.25em; }
        @media (min-width: 24.5em){.picker__nav--next                               { padding-left: 1.5em; }}
        .picker__nav--prev:before, .picker__nav--next:before                        { content: " "; border-top: .5em solid transparent; border-bottom: .5em solid transparent; border-right: 0.75em solid #000; width: 0; height: 0; display: block; margin: 0 auto; }
        .picker__nav--next:before                                                   { border-right: 0; border-left: 0.75em solid #000; }
        .picker__nav--prev:hover, .picker__nav--next:hover                          { cursor: pointer; color: #000; background: #b1dcfb; }
        .picker__nav--disabled, .picker__nav--disabled:hover,
        .picker__nav--disabled:before, .picker__nav--disabled:before:hover          { cursor: default; background: none; border-right-color: #f5f5f5; border-left-color: #f5f5f5; }
        .picker__table                                                              { text-align: center; border-collapse: collapse; border-spacing: 0; table-layout: fixed; font-size: 18px; width: 100%; margin-top: .75em; margin-bottom: .5em; }
        @media (min-height: 33.875em){.picker__table                                { margin-bottom: .75em; }}
        .picker__table td                                                           { margin: 0; padding: 0; border-right: 1px solid rgba(0, 0, 0, 0.2); border-bottom: 1px solid rgba(0, 0, 0, 0.2); }
        .picker__table td:last-child                                                { border-right: none; }
        .picker__table tr:last-child > *                                            { border-right: none; border-bottom: none; border-left: none; }
        .picker__weekday                                                            { width: 14.285714286%; font-size: 18px; padding-bottom: .25em; color: #999; font-weight: 500; }
        @media (min-height: 33.875em){.picker__weekday                              { padding-bottom: .5em; }}
        .picker__day                                                                { padding: .3125em 0; font-weight: 200; border: 1px solid transparent; }
        .picker__day--today                                                         { position: relative; }
        .picker__day--today:before                                                  { content: " "; position: absolute; top: 2px; right: 2px; width: 0; height: 0; border-top: 0.5em solid #0059bc; border-left: .5em solid transparent; }
        .picker__day--disabled:before                                               { border-top-color: #aaa; }
        .picker__day--outfocus                                                      { color: #ddd; }
        .picker__day--infocus:hover, .picker__day--outfocus:hover                   { cursor: pointer; color: #000; background: #b1dcfb; }
        .picker__day--highlighted                                                   { border-color: #0089ec; }
        .picker__day--highlighted:hover, .picker--focused .picker__day--highlighted { cursor: pointer; color: #000; background: #b1dcfb; }
        .picker__day--selected, .picker__day--selected:hover,
        .picker--focused .picker__day--selected                                     { background: #0089ec; color: #fff; }
        .picker__day--disabled, .picker__day--disabled:hover,
        .picker--focused .picker__day--disabled                                     { background: #f5f5f5; border-color: #f5f5f5; color: #ddd; cursor: default; }
        .picker__day--highlighted.picker__day--disabled,
        .picker__day--highlighted.picker__day--disabled:hover                       { background: #bbb; }
        .picker__footer                                                             { text-align: center; }
        .picker__button--today, .picker__button--clear, .picker__button--close      { border: 1px solid #fff; background: #fff; font-size: .8em; padding: .66em 0; font-weight: bold; width: 33%; display: inline-block; vertical-align: bottom; }
        .picker__button--today:hover, .picker__button--clear:hover,
        .picker__button--close:hover                                                { cursor: pointer; color: #000; background: #b1dcfb; border-bottom-color: #b1dcfb; }
        .picker__button--today:focus, .picker__button--clear:focus,
        .picker__button--close:focus                                                { background: #b1dcfb; border-color: #0089ec; outline: none; }
        .picker__button--today:before, .picker__button--clear:before, 
        .picker__button--close:before                                               { position: relative; display: inline-block; height: 0; }
        .picker__button--today:before, .picker__button--clear:before                { content: " "; margin-right: .45em; }
        .picker__button--today:before                                               { top: -0.05em; width: 0; border-top: 0.66em solid #0059bc; border-left: .66em solid transparent; }
        .picker__button--clear:before                                               { top: -0.25em; width: .66em; border-top: 3px solid #e20; }
        .picker__button--close:before                                               { content: "×"; top: -0.1em; vertical-align: top; font-size: 1.1em; margin-right: .35em; color: #777; }
        .picker__button--today[disabled],.picker__button--today[disabled]:hover     { background: #f5f5f5; border-color: #f5f5f5; color: #ddd; cursor: default; }
        .picker__button--today[disabled]:before                                     { border-top-color: #aaa; }
      `;

      objHeaderTemplate.innerHTML = 
      `
        <div part="k2go-head-top-bar">
          <div part="k2go-head-left">
            <span part="k2go-timeline-logo">Timeline</span>
          </div>
          <div part="k2go-head-center">
            <span part="k2go-head-date-box">
              <span part="k2go-head-cal"></span>
              <span part="k2go-head-date">0000-00-00 00:00:00</span>
              <span part="k2go-head-time-btn" class="timeCurrent"></span>
            </span>
          </div>
          <div part="k2go-head-right"></div>
        </div>
      `;

      headerShadowRoot.appendChild(objHeaderStyle);
      headerShadowRoot.appendChild(objHeaderTemplate.content.cloneNode(true));

      this.#headerElement      = document.querySelector('k2go-timelineheader');
      this.#timebtnElement     = this.#headerElement.shadowRoot.querySelector("[part='k2go-head-time-btn']");
      this.#calendarbtnElement = this.#headerElement.shadowRoot.querySelector("[part='k2go-head-cal']");
      this.#calendardate       = this.#headerElement.shadowRoot.querySelector("[part='k2go-head-date']");
    }
    /*-----* shadow dom functionbar *--------------------------------------------------------------*/
    if (this.#enableFunctionBar)
    {
      const barShadow      = document.querySelector("k2go-functionbar");
      const barShadowRoot  = barShadow.attachShadow({ mode: 'open' });
      const objBarStyle    = document.createElement("style");
      const objBarTemplate = document.createElement("template");

      objBarStyle.textContent = 
      `
        [part="k2go-function-bar"]                                { position: fixed; top: 76px; width: 100%; height: 60px; background: #292d3e; display: grid; grid-template-columns: 240px 1fr 240px; justify-content: space-around; align-items: center; font-family: Monda, sans-serif; color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.5);}
        [part="k2go-left"]                                        { font-size: 11px; padding: 0 0 0 10px; display: block;}
        [part="k2go-button-select-data"]                          { background: url(img/ic_folder.svg) no-repeat center left; background-size: 16px 16px; padding: 0 0 0 20px; margin: 0 0.5em 0 0; cursor: pointer; transition: 0.3s;}
        [part="k2go-button-select-data"]:hover                    { color: rgba(255, 255, 255, 0.5); }   
        [part="k2go-button-view-url"]                             { background: url(img/ic_link.svg) no-repeat center left; background-size: 16px 16px; padding: 0 0 0 20px; margin: 0 0.5em 0 0; cursor: pointer; }
        [part="k2go-button-view-url"]:hover                       { color: rgba(255, 255, 255, 0.5); }    
        [part="k2go-button-help"]                                 { background: url(img/ic_help.svg) no-repeat center left; background-size: 16px 16px; padding: 0 0 0 20px; margin: 0 1em 0 0; cursor: pointer; transition: 0.3s;}
        [part="k2go-button-help"]:hover                           { color: rgba(255, 255, 255, 0.5); }
        [part="k2go-center"]                                      { width: 380px; margin: 0 auto 0; box-sizing: border-box; display: block;} 
        [part="k2go-play-box"]                                    { display: grid; grid-template-columns: 35px 1fr 35px; justify-content: center; align-items: center; gap: 4px; width: 360px; height: 36px; margin: 0 auto 0; padding: 0; box-sizing: border-box;} 
        [part="k2go-play-box"].disable2                           { pointer-events: none; }
        [part="k2go-play-box"] a                                  { display: block; width: 35px; height: 35px; cursor: pointer; }
        [part="k2go-button-loop"]                                 { visibility: hidden; display: block; width: 36px; height: 36px; border-radius: 50%; background: url(img/play_loop.svg) no-repeat center center rgba(27, 30, 43, 0.8); background-size: 20px 20px; margin: 0; padding: 0; cursor: pointer; }
        [part="k2go-button-loop"]:active                          { opacity: 0.5; transform: scale(0.9); }
        [part="k2go-button-loop"].active                          { display: block; background: url(img/play_loop_active.svg) no-repeat center center rgba(27, 30, 43, 0.8); background-size: 20px 20px; }
        [part="k2go-play-ctl"]                                    { display: flex; justify-content: center; align-items: center; width: 280px; height: 36px; margin: 0; padding: 0; background: rgba(27, 30, 43, 0.8); border-radius: 18px; transition: 0.3s; }  
        [part="k2go-button-back-edge"]                            { display: block; background: url(img/play_edge.svg) no-repeat center center; background-size: 30px 30px; transform: rotate(180deg); }
        [part="k2go-button-back-edge"]:active                     { opacity: 0.5; transform: scale(0.9) rotate(180deg); }
        [part="k2go-button-back"]                                 { display: block; background: url(img/play_frame.svg) no-repeat center center; background-size: 30px 30px; transform: rotate(180deg); }
        [part="k2go-button-back"]:active                          { opacity: 0.5; transform: scale(0.9) rotate(180deg); }
        [part="k2go-button-play-reverse"]                         { display: block; background: url(img/play_play.svg) no-repeat center center; background-size: 30px 30px; position: relative; font-size: 13px; transform: rotate(180deg); }
        [part="k2go-button-play-reverse"] span                    { font-family: 'VT323', monospace; display: table-cell; vertical-align: middle; margin: 0; padding: 0; width: 13px; height: 13px; border-radius: 50%; font-size: 13px; line-height: 13px; position: absolute; top: 20px; left: 23px; color: var(--active-color); text-align: center; user-select: none; transform: rotate(180deg); }    
        [part="k2go-button-play-reverse"].play_frame_rev          { background: url(img/play_play_active.svg) no-repeat center center; background-size: 30px 30px; transform: rotate(180deg); }
        [part="k2go-button-play-reverse"]:active                  { opacity: 0.5; }
        [part="k2go-button-play-reverse"].active                  { background: url(img/play_play_active.svg) no-repeat center center; background-size: 30px 30px; transform: rotate(180deg); }
        [part="k2go-button-stop"]                                 { display: block; background: url(img/play_stop.svg) no-repeat center center; background-size: 30px 30px; }
        [part="k2go-button-stop"]:active                          { opacity: 0.5; transform: scale(0.9); }
        [part="k2go-button-play"]                                 { display: block; background: url(img/play_play.svg) no-repeat center center; background-size: 30px 30px; position: relative; font-size: 13px;}
        [part="k2go-button-play"].play_frame                      { background: url(img/play_play_active.svg) no-repeat center center; background-size: 30px 30px; }
        [part="k2go-button-play"] span                            { font-family: 'VT323', monospace; display: table-cell; vertical-align: middle; margin: 0; padding: 0; width: 13px; height: 13px; border-radius: 50%; font-size: 13px; line-height: 13px; position: absolute; top: 3px; left: 24px; color: var(--active-color); text-align: center; user-select: none; transition: 0.3s; }
        [part="k2go-button-play"]:active                          { opacity: 0.5; transform: scale(0.9); }
        [part="k2go-button-fwd"]                                  { display: block; background: url(img/play_frame.svg) no-repeat center center; background-size: 30px 30px;}
        [part="k2go-button-fwd"]:active                           { opacity: 0.5; transform: scale(0.9); }
        [part="k2go-button-fwd-edge"]                             { display: block; background: url(img/play_edge.svg) no-repeat center center; background-size: 30px 30px; }
        [part="k2go-button-fwd-edge"]:active                      { opacity: 0.5; transform: scale(0.9); }
        [part="k2go-button-conf"]                                 { display: block; width: 36px; height: 36px; border-radius: 50%; margin: 0; padding: 0; background: url(img/play_conf.svg) no-repeat center center rgba(27, 30, 43, 0.8); background-size: 18px 18px; cursor: pointer;}
        [part="k2go-button-conf"].active                          { display: block; background: url(img/play_conf_yellow.svg) no-repeat center center rgba(27, 30, 43, 0.8); background-size: 18px 18px; }
        [part="k2go-button-conf"]:active                          { opacity: 0.5; transform: scale(0.9); }
        [part="k2go-right"]                                       { font-size: 12px; padding: 0 15px; margin: 0 0 0 auto; position: relative; display: grid; grid-template-rows: 20px 1fr; align-items: center; justify-content: center; }
        [part="k2go-slider-label"]                                { width: 80px; height: 18px; display: grid; align-items: center; border-radius: 10px; background: rgba(0, 0, 0, 0.3); margin: 0 auto 0; text-align: center; font-family: Monda, sans-serif; font-size: 10px; }
        [part="k2go-slider"]                                      { width: 100%; height: 30px; display: grid; grid-template-columns: 24px 1fr 24px; align-items: center; justify-content: center; box-sizing: border-box; grid-column-gap: 5px; }
        [part="k2go-slider"].disable1                             { opacity: 0.2; pointer-events: none; }
        [part="k2go-slider"].disable2                             { pointer-events: none; }
        [part="k2go-button-minus"]                                { width: 24px; height: 24px; background: url(img/ic_minus.svg) no-repeat center center; background-size: 18px 18px; cursor: pointer; }
        [part="k2go-button-minus"]:active                         { opacity: 0.5; transform: scale(0.9); }
        [part="k2go-zoom-range"]                                  { -webkit-appearance: none; appearance: none; background-color: rgba(0, 0, 0, 0.5); height: 3px; width: 150px; border-radius: 1.5px; margin: 0 auto 0; }
        [part="k2go-button-plus"]                                 { width: 24px; height: 24px; background: url(img/ic_plus.svg) no-repeat center center; background-size: 18px 18px; cursor: pointer; }
        [part="k2go-button-plus"]:active                          { opacity: 0.5; transform: scale(0.9); }
        .disable                                                  { pointer-events:none; opacity:0.5; }
        @keyframes zoomIn                                         { 0% { opacity: 0; display: grid; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
        [part="k2go-panel-conf"]                                  { box-sizing: border-box; display: none; grid-template-rows: 30px 1fr; width: 460px; /* height: 165px; */ border-radius: 4px; position: absolute; z-index : ; top: 145px; left: calc(50% - 460px / 2); background: rgba(30,33,46,0.9); box-shadow: 0 2px 14px 0px rgba(0, 0, 0, 0.4); }
        [part="k2go-panel-conf"].active                           { animation: zoomIn cubic-bezier(0.075, 0.82, 0.165, 1) 0.6s; display: grid;}
        [part="k2go-panel-conf-header"]                           { box-sizing: border-box; display: grid; grid-template-columns: 1fr 20px; align-items: center; justify-content: space-between; padding: 4px 10px; width: 100%; height: 30px; border-radius: 4px 4px 0 0; font-size: 12px; color: #85a1c8; background: #0c0e26; cursor: pointer; }
        [part="k2go-panel-conf-header"] span:first-child::before  { content: ""; width: 24px; height: 18px; display: inline-block; vertical-align: middle; background: url(img/play_conf_blue.svg) no-repeat left -2px; background-size: contain; }
        [part="k2go-panel-conf-header"] span:nth-child(2)::before { content: ""; width: 16px; height: 16px; display: inline-block; vertical-align: middle; background: url(img/ic_close2.svg) no-repeat left center; background-size: contain; }
        [part="k2go-play-range-col"]                              { display: block; width: 100%; }
        @keyframes blink                                          { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; }}
        [part="k2go-form-title-play-speed"]                       { display: grid; grid-template-columns: 110px 1fr 100px; align-items: center; height: 25px; gap: 10px; margin: 10px 0 0 0; }
        [part="k2go-form-title-play-speed-title"]                 { border-right: solid 1px #85a1c8; text-align: right; padding: 0 16px 0 0; box-sizing: border-box; font-size: 11px; color: #fff; user-select: none; }
        [part="k2go-form-title-play-speed-title"]::before         { content: ""; vertical-align: middle; display: inline-block; width: 16px; height: 25px; background: url(img/play_play.svg) no-repeat center center; background-size: 16px 16px; }
        [part="k2go-form-title-play-speed-title"].fx              { animation: blink 0.4s 3 forwards; }
        .input-area                                               { display: grid; align-items: center; }
        .input-area input                                         { width: 100%; }
        .input-range[type="range"]                                { -webkit-appearance: none; appearance: none; background-color: rgba(0, 0, 0, 0.5); height: 3px; width: 150px; border-radius: 1.5px; margin: 0 auto 0; }
        .input-range[type="range"]:focus,.input-range[type="range"]:active { outline: none }
        .input-range[type="range"]::-webkit-slider-thumb          { -webkit-appearance: none; appearance: none; cursor: pointer; position: relative; width: 20px; height: 20px; display: block; background: #fff; border-radius: 50%; box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3); }
        .input-range-not-active[type="range"]                     { -webkit-appearance: none; appearance: none; background-color: #adb1b6; height: 3px; width: 120px; border-radius: 1.5px; margin: 0 auto 0; pointer-events: none; }
        input[type="range"]::-ms-tooltip                          { display: none; }
        input[type="range"]::-moz-range-track                     { height: 0; }
        input[type="range"]                                       { -webkit-appearance: none; appearance: none; cursor: pointer; outline: none; height: 2px; width: 100%; background: #85a1c8; border-radius: 2px; }
        input[type="range"]:disabled                              { background: rgba(255, 255, 255, 0.3); }
        input[type="range"]::-webkit-slider-thumb                 { -webkit-appearance: none; background: #fff; width: 16px; height: 16px; border-radius: 50%; }
        input[type="range"]:disabled::-webkit-slider-thumb        { background: rgba(255, 255, 255, 0.3); }
        input[type="range"]::-moz-range-thumb                     { background: #85a1c8; width: 16px; height: 16px; border-radius: 50%; border: none; }
        input[type="range"]:disabled:-moz-range-thumb             { background: rgba(255, 255, 255, 0.3); }
        input[type="range"]::-moz-focus-outer                     { border: 0; }
        input[type="range"]:active::-webkit-slider-thumb          { background: rgba(255, 255, 255, 0.7)}
        [part="k2go-display"]                                     { color: #fff; background: rgba(0,0,0,0.6); width: 90px; height: 25px; display: grid; align-items: center; text-align: center; border-radius: 4px; font-family: Monda, sans-serif; font-size: 12px; }
        #display3                                                 { display: grid; grid-template-columns: auto auto; justify-content: center; }
        [part="k2go-form-title-play-span"]                        { display: grid; grid-template-columns: 110px 1fr 100px; align-items: center; height: 25px; gap: 10px; margin: 10px 0 10px 0; }
        [part="k2go-form-title-play-span-title"]                  { border-right: solid 1px #85a1c8; text-align: right; padding: 0 16px 0 0; box-sizing: border-box; font-size: 11px; color: #fff; user-select: none; }
        [part="k2go-form-title-play-span-title"]::before          { content: ""; vertical-align: middle; display: inline-block; width: 18px; height: 25px; background: url(img/play_frame.svg) no-repeat center center; background-size: 18px 18px; }
        [part="k2go-form-title-play-span-title"].fx               { animation: blink 0.4s 3 forwards; }
        .form-title-disable                                       { color: rgba(255, 255, 255, 0.4) } 
        .form-title-disable::before                               { opacity: 0.3; }
        .selector-disable                                         { opacity: 0.3; pointer-events: none; }
        [part="k2go-view-url"]                                    { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; background: rgba(0,0,0,0.75); }
        [part="k2go-view-url-box"]                                { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50%; background: #1b1e2b; z-index: 11; border-radius: 10px; box-shadow: 0 2px 16px rgba(0,0,0,0.8); box-sizing: border-box; padding: 20px; }
        [part="k2go-view-url-box-header"]                         { display: grid; grid-template-columns: 1fr 30px; align-items: center; width: 100%; height: auto; border-radius: 10px 10px  0 0; box-sizing: border-box; font-family: "Monda", sans-serif; font-size: 18px; }
        [part="k2go-view-url-box-title"]                          { font-weight: 700; color: #fff; }
        [part="k2go-view-url-box-close"]                          { width: 24px; height: 24px; cursor: pointer; }
        [part="k2go-view-url-box-close"]::after                   { content: ""; width: 24px; height: 24px; background: url(img/ic_close.svg) no-repeat center center; display: inline-block; background-size: contain; }
        [part="k2go-input-group"]                                 { display: grid; width: 100%; grid-template-columns: 1fr 40px; margin: 20px 0 0 0; }
        [part="k2go-input-group"] input                           { width: 100%; height: 40px; margin: 0px 0 20px 0; padding: 10px; font-size: 16px; box-sizing: border-box; background: rgba(0,0,0,0.4); border: none; color: #fff; border-radius: 6px 0 0 6px; border: solid 1px #fff; border-right: none; }
        [part="k2go-input-group-button"]                          { width: 40px; height: 40px; border-radius: 0 6px 6px 0; border: solid 1px #fff; box-sizing: border-box; cursor: pointer; }
        [part="k2go-input-group-button"]:hover                    { background: #000; }
        [part="k2go-input-group-button"]::after                   { content: ""; width: 40px; height: 40px; background: url(img/ic_copy.svg) no-repeat center center; display: inline-block; background-size: 20px 20px; }
        [part="k2go-lockWindow"]                                  { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; }
        [part="k2go-lockWindow"].show                             { display: block; }
        @media screen and (max-width: 820px)                      { [part="k2go-left"] { display: none; } [part="k2go-right"] { display: none; } [part="k2go-function-bar"] { grid-template-columns: 1fr; } }
      `;

      objBarTemplate.innerHTML = 
      `
        <div part="k2go-function-bar">
          <div part="k2go-left">
            <a part="k2go-button-select-data">Select Data</a>
            <a part="k2go-button-view-url">View URL</a>
            <a part="k2go-button-help">HELP</a>
          </div>
          <div part="k2go-center">
            <div part="k2go-play-box">
              <span part="k2go-button-loop"></span>
              <div part="k2go-play-ctl">
                <a part="k2go-button-back-edge"></a>
                <a part="k2go-button-back"></a>
                <a part="k2go-button-play-reverse"><span></span></a>
                <a part="k2go-button-stop"></a>
                <a part="k2go-button-play"><span></span></a>
                <a part="k2go-button-fwd"></a>
                <a part="k2go-button-fwd-edge"></a>
              </div>
              <div part="k2go-button-conf" class=""></div>
            </div>
          </div>
          <div part="k2go-right">
            <div part="k2go-slider-label">1 day</div>
            <div part="k2go-slider">
              <a part="k2go-button-minus"></a>
              <input part="k2go-zoom-range" type="range" class="input-range" min="0" step="1" max="18"/>
              <a part="k2go-button-plus"></a>
            </div>
          </div>
        </div>

        <div part="k2go-panel-conf" class="ui-draggable ui-draggable-handle">
          <div part="k2go-panel-conf-header">
            <span>再生設定</span>
            <span part="k2go-panel-conf-close"></span>
          </div>
          <div part="k2go-play-range-col">
            <div part="k2go-form-title-play-speed">
              <div part="k2go-form-title-play-speed-title">コマ送り速度</div>
              <div part="k2go-play-speed-wrapper" class="input-area">
                <input type="range" part="k2go-play-speed" min="1" step="1" max="6" value="2">
              </div>
              <div part="k2go-display" id="display1">1 Sec</div>
            </div>
          </div>
          <div part="k2go-form-title-play-span">
            <div part="k2go-form-title-play-span-title">コマ送り間隔</div>
            <div class="input-area">
              <input type="range" part="k2go-play-span" min="1" step="1" max="8" value="1">
            </div>
            <div part="k2go-display" id="display2">1.0 min</div>
          </div>
        </div>

        <div part="k2go-view-url">
          <div part="k2go-view-url-box">
            <div part="k2go-view-url-box-header">
              <div part="k2go-view-url-box-title">ViewURL</div>
              <div part="k2go-view-url-box-close"></div>
            </div>
            <div part="k2go-view-url-box-body">
              <div part="k2go-input-group">
                <input type="text" value="" aria-label="" readonly="" part="k2go-view-url-input">
                <div part="k2go-input-group-button"></div>
              </div>
            </div>
          </div>
        </div>
        <div part="k2go-lockWindow"></div>
      `;

      barShadowRoot.appendChild(objBarStyle);
      barShadowRoot.appendChild(objBarTemplate.content.cloneNode(true));

      this.#functionbarElement              = document.querySelector('k2go-functionbar');
      /* panel */
      this.#buttonConfElement               = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-conf']");
      this.#panelConfElement                = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-panel-conf']");
      this.#panelConfCloseElement           = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-panel-conf-close']");
      this.#playspeedElement                = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-play-speed']");
      this.#playspanElement                 = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-play-span']"); 
      this.#display1Element                 = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-display']#display1");
      this.#display2Element                 = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-display']#display2");
      /* zoomrange */
      this.#zoomrangeElement                = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-zoom-range']");
      this.#buttonminusElement              = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-minus']");
      this.#buttonplusElement               = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-plus']");
      this.#sliderElement                   = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-slider']");
      this.#sliderlabelElement              = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-slider-label']");
      /* selectData */
      this.#selectDataElement               = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-select-data']");
      /* viewURL */
      this.#buttonviewurlElement            = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-view-url']");
      this.#viewurlinputElement             = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-view-url-input']");
      this.#viewurlElement                  = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-view-url']");
      this.#inputgroupbuttonElement         = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-input-group-button']");
      this.#viewurlboxcloseElement          = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-view-url-box-close']");
      this.#lockwindowElement               = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-lockWindow']");
      /* help */
      this.#helpElement                     = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-help']");
      /* playbutton */
      this.#formtitleplayspeedtitleElement  = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-form-title-play-speed-title']");
      this.#formtitleplayspantitleElement   = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-form-title-play-span-title']");
      this.#buttonloopElement               = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-loop']");
      this.#playboxElement                  = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-play-box']");
      this.#buttonbackedgeElement           = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-back-edge']");
      this.#buttonbackElement               = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-back']");
      this.#buttonplayreverseElement        = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-play-reverse']");
      this.#buttonstopElement               = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-stop']");
      this.#buttonplayElement               = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-play']");
      this.#buttonfwdElement                = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-fwd']");
      this.#buttonfwdedgeElement            = this.#functionbarElement.shadowRoot.querySelector("[part='k2go-button-fwd-edge']");
    }
    /*-----* event *--------------------------------------------------------------*/
      this.addEventListener("contextmenu", (pEvent) => { pEvent.preventDefault(); pEvent.stopPropagation(); });
      this.#setLoadEvent();
      this.#setWindowEvent();
      this.#setMainEvent(true);
      this.#setMainEvent(false);
      this.#setPickKnobEvent();
      this.#setPickEvent    (true);
      this.#setPickEvent    (false);
      this.#setRailEvent();
      this.#setMainEvent();
      this.#setRange();
      this.#setRangeEvent();
      this.#setHeaderEvent();
      this.#setCalendarEvent();
      this.#setFunctionbarEvent();
      this.#setRangeEvent();
      this.#setPanelEvent();
      this.#setPlayboxEvent();
      this.#setZoomRangeEvent();
      this.#setSelectDataEvent();
      this.#setViewurlEvent();
      this.#setHelpEvent();
  }
  /******************************************************************************/
  /* #setLoadEvent                                                              */
  /******************************************************************************/
  #setLoadEvent()
  {
    window.addEventListener("load", (pEvent) => 
    {
      if (window.location.search.length > 1)
      {       
        let objGetQueryString = this.#getQueryString(window.location.search);
       
        if ( typeof objGetQueryString.st == "string" && objGetQueryString.st.match(/^[\d\-]+$/) ) Env.startTime   = new Date(parseInt(objGetQueryString.st, 10));
        if ( typeof objGetQueryString.et == "string" && objGetQueryString.et.match(/^[\d\-]+$/) ) Env.endTime     = new Date(parseInt(objGetQueryString.et, 10));
        if ( typeof objGetQueryString.ct == "string" && objGetQueryString.ct.match(/^[\d\-]+$/) ) Env.currentTime = new Date(parseInt(objGetQueryString.ct, 10));
       
      };

      this.#startTime   = Env.startTime;
      this.#endTime     = Env.endTime;
      this.#currentTime = Env.currentTime;
      this.#minTime     = Env.minTime;
      this.#maxTime     = Env.maxTime;

      const objTimeInfo =
      {
        startTime   : new Date(this.#startTime  .getTime()),
        endTime     : new Date(this.#endTime    .getTime()),
        currentTime : new Date(this.#currentTime.getTime()),
        minTime     : new Date(this.#minTime    .getTime()),
        maxTime     : new Date(this.#maxTime    .getTime())
      };

      this.create( objTimeInfo, 500,
                   function callback()
                   {
                     this.dispatchEvent(new CustomEvent("create"));
                   }
      );
      
      if (this.#enableFunctionBar && !this.#panelConfElement.classList.contains("active"))
      {
        this.#buttonConfElement.classList.add("active");
        this.#panelConfElement .classList.add("active");  
      }

      let $this = this;      
      let onMouseMove = function(event)
      {
        let x = event.clientX;
        let y = event.clientY;
        let width = $this.#panelConfElement.offsetWidth;
        let height = $this.#panelConfElement.offsetHeight;
        $this.#panelConfElement.style.top  = (y-height/2 - 25) + "px";
        $this.#panelConfElement.style.left = (x-width/2) + "px";
      }
      if (this.#enableFunctionBar)
      {
        let inputs = this.#panelConfElement.querySelectorAll('input');
        inputs.forEach(function(input) {
          input.addEventListener('mousedown', function(event) {
              event.stopPropagation();
          });
        });

        this.#panelConfElement.addEventListener("mouseup" , (event) =>
        {
          document.removeEventListener("mousemove",onMouseMove);
        });
        this.#panelConfElement.addEventListener("mousedown" , (event) =>
        {
          event.preventDefault();
          document.addEventListener("mousemove",onMouseMove);
        });

        this.#playspanElement .setAttribute("max"      ,  Env.playSpanTable.length  );
        this.#playspanElement .setAttribute("value"    ,  Env.playSpanTableDefault  );
        this.#playspeedElement.setAttribute("max"      ,  Env.playTable.length      );
        this.#playspeedElement.setAttribute("value"    ,  Env.playTableDefault      );

        let initialValue = Env.zoomTable.findIndex(item => item.name.trim() === "1 day");
        if (initialValue !== -1) { $this.#zoomrangeElement.value = initialValue; }

        setTimeout(() =>
        {
          $this.#setplayspan();
          $this.#setplayspeed();
        }, 100);
      }

      const objRailBound   = this.#railElement.getBoundingClientRect();
      this.#scale          = (this.#endTime.getTime() - this.#startTime.getTime()) / objRailBound.width;
      this.#rangeStartTime = new Date(this.#currentTime.getTime() - this.#mainElement.clientWidth / 16 * this.#scale);
      this.#rangeEndTime   = new Date(this.#currentTime.getTime() + this.#mainElement.clientWidth / 16 * this.#scale);
      this.dispatchEvent(new CustomEvent("rangeChange"));

      return;
    });
  }
  /******************************************************************************/
  /* #setWindowEvent                                                            */
  /******************************************************************************/
  #setWindowEvent()
  {
    window.addEventListener("resize", () =>
    {
      this.#cancelAttributeChanged = true;

      try
      {
        this.#endTime            = new Date(this.  #startTime.getTime() +  this.#scale * this.#railElement.getBoundingClientRect().width);
        this.#currentTime        = new Date(this.#currentTime.getTime() <= this.#endTime.getTime() ? this.#currentTime.getTime() : this.#endTime.getTime());
        this.dataset.    endTime = this.    #endTime.toISOString();
        this.dataset.currentTime = this.#currentTime.toISOString();

        this.#create  ();
        this.#setLabel();
        this.#moveRange();

        setTimeout(() => { this.dispatchEvent(new CustomEvent("resize")); }, 1);
      }
      catch(pError)
      {
        console.error("k2goTimeline window.resize error: " + pError);
      }
      finally
      {
        this.#cancelAttributeChanged = false;
      }
    });
  }
  /******************************************************************************/
  /* #setMainEvent                                                            */
  /******************************************************************************/
  #setMainEvent(pTouch)
  {
    /******************************************************************************/
    /* mainElement.mousemove                                                      */
    /******************************************************************************/
    this.#mainElement.addEventListener("mousemove", (pEvent) =>
    {
      if (!this.#rangeElement.classList.contains("k2go-timeline-range-show")) return;
      if (this.#rangeElement.offsetWidth > 0)
      {
        let intLeft  = this.#rangeElement.offsetLeft;
        let intRight = this.#rangeElement.offsetWidth + intLeft;

        if(!(intLeft <= pEvent.pageX && pEvent.pageX <= intRight)) this.#disableZoom  = true;
        else                                                       this.#disableZoom = false;
      }
    });
    /******************************************************************************/
    /* mainElement.wheel                                                          */
    /******************************************************************************/
    this.#barElement.addEventListener(this.#strMouseWheel, (pEvent) =>
    {
      if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault(); } else { if (pEvent.cancelable) pEvent.preventDefault(); }
      if (this.#disableZoom) return;
      if (this.#lock) return; else this.#lock = true;

      if (this.#mainElement.dataset.wheel == undefined)
      {
        clearTimeout(this.#mainElement.dataset.wheel);
      }
      else
      {
        setTimeout(() => { this.dispatchEvent(new CustomEvent("zoomStart")); }, 1);
      }

      const $this = this;
      let intDelta     = pEvent.deltaY ? -(pEvent.deltaY) : pEvent.wheelDelta ? pEvent.wheelDelta : -(pEvent.detail);
      let intScale     = this.#scale * 0.1 * (intDelta < 0 ? 1 : -1);
      let flgPickHover = false;

      $this.#pickElement.addEventListener('mouseover', function() 
      {
        if ($this.#pickElement.classList.contains("k2go-timeline-pick"))
        {
          flgPickHover = true;
          pEvent.stopPropagation();
        }
      });

      if (!flgPickHover) $this.#movePick(pEvent.pageX);      

      $this.#zoomBar(intScale);
      $this.#setLabel ();
      $this.#moveRange();
      
      this.#mainElement.dataset.wheel = setTimeout(() =>
      {
        setTimeout(() => { this.dispatchEvent(new CustomEvent("zoomEnd")); }, 1);
        this.adjustRangeBar();
        this.#mainElement.dataset.wheel = undefined;
      }, 500);

      this.#lock = false;
    });
    /******************************************************************************/
    /* bar.drag                                                                   */
    /******************************************************************************/
    /*-----* start *--------------------------------------------------------------*/
    this.#barElement.addEventListener(pTouch ? "touchstart" : "mousedown", (pEvent) =>
    {
      try
      {
        if (pTouch == undefined) return; 
        if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault (); pEvent.stopPropagation(); } 
                              else { if (pEvent.cancelable) pEvent.preventDefault(); pEvent.stopPropagation(); }
        if (this.#lock) return;

        let $this = this;
        let flgSingle  = this.#flgEvent ? (pEvent.touches.length == 1 ? true : false) : pTouch ? (pEvent.originalEvent.touches.length == 1 ? true : false) : true;
        let flgDouble  = this.#flgEvent ? (pEvent.touches.length == 2 ? true : false) : pTouch ? (pEvent.originalEvent.touches.length == 2 ? true : false) : false;
        let intBaseX1  = 0;
        let intBaseX2  = 0;
        let intMoveX1  = 0;
        let intMoveX2  = 0;
        let intBaseDis = 0;
        let intMoveDis = 0;
        let intX       = 0;
        let intScale   = 0;

        if (flgSingle)
        {
          intBaseX1 = this.#flgEvent ? pEvent.changedTouches[0].pageX : pTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX;

          if (this.#barElement.dataset.dblTap == "true")
          {
            if (!this.#disableZoom)
            {
              this.#movePick(intBaseX1);
              this.#flgTouch ? this.zoomIn() : (pEvent.which == 3 ? this.zoomOut() : this.zoomIn());
            }

            this.#mainElement.dataset.dblTap = "false";
            return;
          }
          else
          {
            if (this.#clickBarToMovePick) this.#movePick(intBaseX1);

            this.#barElement.dataset.dblTap = "true";
            this.#pickElement.dataset.drag   = "true";
            this.#pickKnobElement.dispatchEvent(new Event("mouseenter"));

            setTimeout(() => { this.dispatchEvent(new CustomEvent("barMoveStart", { detail:{ button:pEvent.button }}));
                               this.adjustCurrentTime();
                              }, 1);
          }
          setTimeout(() => { this.#barElement.dataset.dblTap = "false"; }, 300);
        }
        else if (flgDouble)
        {
          intBaseX1  = this.#flgEvent ? pEvent.touches[0].pageX : flgTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.touches[0].pageX;
          intBaseX2  = this.#flgEvent ? pEvent.touches[1].pageX : flgTouch ? pEvent.originalEvent.touches.item(1).pageX : pEvent.touches[1].pageX;
          intBaseDis = Math.sqrt(Math.pow(intBaseX1 - intBaseX2, 2));

          this.#barElement.dispatchEvent(new Event(pTouch ? "touchend" : "mouseup"));

          if (!this.#disableZoom) setTimeout(() => { this.dispatchEvent(new CustomEvent("zoomStart")); }, 1);
        }
        else
          return;
        /*-----* move *---------------------------------------------------------------*/
        const fncMove = (pEvent) => 
        {
          try
          {
            if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault(); } else { if (pEvent.cancelable) pEvent.preventDefault(); }

            flgSingle = this.#flgEvent ? (pEvent.touches.length == 1 ? true : false) : pTouch ? (pEvent.originalEvent.touches.length == 1 ? true : false) : true;
            flgDouble = this.#flgEvent ? (pEvent.touches.length == 2 ? true : false) : pTouch ? (pEvent.originalEvent.touches.length == 2 ? true : false) : false;

            if (flgSingle)
            {
              intMoveX1 = (this.#flgEvent ? pEvent.changedTouches[0].pageX : pTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX) - intBaseX1;
              intBaseX1 = (this.#flgEvent ? pEvent.changedTouches[0].pageX : pTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX);

              this.#moveBar  (intMoveX1, this.#syncPickAndBar);
              this.#setLabel ();
              this.#moveRange();

              setTimeout(() => { this.dispatchEvent(new CustomEvent("barMove")); }, 1);
            }
            else if (flgDouble && !this.#disableZoom)
            {
              intMoveX1  = this.#flgEvent ? pEvent.touches[0].pageX : pTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.touches[0].pageX;
              intMoveX2  = this.#flgEvent ? pEvent.touches[1].pageX : pTouch ? pEvent.originalEvent.touches.item(1).pageX : pEvent.touches[1].pageX;
              intMoveDis = Math.sqrt (Math.pow(intMoveX1 - intMoveX2, 2));

              if (Math.abs(intBaseDis - intMoveDis) >= 10)
              {
                intX       = Math.floor((intMoveX1 + intMoveX2) / 2);
                intScale   = this.#scale * 0.1 * (intMoveDis > intBaseDis ? -1 : 1);
                intBaseDis = intMoveDis;

                if (!this.#lock)
                {
                  this.#lock = true;
                  this.#movePick (intX);
                  this.#zoomBar  (intScale);
                  this.#setLabel ();
                  this.#moveRange();
                  this.#lock = false;
                }
              }
            }
          }
          catch(pError)
          {
            console.error("k2goTimeline bar.mousemove error: " + pError);
          }
        };

        document.addEventListener(pTouch ? "touchmove" : "mousemove", fncMove, { passive:false });
        /*-----* end *----------------------------------------------------------------*/
        const fncEnd = () =>
        {
          try
          {
            if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault(); } else { if (pEvent.cancelable) pEvent.preventDefault(); }

            this.#pickElement.dataset.drag = false;
            this.#pickKnobElement.dispatchEvent(new Event("mouseleave"));
            document.removeEventListener(pTouch ? "touchmove" : "mousemove", fncMove, { passive:false });
            document.removeEventListener(pTouch ? "touchend" : "mouseup", fncEnd, { passive:false });
            this.#setLabel();

            if (flgSingle)
            {
              setTimeout(() => { this.adjustRangeBar(); 
                                 this.dispatchEvent(new CustomEvent("barMoveEnd")); }, 1);
            }
            else if (flgDouble && !this.#disableZoom)
            {
              setTimeout(() => { this.adjustRangeBar(); 
                                 this.dispatchEvent(new CustomEvent("zoomEnd"));
                                }, 1);
            }
          }
          catch(pError)
          {
            console.error("k2goTimeline bar.mouseup error: " + pError);
          }
        };
        document.addEventListener(pTouch ? "touchend" : "mouseup", fncEnd);
        
        pEvent.stopPropagation();
      }
      catch(pError)
      {
        console.error("k2goTimeline mousedown error: " + pError);
      }
    });
  }
  /******************************************************************************/
  /* range.drag                                                                 */
  /******************************************************************************/
  #setRangeEvent(pTouch)
  {
    this.#rangeElement.addEventListener(pTouch ? "touchstart" : "mousedown", (pEvent) =>
    {
      try
      {
        /*-----* start *--------------------------------------------------------------*/
        if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault(); } else { if (pEvent.cancelable) pEvent.preventDefault(); }
        if (this.#lock) return;

        let intBaseX = this.#flgEvent ? pEvent.pageX : pTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX;
        let intMoveX = 0;
        let targetElement = this.#flgEvent ? pEvent.target : pEvent.target;

        setTimeout(() => { this.dispatchEvent(new CustomEvent("rangeMoveStart"));
                           this.adjustCurrentTime();
                           this.#getRangeInfo();}, 1);
        /*-----* move *---------------------------------------------------------------*/
        const fncMove = (pEvent) => 
        {
          try
          {
            if (this) { if (pEvent.cancelable) pEvent.preventDefault(); } else { if (pEvent.cancelable) pEvent.preventDefault(); }

            intMoveX = (this.#flgEvent ? pEvent.changedTouches[0].pageX : pTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX) - intBaseX;
            intBaseX = (this.#flgEvent ? pEvent.changedTouches[0].pageX : pTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX);

            if (this.#railElement.offsetLeft <= intBaseX && intBaseX <= this.#railElement.offsetLeft + this.#railElement.clientWidth)
            {
              if (targetElement.className == "k2go-timeline-range-left")       this.#moveRange(intMoveX, "left"  );
              else if (targetElement.className == "k2go-timeline-range-right") this.#moveRange(intMoveX, "right" );
              else                                                             this.#moveRange(intMoveX, "center");
              
              setTimeout(() => { this.dispatchEvent(new CustomEvent("rangeMove"));
                                 this.adjustCurrentTime();
                                 this.dispatchEvent(new CustomEvent("change"));
                                 this.dispatchEvent(new CustomEvent("rangeChange"));
                                }, 1);
            }
          }
          catch(pError)
          {
            console.error("k2goTimeline range.mousemove error: " + pError);
          }
        };
        document.addEventListener(pTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
        /*-----* end *----------------------------------------------------------------*/
        const fncEnd = () =>
        {
          try
          {
            if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault(); } else { if (pEvent.cancelable) pEvent.preventDefault(); }
          
            document.removeEventListener(pTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
            document.removeEventListener(pTouch ? "touchend"  : "mouseup",   fncEnd);

            setTimeout(() => {
                               this.#rangeMoveEnd();
                              }, 1);
          }
          catch(pError)
          {
            console.error("k2goTimeline range.mouseup error: " + pError);
          }
          
          pEvent.stopPropagation();
        };
        document.addEventListener(pTouch ? "touchend" : "mouseup", fncEnd);
      }
      catch(pError)
      {
        console.error("k2goTimeline range.mousedown error: " + pError);
      }
    });
  }
  /******************************************************************************/
  /* #setPickKnobEvent                                                          */
  /******************************************************************************/
  #setPickKnobEvent()
  {
    /*-----* mouseenter *---------------------------------------------------------*/
    this.#pickKnobElement.addEventListener("mouseenter", (pEvent) =>
    {
      try
      {
        if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault(); pEvent.stopPropagation(); } else { if (pEvent.cancelable) pEvent.preventDefault(); pEvent.stopPropagation(); }
        this.#pickLineElement.style.height = this.#pickLineElement.getBoundingClientRect().bottom - document.querySelector(this.#pickLineDistance).getBoundingClientRect()[this.#pickLinePosition] + "px";  
      }
      catch(pError)
      {
        console.error("k2goTimeline pick.mouseenter error: " + pError);
      }
    });
    /*-----* mouseleave *---------------------------------------------------------*/
    this.#pickKnobElement.addEventListener("mouseleave", (pEvent) =>
    {
      try
      {
        if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault(); pEvent.stopPropagation(); } else { if (pEvent.cancelable) pEvent.preventDefault(); pEvent.stopPropagation(); }
        if (this.#pickElement.dataset.drag != "true")
        {
          this.#pickLineElement.style.height = "";
        }
      }
      catch(pError)
      {
        console.error("k2goTimeline pick.mouseleave error: " + pError);
      }
    });
  }
  /******************************************************************************/
  /* #setPickEvent                                                              */
  /******************************************************************************/
  #setPickEvent(pTouch)
  {
    /******************************************************************************/
    /* pick.drag                                                                  */
    /******************************************************************************/
    this.#pickElement.addEventListener(pTouch ? "touchstart" : "mousedown", (pEvent) =>
    {
      try
      {
        /*-----* start *--------------------------------------------------------------*/
        if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault();       pEvent .stopPropagation(); }
                              else { if (pEvent.cancelable) pEvent.preventDefault(); pEvent.stopPropagation(); }
        if (this.#lock) return;

        const objRailBound = this.#railElement.getBoundingClientRect();
        let intStartX  = pTouch ? pEvent.changedTouches[0].pageX : pEvent.pageX;
        let intMoveX   = 0;
        let intTapHold = null;

        if (this.#pickElement.dataset.dblTap == "true")
        {
          if (!Env.pickDoubleTap) {
            setTimeout(() => {
              this.dispatchEvent(new CustomEvent("pickDoubleTap", { detail:{ touch: pTouch, mouseButton: pEvent.which }}))
            }, 1);
          }
          else
          {
            pTouch ? this.zoomIn() : (pEvent.which == 3 ? this.zoomOut() : this.zoomIn())
          }
          return;
        }
        else
        {
          this.#pickElement    .dataset.dblTap = "true";
          this.#pickElement    .dataset.drag   = "true";
          this.#pickKnobElement.dispatchEvent(new       Event("mouseenter"   ));
          this                 .dispatchEvent(new CustomEvent("pickMoveStart"));

          intTapHold = setTimeout(() =>
          {
            this.dispatchEvent(new CustomEvent("pickTapHold"));
            intTapHold = null;
          }, 1000);
        }

        setTimeout(() => { this.#pickElement.dataset.dblTap = "false"; }, 300);
        /*-----* move *---------------------------------------------------------------*/
        const fncMove = (pEvent) =>
        {
          if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault();        pEvent.stopPropagation();}
                                else { if (pEvent.cancelable) pEvent.preventDefault(); pEvent.stopPropagation();}

          intMoveX = pTouch ? pEvent.changedTouches[0].pageX : pEvent.pageX;

          if (objRailBound.left <= intMoveX && intMoveX <= objRailBound.right)
          {
            this.#movePick    (intMoveX);
            this.dispatchEvent(new CustomEvent("pickMove"));

            if (typeof intTapHold == "number" && Math.abs(intStartX - intMoveX) > 5)
            {
              clearTimeout(intTapHold);
              intTapHold = null;
            }
          }
        };

        document.addEventListener(pTouch ? "touchmove" : "mousemove", fncMove, { passive:false });
        /*-----* end *----------------------------------------------------------------*/
        const fncEnd = () =>
        {
          if (this.#flgEvent) { if (pEvent.cancelable)        pEvent.preventDefault(); pEvent.stopPropagation(); }
                                else { if (pEvent.cancelable) pEvent.preventDefault(); pEvent.stopPropagation(); }

          if (typeof intTapHold == "number")
          {
            clearTimeout(intTapHold);
            intTapHold = null;
          }

          this.#pickElement    .dataset.drag = "false";
          this.#pickKnobElement.dispatchEvent(new Event("mouseleave"));

          document.removeEventListener(pTouch ? "touchmove" : "mousemove", fncMove, { passive:false });
          document.removeEventListener(pTouch ? "touchend"  : "mouseup"  , fncEnd);
          
          this.dispatchEvent(new CustomEvent("pickMoveEnd"));
          this.adjustCurrentTime();

          if (this.#rangeElement.classList.contains("k2go-timeline-range-show"))
          {
            this.#create();
            this.#setLabel();
          }
        };

        document.addEventListener(pTouch ? "touchend" : "mouseup", fncEnd);
      }
      catch(pError)
      {
        console.error("k2goTimeline pick.mousedown error: " + pError);
      }
    });
  }
  /******************************************************************************/
  /* rail.click                                                                 */
  /******************************************************************************/
  #setRailEvent(pTouch)
  {
    this.#railElement.addEventListener(pTouch ? "touchstart" : "mousedown", (pEvent) =>
    {
      if(this.#railElement.style.pointerEvents == "none") return;

      try
      {
        if (this.#flgEvent) { if (pEvent.cancelable) pEvent.preventDefault();        pEvent.stopPropagation() }
                              else { if (pEvent.cancelable) pEvent.preventDefault(); pEvent.stopPropagation() }
        if (this.#lock) return;

        let intX = this.#flgEvent ? pEvent.pageX : pTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX;
        this.#movePick(intX);
        setTimeout(() => { this.dispatchEvent(new CustomEvent("railClick"));
                           this.adjustCurrentTime();
                          }, 1);
      }
      catch(pError)
      {
        console.error("k2goTimeline rail.click error: " + pError);
      }
    });
  }
  /******************************************************************************/
  /* observedAttributes                                                         */
  /******************************************************************************/
  static get observedAttributes()
  {
    return [
             "data-start-time",
             "data-end-time",
             "data-current-time",
             "data-max-time",
             "data-min-time",
             "data-timezone-offset",
             "data-jp-calendar",
             "data-label-position",
             "data-pick-line-distance",
             "data-pick-line-position"
           ];
  };
  /******************************************************************************/
  /* attributeChangedCallback                                                   */
  /******************************************************************************/
  attributeChangedCallback(pName, pOldValue, pNewValue)
  {
    if (this.#cancelAttributeChanged) return;

    if (pName == "data-start-time"  ) { const objDate = new Date(pNewValue); if (!Number.isNaN(objDate.getTime())) this.#startTime   = objDate; }
    if (pName == "data-end-time"    ) { const objDate = new Date(pNewValue); if (!Number.isNaN(objDate.getTime())) this.#endTime     = objDate; }
    if (pName == "data-current-time") { const objDate = new Date(pNewValue); if (!Number.isNaN(objDate.getTime())) this.#currentTime = objDate; }
    if (pName == "data-min-time"    ) { const objDate = new Date(pNewValue); if (!Number.isNaN(objDate.getTime())) this.#minTime     = objDate; }
    if (pName == "data-max-time"    ) { const objDate = new Date(pNewValue); if (!Number.isNaN(objDate.getTime())) this.#maxTime     = objDate; }

    if (pName == "data-timezone-offset") { if (pNewValue.match(/^[+-]?\d+$/) != null) this.#timezoneOffset = parseInt(pNewValue, 10); }

    if (pName == "data-jp-calendar"       ) this.#jpCalendar       = pNewValue == "true";
    if (pName == "data-label-position"    ) this.#labelPosition    = pNewValue;
    if (pName == "data-pick-line-distance") this.#pickLineDistance = pNewValue;
    if (pName == "data-pick-line-position") this.#pickLinePosition = pNewValue;

    clearTimeout(this.#thread);

    this.#thread = setTimeout(() =>
    {
      this.#checkTimeInfo({ minTime:this.#minTime, maxTime:this.#maxTime, startTime:this.#startTime, endTime:this.#endTime, currentTime:this.#currentTime });
      this.#create       ();
      this.#setLabel     ();
    }, 50);
  }
  /******************************************************************************/
  /* connectedCallback                                                          */
  /******************************************************************************/
  connectedCallback()
  {
    clearTimeout(this.#thread);

    this.#thread = setTimeout(() =>
    {
      this.#checkTimeInfo({ minTime:this.#minTime, maxTime:this.#maxTime, startTime:this.#startTime, endTime:this.#endTime, currentTime:this.#currentTime });
      this.#create       ();
      this.#setLabel     ();
    }, 50);
  }
  /******************************************************************************/
  /* create                                                                     */
  /******************************************************************************/
  create(pTimeInfo, pDuration)
  {
    clearTimeout(this.#thread);

    return new Promise((pResolve, pReject) =>
    {
      if (this.#lock) return this; else this.#lock = true; this.#cancelAttributeChanged = true;

      try
      {
        let   objTimeInfo = structuredClone(pTimeInfo);
        const objStepInfo = {};
        const $this       = this;
        const intNow      = Date.now();
        const pFunctions  = pDuration;

        if (typeof objTimeInfo != "object" || objTimeInfo == null) objTimeInfo = {};
        if (typeof pDuration   != "number" || pDuration   <=    0) pDuration   = 1;

        if (!(    "minTime" in objTimeInfo)) objTimeInfo.    minTime = new Date(this.    #minTime.getTime());
        if (!(    "maxTime" in objTimeInfo)) objTimeInfo.    maxTime = new Date(this.    #maxTime.getTime());
        if (!(  "startTime" in objTimeInfo)) objTimeInfo.  startTime = new Date(this.  #startTime.getTime());
        if (!(    "endTime" in objTimeInfo)) objTimeInfo.    endTime = new Date(this.    #endTime.getTime());
        if (!("currentTime" in objTimeInfo)) objTimeInfo.currentTime = new Date(this.#currentTime.getTime());

        this.#checkTimeInfo(objTimeInfo);

        this.#minTime.setTime(objTimeInfo.minTime.getTime());
        this.#maxTime.setTime(objTimeInfo.maxTime.getTime());

        this.dataset.minTime = this.#minTime.toISOString();
        this.dataset.maxTime = this.#maxTime.toISOString();

        objStepInfo.start   = (objTimeInfo.  startTime.getTime() - this.  #startTime.getTime()) / Math.ceil(pDuration / 50);
        objStepInfo.end     = (objTimeInfo.    endTime.getTime() - this.    #endTime.getTime()) / Math.ceil(pDuration / 50);
        objStepInfo.current = (objTimeInfo.currentTime.getTime() - this.#currentTime.getTime()) / Math.ceil(pDuration / 50);

        setTimeout(function _loop()
        {
          try
          {
            if (Date.now() - intNow < pDuration)
            {
              $this.  #startTime.setTime($this.  #startTime.getTime() + objStepInfo.start  );
              $this.    #endTime.setTime($this.    #endTime.getTime() + objStepInfo.end    );
              $this.#currentTime.setTime($this.#currentTime.getTime() + objStepInfo.current);

              $this.dataset.  startTime = $this.  #startTime.toISOString();
              $this.dataset.    endTime = $this.    #endTime.toISOString();
              $this.dataset.currentTime = $this.#currentTime.toISOString();

              $this.#create  ();
              $this.#setLabel();
              $this.#moveRange();

              setTimeout(_loop, 50);
            }
            else
            {
              $this.  #startTime.setTime(objTimeInfo.  startTime.getTime());
              $this.    #endTime.setTime(objTimeInfo.    endTime.getTime());
              $this.#currentTime.setTime(objTimeInfo.currentTime.getTime());

              $this.dataset.  startTime = $this.  #startTime.toISOString();
              $this.dataset.    endTime = $this.    #endTime.toISOString();
              $this.dataset.currentTime = $this.#currentTime.toISOString();

              $this.#create  ();
              $this.#setLabel();
              $this.#moveRange();

              $this.#lock                   = false;
              $this.#cancelAttributeChanged = false;

              if (typeof pFunctions == "function") setTimeout(function() { pFunctions(objTimeInfo); }, 1);
              pResolve();
            }
            $this.#setHeaderDate($this.#currentTime);
          }
          catch(pError)
          {
            $this.#lock                   = false;
            $this.#cancelAttributeChanged = false;

            console.error("k2goTimeline create error: " + pError);
          }
        }, 1);

      }
      catch(pError)
      {
        this.#lock                   = false;
        this.#cancelAttributeChanged = false;

        console.error("k2goTimeline create error: " + pError);
      }
    });
  }
  /******************************************************************************/
  /* #create                                                                    */
  /******************************************************************************/
  #create()
  {
    try
    {
      const objRailBound = this.#railElement.getBoundingClientRect();
      const objPickBound = this.#pickElement.getBoundingClientRect();
      const objBarBound  = this.#barElement .getBoundingClientRect();
      let   objTime      = new Date(this.#startTime.getTime());
      let   intLeft;

      this.#scale         = (this.#endTime.getTime() - this.#startTime.getTime()) / objRailBound.width;
      this.#scaleInterval = this.#getScaleInterval(this.#scale);

      this.#roundTime(objTime, this.#scaleInterval, this.#timezoneOffset);

      while (this.#barElement.firstChild)
      {
        this.#barElement.removeChild(this.#barElement.firstChild);
      }

      intLeft = (objTime.getTime() - this.#startTime.getTime()) / this.#scale;

      while (objTime.getTime() <= this.#endTime.getTime())
      {
        this.#barElement.insertAdjacentHTML("beforeend", `<span part="k2go-timeline-scale" data-time="${objTime.toISOString()}" style="left:${intLeft}px"></span>`);
        this.#incrementTime(objTime, this.#scaleInterval, this.#timezoneOffset);
        intLeft = (objTime.getTime() - this.#startTime.getTime()) / this.#scale;
      }

      if (this.#rangeElement.classList.contains("k2go-timeline-range-show"))
      {
        let barScale = (this.#endTime.getTime() - this.#startTime.getTime()) / objBarBound.width;

        if (this.#currentTime.getTime() > this.#rangeEndTime.getTime()) {
          this.#pickElement.style.left = (this.#rangeEndTime.getTime() - this.#startTime.getTime()) / barScale - objPickBound.width / 2 + "px";
          this.#currentTime.setTime(this.#rangeEndTime.getTime());
        }
        else if (this.#currentTime.getTime() < this.#rangeStartTime.getTime())
        {
          this.#pickElement.style.left = (this.#rangeStartTime.getTime() - this.#startTime.getTime()) / barScale + "px";
          this.#currentTime.setTime(this.#rangeStartTime.getTime());
        }
        else
        {
          this.#pickElement.style.left = (this.#currentTime.getTime() - this.#startTime.getTime()) / this.#scale - objPickBound.width / 2 + "px"; 
        }
      }
      else
      {
        this.#pickElement.style.left = (this.#currentTime.getTime() - this.#startTime.getTime()) / this.#scale - objPickBound.width / 2 + "px";
        this.#rangeStartTime = new Date(this.#currentTime.getTime() - this.#mainElement.clientWidth / 16 * this.#scale);
        this.#rangeEndTime   = new Date(this.#currentTime.getTime() + this.#mainElement.clientWidth / 16 * this.#scale);
      }

      this.dispatchEvent(new CustomEvent("change"));
      this.#setHeaderDate(this.#currentTime);
    }
    catch(pError)
    {
      console.error("k2goTimeline #create error: " + pError);
    }
  }
  /******************************************************************************/
  /* zoom                                                                       */
  /******************************************************************************/
  zoomIn()  { this.#zoom(-1); }  
  zoomOut() { this.#zoom( 1); }
  #zoom(pScale)
  {
    if (!pScale) return;
    const $this    = this;
    const objRailBound = this.#railElement.getBoundingClientRect();
    this.#scale = (this.#endTime.getTime() - this.#startTime.getTime()) / objRailBound.width;
    let intCounter = 0;

    if (this.#disableZoom) return this;
    if (this.#lock) return this;
    
    this.dispatchEvent(new CustomEvent("zoomStart"));

    if (this.#scale > 0) 
    {
      setTimeout(function _loop()
      {
        $this.#zoomBar($this.#scale * 0.1 * pScale);
        $this.#setLabel();
        $this.#moveRange();
        intCounter++;

        if (intCounter < 10)
        {
          setTimeout(_loop, 50);
        }
        else
        {
          $this.#setLabel();
          this.dispatchEvent(new CustomEvent("zoomEnd"));
          $this.adjustRangeBar();
          $this.#lock = false;
        }
      }, 1);
    }
  }
  /******************************************************************************/
  /* showRangeBar                                                               */
  /******************************************************************************/
  /*-----* show *---------------------------------------------------------------*/
  showRangeBar(pOptions)
  {
    let objTimeInfo = {};
    
    if (typeof pOptions == "object")
    {
      if (typeof pOptions.rangeStartTime == "object") objTimeInfo.startTime = new Date(pOptions.rangeStartTime.getTime());
      else                                            objTimeInfo.startTime = new Date(this.#rangeStartTime   .getTime());

      if (typeof pOptions.rangeEndTime   == "object") objTimeInfo.  endTime = new Date(pOptions.rangeEndTime.getTime());
      else                                            objTimeInfo.  endTime = new Date(this.#rangeEndTime   .getTime());
    }
    else
    {
      objTimeInfo.startTime = new Date(this.#rangeStartTime.getTime());
      objTimeInfo.  endTime = new Date(this.#rangeEndTime  .getTime());
    }

    objTimeInfo.currentTime = new Date(objTimeInfo.endTime.getTime());
    objTimeInfo.minTime     = new Date(this.#minTime.getTime());
    objTimeInfo.maxTime     = new Date(this.#maxTime.getTime());

    this.#checkTimeInfo(objTimeInfo);

    this.#rangeStartTime = objTimeInfo.startTime;
    this.#rangeEndTime   = objTimeInfo.  endTime;

    this.#rangeElement.classList.add("k2go-timeline-range-show");
    this.#moveRange();
  }
  /*-----* hidden *-------------------------------------------------------------*/
  hiddenRangeBar()
  {
    this.#rangeElement.classList.remove("k2go-timeline-range-show");
  }
  /******************************************************************************/
  /* play                                                                       */
  /******************************************************************************/
  start(pOptions)
  {
    let $main = this.#mainElement;
    let $bar  = this.#barElement;
    let $pick = this.#pickElement;
    let $this = this;

    $main.dataset.fps   = 1000 / (typeof pOptions.fps   == "number" ? pOptions.fps   : 10);
    $main.dataset.speed =        (typeof pOptions.speed == "number" ? pOptions.speed : 10);

    if ($this.#lock) return this; else $this.#lock = true;

    let now = $this.currentTime.getTime();
    setTimeout(function _loop()
    {
      if (!$this.#lock)
      {
        if (typeof pOptions.stop == "function") pOptions.stop();
        return;
      }

      /*-----* realtime *-----------------------------------------------------------*/
      if (pOptions.realTime)
      {
        let objTimeInfo = {};
        if (!$this.#enableRealtime) $this.dispatchEvent(new CustomEvent("setCustomData"));
        if($this.customImpl && $this.customImpl.appLatestTime)
        {
          let ml = $this.customImpl.appLatestTime();
          objTimeInfo.currentTime = new Date(ml);
        }
        else
        {
          objTimeInfo.currentTime = new Date();
        }

        if(objTimeInfo.currentTime > $this.currentTime.getTime())
        {
          objTimeInfo.startTime   = new Date(objTimeInfo.currentTime.getTime() - ($pick.offsetLeft + $pick.offsetWidth / 2) * $this.#scale);
          objTimeInfo.endTime     = new Date(objTimeInfo.  startTime.getTime() +  $bar.scrollWidth                          * $this.#scale);
  
          if (objTimeInfo.endTime >= $this.maxTime.getTime())
          {
            $this.#lock = false;
            if (typeof pOptions.stop == "function") pOptions.stop();
          }
          else
          {
            $this.#startTime   = objTimeInfo.startTime;
            $this.#endTime     = objTimeInfo.endTime;
            $this.#currentTime = objTimeInfo.currentTime;
            $this.#create   ();
            $this.#setLabel ();
            $this.#moveRange();
            setTimeout(_loop, parseInt($main.dataset.fps));
          }
        }
      }
      /*-----* range bar *----------------------------------------------------------*/
      else if ($this.#rangeElement.classList.contains("k2go-timeline-range-show"))
      {
        if ($this.currentTime < $this.rangeStartTime && parseInt($main.dataset.speed) > 0)
        {
          if ($this.rangeStartTime < $this.startTime
          ||  $this.rangeStartTime > $this.  endTime)
          {
                                                    $this.#startTime.setTime($this.rangeStartTime - ($pick.getBoundingClientRect().left + $pick.clientWidth / 2) * $this.#scale);
            if ( $this.startTime < $this.minTime )  $this.#startTime.setTime($this.       minTime);
                                                    $this.  #endTime.setTime($this.     startTime -  $bar.clientWidth                                            * $this.#scale);
            if ( $this.  endTime > $this.maxTime )  $this.  #endTime.setTime($this.       maxTime);
          }

          $this.#currentTime.setTime($this.rangeStartTime);
          $this.#create();
          $this.#setLabel();
          $this.#moveRange();
          setTimeout(_loop, parseInt($main.dataset.fps));
        }
        else if ($this.currentTime > $this.rangeEndTime && parseInt($main.dataset.speed) < 0)
        {
          if ($this.rangeEndTime < $this.startTime
          ||  $this.rangeEndTime > $this.  endTime)
          {
                                                    $this.#startTime.setTime($this.rangeEndTime - ($pick.getBoundingClientRect().left + $pick.clientWidth / 2) * $this.#scale);
            if ( $this.startTime < $this.minTime )  $this.#startTime.setTime($this.     minTime);
                                                    $this.  #endTime.setTime($this.   startTime -  $bar.clientWidth                                            * $this.#scale);
            if ( $this.  endTime > $this.maxTime )  $this.  #endTime.setTime($this.     maxTime);             
          }

          $this.#currentTime.setTime($this.rangeEndTime);
          $this.#create();
          $this.#setLabel();
          $this.#moveRange();
          setTimeout(_loop, parseInt($main.dataset.fps));
        }
        else if ($this.currentTime <= $this.rangeStartTime && parseInt($main.dataset.speed) < 0)
        {
          if (pOptions.loop)
          {
            setTimeout(function()
            {
              if ($this.rangeEndTime < $this.startTime
              ||  $this.rangeEndTime > $this.  endTime)
              {
                                                        $this.  #endTime.setTime($this.rangeEndTime - $bar.clientWidth / 2 * $this.#scale);
                if ( $this.  endTime < $this.maxTime )  $this.  #endTime.setTime($this.     maxTime);
                                                        $this.#startTime.setTime($this.     endTime - $bar.clientWidth     * $this.#scale);
                if ( $this.startTime > $this.minTime )  $this.#startTime.setTime($this.     minTime);
              }

              $this.#currentTime.setTime($this.rangeEndTime);
              $this.#create();
              $this.#setLabel();
              $this.#moveRange();
              setTimeout(_loop, parseInt($main.dataset.fps));
            }, 2000)
          }
          else 
          {
            $this.#lock = false;
            if (typeof pOptions.stop == "function") pOptions.stop();
          }
        }
        else if ($this.currentTime >= $this.rangeEndTime && parseInt($main.dataset.speed) > 0)
        {
          if (pOptions.loop)
          {
            setTimeout(function() 
            {
              if ($this.rangeStartTime < $this.startTime
              ||  $this.rangeStartTime > $this.  endTime)
              {
                                                        $this.#startTime.setTime($this.rangeStartTime - $bar.clientWidth / 2 * $this.#scale);
                if ( $this.startTime < $this.minTime )  $this.#startTime.setTime($this.       minTime);
                                                        $this.  #endTime.setTime($this.     startTime - $bar.clientWidth     * $this.#scale);
                if ( $this.  endTime > $this.maxTime )  $this.  #endTime.setTime($this.       maxTime);
              }

              $this.#currentTime.setTime($this.rangeStartTime);
              $this.#create();
              $this.#setLabel();
              $this.#moveRange();
              setTimeout(_loop, parseInt($main.dataset.fps));
            }, 2000);
          }
          else
          {
            $this.#lock = false;
            if (typeof pOptions.stop == "function") pOptions.stop();
          }
        }
        else 
        {
          let intMove = parseInt($main.dataset.speed) / (1000 / parseInt($main.dataset.fps)) * -1;
          let intDiff = ($this.currentTime - (parseInt($main.dataset.speed) < 0 ? $this.rangeStartTime : $this.rangeEndTime)) / $this.#scale;

          if (Math.abs(intMove) > Math.abs(intDiff)) intMove = intDiff;

          if ($this.rangeStartTime < $this.startTime
          ||  $this.  rangeEndTime > $this.  endTime)
          {
            if (($this.minTime < $this.startTime && parseInt($main.dataset.speed) < 0)
            ||  ($this.maxTime > $this.  endTime && parseInt($main.dataset.speed) > 0))
            {
              $this.#moveBar(intMove);
            }
            else
            {
              $this.#movePick(($pick.getBoundingClientRect().left + $pick.clientWidth / 2) - intMove);
            }
          }
          else
          {
              $this.#movePick(($pick.getBoundingClientRect().left + $pick.clientWidth / 2) - intMove);
          }

          $this.#setLabel();
          $this.#moveRange();
          setTimeout(_loop, parseInt($main.dataset.fps));
        }
      }
      /*-----* normal *-------------------------------------------------------------*/
      else
      {
        if ($this.startTime <= $this.minTime && parseInt($main.dataset.speed) < 0)
        {
          if (pOptions.loop)
          {
            setTimeout(function()  
            {
              $this.#endTime    .setTime($this.maxTime                                                              );
              $this.#currentTime.setTime($this.startTime + ($pick.getBoundingClientRect().left + $pick.clientWidth / 2) * $this.#scale);
              $this.#startTime  .setTime($this.endTime   -  $bar.clientWidth                                            * $this.#scale);
              $this.#create();
              $this.#setLabel();
              $this.#moveRange();
              setTimeout(_loop, parseInt($main.dataset.fps));
            }, 2000);
          }
          else 
          {
            $this.#lock = false;
            if (typeof pOptions.stop == "function") pOptions.stop();
          }
        }
        else if ($this.endTime >= $this.maxTime && parseInt($main.dataset.speed) > 0)
        {
          if (pOptions.loop)
          {
            setTimeout(function()
            {
              $this.#startTime  .setTime($this.minTime.getTime()                                                                                );
              $this.#endTime    .setTime($this.startTime.getTime() +  $bar.clientWidth                                            * $this.#scale);
              $this.#currentTime.setTime($this.startTime.getTime() + ($pick.getBoundingClientRect().left + $pick.clientWidth / 2) * $this.#scale);
              $this.#create();
              $this.#setLabel();
              $this.#moveRange();
              setTimeout(_loop, parseInt($main.dataset.fps));
            }, 2000);
          }
          else
          {
            $this.#lock = false;
            if (typeof pOptions.stop == "function") pOptions.stop();
          }
        }
        else 
        {
          $this.#moveBar(parseInt($main.dataset.speed) / (1000 / parseInt($main.dataset.fps)) * -1);
          $this.#setLabel();
          $this.#moveRange();
          setTimeout(_loop, parseInt($main.dataset.fps));
        }
      }
    },1);
  }
  /*-----* stop *---------------------------------------------------------------*/
  stop ()
  {
    this.#lock = false;
  }
  /******************************************************************************/
  /* getTimeFromOffset                                                          */
  /******************************************************************************/
  getTimeFromOffset(pOffsetLeft)
  {
    return new Date(this.#startTime.getTime() + (pOffsetLeft - this.#railElement.getBoundingClientRect().left) * this.#scale);
  }
  /******************************************************************************/
  /* getOffsetFromTime                                                          */
  /******************************************************************************/
  getOffsetFromTime(pDate)
  {
    return this.#railElement.getBoundingClientRect().left + (pDate.getTime() - this.#startTime.getTime()) / this.#scale;
  }
  /******************************************************************************/
  /* #moveBar                                                                   */
  /******************************************************************************/
  #moveBar(pMoveX, pSync)
  {
    let $this = this;
    try
    {
      if ($this.#mainElement.dataset.moveBar == "true") return; else $this.#mainElement.dataset.moveBar = "true";
      if (this.#disableMoveBar                                              ) return;
      if (this.#startTime.getTime() <= this.#minTime.getTime() && pMoveX > 0) return;
      if (this.#endTime  .getTime() >= this.#maxTime.getTime() && pMoveX < 0) return;

      let objTimeInfo = { startTime : null, endTime : null, currentTime : null };
      objTimeInfo.startTime = new Date(this.#startTime.getTime() - this.#scale * pMoveX);

      if (objTimeInfo.startTime.getTime() < this.#minTime.getTime() && pMoveX > 0)
      {
        objTimeInfo.startTime = new Date(this.#minTime.getTime());
        pMoveX                = (this.#startTime.getTime() - this.#minTime.getTime()) / this.#scale;
      }

      objTimeInfo.  endTime   = new Date(this.#endTime.getTime() - this.#scale * pMoveX);

      if (objTimeInfo.  endTime.getTime() > this.#maxTime.getTime() && pMoveX < 0)
      {
        objTimeInfo.  endTime = new Date(this.#maxTime.getTime());
        pMoveX                = (this.  #maxTime.getTime() - this.#endTime.getTime()) / this.#scale;
      }

      objTimeInfo.currentTime = !pSync ? new Date(this.#currentTime.getTime() - this.#scale * pMoveX) : new Date(this.#currentTime.getTime());

      if (pSync)
      {
        if (objTimeInfo.currentTime.getTime() < objTimeInfo.startTime.getTime()) objTimeInfo.currentTime.setTime(objTimeInfo.startTime.getTime());
        if (objTimeInfo.currentTime.getTime() > objTimeInfo.  endTime.getTime()) objTimeInfo.currentTime.setTime(objTimeInfo.  endTime.getTime());
      }

      this.  #startTime.setTime(objTimeInfo.  startTime.getTime());
      this.    #endTime.setTime(objTimeInfo.    endTime.getTime());
      this.#currentTime.setTime(objTimeInfo.currentTime.getTime());

      this.#create();
    }
    catch(pError)
    {
      console.error("k2goTimeline _moveBar error: " + pError);
    }
    finally
    {
      $this.#mainElement.dataset.moveBar = "false";
    }
  }
  /******************************************************************************/
  /* zoomBar                                                                   */
  /******************************************************************************/
  #zoomBar(pScale)
  {
    if (!pScale) return;
    try
    {
      if (this.#mainElement.dataset.zoomBar == "true") return; else this.#mainElement.dataset.zoomBar = "true";
      let intScale = this.#scale + pScale;

      if (this.#disableZoom) return;
      if (this.#scale     <= this.#minScale && pScale < 0) return;
      if (this.#scale     >= this.#maxScale && pScale > 0) return;
      if (this.#startTime <= this.#minTime  && pScale > 0) return;
      if (this.#endTime   >= this.#maxTime  && pScale > 0) return;
      if (intScale < this.#minScale) intScale = this.#minScale;
      if (intScale > this.#maxScale) intScale = this.#maxScale;

      this.#scale = intScale;
      this.#startTime.setTime(this.#currentTime.getTime() - (this.#pickElement.offsetLeft + this.#pickElement.offsetWidth / 2) * this.#scale);
      this.#endTime.setTime(this.#startTime.getTime() +  this.#barElement.scrollWidth                               * this.#scale);

      this.#create();
      setTimeout(() => { this.dispatchEvent(new CustomEvent("zoom")); }, 1);
    }
    catch(pError)
    {
      console.error("k2goTimeline zoomBar error: " + pError);
    }
    finally
    {
      this.#mainElement.dataset.zoomBar = "false";
    }
  }
  /******************************************************************************/
  /* #moveRange                                                                 */
  /******************************************************************************/
  #moveRange(pMove, pFlg)
  {
    try
    {
      let objRangeInfo;
      let objTime;

      if (!this.#rangeElement.classList.contains("k2go-timeline-range-show")) return;

      objRangeInfo =
      {
        startTime : new Date(this.#getRangeInfo().rangeStartTime.getTime()),
        endTime   : new Date(this.#getRangeInfo().rangeEndTime.getTime())
      };

      if (typeof pMove == "number" && typeof pFlg == "string")
      {
        if (pFlg != "right")
        {
          objRangeInfo.startTime.setTime(objRangeInfo.startTime.getTime() + pMove * this.#scale);

          if (pFlg == "left" && (objRangeInfo.endTime.getTime() - objRangeInfo.startTime.getTime()) / this.#scale < this.#rangeLeftElement.clientWidth + this.#rangeRightElement.clientWidth)
          {
            objRangeInfo.startTime.setTime(this.#rangeStartTime.getTime());
          }

          objTime = new Date(objRangeInfo.startTime.getTime());
          this.#roundTime(objTime, this.#getScaleInterval(this.#scale), this.#timezoneOffset);

          if (Math.abs(objTime.getTime() - objRangeInfo.startTime.getTime()) <= this.#scale)
          {
            objRangeInfo.startTime.setTime(objTime.getTime());
          }
        }

        if (pFlg != "left")
        {
          objRangeInfo.endTime.setTime(objRangeInfo.endTime.getTime() + pMove * this.#scale);

          if (pFlg == "right" && (objRangeInfo.endTime.getTime() - objRangeInfo.startTime.getTime()) / this.#scale < this.#rangeLeftElement.clientWidth + this.#rangeRightElement.clientWidth)
          {
            objRangeInfo.endTime.setTime(this.#rangeEndTime.getTime());
          }

          objTime = new Date(objRangeInfo.endTime.getTime());
          this.#roundTime(objTime, this.#getScaleInterval(this.#scale), this.#timezoneOffset);

          if (Math.abs(objTime.getTime() - objRangeInfo.endTime.getTime()) <= this.#scale)
          {
            objRangeInfo.endTime.setTime(objTime.getTime());
          }
        }

        if (objRangeInfo.startTime.getTime() < this.#minTime.getTime())
        {
          pMove = objRangeInfo.startTime.getTime() - this.#minTime.getTime();
          objRangeInfo.startTime.setTime(this.#minTime.getTime());
          objRangeInfo.  endTime.setTime(objRangeInfo .endTime.getTime() - pMove);
        }

        if (objRangeInfo.  endTime.getTime() > this.#maxTime.getTime())
        {
          pMove = objRangeInfo.  endTime.getTime() - this.#maxTime.getTime();
          objRangeInfo.  endTime.setTime(this.#maxTime.getTime());
          objRangeInfo.startTime.setTime(objRangeInfo.startTime.getTime() - pMove);
        }
      }

      if (objRangeInfo.startTime.getTime() > this.#endTime  .getTime()
      ||  objRangeInfo.  endTime.getTime() < this.#startTime.getTime())
      {
        this.#rangeElement.style.display = "none";
      }
      else
      {
        let intLeft  = (objRangeInfo.startTime.getTime() - this.#startTime.getTime()) / this.#scale;
        let intRight = (objRangeInfo.endTime  .getTime() - this.#startTime.getTime()) / this.#scale;

        if (intLeft < 0) { this.#rangeLeftElement.style.display = "none"; intLeft  = 0; }
        else               this.#rangeLeftElement.style.display = "";

        if (intRight > this.#railElement.clientWidth) { this.#rangeRightElement.style.display = "none"; intRight = this.#railElement.clientWidth; }
        else                            this.#rangeRightElement.style.display = "";

        this.#rangeElement.style.display = "";
        this.#rangeElement.style.left    = intLeft + "px";
        this.#rangeElement.style.width   = intRight - intLeft + "px";
      }

      if (objRangeInfo.startTime.getTime() != this.#rangeStartTime.getTime()
      ||  objRangeInfo.  endTime.getTime() != this.#rangeEndTime  .getTime())
      {
        this.#rangeStartTime.setTime(objRangeInfo.startTime.getTime());
        this.#rangeEndTime  .setTime(objRangeInfo.  endTime.getTime());

        setTimeout(this.#rangeChange(this.#getRangeInfo()), 1);
      }
    }
    catch(pError)
    {
      console.error("k2goTimeline moveRange error: " + pError);
    }
  }
  /******************************************************************************/
  /* #movePick                                                                  */
  /******************************************************************************/
  #movePick(pOffsetLeft)
  {
    this.#cancelAttributeChanged = true;

    try
    {
      const objRailBound = this.#railElement.getBoundingClientRect();
      const objPickBound = this.#pickElement.getBoundingClientRect();
      const intPickWidth = objPickBound.width / 2;
      let   intLeft      = (typeof pOffsetLeft == "number" ? pOffsetLeft : objRailBound.left) - objRailBound.left - intPickWidth;

           if (intLeft < intPickWidth * -1                     ) intLeft = intPickWidth * -1;
      else if (intLeft > intPickWidth * -1 + objRailBound.width) intLeft = intPickWidth * -1 + objRailBound.width;

      if (intLeft != objPickBound.left - objRailBound.left)
      {
        const objCurrentTime = new Date(this.#startTime.getTime() + (intLeft + intPickWidth) * this.#scale);
        const objTime        = new Date(objCurrentTime.getTime());

        this.#roundTime(objTime, this.#scaleInterval, this.#timezoneOffset);

        if (Math.abs(objTime.getTime() - objCurrentTime.getTime()) <= this.#scale)
        {
          objCurrentTime.setTime(objTime.getTime());
        }

        if (objCurrentTime.getTime() < this.#minTime.getTime())
        {
          intLeft -= (objCurrentTime.getTime() - this.#minTime.getTime()) / this.#scale;
          objCurrentTime.setTime(this.#minTime.getTime());
        }

        if (objCurrentTime.getTime() > this.#maxTime.getTime())
        {
          intLeft -= (objCurrentTime.getTime() - this.#maxTime.getTime()) / this.#scale;
          objCurrentTime.setTime(this.#maxTime.getTime());
        }

        this.#pickElement.style.left = intLeft + "px";

        if (objCurrentTime.getTime() != this.#currentTime.getTime())
        {
          this.#currentTime.setTime(objCurrentTime.getTime());
          this.dataset.currentTime = this.#currentTime.toISOString();

          if (this.#enableHeaderBar) 
          {
            if (this.#timebtnElement.classList.contains("timeNow"))
            {
              this.#timebtnElement.classList.remove("timeNow" );
              this.#timebtnElement.classList.add("timeCurrent");
            }  
          }

          this.dispatchEvent(new CustomEvent("change"));
          this.#setHeaderDate(this.#currentTime);
        }
      }
    }
    catch(pError)
    {
      console.error("k2goTimeline #movePick error: " + pError);
    }
    finally
    {
      this.#cancelAttributeChanged = false;
    }
  }
  /******************************************************************************/
  /* #setLabel                                                                  */
  /******************************************************************************/
  #setLabel()
  {
    /*-----* remove *-------------------------------------------------------------*/
    let $labels = this.shadowRoot.querySelectorAll("[part='k2go-timeline-label']");

    for (let i01 = 0; i01 < $labels.length; i01++)
    {
      $labels[i01].remove();
    }

    let $scales = this.shadowRoot.querySelectorAll("[part='k2go-timeline-scale'].long");

    for (let i01 = 0; i01 < $scales.length; i01++)
    {
      $scales[i01].classList.remove("long");
    }
    /*-----* scanning *-----------------------------------------------------------*/
    const $children = this.#barElement.children;

    for (let i01 = 0; i01 < $children.length; i01++)
    {
      const $element  = $children[i01];
      const objTime   = new Date((new Date($element.dataset.time)).getTime() + this.#timezoneOffset * 60 * 1000);
      let   strFormat = "";
      let   intWidth  = 0;
      let   objNext;

      if (this.#scale <= 1)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 100 / this.#scale;
        }

             if (objTime.getTime() %   500       == 0) strFormat = this.#jpCalendar ? "%N<br/>%jp年%mm月%dd日 %H時%M分%S秒" : "%N<br/>%y/%mm/%dd %H:%M:%S";
        else if (objTime.getTime() %   100       == 0) strFormat = "%N";
      }
      else if (this.#scale <= 5)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 100 / this.#scale;
        }

             if (objTime.getTime() % (1000 *  2) == 0) strFormat = this.#jpCalendar ? "%N<br/>%jp年%mm月%dd日 %H時%M分%S秒" : "%N<br/>%y/%mm/%dd %H:%M:%S";
        else if (objTime.getTime() %   250       == 0) strFormat = "%N";
      }
      else if (this.#scale <= 10)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 100 / this.#scale;
        }

             if (objTime.getTime() % (1000 *  5) == 0) strFormat = this.#jpCalendar ? "%N<br/>%jp年%mm月%dd日 %H時%M分%S秒" : "%N<br/>%y/%mm/%dd %H:%M:%S";
        else if (objTime.getTime() %   500       == 0) strFormat = "%N";
      }
      else if (this.#scale <= 25)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 / this.#scale;
        }

             if (objTime.getTime() % (1000 * 10) == 0) strFormat = this.#jpCalendar ? "%S<br/>%jp年%m月%d日 %H時%M分" : "%S<br/>%y/%mm/%dd %H:%M";
        else if (objTime.getTime() %  1000       == 0) strFormat = "%S";
      }
      else if (this.#scale <= 50)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 / this.#scale;
        }

             if (objTime.getTime() % (1000 * 20) == 0) strFormat = this.#jpCalendar ? "%S<br/>%jp年%m月%d日 %H時%M分" : "%S<br/>%y/%mm/%dd %H:%M";
        else if (objTime.getTime() % (1000 *  2) == 0) strFormat = "%S";
      }
      else if (this.#scale <= 100)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 / this.#scale;
        }

             if (objTime.getTime() % (1000 * 30) == 0) strFormat = this.#jpCalendar ? "%S<br/>%jp年%m月%d日 %H時%M分" : "%S<br/>%y/%mm/%dd %H:%M";
        else if (objTime.getTime() % (1000 *  5) == 0) strFormat = "%S";
      }
      else if (this.#scale <= 250)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 / this.#scale;
        }

             if (objTime.getTime() % (1000 * 60) == 0) strFormat = this.#jpCalendar ? "%S<br/>%jp年%m月%d日 %H時%M分" : "%S<br/>%y/%mm/%dd %H:%M";
        else if (objTime.getTime() % (1000 * 10) == 0) strFormat = "%S";
      }
      else if (this.#scale <= 500)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 / this.#scale;
        }

             if (objTime.getTime() % (1000 * 60 *  2) == 0) strFormat = this.#jpCalendar ? "%S<br/>%jp年%m月%d日 %H時%M分" : "%S<br/>%y/%mm/%dd %H:%M";
        else if (objTime.getTime() % (1000 * 30     ) == 0) strFormat = "%S";
      }
      else if (this.#scale <= 1000)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 * 60 / this.#scale;
        }

             if (objTime.getTime() % (1000 * 60 *  5) == 0) strFormat = this.#jpCalendar ? "%H:%M<br/>%jp年%m月%d日" : "%H:%M<br/>%y/%mm/%dd";
        else if (objTime.getTime() % (1000 * 60     ) == 0) strFormat = "%H:%M";
      }
      else if (this.#scale <= 1000 *  2.5)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 * 60 / this.#scale;
        }

             if (objTime.getTime() % (1000 * 60 * 10) == 0) strFormat = this.#jpCalendar ? "%H:%M<br/>%jp年%m月%d日" : "%H:%M<br/>%y/%mm/%dd";
        else if (objTime.getTime() % (1000 * 60 *  5) == 0) strFormat = "%H:%M";
      }
      else if (this.#scale <= 1000 *  5)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 * 60 / this.#scale;
        }

             if (objTime.getTime() % (1000 * 60 * 30) == 0) strFormat = this.#jpCalendar ? "%H:%M<br/>%jp年%m月%d日" : "%H:%M<br/>%y/%mm/%dd";
        else if (objTime.getTime() % (1000 * 60 * 10) == 0) strFormat = "%H:%M";
      }
      else if (this.#scale <= 1000 * 15)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 * 60 / this.#scale;
        }

             if (objTime.getTime() % (1000 * 60 * 60) == 0) strFormat = this.#jpCalendar ? "%H:%M<br/>%jp年%m月%d日" : "%H:%M<br/>%y/%mm/%dd";
        else if (objTime.getTime() % (1000 * 60 * 30) == 0) strFormat = "%H:%M";
      }
      else if (this.#scale <= 1000 * 30)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 * 60 * 60 / this.#scale;

               if (objTime.getTime() % (1000 * 60 * 60 *  3) == 0) strFormat = this.#jpCalendar ? "%H<br/>%jp年%m月%d日" : "%H<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60     ) == 0) strFormat = "%H";
        }
        else
        {
               if (objTime.getTime() % (1000 * 60 * 60 *  3) == 0) strFormat = this.#jpCalendar ? "%H:%M<br/>%jp年%m月%d日" : "%H:%M<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60     ) == 0) strFormat = "%H:%M";
        }
      }
      else if (this.#scale <= 1000 * 60)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 * 60 * 60 / this.#scale;

               if (objTime.getTime() % (1000 * 60 * 60 *  6) == 0) strFormat = this.#jpCalendar ? "%H<br/>%jp年%m月%d日" : "%H<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60     ) == 0) strFormat = "%H";
        }
        else
        {
               if (objTime.getTime() % (1000 * 60 * 60 *  6) == 0) strFormat = this.#jpCalendar ? "%H:%M<br/>%jp年%m月%d日" : "%H:%M<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60     ) == 0) strFormat = "%H:%M";
        }
      }
      else if (this.#scale <= 1000 * 60 *  2.5)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 * 60 * 60 / this.#scale;

               if (objTime.getTime() % (1000 * 60 * 60 * 12) == 0) strFormat = this.#jpCalendar ? "%H<br/>%jp年%m月%d日" : "%H<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60 *  3) == 0) strFormat = "%H";
        }
        else
        {
               if (objTime.getTime() % (1000 * 60 * 60 * 12) == 0) strFormat = this.#jpCalendar ? "%H:%M<br/>%jp年%m月%d日" : "%H:%M<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60 *  3) == 0) strFormat = "%H:%M";
        }
      }
      else if (this.#scale <= 1000 * 60 *  5)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 * 60 * 60 / this.#scale;

               if (objTime.getTime() % (1000 * 60 * 60 * 24) == 0) strFormat = this.#jpCalendar ? "%H<br/>%jp年%m月%d日" : "%H<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60 *  6) == 0) strFormat = "%H";
        }
        else
        {
               if (objTime.getTime() % (1000 * 60 * 60 * 24) == 0) strFormat = this.#jpCalendar ? "%H:%M<br/>%jp年%m月%d日" : "%H:%M<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60 *  6) == 0) strFormat = "%H:%M";
        }
      }
      else if (this.#scale <= 1000 * 60 * 10)
      {
        if (this.#labelPosition == "range")
        {
          intWidth = 1000 * 60 * 60 / this.#scale;

               if (objTime.getTime() % (1000 * 60 * 60 * 24) == 0) strFormat = this.#jpCalendar ? "%H<br/>%jp年%m月%d日" : "%H<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60 * 12) == 0) strFormat = "%H";
        }
        else
        {
               if (objTime.getTime() % (1000 * 60 * 60 * 24) == 0) strFormat = this.#jpCalendar ? "%H:%M<br/>%jp年%m月%d日" : "%H:%M<br/>%y/%mm/%dd";
          else if (objTime.getTime() % (1000 * 60 * 60 * 12) == 0) strFormat = "%H:%M";
        }
      }
      else if (this.#scale <= 1000 * 60 * 30)
      {
        if (objTime.getUTCHours() == 0)
        {
          if (this.#labelPosition == "range")
          {
            intWidth = 1000 * 60 * 60 * 24 / this.#scale;
          }

          if (objTime.getUTCDate () < 31 && objTime.getUTCDate() %  5 == 1) strFormat = this.#jpCalendar ? "%m/%d<br/>%jp年" : "%m/%d<br/>%y";
          else                                                              strFormat = "%m/%d";
        }
      }
      else if (this.#scale <= 1000 * 60 * 60)
      {
        if (objTime.getUTCHours() == 0)
        {
          if (this.#labelPosition == "range")
          {
            objNext  = new Date(objTime.getTime()); objNext.setUTCDate(objNext.getUTCDate() + 1);
            intWidth = (objNext.getTime() - objTime.getTime()) / this.#scale;
          }

               if (objTime.getUTCDate() < 31 && objTime.getUTCDate() % 15 == 1) strFormat = this.#jpCalendar ? "%m/%d<br/>%jp年" : "%m/%d<br/>%y";
          else if (objTime.getUTCDate() < 31 && objTime.getUTCDate() %  5 == 1) strFormat = "%m/%d";
        }
      }
      else if (this.#scale <= 1000 * 60 * 60 *  2)
      {
        if (objTime.getUTCDate() < 31 && objTime.getUTCDate() % 15 == 1)
        {
          if (this.#labelPosition == "range")
          {
            objNext  = new Date(objTime.getTime()); objNext.setUTCDate(objNext.getUTCDate() + 1);
            intWidth = (objNext.getTime() - objTime.getTime()) / this.#scale;
          }

          if (objTime.getUTCDate() == 1) strFormat = this.#jpCalendar ? "%m/%d<br/>%jp年" : "%m/%d<br/>%y";
          else                           strFormat = "%m/%d";
        }
      }
      else if (this.#scale <= 1000 * 60 * 60 *  8)
      {
        if (objTime.getUTCDate() == 1)
        {
          if (this.#labelPosition == "range")
          {
            objNext  = new Date(objTime.getTime()); objNext.setUTCMonth(objNext.getUTCMonth() + 1);
            intWidth = (objNext.getTime() - objTime.getTime()) / this.#scale;

            if (objTime.getUTCMonth() % 3 == 0) strFormat = this.#jpCalendar ? "%m<br/>%jp年" : "%m<br/>%y";
            else                                strFormat = "%m";
          }
          else
          {
            if (objTime.getUTCMonth() % 3 == 0) strFormat = this.#jpCalendar ? "%m/%d<br/>%jp年" : "%m/%d<br/>%y";
            else                                strFormat = "%m/%d";
          }
        }
      }
      else if (this.#scale <= 1000 * 60 * 60 * 18)
      {
        if (objTime.getUTCDate() == 1)
        {
          if (this.#labelPosition == "range")
          {
            objNext  = new Date(objTime.getTime()); objNext.setUTCMonth(objNext.getUTCMonth() + 1);
            intWidth = (objNext.getTime() - objTime.getTime()) / this.#scale;

                 if (objTime.getUTCMonth() %  6 == 0) strFormat = this.#jpCalendar ? "%m<br/>%jp年" : "%m<br/>%y";
            else if (objTime.getUTCMonth() %  3 == 0) strFormat = "%m";
          }
          else
          {
                 if (objTime.getUTCMonth() %  6 == 0) strFormat = this.#jpCalendar ? "%m/%d<br/>%jp年" : "%m/%d<br/>%y";
            else if (objTime.getUTCMonth() %  3 == 0) strFormat = "%m/%d";
          }
        }
      }
      else if (this.#scale <= 1000 * 60 * 60 * 24 *  3)
      {
        if (objTime.getUTCDate() == 1)
        {
          if (this.#labelPosition == "range")
          {
            objNext  = new Date(objTime.getTime()); objNext.setUTCMonth(objNext.getUTCMonth() + 1);
            intWidth = (objNext.getTime() - objTime.getTime()) / this.#scale;

                 if (objTime.getUTCMonth() % 12 == 0) strFormat = this.#jpCalendar ? "%m<br/>%jp年" : "%m<br/>%y";
            else if (objTime.getUTCMonth() %  6 == 0) strFormat = "%m";
          }
          else
          {
                 if (objTime.getUTCMonth() % 12 == 0) strFormat = this.#jpCalendar ? "%m/%d<br/>%jp年" : "%m/%d<br/>%y";
            else if (objTime.getUTCMonth() %  6 == 0) strFormat = "%m/%d";
          }
        }
      }
      else if (this.#scale <= 1000 * 60 * 60 * 24 *  9)
      {
        if (objTime.getUTCMonth() == 0)
        {
          if (this.#labelPosition == "range")
          {
            objNext  = new Date(objTime.getTime()); objNext.setUTCFullYear(objNext.getUTCFullYear() + 1);
            intWidth = (objNext.getTime() - objTime.getTime()) / this.#scale;
          }

          strFormat = this.#jpCalendar ? "%jp年" : "%y";
        }
      }
      else if (this.#scale <= 1000 * 60 * 60 * 24 * 30)
      {
        if (objTime.getUTCFullYear() % 5 == 0)
        {
          if (this.#labelPosition == "range")
          {
            objNext  = new Date(objTime.getTime()); objNext.setUTCFullYear(objNext.getUTCFullYear() + 1);
            intWidth = (objNext.getTime() - objTime.getTime()) / this.#scale;
          }

          strFormat = this.#jpCalendar ? "%jp年" : "%y";
        }
      }
      else
      {
        if (objTime.getUTCFullYear() % 10 == 0)
        {
          if (this.#labelPosition == "range")
          {
            objNext  = new Date(objTime.getTime()); objNext.setUTCFullYear(objNext.getUTCFullYear() + 1);
            intWidth = (objNext.getTime() - objTime.getTime()) / this.#scale;
          }

          strFormat = this.#jpCalendar ? "%jp年" : "%y";
        }
      }
      /*-----* append label *-------------------------------------------------------*/
      if (strFormat.length > 0)
      {
        const $label = document.createElement("span");

        $label.part      = "k2go-timeline-label";
        $label.innerHTML = this.formatDate(new Date($element.dataset.time), strFormat, this.#timezoneOffset);

        $element.classList.add("long");
        $element.appendChild($label);

        const objLabelBound = $label.getBoundingClientRect();

        if (intWidth > 0)
        {
          if (intWidth >= objLabelBound.width)
          {
            $label.style.left  = "0px";
            $label.style.width = intWidth + "px";
          }
          else
            $label.style.left = (objLabelBound.width - intWidth) / 2 * -1 + "px";
        }
        else
          $label.style.left = objLabelBound.width / 2 * -1 + "px";
      }
    }
  }
  /******************************************************************************/
  /* #getScaleInterval                                                          */
  /******************************************************************************/
  #getScaleInterval(pScale)
  {
         if (pScale <=    1                    ) return { value :  10, unit : "ms" };
    else if (pScale <=    5                    ) return { value :  50, unit : "ms" };
    else if (pScale <=   10                    ) return { value : 100, unit : "ms" };
    else if (pScale <=   50                    ) return { value : 500, unit : "ms" };
    else if (pScale <=  100                    ) return { value :   1, unit : "S"  };
    else if (pScale <=  500                    ) return { value :   5, unit : "S"  };
    else if (pScale <= 1000                    ) return { value :  10, unit : "S"  };
    else if (pScale <= 1000 *  2.5             ) return { value :  30, unit : "S"  };
    else if (pScale <= 1000 *  5               ) return { value :   1, unit : "M"  };
    else if (pScale <= 1000 * 30               ) return { value :   5, unit : "M"  };
    else if (pScale <= 1000 * 60               ) return { value :  10, unit : "M"  };
    else if (pScale <= 1000 * 60 *  2.5        ) return { value :  30, unit : "M"  };
    else if (pScale <= 1000 * 60 *  5          ) return { value :   1, unit : "H"  };
    else if (pScale <= 1000 * 60 * 10          ) return { value :   3, unit : "H"  };
    else if (pScale <= 1000 * 60 * 30          ) return { value :   6, unit : "H"  };
    else if (pScale <= 1000 * 60 * 60          ) return { value :  12, unit : "H"  };
    else if (pScale <= 1000 * 60 * 60 *  2     ) return { value :   1, unit : "d"  };
    else if (pScale <= 1000 * 60 * 60 *  8     ) return { value :   5, unit : "d"  };
    else if (pScale <= 1000 * 60 * 60 * 18     ) return { value :  15, unit : "d"  };
    else if (pScale <= 1000 * 60 * 60 * 24 *  3) return { value :   1, unit : "m"  };
    else if (pScale <= 1000 * 60 * 60 * 24 *  9) return { value :   3, unit : "m"  };
    else if (pScale <= 1000 * 60 * 60 * 24 * 30) return { value :   1, unit : "y"  };
    else                                         return { value :   2, unit : "y"  };
  }
  /******************************************************************************/
  /* #roundTime                                                                 */
  /******************************************************************************/
  #roundTime(pTime, pInterval, pOffset)
  {
    pTime.setTime(pTime.getTime() + pOffset * 60 * 1000);

         if (pInterval.unit == "ms")   pTime.setUTCMilliseconds(Math.round(pTime.getUTCMilliseconds() / pInterval.value) * pInterval.value);
    else if (pInterval.unit == "S" )   pTime.setUTCSeconds     (Math.round(pTime.getUTCSeconds     () / pInterval.value) * pInterval.value, 0);
    else if (pInterval.unit == "M" )   pTime.setUTCMinutes     (Math.round(pTime.getUTCMinutes     () / pInterval.value) * pInterval.value, 0, 0);
    else if (pInterval.unit == "H" )   pTime.setUTCHours       (Math.round(pTime.getUTCHours       () / pInterval.value) * pInterval.value, 0, 0, 0);
    else if (pInterval.unit == "m" ) { pTime.setUTCMonth       (Math.round(pTime.getUTCMonth       () / pInterval.value) * pInterval.value, 1);    pTime.setUTCHours(0, 0, 0, 0); }
    else if (pInterval.unit == "y" ) { pTime.setUTCFullYear    (Math.round(pTime.getUTCFullYear    () / pInterval.value) * pInterval.value, 0, 1); pTime.setUTCHours(0, 0, 0, 0); }
    else if (pInterval.unit == "d" )
    {
      const objLastDate = new Date(Date.UTC(pTime.getUTCFullYear(), pTime.getUTCMonth() + 1, 0));

      pTime.setUTCDate(Math.round(pTime.getUTCDate() / pInterval.value) * pInterval.value + 1);

      if (pTime.getUTCDate() + pInterval.value - 1 > objLastDate.getUTCDate()) pTime.setUTCMonth(pTime.getUTCMonth() + 1, 1);

      pTime.setUTCHours(0, 0, 0, 0);
    }

    pTime.setTime(pTime.getTime() - pOffset * 60 * 1000);
  }
  /******************************************************************************/
  /* #incrementTime                                                             */
  /******************************************************************************/
  #incrementTime(pTime, pInterval, pOffset, pIncrement)
  {
    const intIncrement = typeof pIncrement == "number" ? pIncrement : 1;

    pTime.setTime(pTime.getTime() + pOffset * 60 * 1000);

         if (pInterval.unit == "ms") pTime.setUTCMilliseconds(pTime.getUTCMilliseconds() + pInterval.value * intIncrement);
    else if (pInterval.unit == "S" ) pTime.setUTCSeconds     (pTime.getUTCSeconds     () + pInterval.value * intIncrement);
    else if (pInterval.unit == "M" ) pTime.setUTCMinutes     (pTime.getUTCMinutes     () + pInterval.value * intIncrement);
    else if (pInterval.unit == "H" ) pTime.setUTCHours       (pTime.getUTCHours       () + pInterval.value * intIncrement);
    else if (pInterval.unit == "m" ) pTime.setUTCMonth       (pTime.getUTCMonth       () + pInterval.value * intIncrement);
    else if (pInterval.unit == "y" ) pTime.setUTCFullYear    (pTime.getUTCFullYear    () + pInterval.value * intIncrement);
    else if (pInterval.unit == "d" )
    {
      pTime.setUTCDate(pTime.getUTCDate() + pInterval.value * intIncrement);
      pTime.setUTCDate(pTime.getUTCDate() - (pTime.getUTCDate() % pInterval.value - 1) * (pTime.getUTCDate() % pInterval.value == 0 ? 0 : 1));

      const objLastDate = new Date(Date.UTC(pTime.getUTCFullYear(), pTime.getUTCMonth() + 1, 0));

           if (pTime.getUTCDate() + pInterval.value - 1 > objLastDate.getUTCDate()) pTime.setUTCMonth(pTime.getUTCMonth() + 1, 1);
      else if (pTime.getUTCDate()                       < pInterval.value + 1     ) pTime.setUTCDate (1);
    }

    pTime.setTime(pTime.getTime() - pOffset * 60 * 1000);
  }
  /******************************************************************************/
  /* #checkTimeInfo                                                             */
  /******************************************************************************/
  #checkTimeInfo(pTimeInfo)
  {
    if (isNaN(pTimeInfo.    minTime.getTime())) throw new Error("min time is invalid date");
    if (isNaN(pTimeInfo.    maxTime.getTime())) throw new Error("max time is invalid date");
    if (isNaN(pTimeInfo.  startTime.getTime())) throw new Error("start time is invalid date");
    if (isNaN(pTimeInfo.    endTime.getTime())) throw new Error("end time is invalid date");
    if (isNaN(pTimeInfo.currentTime.getTime())) throw new Error("current time is invalid date");

    if (pTimeInfo.    maxTime.getTime() <= pTimeInfo.   minTime.getTime()) throw new Error("max time is out of range");

    if (pTimeInfo.  startTime.getTime() <  pTimeInfo.   minTime.getTime()) throw new Error("start time is out of range");
    if (pTimeInfo.  startTime.getTime() >= pTimeInfo.   maxTime.getTime()) throw new Error("start time is out of range");

    if (pTimeInfo.    endTime.getTime() <= pTimeInfo.   minTime.getTime()) throw new Error("end time is out of range");
    if (pTimeInfo.    endTime.getTime() >  pTimeInfo.   maxTime.getTime()) throw new Error("end time is out of range");
    if (pTimeInfo.    endTime.getTime() <= pTimeInfo. startTime.getTime()) throw new Error("end time is out of range");

    if (pTimeInfo.currentTime.getTime() <  pTimeInfo.startTime.getTime()) throw new Error("current time is out of range");
    if (pTimeInfo.currentTime.getTime() >  pTimeInfo.  endTime.getTime()) throw new Error("current time is out of range");
  }
  /******************************************************************************/
  /* getTimeInfo                                                               */
  /******************************************************************************/
  #getTimeInfo()
  {
    return {
      startTime   : new Date(this.#startTime.getTime()),
      endTime     : new Date(this.#endTime.getTime()),
      currentTime : new Date(this.#currentTime.getTime())
    };
  }
  /******************************************************************************/
  /* getRangeInfo                                                              */
  /******************************************************************************/
  #getRangeInfo()
  {
    return {
      rangeStartTime : new Date(this.#rangeStartTime.getTime()),
      rangeEndTime   : new Date(this.#rangeEndTime  .getTime())
    };
  }
  /******************************************************************************/
  /* getQueryString                                                             */
  /******************************************************************************/
  #getQueryString(pParameters)
  {
    let objGetQueryString = {};
    let arrParameters     = pParameters.substring(1).split("&");

    for(let i = 0; i < arrParameters.length; i++)
    {
      objGetQueryString[decodeURIComponent(arrParameters[i].split("=")[0])] = decodeURIComponent(arrParameters[i].split("=")[1]);
    }
    return objGetQueryString;
  }
  /******************************************************************************/
  /* formatDate                                                                 */
  /******************************************************************************/
  formatDate(pDate, pFormatString, pOffset)
  {
    const intOffset = typeof pOffset == "number" ? pOffset : (new Date()).getTimezoneOffset() * -1;
    const objDate   = new Date(pDate.getTime() + intOffset * 60 * 1000);
    let   strResult = pFormatString;

    strResult = strResult.replace(/%y/g ,          objDate.getUTCFullYear    ()      .toString(  ));
    strResult = strResult.replace(/%mm/g, ("0"  + (objDate.getUTCMonth       () + 1)).slice   (-2));
    strResult = strResult.replace(/%m/g ,         (objDate.getUTCMonth       () + 1) .toString(  ));
    strResult = strResult.replace(/%dd/g, ("0"  + (objDate.getUTCDate        ()    )).slice   (-2));
    strResult = strResult.replace(/%d/g ,          objDate.getUTCDate        ()      .toString(  ));
    strResult = strResult.replace(/%H/g , ("0"  +  objDate.getUTCHours       ()     ).slice   (-2));
    strResult = strResult.replace(/%M/g , ("0"  +  objDate.getUTCMinutes     ()     ).slice   (-2));
    strResult = strResult.replace(/%S/g , ("0"  +  objDate.getUTCSeconds     ()     ).slice   (-2));
    strResult = strResult.replace(/%N/g , ("00" +  objDate.getUTCMilliseconds()     ).slice   (-3));

    if (strResult.indexOf("%jp") > -1)
    {
           if (objDate.getTime() < (new Date(Date.UTC( 650,  2, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "大化" + (objDate.getUTCFullYear() -  644).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 654, 10, 24, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "白雉" + (objDate.getUTCFullYear() -  649).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 686,  7, 14, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "－－" + (objDate.getUTCFullYear() -  653).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 686,  9,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "朱鳥" + (objDate.getUTCFullYear() -  685).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 701,  4,  3, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "－－" + (objDate.getUTCFullYear() -  685).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 704,  5, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "大宝" + (objDate.getUTCFullYear() -  700).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 708,  1,  7, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "慶雲" + (objDate.getUTCFullYear() -  703).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 715,  9,  3, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "和銅" + (objDate.getUTCFullYear() -  707).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 717, 11, 24, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "霊亀" + (objDate.getUTCFullYear() -  714).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 724,  2,  3, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "養老" + (objDate.getUTCFullYear() -  716).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 729,  8,  2, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "神亀" + (objDate.getUTCFullYear() -  723).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 749,  4,  4, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天平" + (objDate.getUTCFullYear() -  728).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 749,  7, 19, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "感宝" + (objDate.getUTCFullYear() -  748).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 757,  8,  6, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "勝宝" + (objDate.getUTCFullYear() -  748).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 765,  1,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "宝字" + (objDate.getUTCFullYear() -  756).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 767,  8, 13, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "神護" + (objDate.getUTCFullYear() -  764).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 770,  9, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "景雲" + (objDate.getUTCFullYear() -  766).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 781,  0, 30, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "宝亀" + (objDate.getUTCFullYear() -  769).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 782,  8, 30, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天応" + (objDate.getUTCFullYear() -  780).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 806,  5,  8, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延暦" + (objDate.getUTCFullYear() -  781).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 810,  9, 20, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "大同" + (objDate.getUTCFullYear() -  805).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 824,  1,  8, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "弘仁" + (objDate.getUTCFullYear() -  809).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 834,  1, 14, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天長" + (objDate.getUTCFullYear() -  823).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 848,  6, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "承和" + (objDate.getUTCFullYear() -  833).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 851,  5,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉祥" + (objDate.getUTCFullYear() -  847).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 854, 11, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "仁寿" + (objDate.getUTCFullYear() -  850).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 857,  2, 20, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "斉衡" + (objDate.getUTCFullYear() -  853).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 859,  4, 20, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天安" + (objDate.getUTCFullYear() -  856).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 877,  5,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "貞観" + (objDate.getUTCFullYear() -  858).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 885,  2, 11, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元慶" + (objDate.getUTCFullYear() -  876).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 889,  4, 30, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "仁和" + (objDate.getUTCFullYear() -  884).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 898,  4, 20, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛平" + (objDate.getUTCFullYear() -  888).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 901,  7, 31, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "昌泰" + (objDate.getUTCFullYear() -  897).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 923,  4, 29, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延喜" + (objDate.getUTCFullYear() -  900).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 931,  4, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延長" + (objDate.getUTCFullYear() -  922).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 938,  5, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "承平" + (objDate.getUTCFullYear() -  930).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 947,  4, 15, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天慶" + (objDate.getUTCFullYear() -  937).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 957, 10, 21, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天暦" + (objDate.getUTCFullYear() -  946).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 961,  2,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天徳" + (objDate.getUTCFullYear() -  956).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 964,  7, 19, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "応和" + (objDate.getUTCFullYear() -  960).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 968,  8,  8, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "康保" + (objDate.getUTCFullYear() -  963).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 970,  4,  3, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "安和" + (objDate.getUTCFullYear() -  967).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 974,  0, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天禄" + (objDate.getUTCFullYear() -  969).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 976,  7, 11, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天延" + (objDate.getUTCFullYear() -  973).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 978, 11, 31, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "貞元" + (objDate.getUTCFullYear() -  975).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 983,  4, 29, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天元" + (objDate.getUTCFullYear() -  977).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 985,  4, 19, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永観" + (objDate.getUTCFullYear() -  982).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 987,  4,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛和" + (objDate.getUTCFullYear() -  984).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 989,  8, 10, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永延" + (objDate.getUTCFullYear() -  986).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 990, 10, 26, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永祚" + (objDate.getUTCFullYear() -  988).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 995,  2, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正暦" + (objDate.getUTCFullYear() -  989).toString());
      else if (objDate.getTime() < (new Date(Date.UTC( 999,  1,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長徳" + (objDate.getUTCFullYear() -  994).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1004,  7,  8, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長保" + (objDate.getUTCFullYear() -  998).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1013,  1,  8, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛弘" + (objDate.getUTCFullYear() - 1003).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1017,  4, 21, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長和" + (objDate.getUTCFullYear() - 1012).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1021,  2, 17, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛仁" + (objDate.getUTCFullYear() - 1016).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1024,  7, 19, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "治安" + (objDate.getUTCFullYear() - 1020).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1028,  7, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "万寿" + (objDate.getUTCFullYear() - 1023).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1037,  4,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長元" + (objDate.getUTCFullYear() - 1027).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1040, 11, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長暦" + (objDate.getUTCFullYear() - 1036).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1044, 11, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長久" + (objDate.getUTCFullYear() - 1039).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1046,  4, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛徳" + (objDate.getUTCFullYear() - 1043).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1053,  1,  2, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永承" + (objDate.getUTCFullYear() - 1045).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1058,  8, 19, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天喜" + (objDate.getUTCFullYear() - 1052).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1065,  8,  4, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "康平" + (objDate.getUTCFullYear() - 1057).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1069,  4,  6, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "治暦" + (objDate.getUTCFullYear() - 1064).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1074,  8, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延久" + (objDate.getUTCFullYear() - 1068).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1077, 11,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "承保" + (objDate.getUTCFullYear() - 1073).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1081,  2, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "承暦" + (objDate.getUTCFullYear() - 1076).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1084,  2, 15, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永保" + (objDate.getUTCFullYear() - 1080).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1087,  4, 11, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "応徳" + (objDate.getUTCFullYear() - 1083).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1095,  0, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛治" + (objDate.getUTCFullYear() - 1086).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1097,  0,  3, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉保" + (objDate.getUTCFullYear() - 1094).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1097, 11, 27, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永長" + (objDate.getUTCFullYear() - 1096).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1099,  8, 15, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "承徳" + (objDate.getUTCFullYear() - 1096).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1104,  2,  8, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "康和" + (objDate.getUTCFullYear() - 1098).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1106,  4, 13, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長治" + (objDate.getUTCFullYear() - 1103).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1108,  8,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉承" + (objDate.getUTCFullYear() - 1105).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1110,  6, 31, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天仁" + (objDate.getUTCFullYear() - 1107).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1113,  7, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天永" + (objDate.getUTCFullYear() - 1109).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1118,  3, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永久" + (objDate.getUTCFullYear() - 1112).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1120,  4,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元永" + (objDate.getUTCFullYear() - 1117).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1124,  4, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "保安" + (objDate.getUTCFullYear() - 1119).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1126,  1, 15, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天治" + (objDate.getUTCFullYear() - 1123).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1131,  1, 28, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "大治" + (objDate.getUTCFullYear() - 1125).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1132,  8, 21, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天承" + (objDate.getUTCFullYear() - 1130).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1135,  5, 10, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長承" + (objDate.getUTCFullYear() - 1131).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1141,  7, 13, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "保延" + (objDate.getUTCFullYear() - 1134).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1142,  4, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永治" + (objDate.getUTCFullYear() - 1140).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1144,  2, 28, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "康治" + (objDate.getUTCFullYear() - 1141).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1145,  7, 12, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天養" + (objDate.getUTCFullYear() - 1143).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1151,  1, 14, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "久安" + (objDate.getUTCFullYear() - 1144).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1154, 11,  4, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "仁平" + (objDate.getUTCFullYear() - 1150).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1156,  4, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "久寿" + (objDate.getUTCFullYear() - 1153).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1159,  4,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "保元" + (objDate.getUTCFullYear() - 1155).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1160,  1, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "平治" + (objDate.getUTCFullYear() - 1158).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1161,  8, 24, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永暦" + (objDate.getUTCFullYear() - 1159).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1163,  4,  4, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "応保" + (objDate.getUTCFullYear() - 1160).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1165,  6, 14, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長寛" + (objDate.getUTCFullYear() - 1162).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1166,  8, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永万" + (objDate.getUTCFullYear() - 1164).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1169,  4,  6, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "仁安" + (objDate.getUTCFullYear() - 1165).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1171,  4, 27, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉応" + (objDate.getUTCFullYear() - 1168).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1175,  7, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "承安" + (objDate.getUTCFullYear() - 1170).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1177,  7, 29, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "安元" + (objDate.getUTCFullYear() - 1174).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1181,  7, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "治承" + (objDate.getUTCFullYear() - 1176).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1182,  5, 29, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "養和" + (objDate.getUTCFullYear() - 1180).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1184,  4, 27, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寿永" + (objDate.getUTCFullYear() - 1181).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1185,  8,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元暦" + (objDate.getUTCFullYear() - 1183).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1190,  4, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文治" + (objDate.getUTCFullYear() - 1184).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1199,  4, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "建久" + (objDate.getUTCFullYear() - 1189).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1201,  2, 19, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正治" + (objDate.getUTCFullYear() - 1198).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1204,  2, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "建仁" + (objDate.getUTCFullYear() - 1200).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1206,  5,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元久" + (objDate.getUTCFullYear() - 1203).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1207, 10, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "建永" + (objDate.getUTCFullYear() - 1205).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1211,  3, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "承元" + (objDate.getUTCFullYear() - 1206).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1214,  0, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "建暦" + (objDate.getUTCFullYear() - 1210).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1219,  4, 27, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "建保" + (objDate.getUTCFullYear() - 1213).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1222,  4, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "承久" + (objDate.getUTCFullYear() - 1218).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1224, 11, 31, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "貞応" + (objDate.getUTCFullYear() - 1221).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1225,  4, 28, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元仁" + (objDate.getUTCFullYear() - 1223).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1228,  0, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉禄" + (objDate.getUTCFullYear() - 1224).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1229,  2, 31, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "安貞" + (objDate.getUTCFullYear() - 1227).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1232,  3, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛喜" + (objDate.getUTCFullYear() - 1228).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1233,  4, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "貞永" + (objDate.getUTCFullYear() - 1231).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1234, 10, 27, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天福" + (objDate.getUTCFullYear() - 1232).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1235, 10,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文暦" + (objDate.getUTCFullYear() - 1233).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1238, 11, 30, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉禎" + (objDate.getUTCFullYear() - 1234).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1239,  2, 13, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "暦仁" + (objDate.getUTCFullYear() - 1237).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1240,  7,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延応" + (objDate.getUTCFullYear() - 1238).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1243,  2, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "仁治" + (objDate.getUTCFullYear() - 1239).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1247,  3,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛元" + (objDate.getUTCFullYear() - 1242).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1249,  4,  2, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "宝治" + (objDate.getUTCFullYear() - 1246).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1256,  9, 24, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "建長" + (objDate.getUTCFullYear() - 1248).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1257,  2, 31, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "康元" + (objDate.getUTCFullYear() - 1255).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1259,  3, 20, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正嘉" + (objDate.getUTCFullYear() - 1256).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1260,  4, 24, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正元" + (objDate.getUTCFullYear() - 1258).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1261,  2, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文応" + (objDate.getUTCFullYear() - 1259).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1264,  2, 27, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "弘長" + (objDate.getUTCFullYear() - 1260).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1275,  4, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文永" + (objDate.getUTCFullYear() - 1263).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1278,  2, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "建治" + (objDate.getUTCFullYear() - 1274).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1288,  4, 29, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "弘安" + (objDate.getUTCFullYear() - 1277).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1293,  8,  6, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正応" + (objDate.getUTCFullYear() - 1287).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1299,  4, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永仁" + (objDate.getUTCFullYear() - 1292).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1302, 11, 10, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正安" + (objDate.getUTCFullYear() - 1298).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1303,  8, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "乾元" + (objDate.getUTCFullYear() - 1301).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1307,  0, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉元" + (objDate.getUTCFullYear() - 1302).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1308, 10, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "徳治" + (objDate.getUTCFullYear() - 1306).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1311,  4, 17, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延慶" + (objDate.getUTCFullYear() - 1307).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1312,  3, 27, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "応長" + (objDate.getUTCFullYear() - 1310).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1317,  2, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正和" + (objDate.getUTCFullYear() - 1311).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1319,  4, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文保" + (objDate.getUTCFullYear() - 1316).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1321,  2, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元応" + (objDate.getUTCFullYear() - 1318).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1324, 11, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元亨" + (objDate.getUTCFullYear() - 1320).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1326,  4, 28, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正中" + (objDate.getUTCFullYear() - 1323).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1329,  8, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉暦" + (objDate.getUTCFullYear() - 1325).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1331,  8, 11, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元徳" + (objDate.getUTCFullYear() - 1328).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1334,  2,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元弘" + (objDate.getUTCFullYear() - 1330).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1336,  3, 11, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "建武" + (objDate.getUTCFullYear() - 1333).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1340,  4, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延元" + (objDate.getUTCFullYear() - 1335).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1347,  0, 20, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "興国" + (objDate.getUTCFullYear() - 1339).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1370,  7, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正平" + (objDate.getUTCFullYear() - 1346).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1372,  4,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "建徳" + (objDate.getUTCFullYear() - 1369).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1375,  5, 26, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文中" + (objDate.getUTCFullYear() - 1371).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1381,  2,  6, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天授" + (objDate.getUTCFullYear() - 1374).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1384,  4, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "弘和" + (objDate.getUTCFullYear() - 1380).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1394,  7,  2, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "明徳" + (objDate.getUTCFullYear() - 1383).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1428,  5, 10, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "応永" + (objDate.getUTCFullYear() - 1393).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1429,  9,  3, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正長" + (objDate.getUTCFullYear() - 1427).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1441,  2, 10, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永享" + (objDate.getUTCFullYear() - 1428).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1444,  1, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉吉" + (objDate.getUTCFullYear() - 1440).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1449,  7, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文安" + (objDate.getUTCFullYear() - 1443).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1452,  7, 10, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "宝徳" + (objDate.getUTCFullYear() - 1448).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1455,  8,  6, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "享徳" + (objDate.getUTCFullYear() - 1451).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1457,  9, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "康正" + (objDate.getUTCFullYear() - 1454).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1461,  1,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長禄" + (objDate.getUTCFullYear() - 1456).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1466,  2, 14, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛正" + (objDate.getUTCFullYear() - 1460).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1467,  3,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文正" + (objDate.getUTCFullYear() - 1465).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1469,  5,  8, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "応仁" + (objDate.getUTCFullYear() - 1466).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1487,  7,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文明" + (objDate.getUTCFullYear() - 1468).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1489,  8, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "長享" + (objDate.getUTCFullYear() - 1486).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1492,  7, 12, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延徳" + (objDate.getUTCFullYear() - 1488).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1501,  2, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "明応" + (objDate.getUTCFullYear() - 1491).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1504,  2, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文亀" + (objDate.getUTCFullYear() - 1500).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1521,  8, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永正" + (objDate.getUTCFullYear() - 1503).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1528,  8,  3, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "大永" + (objDate.getUTCFullYear() - 1520).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1532,  7, 29, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "享禄" + (objDate.getUTCFullYear() - 1527).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1555, 10,  7, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天文" + (objDate.getUTCFullYear() - 1531).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1558,  2, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "弘治" + (objDate.getUTCFullYear() - 1554).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1570,  4, 27, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "永禄" + (objDate.getUTCFullYear() - 1557).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1573,  7, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元亀" + (objDate.getUTCFullYear() - 1569).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1593,  0, 10, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天正" + (objDate.getUTCFullYear() - 1572).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1596, 11, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文禄" + (objDate.getUTCFullYear() - 1592).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1615,  8,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "慶長" + (objDate.getUTCFullYear() - 1595).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1624,  3, 17, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元和" + (objDate.getUTCFullYear() - 1614).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1645,  0, 13, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛永" + (objDate.getUTCFullYear() - 1623).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1648,  3,  7, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正保" + (objDate.getUTCFullYear() - 1644).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1652,  9, 20, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "慶安" + (objDate.getUTCFullYear() - 1647).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1655,  4, 18, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "承応" + (objDate.getUTCFullYear() - 1651).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1658,  7, 21, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "明暦" + (objDate.getUTCFullYear() - 1654).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1661,  4, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "万治" + (objDate.getUTCFullYear() - 1657).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1673,  9, 30, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛文" + (objDate.getUTCFullYear() - 1660).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1681, 10,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延宝" + (objDate.getUTCFullYear() - 1672).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1684,  3,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天和" + (objDate.getUTCFullYear() - 1680).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1688,  9, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "貞享" + (objDate.getUTCFullYear() - 1683).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1704,  3, 16, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元禄" + (objDate.getUTCFullYear() - 1687).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1711,  5, 11, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "宝永" + (objDate.getUTCFullYear() - 1703).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1716,  7,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "正徳" + (objDate.getUTCFullYear() - 1710).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1736,  5,  7, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "享保" + (objDate.getUTCFullYear() - 1715).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1741,  3, 12, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元文" + (objDate.getUTCFullYear() - 1735).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1744,  3,  3, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛保" + (objDate.getUTCFullYear() - 1740).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1748,  7,  5, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "延享" + (objDate.getUTCFullYear() - 1743).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1751, 11, 14, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛延" + (objDate.getUTCFullYear() - 1747).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1764,  5, 30, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "宝暦" + (objDate.getUTCFullYear() - 1750).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1772, 11, 10, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "明和" + (objDate.getUTCFullYear() - 1763).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1781,  3, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "安永" + (objDate.getUTCFullYear() - 1771).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1789,  1, 19, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天明" + (objDate.getUTCFullYear() - 1780).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1801,  2, 19, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "寛政" + (objDate.getUTCFullYear() - 1788).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1804,  2, 22, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "享和" + (objDate.getUTCFullYear() - 1800).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1818,  4, 26, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文化" + (objDate.getUTCFullYear() - 1803).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1831,  0, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文政" + (objDate.getUTCFullYear() - 1817).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1845,  0,  9, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "天保" + (objDate.getUTCFullYear() - 1830).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1848,  3,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "弘化" + (objDate.getUTCFullYear() - 1844).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1855,  0, 15, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "嘉永" + (objDate.getUTCFullYear() - 1847).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1860,  3,  8, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "安政" + (objDate.getUTCFullYear() - 1854).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1861,  2, 29, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "万延" + (objDate.getUTCFullYear() - 1859).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1864,  2, 27, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "文久" + (objDate.getUTCFullYear() - 1860).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1865,  4,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "元治" + (objDate.getUTCFullYear() - 1863).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1868,  9, 23, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "慶応" + (objDate.getUTCFullYear() - 1864).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1912,  6, 30, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "明治" + (objDate.getUTCFullYear() - 1867).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1926, 11, 25, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "大正" + (objDate.getUTCFullYear() - 1911).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(1989,  0,  8, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "昭和" + (objDate.getUTCFullYear() - 1925).toString());
      else if (objDate.getTime() < (new Date(Date.UTC(2019,  4,  1, 0, 0, 0, 0))).getTime()) strResult = strResult.replace(/%jp/g , "平成" + (objDate.getUTCFullYear() - 1988).toString());
      else                                                                                   strResult = strResult.replace(/%jp/g , "令和" + (objDate.getUTCFullYear() - 2018).toString());
    }
    return strResult;
  }
  /******************************************************************************/
  /* button_range.click                                                         */
  /******************************************************************************/
  #setRange()
  {
    this.#rangebuttonElement.addEventListener('click', () =>
    {
      this.#rangebuttonElement.classList.toggle("active");

      if (this.#rangebuttonElement.classList.contains("active"))
      {
        this.#rangeCurrentTime                 = this.#currentTime.getTime();
        this.#railElement.style.pointerEvents  = "none"; 
        this.#rangeElement.style.pointerEvents = "auto";
        this.#pickElement.style.pointerEvents  = "auto";

        if (this.#enableHeaderBar)
        {
          this.#calendarbtnElement.classList.add("disable1");
          this.#timebtnElement.classList.add("disable1");
        }
        if (this.#enableFunctionBar)
        {
          this.#buttonloopElement.style.visibility = "visible";
        }

        if (this.#checkRangeBar())
        {
          this.showRangeBar();
        }
        else
        {
          let objStartTime      = new Date(this.#minTime.getTime() > this.#startTime.getTime() ? this.#minTime.getTime() : this.#startTime.getTime());
          let objEndTime        = new Date(this.#maxTime.getTime() < this.#endTime  .getTime() ? this.#maxTime.getTime() : this.#endTime  .getTime());
          let objRangeStartTime = new Date(this.#currentTime.getTime() - this.#mainElement.clientWidth / 16 * this.#scale);
          let objRangeEndTime   = new Date(this.#currentTime.getTime() + this.#mainElement.clientWidth / 16 * this.#scale);

          if (objRangeStartTime.getTime() < objStartTime.getTime())
          {
            objRangeStartTime = new Date(objStartTime.getTime());
            objRangeEndTime   = new Date(objStartTime.getTime() + this.#mainElement.clientWidth / 8 * this.#scale);
          }

          if (objRangeEndTime.getTime() > objEndTime.getTime())
          {
            objRangeEndTime   = new Date(objEndTime.getTime());
            objRangeStartTime = new Date(objEndTime.getTime() - this.#mainElement.clientWidth / 8 * this.#scale);
          }

          this.showRangeBar({ rangeStartTime : objRangeStartTime, rangeEndTime : objRangeEndTime });

          this.#rangeStartTime = objRangeStartTime;
          this.#rangeEndTime   = objRangeEndTime;

          this.dispatchEvent(new CustomEvent("rangeChange"));
          this.dispatchEvent(new CustomEvent("change"));          
        }
      }
      else
      {
        this.hiddenRangeBar();
        this.#disableZoom                       = false;
        this.#railElement.style.pointerEvents   = ""; 
        this.#rangeElement.style.pointerEvents  = "";
        this.#pickElement.style.pointerEvents   = "";

        if (this.#enableHeaderBar)
        {
          this.#calendarbtnElement.classList.remove("disable1");
          this.#timebtnElement.classList.remove("disable1");
        }
        if (this.#enableFunctionBar)
        {
          this.#buttonloopElement.style.visibility = "hidden";
          this.#buttonloopElement.classList.remove("action");
        }

        this.#loop = false;
      }
    });
  }
  /******************************************************************************/
  /* adjustCurrentTime                                                          */
  /******************************************************************************/
  adjustCurrentTime()
  {
    const $this = this;

    if (!$this.#rangeElement.classList.contains("k2go-timeline-range-show")) return;
    if ($this.#rangeElement.offsetWidth > 0)
    {
      if ($this.#startTime.getTime() > $this.#rangeEndTime.getTime() ||  $this.#endTime  .getTime() < $this.#rangeStartTime.getTime())
      {
        return;
      }
      else if ($this.#currentTime.getTime() < $this.#rangeStartTime.getTime())
      {
        let objTimeInfo = {};

        objTimeInfo.minTime     = new Date($this.#minTime    .getTime());
        objTimeInfo.maxTime     = new Date($this.#maxTime    .getTime());
        objTimeInfo.startTime   = new Date($this.#minTime    .getTime() > $this.#startTime     .getTime() ? $this.#minTime.getTime() : $this.#startTime     .getTime());
        objTimeInfo.endTime     = new Date($this.#maxTime    .getTime() < $this.#endTime       .getTime() ? $this.#maxTime.getTime() : $this.#endTime       .getTime());
        objTimeInfo.currentTime = new Date($this.#endTime    .getTime() < $this.#rangeStartTime.getTime() ? $this.#endTime.getTime() : $this.#rangeStartTime.getTime());
        Env       .currentTime = new Date(objTimeInfo.currentTime.getTime());
        Env       .creating    = true;

        $this.create(
          objTimeInfo,
          500,
          function callback()
          {
            Env.creating = false;
          }
        );
      }
      else if ($this.#currentTime.getTime() > $this.#rangeEndTime.getTime())
      {
        let objTimeInfo = {};

        objTimeInfo.minTime     = new Date($this.#minTime    .getTime());
        objTimeInfo.maxTime     = new Date($this.#maxTime    .getTime());
        objTimeInfo.startTime   = new Date($this.#minTime    .getTime() > $this.#startTime   .getTime() ? $this.#minTime  .getTime() : $this.#startTime   .getTime());
        objTimeInfo.endTime     = new Date($this.#maxTime    .getTime() < $this.#endTime     .getTime() ? $this.#maxTime  .getTime() : $this.#endTime     .getTime());
        objTimeInfo.currentTime = new Date($this.#startTime  .getTime() > $this.#rangeEndTime.getTime() ? $this.#startTime.getTime() : $this.#rangeEndTime.getTime());
        Env       .currentTime = new Date(objTimeInfo.currentTime.getTime());
        Env       .creating    = true;

        $this.create(
          objTimeInfo,
          500,
          function callback()
          {
            Env.creating = false;
          }
        );
      }
      else
        Env.currentTime = new Date($this.currentTime.getTime());
    }
    else
    {
      Env.currentTime = new Date($this.#currentTime.getTime());
    }
  }
  /******************************************************************************/
  /* checkRangeBar                                                              */
  /******************************************************************************/
  #checkRangeBar()
  {
    return   this.#startTime     .getTime() <= this.#rangeStartTime.getTime() && this.#rangeEndTime.getTime() <= this.#endTime     .getTime()
    &&  this.#rangeStartTime.getTime() <= this.#currentTime   .getTime() && this.#currentTime .getTime() <= this.#rangeEndTime.getTime()
    && (this.#rangeEndTime  .getTime() -  this.#rangeStartTime.getTime()) / this.#scale >= this.#pickElement.clientWidth * 3;
  }
  /******************************************************************************/
  /* adjustRangeBar                                                             */
  /******************************************************************************/
  adjustRangeBar()
  {
    const $this = this;
    const objRangeBound = this.#rangeElement.getBoundingClientRect();

    setTimeout(function _sleep()
    {
      if (Env.creating)
      {
        setTimeout(_sleep, 10);
        return;
      }

      if ($this.#rangeElement.classList.contains("k2go-timeline-range-show"))
      {
        if ($this.#checkRangeBar())
        {
          Env.startTime   = new Date($this.#minTime    .getTime() > $this.#startTime.getTime() ? $this.#minTime.getTime() : $this.#startTime.getTime());
          Env.endTime     = new Date($this.#maxTime    .getTime() < $this.#endTime  .getTime() ? $this.#maxTime.getTime() : $this.#endTime  .getTime());
          Env.currentTime = new Date($this.#currentTime.getTime());

          if ($this.#enableFunctionBar)
          {
            $this.#zoomrangeElement.value = $this.#getZoomLevel();
            $this.#changeZoomLevel();  
          }
        }
        else
        {
          let objTimeInfo = {};

          objTimeInfo.minTime     = new Date(Env.minTime    .getTime());
          objTimeInfo.maxTime     = new Date(Env.maxTime    .getTime());
          objTimeInfo.startTime   = new Date(Env.startTime  .getTime());
          objTimeInfo.endTime     = new Date(Env.endTime    .getTime());
          objTimeInfo.currentTime = new Date(Env.currentTime.getTime());

          Env.creating = true;
          document.querySelector("#lockWindow").classList.add("show");

          $this.create(
            objTimeInfo,
            500,
            function callback(pTimeInfo)
            {
              if ($this.#enableFunctionBar)
              {
                $this.#zoomrangeElement.value = $this.#getZoomLevel();
                $this.#changeZoomLevel();
              }
            }
          );

          this.dispatchEvent(new CustomEvent("afterCreateMethod"));
          document.querySelector("#lockWindow").classList.remove("show");
          Env.creating = false;
        }
      }
      else
      {
        Env.startTime   = new Date($this.#minTime    .getTime() > $this.#startTime.getTime() ? $this.#minTime.getTime() : $this.#startTime.getTime());
        Env.endTime     = new Date($this.#maxTime    .getTime() < $this.#endTime  .getTime() ? $this.#maxTime.getTime() : $this.#endTime  .getTime());
        Env.currentTime = new Date($this.#currentTime.getTime());

        if ($this.#enableFunctionBar)
        {
          $this.#zoomrangeElement.value = $this.#getZoomLevel();
          $this.#changeZoomLevel();
        }
      }
    }, 1);
  }
  /******************************************************************************/
  /* rangeChange                                                                */
  /******************************************************************************/
  #rangeChange(objRange)
  {
    this.#objRangeTime = objRange;
  }
  /******************************************************************************/
  /* rangeMoveEnd                                                               */
  /******************************************************************************/
  #rangeMoveEnd()
  {
    let objStartTime = this.#minTime.getTime() > this.#startTime.getTime() ? this.#minTime : this.#startTime;
    let objEndTime   = this.#maxTime.getTime() < this.#endTime  .getTime() ? this.#maxTime : this.#endTime;
    let pOptions     = {};

    if (this.#rangeStartTime < objStartTime)
    {
      objEndTime = new Date(objStartTime.getTime() + (this.#rangeEndTime.getTime() - this.#rangeStartTime.getTime()));
      pOptions   = { rangeStartTime : new Date(objStartTime.getTime()), rangeEndTime : new Date(objEndTime.getTime()) };
      this.showRangeBar(pOptions);
    }
    else if (this.#rangeEndTime > objEndTime)
    {
      objStartTime = new Date(objEndTime.getTime() - (this.#rangeEndTime.getTime() - this.#rangeStartTime.getTime()));
      pOptions     = { rangeStartTime : new Date(objStartTime.getTime()), rangeEndTime : new Date(objEndTime.getTime()) };
      this.showRangeBar(pOptions);
    }
    else
    {
      objStartTime = this.#rangeStartTime;
      objEndTime   = this.#rangeEndTime;
    }
    this.adjustCurrentTime();
    document.querySelector("#range_start_time span").innerHTML = this.formatDate(objStartTime, "%y-%mm-%dd %H:%M:%S");
	  document.querySelector("#range_end_time   span").innerHTML = this.formatDate(objEndTime,   "%y-%mm-%dd %H:%M:%S");

    this.dispatchEvent(new CustomEvent("rangeChange"));
    this.dispatchEvent(new CustomEvent("rangeMoveEnd"));
  }
  /******************************************************************************/
  /* #setHeaderDate                                                            */
  /******************************************************************************/
  #setHeaderDate(cTime) {
    if (!this.#enableHeaderBar) return;
    if (!this.#enableHeaderDate) this.dispatchEvent(new CustomEvent("setCustomData"));
    let headerdate = ""

    if(this.customImpl && this.customImpl.customTimeString && !this.#enableHeaderDate)
    {
      headerdate = this.customImpl.customTimeString();
    }
    else
    {
      if (!cTime) return;
      headerdate = this.formatDate(cTime, "%y-%mm-%dd %H:%M:%S", this.#timezoneOffset);
    } 
    this.#headerElement.shadowRoot.querySelector("[part='k2go-head-date']").innerHTML = headerdate;
  }
  /******************************************************************************/
  /* #setHeaderEvent                                                            */
  /******************************************************************************/
  #setHeaderEvent()
  {
    if (!this.#enableHeaderBar) return;
    /*-----* time btn *-------------------------------------------------------*/
    this.#timebtnElement.addEventListener("click", () =>
    {
      /*-----* time current *-------------------------------------------------------*/
      const $timebtn = this.#timebtnElement;
      const $this = this;

      if($timebtn.classList.contains("timeCurrent"))
      {
        let objTimeInfo = {};

        objTimeInfo.minTime     = new Date(this.#minTime    .getTime());
        objTimeInfo.maxTime     = new Date(this.#maxTime    .getTime());
        objTimeInfo.startTime   = new Date(this.#minTime    .getTime() > this.#startTime.getTime() ? this.#minTime.getTime() : this.#startTime.getTime());
        objTimeInfo.endTime     = new Date(this.#maxTime    .getTime() < this.#endTime  .getTime() ? this.#maxTime.getTime() : this.#endTime  .getTime());
        objTimeInfo.currentTime = new Date(this.#currentTime.getTime());

        let intDiff1 = objTimeInfo.currentTime.getTime() - objTimeInfo.startTime  .getTime();
        let intDiff2 = objTimeInfo.endTime    .getTime() - objTimeInfo.currentTime.getTime();

        if (!this.#enableNowtime) this.dispatchEvent(new CustomEvent("setCustomData"));

        if(this.customImpl && this.customImpl.appLatestTime) {
          objTimeInfo.currentTime.setTime(this.customImpl.appLatestTime());
        }
        else
        {
          objTimeInfo.currentTime.setTime(Date.now());
        }

        objTimeInfo.startTime  .setTime(objTimeInfo.currentTime.getTime() - intDiff1);
        objTimeInfo.endTime    .setTime(objTimeInfo.currentTime.getTime() + intDiff2);

        if (this.#minTime.getTime() > objTimeInfo.startTime.getTime()) objTimeInfo.startTime.setTime(this.#minTime.getTime());
        if (this.#maxTime.getTime() < objTimeInfo.endTime  .getTime()) objTimeInfo.endTime  .setTime(this.#maxTime.getTime());

        document.querySelector("#lockWindow").classList.add("show");

        this.create(
          objTimeInfo,
          function callback(pTimeInfo)
          {
            $timebtn.dataset.removeTimeNow = setTimeout(() =>
            {
              $timebtn.classList.remove("timeNow"    );
              $timebtn.classList.add   ("timeCurrent");
            }, 5000);
            
            $timebtn.classList.add   ("timeNow"    );
            $timebtn.classList.remove("timeCurrent");

            Env.creating = false;
            $this.adjustRangeBar();
            document.getElementById("event_info").innerHTML = `change time now`;
            document.querySelector("#lockWindow").classList.remove("show");
        })
      }
      /*-----* time now *-----------------------------------------------------------*/
      else if ($timebtn.classList.contains("timeNow"))
      {
        clearTimeout($timebtn.dataset.removeTimeNow);
        
        $timebtn.classList.add   ("timeNowPlay");
        $timebtn.classList.remove("timeNow"    );

        this.#calendarbtnElement.classList.add("disable2");
        this.#playboxElement    .classList.add("disable2");
        this.#sliderElement     .classList.add("disable2");
        this.#rangebuttonElement.classList.add("disable2");

        const objPlayerInfo = {
          fps      : 10,
          realTime : true,
          stop     : function()
          {
            $this.#calendarbtnElement.classList.remove("disable2");
            $this.#playboxElement    .classList.remove("disable2");
            $this.#sliderElement     .classList.remove("disable2");
            $this.#rangebuttonElement.classList.remove("disable2");
            document.querySelector("#lockWindow").classList.remove("show");
            $timebtn                 .classList.add   ("timeCurrent");
            $timebtn                 .classList.remove("timeNowPlay");
            $timebtn                 .dispatchEvent   (new Event("click"));
            $this.adjustRangeBar();
          }
        };

        this.start(objPlayerInfo);
      }
      /*-----* time now play *------------------------------------------------------*/
      else
      {
        document.querySelector("#lockWindow").classList.add("show");
        this.stop();
        $this.#calendarbtnElement.classList.remove("disable2");
        $this.#playboxElement    .classList.remove("disable2");
        $this.#sliderElement     .classList.remove("disable2");
        $this.#rangebuttonElement.classList.remove("disable2");
        document.querySelector("#lockWindow").classList.remove("show");
        $timebtn                 .classList.add   ("timeCurrent");
        $timebtn                 .classList.remove("timeNowPlay");
        $timebtn                 .dispatchEvent   (new Event("click"));
        clearTimeout(Env.timeoutIdCurrent);
      }
    });
  };
  /******************************************************************************/
  /* #setFunctionbarEvent                                                      */
  /******************************************************************************/
  #setCalendarEvent() {
    if (!this.#enableHeaderBar) return;
    this.#calendarbtnElement.addEventListener("click", () =>
    {
      console.log("openCalendar");
      this.dispatchEvent(new CustomEvent("openCalendar", { detail: this.#calendarbtnElement }));
    });
  }
  /******************************************************************************/
  /* #setFunctionbarEvent                                                      */
  /******************************************************************************/
  #setFunctionbarEvent()
  {
    if (!this.#enableFunctionBar) return;
    /******************************************************************************/
    /* #panel-conf action                                                         */
    /******************************************************************************/
    this.#buttonConfElement.addEventListener("click", () =>
    {
      if (this.#panelConfElement.classList.contains("active"))
      {
        this.#buttonConfElement.classList.remove("active");
        this.#panelConfElement .classList.remove("active");
      }
      else
      {
        this.#buttonConfElement.classList.add("active");
        this.#panelConfElement .classList.add("active");
      }
    });
    /******************************************************************************/
    /* #panel-conf-close action                                                   */
    /******************************************************************************/
    this.#panelConfCloseElement.addEventListener("click", () =>
    {
      this.#buttonConfElement.classList.remove("active");
      this.#panelConfElement .classList.remove("active");
    });
  }
  /******************************************************************************/
  /* panel-conf                                                                 */
  /******************************************************************************/
  #setPanelEvent()
  {
    if (!this.#enableFunctionBar) return;
    let $this = this;
    /*-----* play-speed *---------------------------------------------------------*/
    this.#playspeedElement.addEventListener("input", () => 
    {
      $this.#setplayspeed();
    });
    /*-----* play-span *----------------------------------------------------------*/
    this.#playspanElement.addEventListener("input", () => 
    {
      $this.#setplayspan();
    });
  }
  /******************************************************************************/
  /* panel-info                                                                 */
  /******************************************************************************/
  #setplayspeed()
  {
    this.#display1Element.innerHTML = (Env.playTable[this.#playspeedElement.value - 1] + " Sec");
    Env.playInterval               = Env.playTable[Math.round(this.#playspeedElement.value) - 1];
  }
  #setplayspan()
  {
    this.#display2Element.innerHTML = this.#makeTime(Math.floor(Env.playSpanTable[Math.round(this.#playspanElement.value) - 1]));
    Env.frameInterval              = Env.playSpanTable[Math.round(this.#playspanElement.value) - 1];
  }
  /******************************************************************************/
  /* makeTime                                                                   */
  /******************************************************************************/
  #makeTime(pTime)
  {
    if      (pTime <  1000 * 60                                    ) return (pTime /  1000           ).toFixed(0) + " sec";
    else if (pTime >= 1000 * 60      && pTime < 1000 * 60 * 60     ) return (pTime / (1000 * 60     )).toFixed(1) + " min";
    else if (pTime >= 1000 * 60 * 60 && pTime < 1000 * 60 * 60 * 24) return (pTime / (1000 * 60 * 60)).toFixed(1) + " hour";
    else
    {
      let intDay = (pTime / (1000 * 60 * 60 * 24)).toFixed(0);

      if (intDay == 1) return intDay + " day";
      else             return intDay + " days";
    }
  }
  /******************************************************************************/
  /* zoom-range event                                                           */
  /******************************************************************************/
  #setZoomRangeEvent()
  {
    if (!this.#enableFunctionBar) return;
    let $this = this;

    /*-----* zoom-range.input *---------------------------------------------------*/
    this.#zoomrangeElement.addEventListener("input", () =>
    {
      $this.#changeZoomLevel();

      if (!Env.creating)
      {
         let intValue = parseInt($this.#zoomrangeElement.value, 10);

          if (intValue != $this.#getZoomLevel())
          {
            Env.creating = true;

            let objZoomInfo        = Env.zoomTable[intValue];
            let objOffsetPixelInfo = {};
            let objTimeInfo        = {}; 
            let intPixelSize;
            
            objOffsetPixelInfo.startTime   = $this.getOffsetFromTime(this.#minTime > this.#startTime ? this.#minTime  : this.#startTime);
            objOffsetPixelInfo.endTime     = $this.getOffsetFromTime(this.#maxTime < this.#endTime   ? this.#maxTime  : this.#endTime  );
            objOffsetPixelInfo.currentTime = $this.getOffsetFromTime(this.#currentTime);
            
            intPixelSize = objZoomInfo.value / (objOffsetPixelInfo.endTime - objOffsetPixelInfo.startTime);

            objTimeInfo.minTime      = new Date(this.#minTime);
            objTimeInfo.maxTime      = new Date(this.#maxTime);
            objTimeInfo.currentTime  = new Date(this.#currentTime);
            objTimeInfo.startTime    = new Date(this.#currentTime           - intPixelSize * (objOffsetPixelInfo.currentTime - objOffsetPixelInfo.startTime  ));
            objTimeInfo.endTime      = new Date(this.#currentTime.getTime() + intPixelSize * (objOffsetPixelInfo.endTime     - objOffsetPixelInfo.currentTime));
            
            if( objTimeInfo.startTime < this.#minTime ) objTimeInfo.startTime = this.#minTime;
            if( objTimeInfo.endTime   > this.#maxTime ) objTimeInfo.endTime   = this.#maxTime;

            $this.create(
              objTimeInfo,
              function callback(pTimeInfo)
              {
                Env.creating = false;
                $this.#zoomrangeElement.dispatchEvent   (new Event("input"));
              }
            )
          }
      }
    });
    /*-----* zoom-range.change *--------------------------------------------------*/
    this.#zoomrangeElement.addEventListener("change", () =>
    {
      $this.adjustRangeBar();
    });
    /*-----* plus or minus.click *------------------------------------------------*/
    this.#sliderElement.addEventListener("click" , function(event)
    {
      let target    = event.target;
      let partname = target.getAttribute('part');

      let intValue = parseInt($this.#zoomrangeElement.value, 10);

      if(target.tagName.toLowerCase() === 'a')
      {
        if (partname == ("k2go-button-minus")) intValue --; 
        else                                   intValue ++;                  

        $this.#zoomrangeElement.value = intValue
        $this.#zoomrangeElement.dispatchEvent   (new Event("input"));
        $this.#zoomrangeElement.dispatchEvent   (new Event("change"));
      }
    });
  }
  /******************************************************************************/
  /* changeZoomLevel                                                            */
  /******************************************************************************/
  #changeZoomLevel()
  {
    let intZoomRange = parseInt(this.#zoomrangeElement.value, 10);
    this.#sliderlabelElement.innerHTML = Env.zoomTable[intZoomRange].name; 
    this.#buttonminusElement.classList.toggle("disable",   intZoomRange == 0);
    this.#buttonplusElement .classList.toggle("disable",   intZoomRange == Env.zoomTable.length - 1);
    if (this.#enableHeaderBar)
    {
      this.#calendardate      .classList.toggle("expansion", this.#scale <= 40);
    }
  }
  /******************************************************************************/
  /* getZoomLevel                                                               */
  /******************************************************************************/
  #getZoomLevel()
  {
    let intSize = this.#endTime - this.#startTime;

    if (Env.zoomTable[0] <= intSize)
    {
      return 0;
    }
    else if (Env.zoomTable[Env.zoomTable.length - 1] >= intSize)
    {
      return Env.zoomTable.length - 1;
    }
    else
    {
      let diff = [];
      let index = 0;

      Env.zoomTable.forEach(function (val, i)
      {
        diff[i] = Math.abs(intSize - val.value);
        index = diff[index] < diff[i] ? index : i;
      });
      return index;
    }
  }
  /******************************************************************************/
  /* select_data event                                                             */
  /******************************************************************************/
  #setSelectDataEvent()
  {
    if (!this.#enableFunctionBar) return;
    this.#selectDataElement.addEventListener("click", () =>
    {
      this.dispatchEvent(new CustomEvent("selectData", { detail: this.#selectDataElement }));
    });
  }
  /******************************************************************************/
  /* view_url event                                                             */
  /******************************************************************************/
  #setViewurlEvent()
  {
    if (!this.#enableFunctionBar) return;
    let $this = this;
    /*-----* button_view_url.click *----------------------------------------------*/
    this.#buttonviewurlElement.addEventListener("click", () =>
    {
      let strUurl;
      let baseUrl = window.location.origin + window.location.pathname + "?" + "st=" + $this.startTime.getTime() + "&et=" + $this.endTime.getTime() + "&ct=" + $this.currentTime.getTime();
      let addParam;

      if (!this.#disableViewURL) this.dispatchEvent(new CustomEvent("setCustomData"));
  
      if(this.customImpl && this.customImpl.customViewURL) {
        addParam = this.customImpl.customViewURL();
        strUurl = baseUrl + addParam;
      }
      else
      {
        strUurl = baseUrl;
      }
      
      $this.#viewurlinputElement.value    = strUurl;
      $this.#viewurlinputElement.setAttribute("aria-label" , strUurl );
      $this.#viewurlElement.style.display = "block"; 
      $this.#inputgroupbuttonElement.dispatchEvent(new Event("click"));
    });
    /*-----* input_group_button.click *--------------------------------------------*/
    this.#inputgroupbuttonElement.addEventListener("click", () =>
    {
      $this.#viewurlinputElement.select();
      document.execCommand("Copy");
    });
    /*-----* view_url_box_close.click *-------------------------------------------*/
    this.#viewurlboxcloseElement.addEventListener("click", () =>
    {
      $this.#viewurlElement.style.display = "none";
    });
  }
  /******************************************************************************/
  /* help event                                                             */
  /******************************************************************************/
  #setHelpEvent()
  {
    if (!this.#enableFunctionBar) return;
    this.#helpElement.addEventListener("click", () =>
    {
      this.dispatchEvent(new CustomEvent("viewHelp", { detail: this.#helpElement }));
    });
  }
  /******************************************************************************/
  /* play_box.click                                                             */
  /******************************************************************************/
  #setPlayboxEvent()
  {
    if (!this.#enableFunctionBar) return;
    let $this = this;
    this.#buttonstopElement.addEventListener("click", () =>
    {
      $this.#buttonplayElement             .classList.remove("play_frame");
      $this.#buttonplayreverseElement      .classList.remove("play_frame_rev");
      clearTimeout(Env.timeoutIdFwd);
      clearTimeout(Env.timeoutIdBack);
      $this.#formtitleplayspeedtitleElement.classList.remove("fx");
      if (this.#enableHeaderBar) 
      {
        $this.#calendarbtnElement            .classList.remove("disable2");
        $this.#timebtnElement                .classList.remove("disable2");
      }
      $this.#sliderElement                 .classList.remove("disable2");
      $this.#rangebuttonElement            .classList.remove("disable2");
      $this.#mainElement                   .classList.remove("disable2");
    });
    /*-----* button_play *--------------------------------------------------------*/
    $this.#buttonplayElement.addEventListener("click", () =>
    {
      $this.#formtitleplayspeedtitleElement.classList.remove("fx");
      setTimeout(function() { $this.#formtitleplayspeedtitleElement.classList.add("fx")}, 100);
      clearTimeout(Env.timeoutIdBack);
      $this.#buttonplayreverseElement.classList.remove("play_frame_rev");
      $this.#buttonplayElement       .classList.add("play_frame");
      if (this.#enableHeaderBar) 
      {
        $this.#calendarbtnElement      .classList.add("disable2");
        $this.#timebtnElement          .classList.add("disable2");
      }
      $this.#sliderElement           .classList.add("disable2");
      $this.#rangebuttonElement      .classList.add("disable2");
      $this.#mainElement             .classList.add("disable2");

      Env.timeoutIdFwd = setTimeout(function _loop()
      {
        if (!$this.#buttonplayElement.classList.contains("play_frame")) return;

        if ($this.#rangebuttonElement.classList.contains("active"))
        {
          if ($this.#currentTime.getTime() < $this.#getRangeInfo().rangeEndTime)
          {
            let e = new CustomEvent('click', {detail: { flg : true}} );
            $this.#buttonfwdElement.dispatchEvent(e);
            Env.timeoutIdFwd = setTimeout(function() { _loop() }, Env.playInterval * 1000);
          }
          else
          {
            if ($this.#buttonloopElement.classList.contains("active"))
            {
              $this.#buttonbackedgeElement.dispatchEvent(new Event("click"));
              Env.timeoutIdFwd = setTimeout(function() { _loop() }, Env.playInterval * 1000);
            }
            else
              $this.#buttonstopElement.dispatchEvent(new Event("click"));
          }
        }
        else
        {
          if ($this.#endTime.getTime() < $this.#maxTime.getTime())
          {
            let e = new CustomEvent('click', {detail: { flg : true}} );
            $this.#buttonfwdElement.dispatchEvent(e);
            Env.timeoutIdFwd = setTimeout(function() { _loop() }, Env.playInterval * 1000);
          }
          else
            $this.#buttonstopElement.dispatchEvent(new Event("click"));
        }
      }, 1);
    });
    /*-----* button_play_rev *----------------------------------------------------*/
    $this.#buttonplayreverseElement.addEventListener("click", () =>
    {
      $this.#formtitleplayspeedtitleElement.classList.remove("fx");
      setTimeout(function() { $this.#formtitleplayspeedtitleElement.classList.add("fx")}, 100);

      clearTimeout(Env.timeoutIdFwd);

      $this.#buttonplayElement       .classList.remove("play_frame");
      $this.#buttonplayreverseElement.classList.add   ("play_frame_rev");
      
      if (this.#enableHeaderBar) 
      {
        $this.#calendarbtnElement.classList.add("disable2");
        $this.#timebtnElement    .classList.add("disable2");
      }
      $this.#sliderElement     .classList.add("disable2");
      $this.#rangebuttonElement.classList.add("disable2");
      $this.#mainElement       .classList.add("disable2");

      Env.timeoutIdBack = setTimeout(function _loop()
      {
        if (!$this.#buttonplayreverseElement.classList.contains("play_frame_rev")) return;

        if ($this.#rangebuttonElement.classList.contains("active"))
        {
          
          if ($this.#currentTime.getTime() > $this.#getRangeInfo().rangeStartTime)
          {
            let e = new CustomEvent('click', {detail: { flg : true}} );
            $this.#buttonbackElement.dispatchEvent(e);
            Env.timeoutIdBack = setTimeout(function() { _loop() }, Env.playInterval * 1000);
          }
          else
          {
            if ($this.#buttonloopElement.classList.contains("active"))
            {
              $this.#buttonfwdedgeElement.dispatchEvent(new Event("click"));
              Env.timeoutIdBack = setTimeout(function() { _loop() }, Env.playInterval * 1000);
            }
            else
              $this.#buttonstopElement.dispatchEvent(new Event("click"));
          }
        }
        else
        {
          if ($this.#startTime.getTime() > $this.#minTime.getTime())
          {
            let e = new CustomEvent('click', {detail: { flg : true}} );
            $this.#buttonbackElement.dispatchEvent(e);
            Env.timeoutIdBack = setTimeout(function() { _loop() }, Env.playInterval * 1000);
          }
          else
            $this.#buttonstopElement.dispatchEvent(new Event("click"));
        }
      }, 1);
    });
    /*-----* button_fwd (Frame Play) *-------------------------------------------*/
    $this.#buttonfwdElement.addEventListener("click", (pEvent) =>
    {
      if (!pEvent.detail.flg)
      {
        $this.#formtitleplayspantitleElement.classList.add("fx");
        setTimeout(function() { $this.#formtitleplayspantitleElement.classList.remove("fx")}, 400);
      }

      let objTimeInfo = {};

      objTimeInfo.minTime = new Date($this.#minTime.getTime());
      objTimeInfo.maxTime = new Date($this.#maxTime.getTime());
      
      if ($this.#rangebuttonElement.classList.contains("active"))
      {
        objTimeInfo.startTime   = new Date($this.#startTime  .getTime());
        objTimeInfo.endTime     = new Date($this.#endTime    .getTime());
        objTimeInfo.currentTime = new Date($this.#currentTime.getTime() + Env.frameInterval);

        if ($this.#getRangeInfo().rangeEndTime< objTimeInfo.currentTime.getTime()) objTimeInfo.currentTime = new Date($this.#getRangeInfo().rangeEndTime);
      }
      else
      {
        objTimeInfo.startTime   = new Date($this.#startTime  .getTime() + Env.frameInterval);
        objTimeInfo.endTime     = new Date($this.#endTime    .getTime() + Env.frameInterval);
        objTimeInfo.currentTime = new Date($this.#currentTime.getTime() + Env.frameInterval);

        let intDiff1 = objTimeInfo.endTime.getTime() - objTimeInfo.  startTime.getTime();
        let intDiff2 = objTimeInfo.endTime.getTime() - objTimeInfo.currentTime.getTime();

        if ($this.#maxTime.getTime() < objTimeInfo.endTime.getTime())
        {
          objTimeInfo.endTime     = new Date($this.#maxTime.getTime());
          objTimeInfo.startTime   = new Date($this.#endTime.getTime() - intDiff1);
          objTimeInfo.currentTime = new Date($this.#endTime.getTime() - intDiff2);
        }
      }

      $this.create(objTimeInfo, null);
    });
    /*-----* button_Fwd_Edge (to Edge) *--------------------------------------------*/
    $this.#buttonfwdedgeElement.addEventListener("click", () =>
    {
      let objTimeInfo = {};

      objTimeInfo.startTime = new Date($this.#startTime.getTime());
      objTimeInfo.  endTime = new Date($this.#endTime.  getTime());
      objTimeInfo.  minTime = new Date($this.#minTime.  getTime());
      objTimeInfo.  maxTime = new Date($this.#maxTime.  getTime());

      if ($this.#rangebuttonElement.classList.contains("active")) objTimeInfo.currentTime = new Date($this.#getRangeInfo().rangeEndTime);
      else                                                        objTimeInfo.currentTime = new Date($this.#endTime.getTime());

      $this.create(objTimeInfo, null);
    });
    /*-----* button_back (Frame Play) *------------------------------------------*/
    $this.#buttonbackElement.addEventListener("click", (pEvent) =>
    {
      if (!pEvent.detail.flg)
      {
        $this.#formtitleplayspantitleElement.classList.add("fx");
        setTimeout(function() { $this.#formtitleplayspantitleElement.classList.remove("fx")}, 400);
      }

      let objTimeInfo = {};

      objTimeInfo.minTime = new Date($this.#minTime.getTime());
      objTimeInfo.maxTime = new Date($this.#maxTime.getTime());
      
      if ($this.#rangebuttonElement.classList.contains("active"))
      {
        objTimeInfo.startTime   = new Date($this.#startTime  .getTime());
        objTimeInfo.endTime     = new Date($this.#endTime    .getTime());
        objTimeInfo.currentTime = new Date($this.#currentTime.getTime() - Env.frameInterval);

        if ($this.#getRangeInfo().rangeStartTime > objTimeInfo.currentTime.getTime()) objTimeInfo.currentTime = new Date($this.#getRangeInfo().rangeStartTime);
      }
      else
      {
        objTimeInfo.startTime   = new Date($this.#startTime  .getTime() - Env.frameInterval);
        objTimeInfo.endTime     = new Date($this.#endTime    .getTime() - Env.frameInterval);
        objTimeInfo.currentTime = new Date($this.#currentTime.getTime() - Env.frameInterval);

        let intDiff1 = objTimeInfo.endTime.    getTime() - objTimeInfo.startTime.getTime();
        let intDiff2 = objTimeInfo.currentTime.getTime() - objTimeInfo.startTime.getTime()

        if ($this.#minTime.getTime() > objTimeInfo.startTime.getTime())
        {
          objTimeInfo.startTime   = new Date($this.#minTime.getTime());
          objTimeInfo.endTime     = new Date($this.#startTime.getTime() + intDiff1);
          objTimeInfo.currentTime = new Date($this.#startTime.getTime() + intDiff2);
        }
      }

      $this.create(objTimeInfo, null);
    });
    /*-----* button_back_Edge (to Edge) *----------------------------------------*/
    $this.#buttonbackedgeElement.addEventListener("click", () =>
    {
      let objTimeInfo = {};

      objTimeInfo.startTime = new Date($this.#startTime.getTime());
      objTimeInfo.  endTime = new Date($this.#endTime.  getTime());
      objTimeInfo.  minTime = new Date($this.#minTime.  getTime());
      objTimeInfo.  maxTime = new Date($this.#maxTime.  getTime());

      if ($this.#rangebuttonElement.classList.contains("active")) objTimeInfo.currentTime = new Date($this.#getRangeInfo().rangeStartTime);
      else                                                        objTimeInfo.currentTime = new Date($this.#startTime.getTime());

      $this.create(objTimeInfo, null);
    });
    /*-----* loop *---------------------------------------------------------------*/
    $this.#buttonloopElement.addEventListener("click", () =>
    {
      $this.#buttonloopElement.classList.toggle("active");
    });
  }
  setCustom(customImpl)
  {
    this.customImpl = customImpl;
  }
}

customElements.define("k2go-timeline", K2goTimeline);
