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
    let dateStr = '';
    let dateNum = date.getSeconds();
    if(dateNum<10){
        dateStr = '0' + dateNum;
    }else{
        dateStr = dateNum+'';
    }
    return dateStr;
}

function getMinute(date){
    let dateStr = '';
    let dateNum = date.getMinutes();
    if(dateNum<10){
        dateStr = '0' + dateNum;
    }else{
        dateStr = dateNum+'';
    }
    return dateStr;
}

function getHour(date){
    let dateStr = '';
    let dateNum = date.getHours();
    if(dateNum<10){
        dateStr = '0' + dateNum;
    }else{
        dateStr = dateNum+'';
    }
    return dateStr;
}

function getDateOfMonth(date){
    let dateStr = '';
    let dateNum = date.getDate();
    if(dateNum<10){
        dateStr = '0' + dateNum;
    }else{
        dateStr = dateNum+'';
    }
    return dateStr;
}

function getYear(date){
    return date.getFullYear();
}

function getMonth(date){
    let monthStr = '';
    let month = date.getMonth()+1;
    if(month<10){
        monthStr = '0' + month;
    }else{
        monthStr = month+'';
    }
    return monthStr;
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
export {getDate,getDateTime,getTime}