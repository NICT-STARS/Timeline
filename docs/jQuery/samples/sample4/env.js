/******************************************************************************/
/* Sample for k2goTimeline                                                    */
/* Inoue Computer Service.                                                    */
/******************************************************************************/
var $Env =
{
  data :
  [
    { name : "1920(大正09年)-01-01", start : new Date(Date.UTC(1920, 0, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(1950, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "1950(昭和25年)-10-01", start : new Date(Date.UTC(1950, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(1955, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "1955(昭和30年)-10-01", start : new Date(Date.UTC(1955, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(1960, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "1960(昭和35年)-10-01", start : new Date(Date.UTC(1960, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(1965, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "1965(昭和40年)-10-01", start : new Date(Date.UTC(1965, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(1970, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "1970(昭和45年)-10-01", start : new Date(Date.UTC(1970, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(1975, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "1975(昭和50年)-10-01", start : new Date(Date.UTC(1975, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(1980, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "1980(昭和55年)-10-01", start : new Date(Date.UTC(1980, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(1985, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "1985(昭和60年)-10-01", start : new Date(Date.UTC(1985, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(1995, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "1995(平成07年)-10-01", start : new Date(Date.UTC(1995, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2000, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "2000(平成12年)-10-01", start : new Date(Date.UTC(2000, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2005, 0, 1, -9, 0, 0, 0)), selected : false },
    { name : "2005(平成17年)-01-01", start : new Date(Date.UTC(2005, 0, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2006, 0, 1, -9, 0, 0, 0)), selected : false },
    { name : "2006(平成18年)-01-01", start : new Date(Date.UTC(2006, 0, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2007, 3, 1, -9, 0, 0, 0)), selected : false },
    { name : "2007(平成19年)-04-01", start : new Date(Date.UTC(2007, 3, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2007, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "2007(平成19年)-10-01", start : new Date(Date.UTC(2007, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2009, 2, 1, -9, 0, 0, 0)), selected : false },
    { name : "2009(平成21年)-03-01", start : new Date(Date.UTC(2009, 2, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2010, 2, 1, -9, 0, 0, 0)), selected : false },
    { name : "2010(平成22年)-03-01", start : new Date(Date.UTC(2010, 2, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2010, 9, 1, -9, 0, 0, 0)), selected : false },
    { name : "2010(平成22年)-10-01", start : new Date(Date.UTC(2010, 9, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2011, 2, 1, -9, 0, 0, 0)), selected : false },
    { name : "2011(平成23年)-03-01", start : new Date(Date.UTC(2011, 2, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2012, 3, 1, -9, 0, 0, 0)), selected : false },
    { name : "2012(平成24年)-04-01", start : new Date(Date.UTC(2012, 3, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2013, 3, 1, -9, 0, 0, 0)), selected : false },
    { name : "2013(平成25年)-04-01", start : new Date(Date.UTC(2013, 3, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2014, 3, 1, -9, 0, 0, 0)), selected : false },
    { name : "2014(平成26年)-04-01", start : new Date(Date.UTC(2014, 3, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2015, 0, 1, -9, 0, 0, 0)), selected : false },
    { name : "2015(平成27年)-01-01", start : new Date(Date.UTC(2015, 0, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2016, 0, 1, -9, 0, 0, 0)), selected : false },
    { name : "2016(平成28年)-01-01", start : new Date(Date.UTC(2016, 0, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2017, 0, 1, -9, 0, 0, 0)), selected : false },
    { name : "2017(平成29年)-01-01", start : new Date(Date.UTC(2017, 0, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2018, 0, 1, -9, 0, 0, 0)), selected : false },
    { name : "2018(平成30年)-01-01", start : new Date(Date.UTC(2018, 0, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2019, 0, 1, -9, 0, 0, 0)), selected : false },
    { name : "2019(平成31年)-01-01", start : new Date(Date.UTC(2019, 0, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2020, 0, 1, -9, 0, 0, 0)), selected : false },
    { name : "2020(令和02年)-01-01", start : new Date(Date.UTC(2020, 0, 1, -9, 0, 0, 0)), end : new Date(Date.UTC(2021, 0, 1, -9, 0, 0, 0)), selected : false }
  ],
  color :
  [
    "#b5184f",
    "#cd1f42",
    "#dd3737",
    "#e55125",
    "#e66d00",
    "#f29500",
    "#eeac00",
    "#e2c500",
    "#c8bb00",
    "#a4b300",
    "#4aa315",
    "#009a55",
    "#008c69",
    "#007e77",
    "#007c8c",
    "#006b93",
    "#005a91",
    "#00569c",
    "#00509d",
    "#663e8c",
    "#793580",
    "#892c71",
    "#ab2664"
  ],
  currentData : 26
};
