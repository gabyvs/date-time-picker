import jQuery from 'jquery';
import moment from 'moment';
import datepick from 'imports?jQuery=jquery!../datepick/jquery.datepick.js';

function doubleCalendar() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onRangeSelected: '&',
            maxRange: '=',
            range: '='
        },
        template: '<div class="double-calendar-container"></div>',
        link: function (scope, element) {
            function setMinMaxDates(minDate, maxDate) {
                jQuery(element).datepick('option', 'minDate', minDate);
                jQuery(element).datepick('option', 'maxDate', maxDate);
            }

            function finishRange(fromDate, toDate) {
                var from =  moment(fromDate).startOf('day').valueOf()
                var to = moment(toDate).endOf('day').valueOf();
                setMinMaxDates('-6m', +0);
                jQuery(element).datepick('setDate', new Date(from), new Date(to));
                scope.onRangeSelected()({ from: from, to: to });
            }

            function startRange(fromDate, toDate) {
                var from = moment(fromDate).startOf('day').valueOf();
                var to = moment(toDate).endOf('day').valueOf();
                var maxRangeFromStart = moment(from).add(scope.maxRange || 31, 'days').valueOf();
                var maxRangeOrToday = _.min([maxRangeFromStart, moment().valueOf()]);
                setMinMaxDates(new Date(from), new Date(maxRangeOrToday));
//              var initialMonthLabel = element.find('.datepick-month.first .datepick-month-header').text().split(' ')[0];
//              var finalMonthLabel = element.find('.datepick-month.last .datepick-month-header').text().split(' ')[0];
                scope.onRangeSelected()({ from: from, to: to });
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

            scope.$watch('range', function (value) {
                if (!value) { return; }
                internalSetting = true;
                jQuery(element).datepick('option', 'minDate', '-6m');
                jQuery(element).datepick('option', 'maxDate', +0);
                jQuery(element).datepick('setDate', value.from, value.to);
                jQuery(element).datepick('showMonth', moment(value.from).year(), moment(value.from).month());
                rangeStarted = false;
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
