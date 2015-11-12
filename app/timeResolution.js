import moment from 'moment';
import _ from 'lodash';

const timeUnits = ['second','minute','hour','day','week','month'];

function nextUnit (string) {
    var index = timeUnits.indexOf(string);
    if(index < 0 || index > timeUnits.length - 2) {
        return timeUnits[timeUnits.length - 1];
    }
    return timeUnits[index + 1];
}

function millisecondsInUnit (timeUnit) {
    switch (timeUnit) {
        case 'second':
            return 1000;
        case 'minute':
            return (1000 * 60);
        case 'hour':
            return (1000 * 60 * 60);
        case 'day':
            return (1000 * 60 * 60 * 24);
        case 'week':
            return (1000 * 60 * 60 * 24 * 7);
        case 'month':
            return (1000 * 60 * 60 * 24 * 30);
        default:
            return NaN;
    }
}

function resolution (timeResolution, unit) {
    if(_.isUndefined(unit)) {
        unit = timeResolution.timeUnit;
    }
    if(timeUnits.indexOf(unit) < 0) {
        return undefined;
    }
    var milliseconds = millisecondsInUnit(unit),
        from = moment(timeResolution.from).toDate().getTime(),
        to = moment(timeResolution.to).toDate().getTime(),
        range = to - from;
    return Math.floor(range / milliseconds);
}

function isInRange (timeResolution, unit) {
    var res = resolution(timeResolution, unit);
    if(res) {
        return resolution(timeResolution, unit) < timeResolution.maxResolution;
    }
    return false;
}

class TimeResolution {
    constructor(from, to, timeUnit = 'second', maxResolution = 200) {
        this.from = from;
        this.to = to;
        this.timeUnit = timeUnit;
        this.maxResolution = maxResolution;
        this.selectedRange = 'custom';
    }

    suggestedTimeUnit () {
        var newR = this.timeUnit,
            end = timeUnits[timeUnits.length - 1];

        while (newR !== end) {
            if(isInRange(this, newR)) {
                break;
            }
            newR = nextUnit(newR);
        }
        return newR;
    }

    suggestedRange () {
        var unit = this.suggestedTimeUnit();
        var result = {
            from: moment(this.from).startOf(unit).valueOf(),
            to:  moment(this.to).startOf(unit).valueOf(),
            intersects: function (timeStamp) {
                return moment(timeStamp).valueOf() >= result.from && moment(timeStamp).valueOf() <= result.to;
            }
        };
        return result;
    }

    /**
     * Creating a new time resolution given a different starting date with the same settings than the original one
     * @param startingDate
     * @returns {TimeResolution}
     */
    changeFrom (startingDate) {
        const fromHelper = new moment(this.from);
        const newDateSelected = new moment(startingDate);
        fromHelper.year(newDateSelected.year()).month(newDateSelected.month()).date(newDateSelected.date());
        const diffInMillis = new moment(this.to).diff(new moment(this.from));
        const toHelper = new moment(fromHelper).add(diffInMillis, 'ms');
        const newTime = new TimeResolution(fromHelper.valueOf(), toHelper.valueOf(), this.timeUnit);
        newTime.selectedRange = { label: 'Time Range', custom: 'time' };
        return newTime;
    }

    static timeResolutionFromLocal (selection, timeUnit) {
        var to, from, rangeObject;
        if (selection.duration && selection.duration.offset === 0) {
            to = moment();
            from = moment().startOf(selection.duration.unit).subtract(selection.duration.value - 1, selection.duration.unit);
        } else if (selection.duration && selection.duration.offset > 0) {
            var previousRange = new moment().subtract(selection.duration.offset, selection.duration.unit);
            var endOfPreviousRange = new moment().subtract(selection.duration.offset - 1, selection.duration.unit);
            from = moment(previousRange).startOf(selection.duration.unit);
            to = moment(endOfPreviousRange).startOf(selection.duration.unit);
        } else {
            to = moment();
            from = moment().subtract(selection.duration.value, selection.duration.unit);
        }
        rangeObject = new TimeResolution(from.valueOf(), to.valueOf());
        var unit = timeUnit || rangeObject.suggestedTimeUnit();
        rangeObject.to = moment(rangeObject.to).startOf(unit).valueOf();
        rangeObject.from = moment(rangeObject.to).subtract(selection.duration.value, selection.duration.unit).valueOf();
        rangeObject.timeUnit = unit;
        rangeObject.selectedRange = selection;
        return rangeObject;
    }
}

export default TimeResolution;