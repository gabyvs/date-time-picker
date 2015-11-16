import dtPickerMain from './main';
import moment from 'moment';
import TimeResolution from './timeResolution';
import jQuery from 'jquery';
import datepick from 'imports?jQuery=jquery!./datepick/jquery.datepick.js';

describe('Date Time Picker', function () {
    var scope, $compile, $rootScope, service, element, $timeout;
    var $ = jQuery;

    function compileDirective () {
        element = $compile('<dt-picker range="range" options="options" range-dictionary="rangeDictionary"></dt-picker>')(scope);
        $rootScope.$digest();
        $timeout.flush();
    }

    beforeEach(angular.mock.module(dtPickerMain));

    beforeEach(angular.mock.inject([
        '$rootScope',
        '$compile',
        '$timeout',
        'pickerService',
        function (_$rootScope_, _$compile_, _$timeout_,  _service_) {
            $compile = _$compile_;
            scope = _$rootScope_.$new();
            $rootScope = _$rootScope_;
            service = _service_;
            $timeout = _$timeout_;
            compileDirective();
        }
    ]));

    it('Loading directive.', function () {
        var element = $compile('<dt-picker range="range" options="options" range-dictionary="rangeDictionary"></dt-picker>')(scope);
        scope.$digest();
        expect(element.isolateScope()).toBeDefined();
        expect(element.isolateScope().observer).toBeDefined();
        expect(element.isolateScope().dictionary).toBeDefined();
        var rangeSet;
        element.isolateScope().observer.subscribe('dateTimePickerSpec', function (range) {
            rangeSet = range;
        });
        $timeout.flush();
        expect(element.isolateScope().threeLetterTimezoneLabel).toBeDefined();
        expect(element.isolateScope().range).toBeDefined();
        expect(element.isolateScope().internalRange).toBeDefined();
        expect(element.isolateScope().isTimeRange).toBe(true);
        expect(rangeSet).toBeDefined();
        expect(scope.range).toBeDefined();
    });

    it('Shows and hides configuration panel', function () {
        expect(element.isolateScope().configuring).toBeUndefined();
        expect(element.find('.date-time-configure').hasClass('ng-hide')).toBe(true);
        element.isolateScope().configure();
        $rootScope.$digest();
        expect(element.isolateScope().configuring).toBe(true);
        expect(element.find('.date-time-configure').hasClass('ng-hide')).toBe(false);
        element.isolateScope().close();
        $rootScope.$digest();
        expect(element.isolateScope().configuring).toBe(false);
        expect(element.find('.date-time-configure').hasClass('ng-hide')).toBe(true);
    });

    it('Receives changes on internal range from internal directives', function () {
        const originalRange = element.isolateScope().internalRange;
        const oneWeekBefore = moment().subtract(7, 'days');
        const dayStart = moment(oneWeekBefore).startOf('day');
        const dayEnds = moment(oneWeekBefore).endOf('day');
        const newDate = new TimeResolution(dayStart, dayEnds);
        element.isolateScope().observer.emit('dateTimePickerSpec', newDate);
        expect(moment(originalRange.from).diff(moment(element.isolateScope().internalRange.from), 'days')).toBe(6);
    });

    it('Only takes saved selections when refreshing', function () {
        expect(element.isolateScope().internalRange.selectedRange.label).toBe('Last 24 Hours');
        expect(element.isolateScope().savedRange.selectedRange.label).toBe('Last 24 Hours');
        element.isolateScope().configure();
        const newDate = TimeResolution.timeResolutionFromLocal({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }});
        element.isolateScope().observer.emit('dateTimePickerSpec', newDate);
        $rootScope.$digest();
        expect(element.isolateScope().internalRange.selectedRange.duration.unit).toBe('hour');
        expect(element.isolateScope().internalRange.selectedRange.duration.value).toBe(1);
        element.isolateScope().close();
        element.isolateScope().refresh();
        $rootScope.$digest();
        expect(element.isolateScope().internalRange.selectedRange.duration.unit).toBe('day');
        expect(element.isolateScope().internalRange.selectedRange.duration.value).toBe(1);
        expect(element.isolateScope().savedRange.selectedRange.duration.unit).toBe('day');
        expect(element.isolateScope().savedRange.selectedRange.duration.value).toBe(1);
    });

    it('Saves selection to controller scope', function () {
        const newDate = element.isolateScope().internalRange.changeWithRangeOption({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }});
        element.isolateScope().observer.emit('dateTimePickerSpec', newDate);
        element.isolateScope().save();
        expect(element.isolateScope().configuring).toBe(false);
        expect(element.find('.date-time-configure').hasClass('ng-hide')).toBe(true);
        expect(new moment(scope.range.to).diff(scope.range.from, 'days')).toBe(7);
    });

    it('Honors time unit for refreshing', function () {
        element.isolateScope().configure();
        element.isolateScope().observer.emit('dateTimePickerSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }}));
        $rootScope.$digest();
        expect(element.isolateScope().internalRange.timeUnit).toBe('hour');
        element.isolateScope().observer.emit('dateTimePickerSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }}, 'day'));
        $rootScope.$digest();
        element.isolateScope().save();
        $rootScope.$digest();
        element.isolateScope().refresh();
        $rootScope.$digest();
        expect(element.isolateScope().internalRange.timeUnit).toBe('day');
        expect(element.isolateScope().savedRange.timeUnit).toBe('day');
    });

    it('Selects all available ranges', function () {
        var selectedDates;
        // By default it selects last 24 hours
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.isolateScope().internalRange.selectedRange.label).toBe('Last 24 Hours');
        expect(element.isolateScope().internalRange.timeUnit).toBe('hour');
        expect(angular.element(element.find(".to-value")[0]).html()).toBe(moment().hours() + ':00');
        selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        // Selecting last hour
        element.isolateScope().observer.emit('dateTimePickerSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last Hour', duration: { unit: 'hour', value: 1 }}));
        $rootScope.$digest();
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.isolateScope().internalRange.selectedRange.label).toBe('Last Hour');
        expect(element.isolateScope().internalRange.timeUnit).toBe('minute');
        expect(angular.element(element.find(".to-value")[0]).html()).not.toBe('');
        selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        // selecting last 7 days
        element.isolateScope().observer.emit('dateTimePickerSpec', TimeResolution.timeResolutionFromLocal({ label: 'Last 7 Days', duration: { unit: 'week', value: 1 }}));
        $rootScope.$digest();
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.isolateScope().internalRange.selectedRange.label).toBe('Last 7 Days');
        expect(element.isolateScope().internalRange.timeUnit).toBe('hour');
        expect(element.isolateScope().internalRange.selectedRange.timeUnits.length).toBe(2);
        selectedDates = $(element.find('.double-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        expect(selectedDates[1]).toBeDefined();
        // selecting time range
        element.isolateScope().observer.emit('dateTimePickerSpec', element.isolateScope().internalRange.changeWithRangeOption({ label: 'Time Range', custom: 'time' }));
        $rootScope.$digest();
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.isolateScope().internalRange.selectedRange.label).toBe('Time Range');
        expect(element.isolateScope().internalRange.timeUnit).toBe('hour');
        expect(angular.element(element.find(".to-value")[0]).html()).toBe('0:00');
        selectedDates = $(element.find('.single-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        expect(selectedDates[0].getDate()).toBe(new moment().subtract(7, 'day').date());
        // selecting date range
        element.isolateScope().observer.emit('dateTimePickerSpec', element.isolateScope().internalRange.changeWithRangeOption({ label: 'Date Range', custom: 'date' }));
        $rootScope.$digest();
        expect(element.find('.date-range-selection').hasClass('ng-hide')).toBe(false);
        expect(element.find('.time-range-selection').hasClass('ng-hide')).toBe(true);
        expect(element.isolateScope().internalRange.selectedRange.label).toBe('Date Range');
        expect(element.isolateScope().internalRange.timeUnit).toBe('hour');
        selectedDates = $(element.find('.double-calendar-container')).datepick('getDate');
        expect(selectedDates[0]).toBeDefined();
        expect(selectedDates[1]).toBeDefined();
    });
});