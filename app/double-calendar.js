import angular from 'angular';
import jQuery from 'jquery';
import datepick from 'imports?jQuery=jquery!./datepick/jquery.datepick.js';

function doubleCalendar() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onRangeSelected: '&',
            maxRange: '=',
            range: '='
        },
        template: '<div></div>',
        link: function (scope, element) {
            var rangeStarted;
            var internalSetting;

            scope.rangeSelected = function (dates) {
                if (!dates || !dates.length) { return; }
                if (internalSetting) {
                    internalSetting = false;
                    return;
                }
                var from, to;
                // Setting available dates according to max range configured
                if (!rangeStarted) {
                    from = moment(dates[0]).startOf('day').valueOf();
                    to = moment(dates[1]).endOf('day').valueOf();
                    rangeStarted = from;
                    var maxRangeFromStart = moment(from).add(scope.maxRange, 'days').valueOf();
                    var maxRangeOrToday = _.min([maxRangeFromStart, moment().valueOf()]);
//                            var initialMonthLabel = element.find('.datepick-month.first .datepick-month-header').text().split(' ')[0];
                    jQuery(element).datepick('option', 'minDate', new Date(from));
                    jQuery(element).datepick('option', 'maxDate', new Date(maxRangeOrToday));
//                            var finalMonthLabel = element.find('.datepick-month.last .datepick-month-header').text().split(' ')[0];
                    //TODO: There is a problem when selecting a date from calendar, where calendars are moved while selecting a date. This partially fix that.
                } else {
                    // Clearing available dates
                    from = rangeStarted;
                    to = moment(dates[1]).endOf('day').valueOf();
                    jQuery(element).datepick('option', 'minDate', '-6m');
                    jQuery(element).datepick('option', 'maxDate', +0);
                    jQuery(element).datepick('setDate', new Date(from), new Date(to));
                    rangeStarted = false;
                }
                scope.onRangeSelected()({ from: from, to: to });
            };

            scope.$watch('range', function (value) {
                if (!value) { return; }
                internalSetting = true;
                jQuery(element).datepick('option', 'minDate', '-6m');
                jQuery(element).datepick('option', 'maxDate', +0);
                jQuery(element).datepick('setDate', value.fromDay, value.toDay);
                jQuery(element).datepick('showMonth', value.fromYear, value.fromMonth);
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
                onSelect: scope.rangeSelected
            });
        }
    }
}

export default doubleCalendar;
