'use strict';

export default class PickerService {
    constructor() {
        'ngInject';

        this.hours = [
            { value: 0, label: '0:00' },
            { value: 1, label: '1:00' },
            { value: 2, label: '2:00' },
            { value: 3, label: '3:00' },
            { value: 4, label: '4:00' },
            { value: 5, label: '5:00' },
            { value: 6, label: '6:00' },
            { value: 7, label: '7:00' },
            { value: 8, label: '8:00' },
            { value: 9, label: '9:00' },
            { value: 10, label: '10:00' },
            { value: 11, label: '11:00' },
            { value: 12, label: '12:00' },
            { value: 13, label: '13:00' },
            { value: 14, label: '14:00' },
            { value: 15, label: '15:00' },
            { value: 16, label: '16:00' },
            { value: 17, label: '17:00' },
            { value: 18, label: '18:00' },
            { value: 19, label: '19:00' },
            { value: 20, label: '20:00' },
            { value: 21, label: '21:00' },
            { value: 22, label: '22:00' },
            { value: 23, label: '23:00' }
        ];

        this.durations = [
            { value: 1, unit: 'hours', label: '1 hour' },
            { value: 2, unit: 'hours', label: '2 hours' },
            { value: 3, unit: 'hours', label: '3 hours' },
            { value: 6, unit: 'hours', label: '6 hours' },
            { value: 12, unit: 'hours', label: '12 hours' },
            { value: 24, unit: 'hours', label: '24 hours' },
            { value: 48, unit: 'hours', label: '48 hours' }
        ];

        this.defaultDictionary = [
            { label: 'Last Hour', duration: { unit: 'hour', value: 1 }},
            { label: 'Last 24 Hours', duration: { unit: 'day', value: 1 }, preselected: true},
            { label: 'Yesterday', duration: { unit: 'day', value: 1, offset: 1 } }, // This needs an offset
            { label: 'Last 7 Days', duration: { unit: 'week', value: 1 }},
            { label: 'Date Range', custom: 'date' },
            { label: 'Time Range', custom: 'time' }
        ];
    }

    isTimeRange(selection) {
        if (selection.duration.unit === 'hour' || selection.duration.unit === 'minutes' || (selection.duration.unit == 'day' && selection.duration.value == 1)) {
            return true;
        }
        return false;
    }

    browserTimezone (dateInput) {
        var dateObject = dateInput || new Date(),
            dateString = dateObject + "",
            tzAbbr = (
                // Works for the majority of modern browsers
                dateString.match(/\(([^\)]+)\)$/) ||
                // IE outputs date strings in a different format:
                dateString.match(/([A-Z]+) [\d]{4}$/)
                );
        if (tzAbbr) {
            // Old Firefox uses the long timezone name (e.g., "Central
            // Daylight Time" instead of "CDT")
            tzAbbr = tzAbbr[1].match(/[A-Z]/g).join("");
        }

        if (!tzAbbr) {
            tzAbbr = '';
        }
        return tzAbbr;
    }

    hourDifference(from, to) {
        var fromHelper = new moment(from);
        var toHelper = new moment(to);
        return toHelper.diff(fromHelper, 'hours');
    }

    timeResolution (from, to, timeUnit) {
        var self,
            timeUnits = ['second','minute','hour','day','week','month'];
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

        function resolution (unit) {
            if(_.isUndefined(unit)) {
                unit = self.timeUnit;
            }
            if(timeUnits.indexOf(unit) < 0) {
                return undefined;
            }
            var milliseconds = millisecondsInUnit(unit),
                from = moment(self.from).toDate().getTime(),
                to = moment(self.to).toDate().getTime(),
                range = to - from;
            return Math.floor(range / milliseconds);
        }

        function isInRange (unit) {
            var res = resolution(unit);
            if(res) {
                return resolution(unit) < self.maxResolution;
            }
            return false;
        }

        self = {
            from: from,
            to: to,
            timeUnit: timeUnit || 'second',
            maxResolution: 200,
            selectedRange: 'custom',
            suggestedTimeUnit: function () {
                var newR = self.timeUnit,
                    end = timeUnits[timeUnits.length - 1];

                while (newR !== end) {
                    if(isInRange(newR)) {
                        break;
                    }
                    newR = nextUnit(newR);
                }
                return newR;
            },
            suggestedRange: function () {
                var unit = self.suggestedTimeUnit();
                var result = {
                    from: moment(self.from).startOf(unit).valueOf(),
                    to:  moment(self.to).startOf(unit).valueOf(),
                    intersects: function (timeStamp) {
                        return moment(timeStamp).valueOf() >= result.from && moment(timeStamp).valueOf() <= result.to;
                    }
                };
                return result;
            }
        };
        return self;
    }

    timeResolutionFromLocal (selection, timeUnit) {
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
        rangeObject = this.timeResolution(from.valueOf(), to.valueOf());
        var unit = timeUnit || rangeObject.suggestedTimeUnit();
        rangeObject.to = moment(rangeObject.to).startOf(unit).valueOf();
        rangeObject.from = moment(rangeObject.to).subtract(selection.duration.value, selection.duration.unit).valueOf();
        rangeObject.timeUnit = unit;
        rangeObject.selectedRange = selection;
        return rangeObject;
    }
}