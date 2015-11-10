import angular from 'angular';
import jQuery from 'jquery';
import moment from 'moment';
import datepick from 'imports?jQuery=jquery!./datepick/jquery.datepick.js';

function singleCalendar() {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            onDateSelected: '&',
            singleDate: '='
        },
        template: '<div class="single-calendar-container"></div>',
        link: function (scope, element) {
            var internalSetting;
            scope.dateSelected = function (dates) {
                if (!dates || !dates.length) { return; }
                if (internalSetting) {
                    internalSetting = false;
                    return;
                }
                scope.onDateSelected({ dateSelected: dates[0]});
            };

            scope.$watch('singleDate', function (value) {
                if (!value) { return; }
                internalSetting = true;
                jQuery(element).datepick('setDate', value);
            });

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
