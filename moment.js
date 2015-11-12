'use strict';

module.exports = function () {
    var week = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    return {
        // Здесь как-то хранится дата ;)
        get date () {
            return parseTime(this.format('%DD %HH:%MM+0'));
        },
        set date (minutes) {
            if (minutes) {
                if (typeof minutes == 'string') {
                    minutes = parseTime(minutes);
                }
                this.dates = getTimeFromMinutes(minutes);
            }
        },

        dates: {},

        // А здесь часовой пояс
        timezone: 0,

        // Выводит дату в переданном формате
        format: function (pattern) {
            if (!Object.keys(this.dates).length) {
                return 'Ограбление не состоится!';
            }
            var days = this.dates.days;
            var hours = this.dates.hours + this.timezone;
            if (hours >= 24) {
                hours -= 24;
                days++;
            }
            if (hours < 0) {
                hours += 24;
                days--;
            }
            days = days == -1 ? week[week.length - 1] : week[days];
            pattern = pattern.replace(/%DD/g, days);
            hours = getCorrectNum(hours);
            pattern = pattern.replace(/%HH/g, hours);
            var minutes = this.dates.minutes;
            minutes = getCorrectNum(minutes);
            pattern = pattern.replace(/%MM/g, minutes);
            return pattern;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            var currentMoment = this.dates;
            var curMin = currentMoment.minutes;
            curMin = getCorrectNum(curMin);
            var curHour = currentMoment.hours;
            curHour = getCorrectNum(curHour);
            var curDay = currentMoment.days;

            var parsedCur = parseTime(week[curDay] + ' ' + curHour + ':' + curMin + '+0');
            var diffMin = parsedCur - moment.date;
            var diff = getTimeFromMinutes(diffMin);

            var isLeft = true;
            var str = 'До ограбления ';
            var decl = getDeclensionOfNouns(diff.days, [' день ', ' дней ', ' дня '], isLeft);
            if (decl) {
                isLeft = false;
                str += decl;
            }
            decl = getDeclensionOfNouns(diff.hours, [' час ', ' часов ', ' часа '], isLeft);
            if (decl) {
                isLeft = false;
                str += decl;
            }
            decl = getDeclensionOfNouns(diff.minutes, [' минута ', ' минут ', ' минуты '], isLeft);
            if (decl) {
                isLeft = false;
                str += decl;
            }
            if (isLeft) {
                return 'Ограбление уже идёт!';
            }
            return str;
        }

    };
};

function getCorrectNum(number) {
    return number < 10 ? '0' + number : number;
}

function getTimeFromMinutes(minutes) {
    var day = 24 * 60;
    var countDays = Math.floor(minutes / day);
    minutes = minutes % day;
    var hour = 60;
    var countHours = Math.floor(minutes / hour);
    minutes = minutes % hour;
    return {
        days: countDays,
        hours: countHours,
        minutes: minutes
    };
}

function parseTime(strTime) {
    var days = ['ПН', 'ВТ', 'СР'];
    var day = days.indexOf(strTime.substr(0, 2));
    var hours = parseInt(strTime.substr(3, 2));
    var minutes = parseInt(strTime.substr(6, 2));
    var zone = strTime.substr(8);
    var sign = zone.charAt(0) == '-' ? 1 : -1;
    var timezone = parseInt(zone.substr(1)) * sign;
    var time = minutes + 60 * (timezone + hours + 24 * day);
    return time;
}

function getDeclensionOfNouns(noun, declensions, isLeft) {
    var declensionLeft = ['остался ', 'осталось ', 'осталась '];
    var result = '';
    if (!noun) {
        return result;
    }
    var declLeft = isLeft ? declensionLeft[1] : '';
    if (noun % 10 == 1 && noun != 11) {
        var isFemGender = declensions[0].charAt(declensions[0] - 2) == 'а';
        declLeft = isLeft ? (isFemGender ? declensionLeft[2] : declensionLeft[0]) : '';
        result = declLeft + noun + declensions[0];
    } else if ((noun % 10 == 0) || (noun > 10 && noun < 15) || noun % 10 > 4) {
        result = declLeft + noun + declensions[1];
    } else {
        result = declLeft + noun + declensions[2];
    }
    return result;
}
