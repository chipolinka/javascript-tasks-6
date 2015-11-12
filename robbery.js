'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    // 1. Читаем json
    var parsed = JSON.parse(json);
    var data = getMinutes(parsed);

    var bank = [
        parseTime('ПН ' + workingHours.from), parseTime('ПН ' + workingHours.to),
        parseTime('ВТ ' + workingHours.from), parseTime('ВТ ' + workingHours.to),
        parseTime('СР ' + workingHours.from), parseTime('СР ' + workingHours.to)
    ];
    var dataFreeTime = getFreeTime(data);
    dataFreeTime.push(bank);

    // 2. Находим подходящий ближайший момент начала ограбления
    var intersection = getIntersection(dataFreeTime, minDuration);

    // 3. И записываем в appropriateMoment
    appropriateMoment.date = intersection ? intersection[0] : null;

    var timezoneBank = workingHours.from.substr(5);
    appropriateMoment.timezone = getTimeZone(timezoneBank) * -1;

    return appropriateMoment;
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }

    return 'Ограбление уже идёт!';
};

function getMinutes(data) {
    var result = [];
    var numOfRobber = 0;
    for (var robber in data) {
        result.push([]);
        for (var time in data[robber]) {
            result[numOfRobber].push({});
            result[numOfRobber][time].from = parseTime(data[robber][time].from);
            result[numOfRobber][time].to = parseTime(data[robber][time].to);
        }
        numOfRobber++;
    }
    return result;
}

function parseTime(strTime) {
    var days = ['ПН', 'ВТ', 'СР'];
    var day = days.indexOf(strTime.substr(0, 2));
    var hours = parseInt(strTime.substr(3, 2));
    var minutes = parseInt(strTime.substr(6, 2));
    var timezone = getTimeZone(strTime.substr(8));
    var time = minutes + 60 * (timezone + hours + 24 * day);
    return time;
}

function getTimeZone(timezone) {
    var sign = timezone.charAt(0) == '-' ? 1 : -1;
    var hours = parseInt(timezone.substr(1));
    return hours * sign;
}

function getFreeTime(data) {
    var segments = [];
    for (var numOfRobber = 0; numOfRobber < data.length; numOfRobber++) {
        var points = [];
        points.push(0);
        for (var day = 0; day < data[numOfRobber].length; day++) {
            points.push(data[numOfRobber][day].from);
            points.push(data[numOfRobber][day].to);
        }
        points.push(parseTime('СР 23:59+5'));
        segments.push(points);
    }
    return segments;
}

function getIntersection(data, minDuration) {
    var robbers = getIntersectionLast(data, minDuration);

    while (robbers.length > 1) {
        robbers = getIntersectionLast(robbers, minDuration);
    }
    if (robbers[0].length == 0) {
        return null;
    } else {
        return robbers[0];
    }
}

function getIntersectionLast(data, minDuration) {
    var last = data[data.length - 1];
    var robbers = [];

    for (var numOfRobber = 0; numOfRobber < data.length - 1; numOfRobber++) {
        robbers.push([]);
        var robber = data[numOfRobber];
        for (var hoursRobber = 0; hoursRobber < robber.length; hoursRobber += 2) {
            var robFrom = robber[hoursRobber];
            for (var hoursLast = 0; hoursLast < last.length; hoursLast += 2) {
                if (robber[hoursRobber + 1] <= last[hoursLast]) {
                    break;
                }
                if (robFrom >= last[hoursLast + 1]) {
                    continue;
                }
                robFrom = Math.max(robFrom, last[hoursLast]);
                var robTo = Math.min(robber[hoursRobber + 1], last[hoursLast + 1]);
                if (robTo - robFrom < minDuration) {
                    continue;
                }
                robbers[numOfRobber].push(robFrom);
                robbers[numOfRobber].push(robTo);
            }
        }
    }
    return robbers;
}

function getTimeFromMinutes(minutes) {
    var days = ['ПН', 'ВТ', 'СР'];
    var day = 24 * 60;
    var countDays = Math.floor(minutes / day);
    minutes = minutes % day;
    var hour = 60;
    var countHours = Math.floor(minutes / hour);
    minutes = minutes % hour;
    return days[countDays] + ' ' + countHours + ':' + minutes + '+0';
}
