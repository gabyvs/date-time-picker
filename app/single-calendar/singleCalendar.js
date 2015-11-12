import jQuery from 'jquery';
import moment from 'moment';
import datepick from 'imports?jQuery=jquery!../datepick/jquery.datepick.js';
import TimeResolution from '../timeResolution';

function singleCalendar($timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            observer: '='
        },
        template: '<div class="single-calendar-container"></div>',
        link: function (scope, element) {
            var internalSetting;
            var internalRange;

            /**
             * Executes when a range is selected and emitted by any of the other components
             * @param range
             */
            function onRangeSet(range) {
                internalSetting = true;
                internalRange = range;
                jQuery(element).datepick('setDate', new Date(range.suggestedRange().from));
            }

            $timeout(function () {
                scope.observer.subscribe('singleCalendar', onRangeSet);
            });

            scope.dateSelected = function (dates) {
                if (!dates || !dates.length) { return; }
                if (internalSetting) {
                    internalSetting = false;
                    return;
                }
                var newDate;
                if (internalRange) {
                    newDate = internalRange.changeFrom(dates[0]);
                } else {
                    const dayStart = moment(dates[0]).startOf('day');
                    const dayEnds = moment(dates[0]).endOf('day');
                    newDate = new TimeResolution(dayStart, dayEnds);
                    newDate.selectedRange = { label: 'Time Range', custom: 'time' };
                }
                scope.observer.emit('singleCalendar', newDate);
            };

            jQuery(element).datepick({
                minDate: '-6m',
                maxDate: +0,
                changeMonth: false,
                dayNamesMin : ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                prevText: '<span class="datepickImagePrevious"></span><span class="datepickTextNextPrevious">Prev</span>',
                nextText: '<span class="datepickTextNextPrevious">Next</span><span class="datepickImageNext"></span>',
                onSelect: scope.dateSelected
            });
        }
    }
}

export default singleCalendar;
