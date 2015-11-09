'use strict';

module.exports = function () {
    var week = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    return {
        // Здесь как-то хранится дата ;)
        get date () {
            return parseTime(this.format('%DD %HH:%MM+0'));
        },
        set date (minutes) {
            this.dates = getTimeFromMinutes(minutes);
        },

        dates: {},

        // А здесь часовой пояс
        timezone: 5,

        // Выводит дату в переданном формате
        format: function (pattern) {
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
            hours = hours < 10 ? '0' + hours : hours;
            pattern = pattern.replace(/%HH/g, hours);
            var minutes = this.dates.minutes;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            pattern = pattern.replace(/%MM/g, minutes);
            return pattern;
        },

        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            var currentMoment = new Date();
            var curMin = currentMoment.getMinutes();
            var curHour = currentMoment.getUTCHours();
            var curDay = currentMoment.getUTCDay();
            var diffMin = moment.date - parseTime(curDay + ' ' + curHour + ':' + curMin + '+0');
            var diff = getTimeFromMinutes(diffMin);
            var str = 'До ограбления ';
            if (diff.days != 0) {
                str = str + 'остался ' + diff.days + ' день ';
            } else {
                str = str + 'осталось ';
            }
            if (diff.hours != 0) {
                str = str + diff.hours + ' часов ';
            }
            str = str + diff.minutes + ' минут';
            console.log(str);
            return str;
        }
    };
};

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
