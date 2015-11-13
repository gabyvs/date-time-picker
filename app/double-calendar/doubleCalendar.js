import jQuery from 'jquery';
import moment from 'moment';
import datepick from 'imports?jQuery=jquery!../datepick/jquery.datepick.js';
import TimeResolution from '../timeResolution';

function doubleCalendar($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onRangeSelected: '&',
            maxRange: '=',
            range: '=',
            observer: '='
        },
        template: '<div class="double-calendar-container"></div>',
        link: function (scope, element) {
            function setMinMaxDates(minDate, maxDate) {
                jQuery(element).datepick('option', 'minDate', minDate);
                jQuery(element).datepick('option', 'maxDate', maxDate);
            }

            function setDateAndEmit (from, to) {
                const newDate = new TimeResolution(from, to);
                newDate.selectedRange = { label: 'Date Range', custom: 'date' };
                newDate.timeUnit = newDate.suggestedTimeUnit();
                scope.internalRange = newDate;
                scope.observer.emit('doubleCalendar', newDate);
                $timeout();
            }

            function finishRange(fromDate, toDate) {
                var from =  moment(fromDate).startOf('day').valueOf()
                var to = moment(toDate).endOf('day').valueOf();
                setMinMaxDates('-6m', +0);
                jQuery(element).datepick('setDate', new Date(from), new Date(to));
                setDateAndEmit(from, to);
            }

            function startRange(fromDate, toDate) {
                var from = moment(fromDate).startOf('day').valueOf();
                var to = moment(toDate).endOf('day').valueOf();
                var maxRangeFromStart = moment(from).add(scope.maxRange || 31, 'days').valueOf();
                var maxRangeOrToday = _.min([maxRangeFromStart, moment().valueOf()]);
                setMinMaxDates(new Date(from), new Date(maxRangeOrToday));
//              var initialMonthLabel = element.find('.datepick-month.first .datepick-month-header').text().split(' ')[0];
//              var finalMonthLabel = element.find('.datepick-month.last .datepick-month-header').text().split(' ')[0];
                setDateAndEmit(from, to);
            }

            function onSetEvent (dates) {
                if (!dates || !dates.length) { return; }
                if (internalSetting) {
                    internalSetting = false;
                    return;
                }
                if (rangeStarted) {
                    finishRange(rangeStarted, dates[1]);
                    rangeStarted = false;
                } else {
                    startRange(dates[0], dates[1]);
                    rangeStarted = dates[0];
                }
            }

            var rangeStarted;
            var internalSetting;

            $timeout(function () {
                scope.observer.subscribe('doubleCalendar', function (range) {
                    console.log('doubleCalendar.js', 'range', range);
                    scope.internalRange = range;
                    internalSetting = true;
                    setMinMaxDates('-6m', +0);
                    jQuery(element).datepick('setDate', new Date(range.from), new Date(range.to));
                    jQuery(element).datepick('showMonth', moment(range.from).year(), moment(range.from).month());
                    rangeStarted = false;
                    console.log('doubleCalendar.js');
                });
            });

            jQuery(element).datepick({
                rangeSelect: true,
                monthsToShow: 2,
                minDate: '-6m',
                maxDate: +0,
                changeMonth: false,
                dayNamesMin : ["S", "M", "T", "W", "T", "F", "S"],
                prevText: '<span class="datepickImagePrevious"></span><span class="datepickTextNextPrevious">Prev</span>',
                nextText: '<span class="datepickTextNextPrevious">Next</span><span class="datepickImageNext"></span>',
                onSelect: onSetEvent
            });
        }
    }
}

export default doubleCalendar;
