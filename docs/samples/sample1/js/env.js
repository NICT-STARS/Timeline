/******************************************************************************/
/* Sample for k2goTimeline                                                    */
/* Inoue Computer Service.                                                    */
/******************************************************************************/
var $Env =
{
  minTime     : new Date((new Date()).getFullYear() - 10,                       0,                      1),
  maxTime     : new Date((new Date()).getFullYear() + 10,                       0,                      1),
  startTime   : new Date((new Date()).getFullYear()     , (new Date()).getMonth(), (new Date()).getDate(),  0,  0,  0,   0),
  endTime     : new Date((new Date()).getFullYear()     , (new Date()).getMonth(), (new Date()).getDate(), 23, 59, 59, 999),
  currentTime : new Date(     Date   .now        ()),
  creating    : false,
  restart     : false
};
