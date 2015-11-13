import jQuery from 'jquery';
import moment from 'moment';
import dtPickerMain from './main';

xdescribe('Date Time Picker', function () {
    var scope, $compile, $rootScope, service, element;
    var $ = jQuery;

    function compileDirective() {
        element = $compile('<dt-picker range="range" options="options" range-dictionary="rangeDictionary"></dt-picker>')(scope);
        $rootScope.$digest();
    }

    beforeEach(angular.mock.module(dtPickerMain));

    beforeEach(angular.mock.inject([
        '$rootScope',
        '$compile',
        'pickerService',
        function (_$rootScope_, _$compile_, _service_) {
            $compile = _$compile_;
            scope = _$rootScope_.$new();
            $rootScope = _$rootScope_;
            service = _service_;
            compileDirective();
        }
    ]));

    // TODO: write this as end to end tests
    it('Selects available ranges', function () {
        var selectedDates;
        // By default it selects last 24 hours
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last 24 Hours');
        expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
        expect(element.isolateScope().selectedDuration.value).toBe(24);
        expect(element.isolateScope().selectedFrom.value).toBeDefined();
        expect(angular.element(element.find(".to-value")[0]).html()).toBe(element.isolateScope().selectedFrom.label);
        selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        // Selecting last hour
        element.isolateScope().selectRangeOption(element.isolateScope().dictionary[0]);
        $rootScope.$digest();
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last Hour');
        expect(element.isolateScope().internalRangeObject.timeUnit).toBe('minute');
        expect(element.isolateScope().selectedDuration.value).toBe(1);
        expect(element.isolateScope().selectedFrom.value).toBeDefined();
        expect(angular.element(element.find(".to-value")[0]).html()).not.toBe('');
        selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        // selecting last 7 days
        element.isolateScope().selectRangeOption(element.isolateScope().dictionary[3]);
        $rootScope.$digest();
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Last 7 Days');
        expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
        expect(element.isolateScope().internalRangeObject.selectedRange.timeUnits.length).toBe(2);
        selectedDates = $(element.find('.double-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        expect(selectedDates[1]).toBeDefined();
        // selecting time range
        element.isolateScope().selectRangeOption(element.isolateScope().dictionary[5]);
        $rootScope.$digest();
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Time Range');
        expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
        expect(element.isolateScope().selectedDuration.value).toBe(24);
        expect(element.isolateScope().selectedFrom.value).toBeDefined();
        expect(angular.element(element.find(".to-value")[0]).html()).toBe(element.isolateScope().selectedFrom.label);
        selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        expect(selectedDates[0].getDate()).toBe(new moment().subtract(7, 'day').date());
        // selecting date range
        element.isolateScope().selectRangeOption(element.isolateScope().dictionary[4]);
        $rootScope.$digest();
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Date Range');
        expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
        selectedDates = $(element.find('.double-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        expect(selectedDates[1]).toBeDefined();
    });

    // TODO: move this to double calendar spec
    // There is a problem with the range picker because of the fact that the min and max dates need to be adjusted with every click
    // Because of that, the first date selected by the user sends to the picker only this date [date1, date1]
    // and the second time only the second date selected [date2, date2]
    // When the min and max date are not adjusted, it is send as [date1, date2] instead.
    // This test makes sure that a range is selected even with that problem.
    it('Selects a date range from calendar', function () {
        element.isolateScope().selectRangeOption(element.isolateScope().dictionary[3]);
        $rootScope.$digest();
        var firstDayOfLastMonth = new Date(moment().subtract(1, 'month').date(1).valueOf());
        var fifthDayOfLastMonth = new Date(moment(firstDayOfLastMonth).add(4, 'day').valueOf());
        element.isolateScope().onRangeSelected({ from: moment(firstDayOfLastMonth).startOf('day').valueOf(), to: moment(firstDayOfLastMonth).endOf('day').valueOf() });
        $rootScope.$digest();
        expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Date Range');
        expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
        var from = new moment(element.isolateScope().internalRangeObject.from);
        var to = new moment(element.isolateScope().internalRangeObject.to);
        expect(to.diff(from, 'days')).toBe(0);
        element.isolateScope().onRangeSelected({ from: moment(fifthDayOfLastMonth).startOf('day').valueOf(), to: moment(fifthDayOfLastMonth).endOf('day').valueOf() });
        $rootScope.$digest();
        expect(element.isolateScope().internalRangeObject.selectedRange.label).toBe('Date Range');
        expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
        var from = new moment(element.isolateScope().internalRangeObject.from);
        var to = new moment(element.isolateScope().internalRangeObject.to);
        expect(to.diff(from, 'days')).toBe(0);
    });

    it('Honors time unit for refreshing', function () {
        element.isolateScope().configure();
        element.isolateScope().selectRangeOption(element.isolateScope().dictionary[2]);
        $rootScope.$digest();
        expect(element.isolateScope().internalRangeObject.timeUnit).toBe('hour');
        element.isolateScope().internalRangeObject.timeUnit = 'day';
        $rootScope.$digest();
        element.isolateScope().save();
        $rootScope.$digest();
        element.isolateScope().refresh();
        $rootScope.$digest();
        expect(element.isolateScope().internalRangeObject.timeUnit).toBe('day');
    });
});

