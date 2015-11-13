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

