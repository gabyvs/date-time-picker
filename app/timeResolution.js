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
        return res < timeResolution.maxResolution;
    }
    return false;
}

class TimeResolution {
    constructor(from, to, timeUnit, range = { label: 'Custom Range', custom: true }, maxResolution = 200) {
        this.from = from;
        this.to = to;
        this.maxResolution = maxResolution;
        this.selectedRange = range;
        if (timeUnit) {
            this.timeUnit = timeUnit;
        } else {
            this.timeUnit = this.suggestedTimeUnit();
        }
    }

    suggestedTimeUnit () {
        var newR = this.timeUnit || 'second',
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
    changeStartingDate (startingDate) {
        const fromHelper = new moment(this.from);
        const newDateSelected = new moment(startingDate);
        fromHelper.year(newDateSelected.year()).month(newDateSelected.month()).date(newDateSelected.date());
        return this.changeFromRespectingDuration(fromHelper.valueOf());
    }

    /**
     * Creating a new time resolution given a different starting time with the same settings than the original one
     * @param startingHour taken from pickerService.hours like { value: 0, label: '0:00' }
     * @returns {TimeResolution}
     */
    changeStartingHour (startingHour) {
        const fromHelper = new moment(this.from);
        fromHelper.hour(startingHour.value).minute(0).second(0).millisecond(0);
        return this.changeFromRespectingDuration(fromHelper.valueOf());
    }

    changeFromRespectingDuration (newFrom) {
        const diffInMillis = new moment(this.to).diff(new moment(this.from));
        const toHelper = new moment(newFrom).add(diffInMillis, 'ms');
        const newTime = new TimeResolution(newFrom, toHelper.valueOf(), this.timeUnit);
        return newTime;
    }

    changeFrom (newFrom) {
        return new TimeResolution(newFrom, this.to, this.timeUnit);
    }

    changeTo (newTo) {
        return new TimeResolution(this.from, newTo, this.timeUnit);
    }

    /**
     * Creating a new time resolution given a different duration time with the same settings than the original one
     @param duration A duration in hours, taken from pickerService.durations like { value: 1, label: '1 hour' }. Only exception is for 10 minutes.
     */
    changeWithDuration(duration) {
        const newTo = moment(this.from).add(duration.value, duration.unit);
        const newTime = new TimeResolution(this.from, newTo);
        return newTime;
    }

    /**
     * Creating a new time resolution given a different range option with the same settings than the original one
     * @param rangeOption A range option taken from options specified in dateTimePicker directive, or its default as in
     * pickerService.defaultDictionary
     */
    changeWithRangeOption(rangeOption) {
        var newDate;
        if (rangeOption.custom) {
            var from = new moment(this.from).startOf('day');
            var to = new moment(this.to).endOf('day');
            newDate = new TimeResolution(from.valueOf(), to.valueOf());
        } else {
            newDate = TimeResolution.timeResolutionFromLocal(rangeOption);
        }
        return newDate;
    }

    /**
     * Creating a new time resolution given a different time unit with the same settings than the original one
     * @param unit A different time unit from [ 'minute', 'hour', 'day' ]
     */
    changeWithTimeUnit(unit) {
        const diffInMillis = new moment(this.to).diff(new moment(this.from));
        const rangeObject = new TimeResolution(this.from, this.to, unit, this.selectedRange);
        rangeObject.to = moment(rangeObject.to).startOf(unit).valueOf();
        rangeObject.from = new moment(rangeObject.to).subtract(diffInMillis, 'ms').valueOf();
        return rangeObject;
    }

    /**
     * Creates a new time resolution based on the original settings but up to date
     * @returns {TimeResolution}
     */
    refresh() {
        if (this.selectedRange.custom) { return this; }
        return TimeResolution.timeResolutionFromLocal(this.selectedRange, this.timeUnit);
    }

    clone() {
        return new TimeResolution(this.from, this.to, this.timeUnit, this.selectedRange);
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
        rangeObject = new TimeResolution(from.valueOf(), to.valueOf(), timeUnit, selection);
        var unit = timeUnit || rangeObject.suggestedTimeUnit();
        rangeObject.to = moment(rangeObject.to).startOf(unit).valueOf();
        rangeObject.from = moment(rangeObject.to).subtract(selection.duration.value, selection.duration.unit).valueOf();
        return rangeObject;
    }
}

export default TimeResolution;