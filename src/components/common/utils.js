//获取当前的日期，合适为：yyyy-MM-dd HH:mm:ss
function getDateTime(now){
    var ymd = getDate(now);
    var hms = getTime(now);
    return ymd + " " + hms;
}
//获取当前日期，格式为：yyyy-MM-dd
function getDate(now){
    var year = getYear(now);
    var month = getMonth(now);
    var date = getDateOfMonth(now);
    return year + "-" + month + "-" + date ;
}
//获取当前日期，格式为：HH-mm-ss
function getTime(now){
    var hour = getHour(now);
    var minute = getMinute(now);
    var second = getSecond(now);
    return hour + ":" + minute + ":" + second;
}

function getSecond(date){
    return date.getSeconds();
}

function getMinute(date){
    return date.getMinutes();
}

function getHour(date){
    return date.getHours();
}

function getDateOfMonth(date){
    return date.getDate();
}

function getYear(date){
    return date.getFullYear();
}

function getMonth(date){
    return date.getMonth()+1;
}
/**
 * 获取两个日期相差的年份
 * @param subtrahendDate 减数日期对象
 * @param minuendDate 被减数日期对象
 */
function getSubstractYears(subtrahendDate,minuendDate){
    if(!subtrahendDate ||!minuendDate){
        throw '日期对象不能为空!';
    }

    if(!subtrahendDate instanceof Date || !minuendDate instanceof Date){
        throw '不是日期对象！';
    }

    var subtrahend = subtrahendDate.getTime();
    var minuend = minuendDate.getTime();
    var days = Math.abs((subtrahend-minuend))/1000/60/60/24;
    var years = Math.floor(days/365);
     if(years<2){
        return '2年以下';
    }else if(years<1){
         return '1年以下';
     }else if(years<3){
         return '3年以下';
     }else if(years<5){
         return '5年以下';
     }else{
        return years+'年';
     }
}

export {getDate,getDateTime}